const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// 1. On sert tout le dossier "public"
app.use(express.static(path.join(__dirname, "public")));

const PAGES_DIR = path.join(__dirname, "pages");
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR);

// ROUTE 1 : Sauvegarder l'arborescence
app.post("/save-project", (req, res) => {
  fs.writeFileSync("project_state.json", JSON.stringify(req.body, null, 2));
  res.send({ status: "Projet sauvegardé" });
});

// ROUTE 2 : Charger l'arborescence
app.get("/load-project", (req, res) => {
  if (fs.existsSync("project_state.json")) {
    const data = fs.readFileSync("project_state.json");
    res.json(JSON.parse(data));
  } else {
    res.json({ nodes: [], links: [] });
  }
});

// ROUTE 3 : Sauvegarder une page individuelle
app.post("/save-page", (req, res) => {
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

app.post("/create-page", (req, res) => {
  const content = `
    <head>
        <title>${req.body.title}</title>
    </head>
    <h1>${req.body.title}</h1>
    <p>${req.body.page_content}</p>`;
  const fileName = `page_${req.body.id}.html`; // Nom unique
  const filePath = path.join(__dirname + "/pages", fileName); // Chemin vers ton dossier public

  // Écrit physiquement le fichier sur le serveur
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ status: "Erreur lors de la création" });
    }
    // On renvoie l'URL du nouveau fichier au client
    res.send({
      status: "Fichier créé",
      url: `${"/pages/" + fileName}`,
    });
  });
});

// Redirection de la racine vers ton interface principale
app.get("/", (req, res) => {
  res.redirect("/html/uwu.html");
});

app.listen(3000, () => {
  console.log("🚀 Serveur lancé sur http://localhost:3000");
  console.log("📂 Interface : http://localhost:3000/html/uwu.html");
});
