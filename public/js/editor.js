//const e = require("express");

const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const canvas = document.getElementById("main_center");
const panel = document.getElementById("config_panel");
const panelTitle = document.getElementById("panel_title");
const placedItems = [];

//Tableau récapitulent les champs nécessaires à chaque type d'élément plaçable
const pannelNeedsForId = {
    "textarea": {
        title: "Configuration du texte",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name :"height", label:"Hauteur",type:"number",placeholder:"Hauteur en pixel...",default:100},
            {name :"width", label:"Largeur",type:"number",placeholder:"Largeur en pixel...",default:100},
            {name : "text", label:"Texte",type:"textarea",placeholder:"Lorem ipsum...",default:"Lorem ipsum..."},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément (ex : 0 pour l'arrière plan)...",default:0}
        ]
    },
    "imgarea": {
        title: "Configuration de l'image",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name :"height", label:"Hauteur",type:"number",placeholder:"Hauteur en pixel...",default:100},
            {name :"width", label:"Largeur",type:"number",placeholder:"Largeur en pixel...",default:100},
            {name : "src", label:"Image",type:"file"},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément...",default:0}
        ]
    },
    "background": {
    title: "Configuration du fond",
        fields: [
            {name: "color", label: "Couleur de fond", type: "color", default: "#ffffff"},
            {name: "gradient_from", label: "Dégradé - Couleur de départ", type: "color", default: "#ff0000"},
            {name: "gradient_to", label: "Dégradé - Couleur d'arrivée", type: "color", default: "#0000ff"}
        ]
    },
    "hypertext": {
    title: "Configuration du lien",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name :"height", label:"Hauteur",type:"number",placeholder:"Hauteur en pixel...",default:100},
            {name :"width", label:"Largeur",type:"number",placeholder:"Largeur en pixel...",default:100},
            {name : "text", label:"Texte",type:"textarea",placeholder:"Lorem ipsum...",default:"Lorem ipsum..."},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément (ex : 0 pour l'arrière plan)...",default:0},
            {name :"link", label:"Lien",type:"textarea",placeholder:"Lien interne ou externe...",default:"../html/uwu.html"}
        ]
    }
};

canvas.addEventListener("click", (event) => {
    const el = event.target.closest(".placed_element");
    if (!el) return;

    event.stopPropagation();
    el.style.border = "gray solid 2px";

    selectPlacedItem(el.dataset.id);
    createPannelFromId(el.dataset.type, el);
});


function renderPlacedList(){
    const ul = document.getElementById('placed-items');
    if(!ul) return;
    ul.innerHTML = '';
    placedItems.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'placed-item';
        li.dataset.id = item.id;
        li.textContent = `${item.type} #${idx+1}`;
        li.style.color = "black";

        li.addEventListener('click', () => {
            selectPlacedItem(item.id);
            // ouvrir panneau pour édition
            const el = canvas.querySelector(`[data-id="${item.id}"]`);
            if(el) createPannelFromId(item.type, el);
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Supprimer';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removePlacedItem(item.id);
        });

        li.appendChild(removeBtn);
        ul.appendChild(li);
    });
}

function addPlacedItemToList(item){
    placedItems.push({id: item.id, type: item.type});
    renderPlacedList();
}

function removePlacedItem(itemId){
    const idx = placedItems.findIndex(x => x.id === itemId);
    if(idx !== -1) placedItems.splice(idx,1);
    const el = canvas.querySelector(`[data-id="${itemId}"]`);
    if(el) el.remove();
    renderPlacedList();
}

function clearSelection(){
    document.querySelectorAll('.placed_element').forEach(el => el.style.border = "white solid 2px");
    document.querySelectorAll('#placed-items .placed-item').forEach(li => li.classList.remove('selected'));
}

function selectPlacedItem(itemId){
    clearSelection();
    const el = canvas.querySelector(`[data-id="${itemId}"]`);
    if(el){
        el.classList.add('selected');
        el.style.border = "gray solid 2px";
        const li = document.querySelector(`#placed-items li[data-id='${itemId}']`);
        if(li) li.classList.add('selected');
    }
}

//Fonction pour créer un élément plaçable conformément aux choix de l'utilisateur
function createPannelFromId(elemId, edited_element){
    if (!pannelNeedsForId[elemId]) return;
    //On supprime un éventuel ancien panneau
    const oldPannel = document.getElementById("config_panel");
    if(oldPannel) oldPannel.remove();
    //On créer le panneau de configuration
    const newPannel = document.createElement("div");
    newPannel.id = "config_panel";
    main.appendChild(newPannel);
    //On créer les champs dans le panneau de configuration
    const title = document.createElement("h3");
    title.textContent = pannelNeedsForId[elemId].title;
    newPannel.appendChild(title);
    pannelNeedsForId[elemId].fields.forEach(field => {
        const fieldWrapper = document.createElement("div");
        fieldWrapper.style.display = "flex";
        fieldWrapper.style.flexDirection = "column";
        fieldWrapper.style.marginBottom = "10px";
        fieldWrapper.style.width = "80%";

        const label = document.createElement("label");
        label.textContent = field.label;
        label.htmlFor = field.name;
        fieldWrapper.appendChild(label);

        let input;
        if(field.type === "textarea"){
            input = document.createElement("textarea");
            input.rows = 5;
        }
        else{
            input = document.createElement("input");
            input.type = field.type;
        }
        input.name = field.name;
        input.id = field.name;
        input.placeholder = field.placeholder || "";
        input.value = field.default !== undefined ? field.default : "";

        fieldWrapper.appendChild(input);
        newPannel.appendChild(fieldWrapper);
    });
            //On créer le bouton pour ajouter l'élément plaçable au canvas
    const addButton = document.createElement("button");
    addButton.textContent = edited_element ? 'Enregistrer' : 'Ajouter';
    newPannel.appendChild(addButton);

    if(edited_element){//On récupère les données de l'élément sélectionné pour remplir les champs avec ses données
        const left = parseInt(edited_element.style.left) || edited_element.offsetLeft || 0;
        const top = parseInt(edited_element.style.top) || edited_element.offsetTop || 0;
        const z = edited_element.style.zIndex || 0;
        const w = edited_element.offsetWidth || pannelNeedsForId[elemId].fields.find(f=>f.name==='width')?.default;
        const h = edited_element.offsetHeight || pannelNeedsForId[elemId].fields.find(f=>f.name==='height')?.default;
        const text = edited_element.textContent || '';
        const link = edited_element.href || '';

        const posXInput = document.getElementById('posX');
        const posYInput = document.getElementById('posY');
        const zInput = document.getElementById('zindex');
        const wInput = document.getElementById('width');
        const hInput = document.getElementById('height');
        const textInput = document.getElementById('text');
        const linkInput = document.getElementById('link');

        if(posXInput) posXInput.value = left;
        if(posYInput) posYInput.value = top;
        if(zInput) zInput.value = z;
        if(wInput) wInput.value = w;
        if(hInput) hInput.value = h;
        if(textInput) textInput.value = text;
        if(linkInput) linkInput.value = link;
    }
    newPannel.addEventListener("click", e => e.stopPropagation());

    addButton.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("CLICK ENREGISTRER", edited_element);
        let newElement = null;
        if(elemId === "textarea"){
            newElement = document.createElement("p");
            newElement.textContent = document.getElementById("text").value;
        }
        else if(elemId === "imgarea"){
            const fileInput = document.getElementById("src");
            const file = fileInput.files[0];
            newElement = document.createElement("img");
            if(file){
                newElement.src = URL.createObjectURL(file);
            }
            else if(edited_element){
                newElement.src = edited_element.src;
            }
            else {
                alert("Veuillez sélectionner un fichier image"); 
                return;
            }
        }
            
        else if(elemId === "background"){
            newElement = null;
            if(document.getElementById("gradient_from").value && document.getElementById("gradient_to").value){
                canvas.style.background = `linear-gradient(${document.getElementById("gradient_from").value}, ${document.getElementById("gradient_to").value})`;
            }
            else {
                canvas.style.background = document.getElementById("color").value;
            }
        }
        else if(elemId === "hypertext"){
            newElement = document.createElement("a");
            const text = document.getElementById("text").value;
            const link = document.getElementById("link").value;

            newElement.textContent = text || "Lien";
            newElement.href = link || "#";
            newElement.style.textDecoration = "none";
        }

        if(!newElement){
            newPannel.classList.remove("open");
            document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
            return;
        }

        
                
        if(edited_element){//Si l'élément a été sélectionné pour être réédité, on le remplace
            newElement.dataset.id = edited_element.dataset.id;
            newElement.dataset.type = edited_element.dataset.type;
            canvas.replaceChild(newElement, edited_element);
        }
        else{//Sinon on l'ajoute simplement
            canvas.appendChild(newElement);
            newElement.dataset.id = crypto.randomUUID();
            newElement.dataset.type = elemId;
            addPlacedItemToList({id: newElement.dataset.id, type: elemId});
        }
        //Puis on le met en forme et on le place conformément aux choix de l'utilisateur
        newElement.style.position = "absolute";
        canvas.getBoundingClientRect();
        if(Number(document.getElementById("posX").value) + Number(document.getElementById("width").value) > canvas.clientWidth){
            newElement.style.left = canvas.clientWidth - Number(document.getElementById("width").value) + "px";
        }
        else if(Number(document.getElementById("posX").value) < 0){
            newElement.style.left = 0 + "px";
        }
        else{
            newElement.style.left = Number(document.getElementById("posX").value) + "px";
        }
        if(Number(document.getElementById("posY").value) + Number(document.getElementById("height").value) > canvas.clientHeight){
            newElement.style.top = canvas.clientHeight - Number(document.getElementById("height").value) + "px";
        }
        else if(Number(document.getElementById("posY").value) < 0){
            newElement.style.top = 0 + "px";
        }
        else{
            newElement.style.top = Number(document.getElementById("posY").value) + "px";
        }
        newElement.style.height = Number(document.getElementById("height").value) + "px";
        newElement.style.width = Number(document.getElementById("width").value) + "px";
        newElement.style.zIndex = Number(document.getElementById("zindex").value);
        newElement.classList.add("placed_element");

        newPannel.classList.remove("open");
        document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
        document.querySelectorAll(".placed_element").forEach(elem => elem.style.border = "transparent solid 2px");
        newElement.addEventListener("click", (event) => {
            //event.preventDefault(); //Empêche redirection du lien pour l'édition
            event.stopPropagation();
            newElement.style.border = "gray solid 2px";
            selectPlacedItem(newElement.dataset.id);
            createPannelFromId(elemId, newElement);
        });
        renderPlacedList();
    });
    //Enfin, on créer le bouton servant à fermer le panel, si l'utilisateur ne souhaite plus éditer
    setTimeout(() => {
        newPannel.classList.add("open");
        const closeButton = document.createElement("button");
        closeButton.textContent = "X";
        newPannel.appendChild(closeButton);
        closeButton.style.position = "absolute";
        closeButton.style.right = 2+"vw";
        closeButton.style.top = 2+"vh";
        closeButton.addEventListener("click", (event)=>{
            newPannel.classList.remove("open");
            document.querySelectorAll(".placed_element").forEach(elem => elem.style.border = "transparent solid 2px");
            document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
            document.querySelectorAll("#placed-items .placed-item").forEach(li => li.classList.remove("selected"));
        });
    }, 10);
}

//Les éléments plaçable possibles sont résumés dans la barre en haut de la page,
// lorsqu'on clique l'un de ces éléments, le pannel s'ouvre pour éditer un
// élément plaçable du type choisis
addable_content.forEach(element => {
    element.addEventListener("click", (event) => {

        addable_content.forEach(event => event.classList.remove("active"));
        const targeted_element = event.currentTarget;
        targeted_element.classList.add("active");

        const img = targeted_element.querySelector("img");
        createPannelFromId(img.id, null);
    })
});


// --- 1. CODE DE CHARGEMENT (À AJOUTER) ---
// On récupère l'ID de la page dans l'URL
const params = new URLSearchParams(window.location.search);
const pageId = params.get('id');

if (pageId) {
    // On demande au serveur le contenu actuel de la page
    fetch(`/pages/page_${pageId}.html?t=${Date.now()}`)
        .then(res => res.text())
        .then(html => {
            // On convertit le texte en HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // On prend tout ce qu'il y a dans le <body> du fichier
            // (Le titre, la description, ET TON BOUTON DE LIEN)
            const existingContent = doc.body.innerHTML;
            
            // On l'injecte dans la zone d'édition (canvas)
            const canvas = document.getElementById("main_center");
            canvas.innerHTML = existingContent;
            
            rehydratePlacedElements();//Et on réhydrate

            // Optionnel : Si tu veux rendre les anciens éléments "cliquables" pour l'édition,
            // il faudrait rajouter ici une logique pour leur remettre les écouteurs d'événements.
            // Mais pour l'instant, ça suffit pour voir le bouton et ne pas le perdre !
        })    
        .catch(err => console.error("Impossible de charger la page :", err));
} else {
    alert("Pas d'ID de page fourni !");
}

// --- 2. BOUTON DE SAUVEGARDE (À AJOUTER À LA FIN) ---

const saveBtn = document.createElement('button');
saveBtn.textContent = "Sauvegarder la Page";
// Petit style pour le placer en bas à droite
saveBtn.style.cssText = "position: fixed; bottom: 20px; right: 20px; padding: 15px; background: #27ae60; color: white; border: none; font-size: 16px; cursor: pointer; z-index: 1000; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";

document.body.appendChild(saveBtn);

saveBtn.onclick = () => {
    // 1. On vérifie l'ID
    if (!pageId) {
        alert("Erreur : Impossible de sauvegarder (pas d'ID trouvé).");
        return;
    }

    // 2. On récupère le contenu de la zone de dessin
    const editorContent = document.getElementById('main_center').innerHTML;

    // 3. On reconstruit le HTML complet pour qu'il soit autonome
    // On n'oublie pas d'inclure le CSS editor.css pour garder le style
    const finalHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Page ${pageId}</title>
    <link rel="stylesheet" href="../css/editor.css">
    <style>
        /* Styles de base pour que la page prenne tout l'écran */
        body { margin: 0; padding: 0; min-height: 100vh; background: #f0f0f0; }
        #main_center { 
            position: relative; 
            width: 100%; 
            height: 100vh; 
            overflow: hidden; 
            background: white; 
        }
    </style>
</head>
<body>
    <div id="main_center">
        ${editorContent}
    </div>
</body>
</html>`;

    // 4. On envoie tout au serveur
    fetch('/save-full-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: pageId,
            htmlContent: finalHTML
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Page sauvegardée avec succès !");
    })
    .catch(err => {
        console.error(err);
        alert("Erreur lors de la sauvegarde.");
    });
};

// --- 3. BOUTON SAUVEGARDER ET QUITTER (À AJOUTER À LA FIN) ---

const saveAndExitBtn = document.createElement('button');
saveAndExitBtn.textContent = "Sauvegarder et Retour";
// On le place à gauche du bouton Sauvegarder
saveAndExitBtn.style.cssText = "position: fixed; bottom: 20px; right: 240px; padding: 15px; background: #34495e; color: white; border: none; font-size: 16px; cursor: pointer; z-index: 1000; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";

document.body.appendChild(saveAndExitBtn);

saveAndExitBtn.onclick = () => {
    // 1. Vérifications d'usage
    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('id');
    
    if (!pageId) {
        alert("Erreur : Pas d'ID de page !");
        window.location.href = 'uwu.html'; // Retour forcé
        return;
    }

    // 2. Récupération du contenu
    const editorContent = document.getElementById('main_center').innerHTML;

    // 3. Construction du HTML complet
    const finalHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Page ${pageId}</title>
    <link rel="stylesheet" href="../css/editor.css">
    <style>
        body { margin: 0; padding: 0; min-height: 100vh; background: #f0f0f0; }
        #main_center { 
            position: relative; 
            width: 100%; 
            height: 100vh; 
            overflow: hidden; 
            background: white; 
        }
    </style>
</head>
<body>
    <div id="main_center">
        ${editorContent}
    </div>
</body>
</html>`;

    // 4. Envoi au serveur
    fetch('/save-full-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: pageId,
            htmlContent: finalHTML
        })
    })
    .then(res => res.json())
    .then(() => {
        // 5. REDIRECTION (C'est ici que ça se passe)
        // Une fois que le serveur dit "OK", on retourne au graphe
   window.location.href = '/html/arbre.html';
    })
    .catch(err => {
        console.error(err);
        alert("Erreur de sauvegarde. Le retour est annulé pour ne pas perdre vos données.");
    });
};

function rehydratePlacedElements() {//Fonction de réhydratation
    placedItems.length = 0;

    document.querySelectorAll(".placed_element").forEach(el => {

        // 1. ID
        if (!el.dataset.id) {
            el.dataset.id = crypto.randomUUID();
        }

        // 2. TYPE
        if (!el.dataset.type) {
            if (el.tagName === "P") el.dataset.type = "textarea";
            else if (el.tagName === "IMG") el.dataset.type = "imgarea";
            else if (el.tagName === "A") el.dataset.type = "hypertext";
        }

        // 3. Bordure invisible par défaut
        el.style.border = "transparent solid 2px";

        // 4. Ajout à la liste
        placedItems.push({
            id: el.dataset.id,
            type: el.dataset.type
        });
    });

    renderPlacedList();
}
