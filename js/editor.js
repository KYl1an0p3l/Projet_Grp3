const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const canvas = document.getElementById("main_center");

// ================== PANNEAUX ==================
const pannelNeedsForId = {

    "textarea": {
        title: "Configuration - Texte",
        fields: [
            {name: "posX", label: "X", type: "number", default: 0},
            {name: "posY", label: "Y", type: "number", default: 0},
            {name: "text", label: "Texte", type: "textarea", default: "Lorem ipsum"},
            {name: "zindex", label: "Z-Index", type: "number", default: 0}
        ]
    },

    "imgarea": {
        title: "Configuration - Image",
        fields: [
            {name: "posX", label: "X", type: "number", default: 0},
            {name: "posY", label: "Y", type: "number", default: 0},
            {name: "width", label: "Largeur", type: "number", default: 150},
            {name: "height", label: "Hauteur", type: "number", default: 150},
            {name: "src", label: "Image", type: "file"},
            {name: "zindex", label: "Z-Index", type: "number", default: 0}
        ]
    },

    "background": {
        title: "Configuration - Fond",
        fields: [
            {name: "color", label: "Couleur unie", type: "color", default: "#ffffff"},
            {name: "gradient_from", label: "Dégradé - De", type: "color", default: "#ff0000"},
            {name: "gradient_to", label: "Dégradé - Vers", type: "color", default: "#0000ff"},
            {name: "use_gradient", label: "Utiliser le dégradé", type: "checkbox", default: false}
        ]
    },

    "hypertext": {
        title: "Configuration - Hypertexte",
        fields: [
            {name: "posX", label: "X", type: "number", default: 0},
            {name: "posY", label: "Y", type: "number", default: 0},
            {name: "text", label: "Texte", type: "textarea", default: "Clique ici"},
            {name: "url", label: "Lien", type: "text", default: ""},
            {name: "target", label: "Ouverture", type: "select", options: [
                {label: "Même page", value: "_self"},
                {label: "Nouvel onglet", value: "_blank"}
            ]},
            {name: "color", label: "Couleur", type: "color", default: "#0000ff"},
            {name: "fontSize", label: "Taille", type: "number", default: 16},
            {name: "zindex", label: "Z-Index", type: "number", default: 0}
        ]
    }
};

// ================== CREATION DU PANNEAU ==================
function createPannelFromId(elemId) {

    if (!pannelNeedsForId[elemId]) return;

    let panel = document.getElementById("config_panel");
    let closeBtn;

    // Création du panneau UNE SEULE FOIS
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "config_panel";
        main.appendChild(panel);

        closeBtn = document.createElement("button");
        closeBtn.textContent = "X";
        closeBtn.setAttribute("aria-label", "Fermer le panneau");
        closeBtn.style.position = "absolute";
        closeBtn.style.right = "15px";
        closeBtn.style.top = "10px";

        closeBtn.addEventListener("click", () => {
            panel.classList.remove("open");
            addable_content.forEach(el => el.classList.remove("active"));
        });

        panel.appendChild(closeBtn);
    } else {
        // Récupérer le bouton existant
        closeBtn = panel.querySelector("button");
    }

    // Nettoyage du contenu SANS enlever la croix
    Array.from(panel.children).forEach(child => {
        if (child !== closeBtn) {
            child.remove();
        }
    });

    // Titre
    const title = document.createElement("h3");
    title.textContent = pannelNeedsForId[elemId].title;
    panel.appendChild(title);

    // Message d'erreur
    const errorMsg = document.createElement("div");
    errorMsg.id = "error_message";
    errorMsg.style.color = "red";
    errorMsg.style.marginBottom = "10px";
    errorMsg.style.display = "none";
    panel.appendChild(errorMsg);

    // Champs
    pannelNeedsForId[elemId].fields.forEach(field => {
        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.flexDirection = "column";
        wrap.style.marginBottom = "10px";

        const label = document.createElement("label");
        label.textContent = field.label;
        label.setAttribute("for", field.name);

        let input;
        if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.rows = 4;
        } else if (field.type === "select") {
            input = document.createElement("select");
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt.value;
                option.textContent = opt.label;
                input.appendChild(option);
            });
        } else if (field.type === "checkbox") {
            input = document.createElement("input");
            input.type = "checkbox";
            input.checked = field.default || false;
        } else {
            input = document.createElement("input");
            input.type = field.type;
        }

        input.id = field.name;
        if (field.type !== "checkbox" && field.type !== "file") {
            input.value = field.default || "";
        }

        wrap.appendChild(label);
        wrap.appendChild(input);
        panel.appendChild(wrap);
    });

    // Bouton ajouter
    const addBtn = document.createElement("button");
    addBtn.textContent = "Ajouter";
    panel.appendChild(addBtn);

    addBtn.addEventListener("click", () => {
        const errorMsg = document.getElementById("error_message");
        errorMsg.style.display = "none";
        errorMsg.textContent = "";

        // TEXTE
        if (elemId === "textarea") {
            const textValue = document.getElementById("text").value.trim();
            if (!textValue) {
                errorMsg.textContent = "Le texte ne peut pas être vide";
                errorMsg.style.display = "block";
                return;
            }

            const p = document.createElement("p");
            p.textContent = textValue;
            p.style.position = "absolute";
            p.style.left = document.getElementById("posX").value + "px";
            p.style.top = document.getElementById("posY").value + "px";
            p.style.zIndex = document.getElementById("zindex").value;
            canvas.appendChild(p);
        }

        // IMAGE
        if (elemId === "imgarea") {
            const fileInput = document.getElementById("src");
            const file = fileInput.files[0];
            
            if (!file) {
                errorMsg.textContent = "Veuillez sélectionner une image";
                errorMsg.style.display = "block";
                return;
            }

            // Vérifier que c'est bien une image
            if (!file.type.startsWith('image/')) {
                errorMsg.textContent = "Le fichier doit être une image";
                errorMsg.style.display = "block";
                return;
            }

            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.position = "absolute";
            img.style.left = document.getElementById("posX").value + "px";
            img.style.top = document.getElementById("posY").value + "px";
            img.style.width = document.getElementById("width").value + "px";
            img.style.height = document.getElementById("height").value + "px";
            img.style.zIndex = document.getElementById("zindex").value;
            canvas.appendChild(img);
        }

        // BACKGROUND
        if (elemId === "background") {
            const useGradient = document.getElementById("use_gradient").checked;
            
            if (useGradient) {
                const from = document.getElementById("gradient_from").value;
                const to = document.getElementById("gradient_to").value;
                canvas.style.background = `linear-gradient(${from}, ${to})`;
            } else {
                const color = document.getElementById("color").value;
                canvas.style.background = color;
            }
        }

        // HYPERTEXTE
        if (elemId === "hypertext") {
            const textValue = document.getElementById("text").value.trim();
            const urlValue = document.getElementById("url").value.trim();

            if (!textValue) {
                errorMsg.textContent = "Le texte ne peut pas être vide";
                errorMsg.style.display = "block";
                return;
            }

            if (!urlValue) {
                errorMsg.textContent = "L'URL ne peut pas être vide";
                errorMsg.style.display = "block";
                return;
            }

            // Validation basique de l'URL
            try {
                new URL(urlValue);
            } catch (e) {
                errorMsg.textContent = "L'URL n'est pas valide (doit commencer par http:// ou https://)";
                errorMsg.style.display = "block";
                return;
            }

            const a = document.createElement("a");
            a.textContent = textValue;
            a.href = urlValue;
            a.target = document.getElementById("target").value;
            a.style.position = "absolute";
            a.style.left = document.getElementById("posX").value + "px";
            a.style.top = document.getElementById("posY").value + "px";
            a.style.color = document.getElementById("color").value;
            a.style.fontSize = document.getElementById("fontSize").value + "px";
            a.style.zIndex = document.getElementById("zindex").value;
            a.style.cursor = "pointer";
            a.style.textDecoration = "underline";
            canvas.appendChild(a);
        }

        // Fermer le panneau après ajout réussi
        panel.classList.remove("open");
        addable_content.forEach(el => el.classList.remove("active"));
    });

    setTimeout(() => panel.classList.add("open"), 10);
}

// ================== CLIC SUR LES ICONES ==================
addable_content.forEach(element => {
    element.addEventListener("click", (event) => {
        addable_content.forEach(e => e.classList.remove("active"));
        element.classList.add("active");

        const img = element.querySelector("img");
        if (img && img.id) {
            // Mapper l'id HTML vers l'id de configuration
            let configId = img.id;
            if (img.id === "hpertxtarea") {
                configId = "hypertext";
            }
            createPannelFromId(configId);
        }
    });
});