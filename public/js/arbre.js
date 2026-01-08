/* --- DANS JS/ARBRE.JS (Tout en haut) --- */

let nodes = [];
let links = [];
let selectedNodeId = null;

// --- CHARGEMENT INTELLIGENT ---
window.addEventListener('DOMContentLoaded', () => {
    // On utilise sessionStorage au lieu de localStorage
    // sessionStorage s'efface quand tu fermes l'onglet !
    const savedData = sessionStorage.getItem('uwu_autosave');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            if (data.nodes) nodes = data.nodes;
            if (data.links) links = data.links;
            
            const nameInput = document.getElementById('input_project_name');
            if (nameInput && data.projectName) {
                nameInput.value = data.projectName;
            }

            renderNodes();
            console.log("♻️ Retour de l'éditeur : Projet restauré.");
            
            // OPTIONNEL : Si tu veux que la sauvegarde s'efface une fois chargée 
            // (pour être sûr que si tu fais F5 ça reparte à zéro), décommente la ligne dessous :
            // sessionStorage.removeItem('uwu_autosave'); 
            
        } catch (e) {
            console.error("Erreur restauration", e);
        }
    }
});
// Mode liaison
let isLinkMode = false;
let linkStartNodeId = null;

const workspace = document.getElementById('workspace');
const connectionsLayer = document.getElementById('connections-layer');

// 1. Ajouter un nœud
function addNode() {
    const id = Date.now();
    const node = {
        id: id,
        name: "Nouvelle Page",
        desc: "Description...",
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 200
    };
    nodes.push(node);
    renderNodes();

    // Création initiale du fichier
    fetch('/create-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: node.id,
            title: node.name,
            page_content: node.desc
        })
    }).then(r => console.log("Page créée:", r.status));
}

// 2. Affichage
function renderNodes() {
    // Nettoyage des noeuds existants (sauf SVG)
    document.querySelectorAll('.node').forEach(el => el.remove());

    nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'node';
        if (node.id === selectedNodeId) el.classList.add('selected');
        
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        el.innerHTML = `<strong>${node.name}</strong>`;
        
        // Clic simple
        el.onclick = (e) => {
            e.stopPropagation();
            handleNodeClick(node.id);
        };

        // Drag & Drop
        el.onmousedown = (e) => {
            e.stopPropagation();
            startDrag(e, node);
        };
        
        // --- DOUBLE CLIC CORRIGÉ ---
        // On ouvre la page au lieu de la recréer
        el.ondblclick = (e) => {
            e.stopPropagation();
            // Le ?t= force le rechargement sans cache pour voir les modifs
            const url = `/pages/page_${node.id}.html?t=${Date.now()}`;
            window.open(url, '_blank');
        }

        workspace.appendChild(el);
    });

    renderLinks();
}

// 3. Gestion des clics (Liaison + Sélection)
function handleNodeClick(id) {
    if (isLinkMode) {
        if (linkStartNodeId === null) {
            // 1er clic : Départ
            linkStartNodeId = id;
        } else {
            // 2ème clic : Arrivée
            if (linkStartNodeId !== id) {
                // Création visuelle
                links.push({ from: linkStartNodeId, to: id });
                renderLinks();

                // --- SAUVEGARDE DU LIEN DANS LE HTML ---
                fetch('/add-link-between-pages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fromId: linkStartNodeId, toId: id })
                })
                .then(r => r.json())
                .then(d => console.log("Lien HTML :", d.status));
                // ----------------------------------------

                linkStartNodeId = null;
            } else {
                alert("Impossible de lier à soi-même");
                linkStartNodeId = null;
            }
        }
    } else {
        // Mode Édition
        selectedNodeId = id;
        renderNodes();
        populateSidebar(id);
    }
}

// 4. Sidebar
// 4. Remplir la sidebar (Mise à jour pour le bouton Modifier)
// 4. Remplir la sidebar (AVEC SAUVEGARDE AUTO)
// --- DANS JS/ARBRE.JS (Vers la fin) ---

function populateSidebar(id) {
    const node = nodes.find(n => n.id === id);
    if (node) {
        document.getElementById('input-name').value = node.name;
        document.getElementById('input-desc').value = node.desc;

        const btnEdit = document.getElementById('btn-edit');
        
        // On clone le bouton pour supprimer les anciens écouteurs d'événements (sécurité)
        const newBtn = btnEdit.cloneNode(true);
        btnEdit.parentNode.replaceChild(newBtn, btnEdit);
        
        newBtn.onclick = () => {
            // SAUVEGARDE TEMPORAIRE
            const currentState = {
                nodes: nodes,
                links: links,
                projectName: document.getElementById('input_project_name').value
            };
            
            // On écrit dans sessionStorage (mémoire temporaire de l'onglet)
            sessionStorage.setItem('uwu_autosave', JSON.stringify(currentState));

            // On part vers l'éditeur
            window.location.href = `/html/editor.html?id=${id}`;
        };
    }
}
// 5. Mise à jour (Texte + HTML)
function updateNodeData() {
    if (!selectedNodeId) return;
    
    const node = nodes.find(n => n.id === selectedNodeId);
    node.name = document.getElementById('input-name').value;
    node.desc = document.getElementById('input-desc').value;
    
    renderNodes(); 

    // --- SAUVEGARDE DU TITRE DANS LE HTML ---
    fetch('/update-page-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: node.id,
            title: node.name,
            contentDesc: node.desc
        })
    }).then(r => console.log("Update HTML:", r.status));
}

// 6. Mode Liaison Toggle
function toggleLinkMode() {
    isLinkMode = !isLinkMode;
    linkStartNodeId = null;
    const btn = document.getElementById('btn-link');
    btn.innerText = isLinkMode ? "🔗 Mode Liaison (ON)" : "🔗 Mode Liaison (OFF)";
    btn.classList.toggle('active');
}

// 7. Dessin des flèches SVG
function renderLinks() {
    const lines = connectionsLayer.querySelectorAll('line');
    lines.forEach(line => line.remove());

    links.forEach(link => {
        const nodeA = nodes.find(n => n.id === link.from);
        const nodeB = nodes.find(n => n.id === link.to);

        if (nodeA && nodeB) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            // Centre des boites (x + largeur/2, y + hauteur/2)
            // Ajuste 60 et 40 selon la taille CSS réelle de tes boites
            line.setAttribute('x1', nodeA.x + 60); 
            line.setAttribute('y1', nodeA.y + 40);
            line.setAttribute('x2', nodeB.x + 60);
            line.setAttribute('y2', nodeB.y + 40);
            line.setAttribute('marker-end', 'url(#arrowhead)');
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '2');

            connectionsLayer.appendChild(line);
        }
    });
}

// 8. Suppression
function deleteSelected() {
    if (!selectedNodeId) return;

    fetch('/delete-page', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id:selectedNodeId})
    });

    nodes = nodes.filter(n => n.id !== selectedNodeId);
    links = links.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId);
    
    selectedNodeId = null;
    document.getElementById('input-name').value = "";
    document.getElementById('input-desc').value = "";
    renderNodes();
}

function handleWorkspaceClick(e) {
    if (e.target.id === 'workspace' || e.target.id === 'connections-layer') {
        selectedNodeId = null;
        renderNodes();
    }
}

// --- Drag and Drop ---
function startDrag(e, node) {
    if(isLinkMode) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;

    function onMouseMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        node.x = startNodeX + dx;
        node.y = startNodeY + dy;
        renderNodes();
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// --- Navigation Workspace ---
let workspaceDragged=false;
let pos0mouseX=0;
let pos0mouseY=0;
let bgX=0;
let bgY=0;

workspace.addEventListener('mousedown',(event)=>{
    // On ne drag pas si on clique sur un node
    if(event.target.closest('.node')) return;
    workspaceDragged=true;
    pos0mouseX=event.clientX;
    pos0mouseY=event.clientY;
});

workspace.addEventListener('mouseup',()=> workspaceDragged=false);

workspace.addEventListener('mousemove',(event)=>{
    if(!workspaceDragged) return;
    workspace.style.cursor = "grabbing";

    let dx=event.clientX-pos0mouseX;
    let dy=event.clientY-pos0mouseY;
    
    bgX+=dx;
    bgY+=dy;

    workspace.style.backgroundPositionX=`${bgX}px`;
    workspace.style.backgroundPositionY=`${bgY}px`;

    // Déplacer tous les noeuds
    nodes.forEach((node)=>{
        node.x+=dx;
        node.y+=dy;                
    });

    pos0mouseX=event.clientX;
    pos0mouseY=event.clientY;
    
    renderNodes();
});

// Supprimer Tout
document.getElementById("btn_del").addEventListener("click", ()=>{
    if(confirm("Tout supprimer ?")){
        fetch('/delete-all-pages',{
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify({nodes:nodes.map(n => n.id)})
        });
        nodes=[];
        links=[];
        selectedNodeId = null;
        renderNodes();
    }
});

// Import / Export
let input_import = document.getElementById('file-input');
let input_project_name = document.getElementById("input_project_name");

function importData(){ input_import.click(); }

input_import.addEventListener('change', (event)=>{
    if(!input_import.files.length) return;
    const file = input_import.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.nodes && data.links) {
                nodes = data.nodes;
                links = data.links;
                renderNodes();
                input_project_name.value = file.name.replace('.json', '');
                alert("Projet chargé !");
            }
        } catch(err) {
            alert("Fichier invalide");
        }
    };
    reader.readAsText(file);
});

async function saveData() {
    let title = input_project_name.value.trim() || "Projet_Sans_Nom";
    const projectData = { nodes, links, title };
    
    await fetch('/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
    });
    alert("Projet sauvegardé !");
}

// Bouton Nouveau Projet
const btnNew = document.getElementById("btn_new");

if (btnNew) {
    btnNew.addEventListener("click", () => {
        // 1. Petite sécurité pour ne pas tout perdre par erreur
        if (nodes.length > 0) {
            const confirmNew = confirm("Créer un nouveau projet ? \n(Les modifications non sauvegardées du projet actuel seront effacées de l'écran)");
            if (!confirmNew) return;
        }

        // 2. On vide les variables en mémoire
        nodes = [];
        links = [];
        selectedNodeId = null;

        // 3. On vide les champs de texte
        document.getElementById('input_project_name').value = "";
        document.getElementById('input-name').value = "";
        document.getElementById('input-desc').value = "";

        // 4. IMPORTANT : On nettoie la sauvegarde automatique
        // Sinon, si l'utilisateur fait F5, l'ancien projet reviendrait !
        sessionStorage.removeItem('uwu_autosave');

        // 5. On rafraîchit l'affichage (qui sera donc vide)
        renderNodes();
        
        console.log("✨ Nouveau projet vierge créé !");
    });
}
