const addable_content = document.querySelectorAll(".header_element");
const main = document.querySelector("main");
const panel = document.getElementById("config_panel");
const panelTitle = document.getElementById("panel_title");

const pannelNeedsForId = {
    "textarea": {
        title: "Configuration - TextArea",
        fields: [
            {name :"posX", label:"X",type:"number",placeholder:"Position X en pixel...",default:0},
            {name : "posY", label:"Y",type:"number",placeholder:"Position Y en pixel...",default:0},
            {name : "text", label:"Texte",type:"textarea",placeholder:"Lorem ipsum...",default:"Lorem ipsum..."},
            {name : "zindex", label:"Z-Index",type:"number",placeholder:"Plan de l'élément (ex : 0 pour l'arrière plan)...",default:0}
        ]
    }
}

function createPannelFromId(elemId){
        //On supprime un éventuel ancien panneau
        const oldPannel = document.getElementById("config_panel");
        if(oldPannel) oldPannel.remove();
        //On créer le panneau de configuration
        const newPannel = document.createElement("div")
        newPannel.id = "config_panel";
        main.appendChild(newPannel);
        //On créer les champs du panneau de configuration
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
        setTimeout(() => {
            newPannel.classList.add("open");
        }, 10);

}

addable_content.forEach(element => {
    element.addEventListener("click", (event) => {

        addable_content.forEach(event => event.classList.remove("active"));
        const targeted_element = event.currentTarget;
        targeted_element.classList.add("active");

        const img = targeted_element.querySelector("img");
        createPannelFromId(img.id);
        })
        

});