/* --- VARIABLES GLOBALES --- */
let nodes = [];
let links = [];
let selectedNodeId = null;
let saveTimeout = null;

// Mode liaison
let isLinkMode = false;
let linkStartNodeId = null;

const workspace = document.getElementById('workspace');
const connectionsLayer = document.getElementById('connections-layer');

/* --- 1. FONCTIONS PRINCIPALES --- */

// Cette fonction crée une nouvelle bulle à l'écran ET demande au serveur de créer les fichiers.
async function addNode() {
    // Génère un ID unique basé sur l'heure exacte (ex: 1704567890123).
    const id = Date.now();
    const name = "Nouvelle Page";

    // 1. Création de l'objet JS pour l'affichage local
    const node = {
        id: id,
        name: name,
        desc: "",
        x: 50 + Math.random() * 200, // Position aléatoire pour ne pas empiler
        y: 50 + Math.random() * 200
    };
    
    // Ajout à la liste locale et rafraîchissement de l'affichage
    nodes.push(node);
    renderNodes();

    // 2. Envoi au serveur (C'est ici qu'on appelle la Route 3 du serveur)
    try {
        await fetch('/save-page', {
            method: 'POST', // On envoie des données
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: node.id,
                name: node.name,
                contentData: null // Pas encore de contenu, juste la création
            })
        });
        console.log("Fichiers serveur initialisés pour " + id);
    } catch (e) {
        console.error("Erreur création page:", e);
    }
}

// Fonction pour mettre à jour le nom/description quand l'utilisateur tape du texte
function updateNodeData() {
    if (!selectedNodeId) return;
    
    // On trouve la bonne bulle dans la mémoire
    const node = nodes.find(n => n.id === selectedNodeId);
    
    // On met à jour avec ce qu'il y a dans les champs de texte
    node.name = document.getElementById('input-name').value;
    node.desc = document.getElementById('input-desc').value;
    
    renderNodes(); // On redessine pour voir le nouveau nom sur la bulle

    // --- TEMPORISATION (Debounce) ---
    // Si l'utilisateur tape encore, on annule la sauvegarde précédente.
    // On attend 1 seconde (1000ms) de pause avant d'envoyer au serveur.
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
        await fetch('/save-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: node.id,
                name: node.name,
                // On ne touche pas au 'contentData' ici pour ne pas effacer le contenu HTML
            })
        });
        console.log("Nom mis à jour sur le serveur");
    }, 1000);
}

// --- NOUVEAU : Ajout automatique d'un bouton de navigation ---
// sourceId = La page où on est
// targetId = La page où on veut aller
async function addLinkButton(sourceId, targetId) {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    console.log(`Ajout bouton de ${sourceNode.name} vers ${targetNode.name}...`);

    try {
        // ÉTAPE 1 : LIRE (Appel à la Route 4 du serveur)
        // On récupère le fichier JSON actuel de la page source pour ne pas écraser ce qui existe déjà.
        const response = await fetch(`/get-page-json/${sourceId}`);
        const pageData = await response.json();

        // ÉTAPE 2 : CALCULER
        // On décide où placer le nouveau bouton (position aléatoire)
        const randX = 50 + Math.floor(Math.random() * 350);
        const randY = 50 + Math.floor(Math.random() * 350);

        // ÉTAPE 3 : CRÉER L'OBJET
        // On fabrique le bloc de données qui représente le bouton
        const newBlock = {
            type: 'link-button', // Pour que l'éditeur sache quoi faire plus tard
            props: { x: randX, y: randY },
            // Le HTML qui sera injecté dans la page finale :
            html: `<div class="nav-block" style="position: absolute; left: ${randX}px; top: ${randY}px; ...">
                    <p>Vers : ${targetNode.name}</p>
                    <a href="${targetId}.html" class="nav-btn">Go ➤</a>
                   </div>`
        };

        // Si la liste 'blocks' n'existait pas, on la crée
        if (!pageData.blocks) pageData.blocks = [];
        
        // On ajoute notre nouveau bouton à la liste existante
        pageData.blocks.push(newBlock);

        // ÉTAPE 4 : SAUVEGARDER (Appel à la Route 3 du serveur)
        // On renvoie TOUT le contenu mis à jour au serveur.
        await fetch('/save-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: sourceId,
                contentData: pageData.blocks // On met à jour le contenu
            })
        });
        console.log("Bouton ajouté avec succès !");
        
    } catch (error) {
        console.error("Problème lors de l'ajout du bouton:", error);
    }
}

/* --- 2. AFFICHAGE (RENDERING) --- */

function renderNodes() {
    document.querySelectorAll('.node').forEach(el => el.remove());

    nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'node';
        if (node.id === selectedNodeId) el.classList.add('selected');
        
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        el.innerHTML = `<strong>${node.name}</strong>`;
        
        el.onclick = (e) => {
            e.stopPropagation();
            handleNodeClick(node.id);
        };

        el.onmousedown = (e) => {
            if(!isLinkMode) {
                e.stopPropagation();
                startDrag(e, node);
            }
        };
        workspace.appendChild(el);
    });
    renderLinks();
}

function renderLinks() {
    const lines = connectionsLayer.querySelectorAll('line');
    lines.forEach(line => line.remove());

    links.forEach(link => {
        const nodeA = nodes.find(n => n.id === link.from);
        const nodeB = nodes.find(n => n.id === link.to);

        if (nodeA && nodeB) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', nodeA.x + 60); 
            line.setAttribute('y1', nodeA.y + 40);
            line.setAttribute('x2', nodeB.x + 60);
            line.setAttribute('y2', nodeB.y + 40);
            line.setAttribute('marker-end', 'url(#arrowhead)');
            connectionsLayer.appendChild(line);
        }
    });
}

/* --- 3. INTERACTION (Le Système Nerveux) --- */

// Cette fonction est le "Cerveau du Clic". Elle décide quoi faire quand on clique sur une bulle.
function handleNodeClick(id) {
    // CAS 1 : On est en mode "Création de liens" (L'utilisateur a activé le bouton 🔗)
    if (isLinkMode) {
        
        // Sous-cas A : C'est le tout premier clic (Départ du lien)
        if (linkStartNodeId === null) {
            linkStartNodeId = id; // On mémorise l'ID de départ
            alert(`Départ sélectionné. Cliquez sur la cible.`);
        } 
        // Sous-cas B : C'est le deuxième clic (Arrivée du lien)
        else {
            // Vérification de sécurité : On ne peut pas lier une page à elle-même
            if (linkStartNodeId !== id) {
                
                // 1. Mise à jour visuelle du graphe (La flèche noire)
                links.push({ from: linkStartNodeId, to: id });
                renderLinks();
                
                // 2. Mise à jour fonctionnelle du contenu (Le bouton HTML dans la page)
                // C'est ici qu'on appelle la fonction intelligente vue plus haut
                addLinkButton(linkStartNodeId, id);

                // 3. Réinitialisation pour le prochain lien
                linkStartNodeId = null; 
            } else {
                alert("Impossible de lier à soi-même");
                linkStartNodeId = null; // On annule tout si erreur
            }
        }
    } 
    // CAS 2 : Mode normal (Sélection et Edition)
    else {
        selectedNodeId = id; // On marque cette bulle comme "active"
        renderNodes(); // On redessine pour afficher la bordure bleue (style .selected)
        
        // On remplit les champs de texte à gauche pour pouvoir modifier le nom
        const node = nodes.find(n => n.id === id);
        document.getElementById('input-name').value = node.name;
        document.getElementById('input-desc').value = node.desc || "";
    }
}

// Interrupteur ON/OFF pour le mode liaison
function toggleLinkMode() {
    isLinkMode = !isLinkMode; // Inverse la valeur (Vrai devient Faux, et vice-versa)
    linkStartNodeId = null;   // Si on change de mode, on oublie le clic de départ en cours
    
    // Mise à jour visuelle du bouton dans l'interface
    const btn = document.getElementById('btn-link');
    btn.innerText = isLinkMode ? "🔗 Mode Liaison (ON)" : "🔗 Mode Liaison (OFF)";
    btn.classList.toggle('active'); // Change la couleur du bouton (CSS)
}

// Fonction "Gomme" : Supprime une page et tout ce qui y est attaché
function deleteSelected() {
    if (!selectedNodeId) return; // Si rien n'est sélectionné, on ne fait rien
    
    // 1. On garde toutes les bulles SAUF celle qu'on veut supprimer
    nodes = nodes.filter(n => n.id !== selectedNodeId);
    
    // 2. On garde tous les liens SAUF ceux qui partent ou arrivent à cette bulle
    links = links.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId);
    
    // 3. Nettoyage
    selectedNodeId = null;
    renderNodes(); // On redessine le graphe mis à jour
}

// Logique complexe du "Drag & Drop" (Glisser-Déposer)
function startDrag(e, node) {
    // On mémorise où était la souris et la bulle au moment précis du clic (mousedown)
    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;

    // Fonction temporaire qui tourne tant qu'on bouge la souris
    function onMouseMove(ev) {
        // Calcul du déplacement (Delta) : Position actuelle - Position de départ
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        
        // On applique ce déplacement à la bulle
        node.x = startNodeX + dx;
        node.y = startNodeY + dy;
        
        renderNodes(); // Mise à jour en temps réel (donne l'impression de fluidité)
    }
    
    // Fonction qui nettoie tout quand on relâche le clic
    function onMouseUp() {
        // IMPORTANT : On retire les écouteurs pour ne pas continuer à bouger la bulle sans cliquer
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    // On écoute les mouvements sur tout le document ('document') et pas juste la bulle.
    // Pourquoi ? Si on bouge la souris très vite, le curseur peut sortir de la bulle.
    // En écoutant le document entier, on ne "perd" jamais la bulle qu'on traîne.
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Désélectionner quand on clique dans le vide
function handleWorkspaceClick(e) {
    // Si on clique sur le fond blanc (workspace) ou la couche des traits (connections-layer)
    if (e.target.id === 'workspace' || e.target.id === 'connections-layer') {
        selectedNodeId = null; // On oublie la sélection
        renderNodes(); // On retire la bordure bleue
    }
}

// Sauvegarde globale du projet (Structure du graphe)
async function saveData() {
    try {
        // On envoie tout le tableau 'nodes' et 'links' au serveur
        await fetch('/save-project', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nodes, links})
        });
        alert("Projet sauvegardé !");
    } catch (e) { console.error(e); }
}

// Lancer le site généré pour voir le résultat final
function previewProject() {
    if (nodes.length === 0) return alert("Projet vide !");
    
    // Petite astuce intelligente :
    // On cherche une page qui contient "home" dans son nom pour l'ouvrir en premier.
    // Sinon, on ouvre juste la première page de la liste.
    let startNode = nodes.find(n => n.name.toLowerCase().includes("home")) || nodes[0];
    
    // Ouvre un nouvel onglet vers le fichier HTML généré par le serveur
    window.open(`/pages/${startNode.id}.html`, '_blank');
}

// --- DÉMARRAGE ---
// La toute première chose qui s'exécute quand le script charge : on dessine ce qu'on a.
renderNodes();