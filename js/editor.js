const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const canvas = document.getElementById("main_center");
const panel = document.getElementById("config_panel");
const panelTitle = document.getElementById("panel_title");

// Panneaux pour chaque élément
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
    },

    //  AJOUT POUR IMAGE
    "imgarea": {
        title: "Configuration - Image",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name :"height", label:"Hauteur",type:"number",placeholder:"Hauteur en pixel...",default:100},
            {name :"width", label:"Largeur",type:"number",placeholder:"Largeur en pixel...",default:100},
            {name : "src", label:"Image",type:"file"},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément...",default:0}
        ]
    },
    // Ajout pour background
    "background": {
    title: "Configuration - Fond",
    fields: [
        {name: "color", label: "Couleur de fond", type: "color", default: "#ffffff"},
        {name: "gradient_from", label: "Dégradé - Couleur de départ", type: "color", default: "#ff0000"},
        {name: "gradient_to", label: "Dégradé - Couleur d'arrivée", type: "color", default: "#0000ff"}
    ]
}
};

// Fonction pour créer le panneau
function createPannelFromId(elemId){
    // sécurité
    if (!pannelNeedsForId[elemId]) return;

    // supprimer un éventuel ancien panneau
    const oldPannel = document.getElementById("config_panel");
    if(oldPannel) oldPannel.remove();

    // créer le nouveau panneau
    const newPannel = document.createElement("div")
    newPannel.id = "config_panel";
    main.appendChild(newPannel);

    // titre
    const title = document.createElement("h3");
    title.textContent = pannelNeedsForId[elemId].title;
    newPannel.appendChild(title);

    // création des champs
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
        } else {
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

    // bouton ajouter 
    const addButton = document.createElement("button");
    addButton.textContent = "Ajouter";
    newPannel.appendChild(addButton);

    addButton.addEventListener("click", (event) => {
        if(elemId === "textarea"){
            const added_textarea = document.createElement("p");
            canvas.appendChild(added_textarea);
            added_textarea.style.position = "absolute";
            added_textarea.style.left = document.getElementById("posX").value + "px";
            added_textarea.style.top = document.getElementById("posY").value + "px";
            added_textarea.textContent = document.getElementById("text").value;
            added_textarea.style.zIndex = document.getElementById("zindex").value;
        }

        if(elemId === "imgarea"){
            const fileInput = document.getElementById("src");
            const file = fileInput.files[0];
            if (!file) return; // ne rien faire si aucun fichier sélectionné

            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            canvas.appendChild(img);
            img.style.position = "absolute";
            img.style.left = document.getElementById("posX").value + "px";
            img.style.top = document.getElementById("posY").value + "px";
            img.style.width = document.getElementById("width").value + "px";
            img.style.height = document.getElementById("height").value + "px";
            img.style.zIndex = document.getElementById("zindex").value;
        }

        if(elemId === "background"){
            const color = document.getElementById("color").value;
            const from = document.getElementById("gradient_from").value;
            const to = document.getElementById("gradient_to").value;

            if(from && to){
            canvas.style.background = `linear-gradient(${from}, ${to})`;
        } else {
            canvas.style.background = color;
    }
}

    });

    setTimeout(() => {
        newPannel.classList.add("open");
        //Création du bonton pour fermer
        const closeButton = document.createElement("button");
        closeButton.textContent = "X";
        newPannel.appendChild(closeButton);
        closeButton.style.position = "absolute";
        closeButton.style.right = "2vw";
        closeButton.style.top = "2vh";

        closeButton.addEventListener("click", ()=>{
            newPannel.classList.remove("open");
            document.querySelectorAll(".header_element").forEach(elem => elem.classList.remove("active"));
        });
    }, 10);
}


addable_content.forEach(element => {
    element.addEventListener("click", (event) => {
        addable_content.forEach(event => event.classList.remove("active"));
        const targeted_element = event.currentTarget;
        targeted_element.classList.add("active");

        // récupérer l'image cliquée
        let img;
        if (event.target.tagName === "IMG") {
            img = event.target;
        } else {
            img = targeted_element.querySelector("img");
        }

        if (!img || !img.id) return;

        createPannelFromId(img.id);
    });
});
