const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const canvas = document.getElementById("main_center");

const pannelNeedsForId = {
    "textarea": {
        title: "Configuration du texte",
        fields: [
            { name: "posX", label: "Position X", type: "number", placeholder: "Position X en pixel...", default: 0 },
            { name: "posY", label: "Position Y", type: "number", placeholder: "Position Y en pixel...", default: 0 },
            { name: "height", label: "Hauteur", type: "number", placeholder: "Hauteur en pixel...", default: 100 },
            { name: "width", label: "Largeur", type: "number", placeholder: "Largeur en pixel...", default: 100 },
            { name: "text", label: "Texte", type: "textarea", placeholder: "Entrez votre texte ici...", default: "Lorem ipsum..." },
            { name: "zindex", label: "Z-Index", type: "number", placeholder: "Plan de l'élément (ex : 0)...", default: 0 }
        ]
    }
};

/**
 * Crée et affiche le panneau de configuration
 */
function createPannelFromId(elemId) {
    // Supprime un éventuel ancien panneau
    const oldPannel = document.getElementById("config_panel");
    if (oldPannel) {
        oldPannel.classList.remove("open");
        setTimeout(() => oldPannel.remove(), 300); // Attendre l'animation avant de supprimer
    }

    // Créer le panneau de configuration
    const newPannel = document.createElement("div");
    newPannel.id = "config_panel";
    main.appendChild(newPannel);

    // Créer le titre
    const title = document.createElement("h3");
    title.textContent = pannelNeedsForId[elemId].title;
    newPannel.appendChild(title);

    // Créer les champs du panneau
    pannelNeedsForId[elemId].fields.forEach((field) => {
        const fieldWrapper = document.createElement("div");
        fieldWrapper.className = "field-wrapper";

        const label = document.createElement("label");
        label.textContent = field.label;
        label.htmlFor = field.name;
        fieldWrapper.appendChild(label);

        let input;
        if (field.type === "textarea") {
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

    // Créer le conteneur de boutons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "buttons-container";

    // Créer le bouton "Ajouter"
    const addButton = document.createElement("button");
    addButton.className = "btn-add";
    addButton.textContent = "Ajouter";
    addButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Empêcher la fermeture du panel
        handleAddElement(elemId, event);
    });

    buttonsContainer.appendChild(addButton);
    newPannel.appendChild(buttonsContainer);

    // Déclencher l'animation d'apparition
    setTimeout(() => {
        newPannel.classList.add("open");
    }, 10);

    // Créer le bouton de fermeture
    const closeButton = document.createElement("button");
    closeButton.className = "btn-close";
    closeButton.innerHTML = "✕";
    closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closePanel(newPannel);
    });
    newPannel.appendChild(closeButton);
}

/**
 * Ajoute un élément au canvas
 */
function handleAddElement(elemId, event) {
    if (elemId === "textarea") {
        const posX = Number(document.getElementById("posX").value);
        const posY = Number(document.getElementById("posY").value);
        const height = Number(document.getElementById("height").value);
        const width = Number(document.getElementById("width").value);
        const text = document.getElementById("text").value;
        const zIndex = Number(document.getElementById("zindex").value);

        // Créer l'élément texte
        const added_textarea = document.createElement("p");
        added_textarea.style.position = "absolute";
        added_textarea.style.left = posX + "px";
        added_textarea.style.top = posY + "px";
        added_textarea.style.height = height + "px";
        added_textarea.style.width = width + "px";
        added_textarea.style.zIndex = zIndex;
        added_textarea.textContent = text;

        // Ajouter des styles modernes
        added_textarea.style.color = "white";
        added_textarea.style.backgroundColor = "rgba(99, 102, 241, 0.2)";
        added_textarea.style.padding = "15px";
        added_textarea.style.borderRadius = "10px";
        added_textarea.style.border = "1px solid rgba(99, 102, 241, 0.4)";
        added_textarea.style.backdropFilter = "blur(5px)";
        added_textarea.style.fontFamily = "inherit";
        added_textarea.style.fontSize = "0.95rem";
        added_textarea.style.lineHeight = "1.6";
        added_textarea.style.wordWrap = "break-word";
        added_textarea.style.overflowWrap = "break-word";
        added_textarea.style.animation = "fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

        // Ajouter l'animation au CSS si elle n'existe pas
        if (!document.getElementById("canvas-animations")) {
            const style = document.createElement("style");
            style.id = "canvas-animations";
            style.textContent = `
                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        canvas.appendChild(added_textarea);

        // Feedback visuel
        showNotification("Élément ajouté avec succès! ✓");
    }
}

/**
 * Ferme le panneau avec animation
 */
function closePanel(panelElement) {
    if (!panelElement) return;
    
    panelElement.classList.remove("open");
    setTimeout(() => {
        panelElement.remove();
        addable_content.forEach(elem => elem.classList.remove("active"));
    }, 300);
}

/**
 * Affiche une notification
 */
function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 10px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        animation: slideInNotif 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Ajouter l'animation
    if (!document.getElementById("notif-animations")) {
        const style = document.createElement("style");
        style.id = "notif-animations";
        style.textContent = `
            @keyframes slideInNotif {
                0% {
                    transform: translateX(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutNotif {
                0% {
                    transform: translateX(0);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Supprimer la notification après 3s
    setTimeout(() => {
        notification.style.animation = "slideOutNotif 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Ferme le panel quand on clique en dehors
 */
function setupPanelClickOutside(panelElement) {
    document.addEventListener("click", (event) => {
        // Vérifier si le panel existe encore
        if (!panelElement || !document.body.contains(panelElement)) {
            return;
        }

        // Ne pas fermer si on clique sur le panel lui-même
        if (panelElement.contains(event.target)) {
            return;
        }

        // Ne pas fermer si on clique sur un élément header
        if (event.target.closest(".header_element")) {
            return;
        }

        // Fermer le panel
        closePanel(panelElement);
    }, { once: true }); // Se déclenche une seule fois
}

/**
 * Gestion des clics sur les éléments de la barre de titre
 */
addable_content.forEach((element) => {
    element.addEventListener("click", (event) => {
        event.stopPropagation(); // Empêcher la propagation du clic

        // Retirer la classe active de tous les éléments
        addable_content.forEach(elem => elem.classList.remove("active"));

        // Ajouter la classe active à l'élément cliqué
        const targeted_element = event.currentTarget;
        targeted_element.classList.add("active");

        // Récupérer l'ID de l'image et créer le panneau
        const img = targeted_element.querySelector("img");
        if (img) {
            createPannelFromId(img.id);

            // Attendre que le panel soit créé et ajouter l'écouteur
            setTimeout(() => {
                const newPanel = document.getElementById("config_panel");
                if (newPanel) {
                    setupPanelClickOutside(newPanel);
                }
            }, 50);
        }
    });
});
