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
    }
};

function renderPlacedList(){
    const ul = document.getElementById('placed-items');
    if(!ul) return;
    ul.innerHTML = '';
    placedItems.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'placed-item';
        li.dataset.id = item.id;
        li.textContent = `${item.type} #${idx+1}`;

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

    if(edited_element){//On récupère les données de l'élément sélectionné pour remplir les champs avec ses donnés
        const left = parseInt(edited_element.style.left) || edited_element.offsetLeft || 0;
        const top = parseInt(edited_element.style.top) || edited_element.offsetTop || 0;
        const z = edited_element.style.zIndex || 0;
        const w = edited_element.offsetWidth || pannelNeedsForId[elemId].fields.find(f=>f.name==='width')?.default;
        const h = edited_element.offsetHeight || pannelNeedsForId[elemId].fields.find(f=>f.name==='height')?.default;
        const text = edited_element.textContent || '';
        const posXInput = document.getElementById('posX');
        const posYInput = document.getElementById('posY');
        const zInput = document.getElementById('zindex');
        const wInput = document.getElementById('width');
        const hInput = document.getElementById('height');
        const textInput = document.getElementById('text');
        if(posXInput) posXInput.value = left;
        if(posYInput) posYInput.value = top;
        if(zInput) zInput.value = z;
        if(wInput) wInput.value = w;
        if(hInput) hInput.value = h;
        if(textInput) textInput.value = text;
    }

    addButton.addEventListener("click", (event) => {
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
        newElement.style.left = Number(document.getElementById("posX").value) + "px";
        newElement.style.top = Number(document.getElementById("posY").value) + "px";
        newElement.style.height = Number(document.getElementById("height").value) + "px";
        newElement.style.width = Number(document.getElementById("width").value) + "px";
        newElement.style.zIndex = Number(document.getElementById("zindex").value);
        newElement.classList.add("placed_element");

        newPannel.classList.remove("open");
        document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
        document.querySelectorAll(".placed_element").forEach(elem => elem.style.border = "transparent solid 2px");
        newElement.addEventListener("click", (event) => {
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

