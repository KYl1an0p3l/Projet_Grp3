const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// 1. On sert tout le dossier "public" et le dossier pages
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pages',express.static(path.join(__dirname,'pages')));

const PAGES_DIR = path.join(__dirname, 'pages');
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR);
app.use('/pages', express.static(PAGES_DIR));

// --- ROUTE 1 : Sauvegarder l'état global du projet ---
// Méthode POST : Le client envoie des données à écrire.
app.post('/save-project', (req, res) => {
<<<<<<< HEAD
    // fs.writeFileSync : Écrit le fichier de manière synchrone (bloque le serveur tant que ce n'est pas fini).
    // JSON.stringify(req.body, null, 2) : Convertit l'objet JavaScript reçu en texte formaté et lisible.
    fs.writeFileSync('project_state.json', JSON.stringify(req.body, null, 2));
    
    // Répond au client que tout s'est bien passé.
    res.send({ status: "Saved" });
=======
    fs.writeFileSync(`${req.body.title}.json`, JSON.stringify(req.body, null, 2));
    res.send({ status: "Projet sauvegardé" });
>>>>>>> parent of af6da6b (enregistrement des projets dans in fichier dédié)
});

// --- ROUTE 2 : Charger l'état global du projet ---
// Méthode GET : Le client demande des données.
app.get('/load-project', (req, res) => {
    // On vérifie d'abord si une sauvegarde existe pour éviter une erreur.
    if (fs.existsSync('project_state.json')) {
        // Lecture du fichier -> Conversion texte vers Objet JS -> Envoi au client
        res.json(JSON.parse(fs.readFileSync('project_state.json')));
    } else {
        // Si aucun fichier n'existe, on renvoie une structure vide pour que le frontend puisse démarrer proprement.
        res.json({ nodes: [], links: [] });
    }
});

// --- ROUTE 3 : Sauvegarder une Page (Double écriture : JSON + HTML) ---
app.post('/save-page', (req, res) => {
    // Déstructuration : On extrait l'ID, le nom et le contenu envoyés par le client.
    const { id, name, contentData } = req.body;

    // Définition des chemins des deux fichiers à créer/mettre à jour.
    const jsonPath = path.join(PAGES_DIR, `${id}.json`); // Pour les données
    const htmlPath = path.join(PAGES_DIR, `${id}.html`); // Pour l'affichage web

    // Initialisation d'un objet par défaut si c'est une nouvelle page
    let pageData = { id, created_at: Date.now(), blocks: [] };
    
    // Si la page existe déjà (fichier JSON présent), on la charge pour ne pas écraser les anciennes infos (comme la date).
    if (fs.existsSync(jsonPath)) {
        pageData = JSON.parse(fs.readFileSync(jsonPath));
    }
    
    // Mise à jour des informations avec ce que le client vient d'envoyer
    pageData.name = name || pageData.name; // Garde l'ancien nom si le nouveau est vide
    if (contentData) pageData.blocks = contentData; // Met à jour le contenu (textes, boutons...)

    // 1. ÉCRITURE DU FICHIER DE DONNÉES (JSON)
    fs.writeFileSync(jsonPath, JSON.stringify(pageData, null, 2));

    // 2. GÉNÉRATION DU CODE HTML (Templating)
    // Ici, on construit une longue chaîne de caractères qui contient tout le code HTML de la page.
    // C'est comme si le serveur "imprimait" la page web.
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${pageData.name}</title>
    <style>
        /* CSS intégré directement dans le fichier pour qu'il soit autonome */
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #f4f4f9; }
        h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .content-block { background: white; padding: 20px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .nav-btn {
            display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white;
            text-decoration: none; border-radius: 5px; font-weight: bold; transition: background 0.3s;
        }
        .nav-btn:hover { background-color: #2563eb; }
    </style>
</head>
<body>
    <h1>${pageData.name}</h1>
    <div id="main-content">
        ${/* C'est ici que la magie opère : on boucle sur chaque bloc de contenu et on insère son HTML */
          pageData.blocks && pageData.blocks.length > 0 
            ? pageData.blocks.map(b => `<div class="content-block">${b.html}</div>`).join('') 
            : '<p style="color:#888;">Page vide.</p>'}
    </div>
</body>
</html>`;

    // Écriture physique du fichier HTML sur le disque
    fs.writeFileSync(htmlPath, htmlContent);

    // On renvoie l'URL de la page créée pour que l'utilisateur puisse cliquer dessus
    res.send({ status: "OK", url: `/pages/${id}.html` });
});

// --- ROUTE 4 : Lire le JSON d'une page spécifique ---
// ':id' est un paramètre dynamique. Si l'URL est '/get-page-json/page_123', alors req.params.id vaudra 'page_123'.
app.get('/get-page-json/:id', (req, res) => {
    
    // 1. Construction du chemin sécurisé vers le fichier JSON cible.
    // On combine le dossier 'pages' avec l'ID reçu et l'extension '.json'.
    const jsonPath = path.join(PAGES_DIR, `${req.params.id}.json`);

    // 2. Vérification de l'existence du fichier.
    if (fs.existsSync(jsonPath)) {
        // 3. Si le fichier existe :
        // a. fs.readFileSync(jsonPath) : On lit le contenu brut du fichier (des 0 et des 1).
        // b. JSON.parse(...) : On transforme ce texte brut en un véritable objet JavaScript manipulable.
        // c. res.json(...) : On renvoie cet objet au client (navigateur).
        res.json(JSON.parse(fs.readFileSync(jsonPath)));
    } else {
        // 4. Si le fichier n'existe pas (page jamais sauvegardée ou ID erroné) :
        // On renvoie un objet avec un tableau 'blocks' vide pour éviter que le Javascript du frontend ne plante.
        res.json({ blocks: [] }); 
    }
});

app.get('/', (req, res) => res.redirect('/html/uwu.html'));
app.listen(3000, () => console.log("🚀 http://localhost:3000"));
