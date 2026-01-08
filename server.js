const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Dossiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Vérification dossier pages
const PAGES_DIR = path.join(__dirname, 'pages');
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR);

// --- ROUTES DU PROJET ---

// 1. Sauvegarder tout le projet (JSON)
app.post('/save-project', (req, res) => {

    const filepath=path.join(path.join(__dirname, "saved projects"),`${req.body.title}.json`)

    fs.writeFileSync(filepath, JSON.stringify(req.body, null, 2));
    res.send({ status: "Projet sauvegardé" });
});

// 2. Créer une page HTML (Appelé par addNode)
app.post('/create-page', (req, res) => {
    const fileName = `page_${req.body.id}.html`;
    const filePath = path.join(PAGES_DIR, fileName);

    // Contenu de base
    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${req.body.title || 'Nouvelle Page'}</title>
</head>
<body>
    <h1>${req.body.title || 'Nouvelle Page'}</h1>
    <p>${req.body.page_content || ''}</p>
</body>
</html>`;

    // On n'écrase pas si le fichier existe déjà (sécurité)
    if (!fs.existsSync(filePath)) {
        fs.writeFile(filePath, content, (err) => {
            if (err) return res.status(500).send({ status: "Erreur création" });
            res.send({ status: "Fichier créé", url: `/pages/${fileName}` });
        });
    } else {
        res.send({ status: "Fichier existe déjà", url: `/pages/${fileName}` });
    }
});

// 3. Supprimer une page
app.post('/delete-page', (req, res) => {
    const filePath = path.join(PAGES_DIR, `page_${req.body.id}.html`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Fichier page_${req.body.id}.html supprimé`);
    }
    res.send({ status: "Fichier supprimé" });
});

// 4. Supprimer toutes les pages
app.post('/delete-all-pages', async (req, res) => {
    try {
        const ids = req.body.nodes;
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                const p = path.join(PAGES_DIR, `page_${id}.html`);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur suppression" });
    }
});

// --- NOUVELLES ROUTES (Celles qui manquaient) ---

// 5. Mettre à jour le titre et la description dans le HTML sans tout casser
app.post('/update-page-meta', (req, res) => {
    const { id, title, contentDesc } = req.body;
    const filePath = path.join(PAGES_DIR, `page_${id}.html`);

    if (!fs.existsSync(filePath)) return res.status(404).send({ status: "Fichier introuvable" });

    let content = fs.readFileSync(filePath, 'utf-8');

    // Remplacement intelligent avec Regex
    content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
    content = content.replace(/<h1>.*<\/h1>/, `<h1>${title}</h1>`);
    // On remplace le premier paragraphe trouvé par la description
    content = content.replace(/<p>.*<\/p>/, `<p>${contentDesc}</p>`);

    fs.writeFileSync(filePath, content);
    res.send({ status: "Méta-données mises à jour" });
});

// 6. Ajouter un lien (bouton) entre deux pages (FOOTER FIXE EN BAS DE FENÊTRE)
app.post('/add-link-between-pages', (req, res) => {
    const { fromId, toId } = req.body;

    // Fonction pour gérer l'ajout dans un footer FIXE
    const addLinkToFixedFooter = (filePath, targetUrl, btnText) => {
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf-8');
        
        // 1. On évite les doublons
        if (content.includes(targetUrl)) return;

        // Le bouton (style épuré)
        const btnHtml = `<a href="${targetUrl}" style="margin-left: 10px; text-decoration: none;"><button style="cursor: pointer; padding: 10px 15px; font-size: 14px;">${btnText}</button></a>`;

        // 2. Vérification : Est-ce qu'un footer existe déjà ?
        if (content.includes('</footer>')) {
            // Le footer existe, on ajoute le bouton dedans
            content = content.replace('</footer>', `${btnHtml}\n</footer>`);
        } else {
            // Le footer n'existe pas, on le crée
            // CSS EXPLICATIF :
            // position: fixed; bottom: 0; left: 0; width: 100%; -> Colle le bloc en bas de l'écran sur toute la largeur
            // box-sizing: border-box; -> S'assure que le padding ne casse pas la largeur
            // z-index: 999; -> S'assure qu'il passe au-dessus du reste si besoin
            const footerHtml = `
    <footer style="position: fixed; bottom: 0; left: 0; width: 100%; background-color: #f9f9f9; border-top: 1px solid #ccc; padding: 15px 20px; text-align: right; box-sizing: border-box; z-index: 999;">
        ${btnHtml}
    </footer>`;
            
            // On l'insère avant la fin du body
            // Note : Pour éviter que le footer ne cache le texte du bas de page, on pourrait ajouter un padding-bottom au body, 
            // mais comme demandé, je ne touche qu'à l'injection du lien.
            if (content.includes('</body>')) {
                content = content.replace('</body>', `${footerHtml}\n</body>`);
            } else {
                content += footerHtml;
            }
        }

        fs.writeFileSync(filePath, content);
    };

    // --- EXECUTION ---

    // 1. Bouton SUIVANT
    addLinkToFixedFooter(
        path.join(PAGES_DIR, `page_${fromId}.html`),
        `/pages/page_${toId}.html`,
        "Aller vers la suite 👉"
    );

    // 2. Bouton PRÉCÉDENT
    addLinkToFixedFooter(
        path.join(PAGES_DIR, `page_${toId}.html`),
        `/pages/page_${fromId}.html`,
        "👈 Retour précédent"
    );

    res.send({ status: "Footer fixe ajouté" });
});
// --- DANS SERVER.JS (Ajoute ça à la fin, avant app.listen) ---

// ROUTE : Sauvegarder le contenu HTML venant de l'éditeur
app.post('/save-full-page', (req, res) => {
    const { id, htmlContent } = req.body;
    
    // Le chemin du fichier à modifier
    const filePath = path.join(__dirname, 'pages', `page_${id}.html`);

    // On écrase le fichier avec le nouveau contenu tout propre
    fs.writeFileSync(filePath, htmlContent);

    console.log(`Page ${id} sauvegardée (HTML écrasé).`);
    res.send({ status: "OK" });
});

// Redirection accueil
app.get('/', (req, res) => {
    res.redirect('/html/arbre.html');
});

// Lancement
app.listen(3000, () => {
    console.log("🚀 Serveur réparé et lancé sur http://localhost:3000");
});