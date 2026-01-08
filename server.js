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



// ROUTE 1 : Sauvegarder l'arborescence
app.post('/save-project', (req, res) => {

    const filepath=path.join(path.join(__dirname, "saved projects"),`${req.body.title}.json`)

    fs.writeFileSync(filepath, JSON.stringify(req.body, null, 2));
    res.send({ status: "Projet sauvegardé" });
});

// ROUTE 2 : Charger l'arborescence
app.get('/load-project', (req, res) => {
    if (fs.existsSync('project_state.json')) {
        const data = fs.readFileSync('project_state.json');
        res.json(JSON.parse(data));
    } else {
        res.json({ nodes: [], links: [] });
    }
});

// ROUTE 3 : Sauvegarder une page individuelle
app.post('/save-page', (req, res) => {
    const { id, name, htmlContent } = req.body;
    const fileName = `${id}.html`;
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${name}</title>
</head>
<body>${htmlContent}</body>
</html>`;

    fs.writeFileSync(path.join(PAGES_DIR, fileName), fullHtml);
    res.send({ status: "Fichier page créé/mis à jour" });
});



app.post('/create-page', (req, res) => {
    const content = 
    `
    <head>
        <title>${req.body.title}</title>
    </head>
    <h1>${req.body.title}</h1>
    <p>${req.body.page_content}</p>`;
    const fileName = `page_${req.body.id}.html`; // Nom unique
    const filePath = path.join(__dirname+'/pages', fileName); // Chemin vers ton dossier public

    // Écrit physiquement le fichier sur le serveur
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ status: "Erreur lors de la création" });
        }
        // On renvoie l'URL du nouveau fichier au client
        res.send({ 
            status: "Fichier créé", 
            url: `${'/pages/'+fileName}`
        });
    });
});


app.post('/delete-page',(req,res)=>{
    const filename=`page_${req.body.id}.html`;
    const filepath=path.join(__dirname,"pages",filename);

    fs.unlink(filepath,(error)=>{
        if(error){
            console.log("Erreur de supression : ",err);
            return;
        }
        console.log(`Fichier \"${filename}\" supprimé avec succès`);
    });

    res.send({status:"Fichier supprimé"});
});

app.post('/delete-all-pages',async (req,res)=>{
    try {
        const ids = req.body.nodes; // tableau d'IDs
        const pagesDir = path.join(__dirname, "pages");

        const files = await fs.promises.readdir(pagesDir);

        const deletions = files
            .filter(file =>
                ids.some(id => file === `page_${id}.html`)
            )
            .map(file =>
                fs.promises.unlink(path.join(pagesDir, file))
            );

        await Promise.all(deletions);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Suppression échouée" });
    }

});


// Redirection de la racine vers ton interface principale
app.get('/', (req, res) => {
    res.redirect('/html/uwu.html');
});



app.listen(3000, () => {
    console.log("🚀 Serveur lancé sur http://localhost:3000");
    console.log("📂 Interface : http://localhost:3000/html/uwu.html");
});