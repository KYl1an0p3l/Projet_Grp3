const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const canvas = document.getElementById("main_center");
const panel = document.getElementById("config_panel");
const panelTitle = document.getElementById("panel_title");

// Tableau d'éléments placés (id, type)
const placedItems = [];

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
    document.querySelectorAll('.placed-element').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('#placed-items .placed-item').forEach(li => li.classList.remove('selected'));
}

function selectPlacedItem(itemId){
    clearSelection();
    const el = canvas.querySelector(`[data-id="${itemId}"]`);
    if(el){
        el.classList.add('selected');
        const li = document.querySelector(`#placed-items li[data-id='${itemId}']`);
        if(li) li.classList.add('selected');
    }
}

//Tableau récapitulent les champs nécessaires à chaque type d'élément plaçable
const pannelNeedsForId = {
    "textarea": {
        title: "Configuration - TextArea",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name :"height", label:"Hauteur",type:"number",placeholder:"Hauteur en pixel...",default:100},
            {name :"width", label:"Largeur",type:"number",placeholder:"Largeur en pixel...",default:100},
            {name : "text", label:"Texte",type:"textarea",placeholder:"Lorem ipsum...",default:"Lorem ipsum..."},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément (ex : 0 pour l'arrière plan)...",default:0}
        ]
    }
}

//Fonction pour créer un élément plaçable conformément aux choix de l'utilisateur
function createPannelFromId(elemId, edited_element){
        //On supprime un éventuel ancien panneau
        const oldPannel = document.getElementById("config_panel");
        if(oldPannel) oldPannel.remove();
        //On créer le panneau de configuration
        const newPannel = document.createElement("div")
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
            //On créer le bouton pour ajouter / enregistrer l'élément plaçable au canvas
            const addButton = document.createElement("button");
            addButton.textContent = edited_element ? 'Enregistrer' : 'Ajouter';
            newPannel.appendChild(addButton);

            // Si on édite, pré-remplir les inputs avec les valeurs existantes
            if(edited_element){
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
                let targetElement = edited_element || null;
                if(elemId === "textarea"){
                    if(targetElement){
                        // modifier l'élément existant
                        targetElement.textContent = document.getElementById("text").value;
                    } else {
                        targetElement = document.createElement("p");
                        targetElement.textContent = document.getElementById("text").value;
                        // assign a stable id for tracking
                        targetElement.dataset.id = 'placed-' + Date.now();
                        canvas.appendChild(targetElement);
                        // ajouter à la liste
                        addPlacedItemToList({id: targetElement.dataset.id, type: elemId});
                    }
                }

                if(!targetElement) return;

                // appliquer styles/position
                targetElement.style.position = "absolute";
                targetElement.style.left = Number(document.getElementById("posX").value) + "px";
                targetElement.style.top = Number(document.getElementById("posY").value) + "px";
                targetElement.style.zIndex = Number(document.getElementById("zindex").value);
                const wv = Number(document.getElementById("width").value || 0);
                const hv = Number(document.getElementById("height").value || 0);
                if(wv) targetElement.style.width = wv + 'px';
                if(hv) targetElement.style.height = hv + 'px';

                // classes et dataset
                targetElement.classList.add("placed-element");
                if(!targetElement.dataset.id) targetElement.dataset.id = 'placed-' + Date.now();

                // fermer le panneau
                newPannel.classList.remove("open");
                document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));

                // mettre en écoute le click sur l'élément pour sélectionner / rééditer
                targetElement.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    selectPlacedItem(targetElement.dataset.id);
                    createPannelFromId(elemId, targetElement);
                });

                // marquer la sélection sur le nouvel élément
                selectPlacedItem(targetElement.dataset.id);
                renderPlacedList();
            });

            //Enfin, on créer le bouton servant à fermer le panel, si l'utilisateur ne souhaite plus éditer
        setTimeout(() => {
            newPannel.classList.add("open");
            const closeButton = document.createElement("button");
            newPannel.appendChild(closeButton);
            closeButton.style.position = "absolute";
            closeButton.style.right = 2+"vw"
            closeButton.style.top = 2+"vh"
            closeButton.addEventListener("click", (event)=>{
                newPannel.classList.remove("open");
                // clear selection visuals
                clearSelection();
                document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
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

