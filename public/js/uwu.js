
        /* --- 2. JavaScript : La Logique --- */
        
        let nodes = []; // Liste des données des pages
        let links = []; // Liste des liens {from: id, to: id}
        let selectedNodeId = null;
        
        // Variables pour le mode liaison
        let isLinkMode = false;
        let linkStartNodeId = null;

        const workspace = document.getElementById('workspace');
        const connectionsLayer = document.getElementById('connections-layer');

        // 1. Ajouter un nœud (au centre ou aléatoire)
        function addNode() {
            const id = Date.now(); // ID unique simple
            console.log("id du noeud créé : "+id);
            const node = {
                id: id,
                name: "Nouvelle Page",
                desc: "",
                x: 50 + Math.random() * 200,
                y: 50 + Math.random() * 200
            };
            nodes.push(node);
            renderNodes();
        }

        // 2. Affichage des nœuds (Rendering)
        function renderNodes() {
            // On garde le SVG, on nettoie juste les divs nœuds
            const existingNodes = document.querySelectorAll('.node');
            existingNodes.forEach(el => el.remove());

            nodes.forEach(node => {
                const el = document.createElement('div');
                el.className = 'node';
                if (node.id === selectedNodeId) el.classList.add('selected');
                
                // Style visuel "Trépied" simplifié (juste une boite pour l'instant)
                el.style.left = node.x + 'px';
                el.style.top = node.y + 'px';
                el.innerHTML = `<strong>${node.name}</strong>`;
                
                // Événement clic sur le nœud
                el.onclick = (e) => {
                    e.stopPropagation(); // Empêche le clic sur le workspace
                    handleNodeClick(node.id);
                };

                //Ajout basique de Drag & Drop pour placer les éléments
                el.onmousedown = (e) =>{
                    e.stopPropagation();
                    startDrag(e, node);
                };
                
                //Lorsqu'on double clique sur un noeud alors une page html est créée
                el.ondblclick=(e)=>{
                    e.stopPropagation();
                    console.log("Noeud double cliqué : "+node.id);

                    fetch('/create-page', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id:node.id,
                            title:node.name,
                            page_content:node.desc
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        console.log(data.status);
                        if (data.url) {
                            window.open(data.url, '_blank');
                        }
                    })
                    .catch(error => console.error('Erreur:', error));
                }

                workspace.appendChild(el);
            });

            renderLinks();
        }

        // 3. Gestion des clics sur les nœuds
        function handleNodeClick(id) {
            if (isLinkMode) {
                // Logique de création de lien en 2 clics
                if (linkStartNodeId === null) {
                    // Premier clic : Point de départ
                    linkStartNodeId = id;
                    //alert("Départ sélectionné. Cliquez sur la page cible.");
                } else {
                    // Deuxième clic : Cible
                    if (linkStartNodeId !== id) {
                        links.push({ from: linkStartNodeId, to: id });
                        renderLinks();
                        linkStartNodeId = null; // Reset
                        //toggleLinkMode(); // Désactiver le mode après création (optionnel)
                    } else {
                        alert("Impossible de lier une page à elle-même.");
                        linkStartNodeId = null;
                    }
                }
            } else {
                // Mode normal : Sélection pour édition sidebar
                selectedNodeId = id;
                renderNodes(); // Pour mettre à jour la classe .selected
                populateSidebar(id);
            }
        }

        // 4. Remplir la sidebar
        function populateSidebar(id) {
            const node = nodes.find(n => n.id === id);
            if (node) {
                document.getElementById('input-name').value = node.name;
                document.getElementById('input-desc').value = node.desc;
            }
        }

        // 5. Mise à jour des données depuis la sidebar
        function updateNodeData() {
            if (!selectedNodeId) return;
            const node = nodes.find(n => n.id === selectedNodeId);
            node.name = document.getElementById('input-name').value;
            node.desc = document.getElementById('input-desc').value;
            renderNodes(); // Mettre à jour le texte dans la boite
        }

        // 6. Gestion du Mode Liaison
        function toggleLinkMode() {
            isLinkMode = !isLinkMode;
            linkStartNodeId = null; // Reset si on change de mode
            const btn = document.getElementById('btn-link');
            btn.innerText = isLinkMode ? "🔗 Mode Liaison (ON)" : "🔗 Mode Liaison (OFF)";
            btn.classList.toggle('active');
        }

        // 7. Dessiner les flèches (SVG)
        function renderLinks() {
            // Nettoyer les lignes existantes (sauf le marker defs)
            const lines = connectionsLayer.querySelectorAll('line');
            lines.forEach(line => line.remove());

            links.forEach(link => {
                const nodeA = nodes.find(n => n.id === link.from);
                const nodeB = nodes.find(n => n.id === link.to);

                if (nodeA && nodeB) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    
                    // Calcul du centre des boites (Largeur 120, Hauteur 80)
                    const x1 = nodeA.x + 60; 
                    const y1 = nodeA.y + 40;
                    const x2 = nodeB.x + 60;
                    const y2 = nodeB.y + 40;

                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('marker-end', 'url(#arrowhead)'); // Pointe de flèche

                    connectionsLayer.appendChild(line);
                }
            });
        }


        // 8. Supprimer un nœud
        function deleteSelected() {
            if (!selectedNodeId) return;
            // Retirer le nœud
            nodes = nodes.filter(n => n.id !== selectedNodeId);
            // Retirer les liens associés
            links = links.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId);
            
            selectedNodeId = null;
            document.getElementById('input-name').value = "";
            document.getElementById('input-desc').value = "";
            renderNodes();
        }
        /*
        function saveData() {
            console.log("Sauvegarde JSON:", JSON.stringify({nodes, links}));
            alert("Données affichées dans la console (F12)");
        }*/

        function handleWorkspaceClick(e) {
            // Si on clique dans le vide, on désélectionne
            if (e.target.id === 'workspace' || e.target.id === 'connections-layer') {
                selectedNodeId = null;
                renderNodes();
            }
        }

        // --- Petit bonus : Drag and Drop basique pour bouger les boites ---
        function startDrag(e, node) {
            if(isLinkMode) return; // Pas de drag en mode liaison

            const startX = e.clientX;
            const startY = e.clientY;
            const startNodeX = node.x;
            const startNodeY = node.y;

            function onMouseMove(ev) {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                node.x = startNodeX + dx;
                node.y = startNodeY + dy;
                renderNodes(); // Met à jour position + flèches
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        // Init : Un nœud Home au départ
        nodes.push({id: 1, name: "Home", desc: "Page d'accueil", x: 300, y: 100});
        renderNodes();
        
        let workspaceDragged=false;
        let pos0mouseX=0;
        let pos0mousey=0;


        workspace.addEventListener('mousedown',(event)=>{
            workspaceDragged=true;
            pos0mouseX=event.clientX;
            pos0mouseY=event.clientY;
        });

        workspace.addEventListener('mouseup',(event)=>{
            workspaceDragged=false;
        });

        let bgX=0;
        let bgY=0;

        workspace.addEventListener('mousemove',(event)=>{
            workspace.style.cursor = workspaceDragged ? "grabbing" : "grab";
            if(!workspaceDragged) return;

            let dx=event.clientX-pos0mouseX;
            let dy=event.clientY-pos0mouseY;
            
            bgX+=dx;
            bgY+=dy;

            workspace.style.backgroundPositionX=`${bgX}px`;
            workspace.style.backgroundPositionY=`${bgY}px`;

            nodes.forEach((node)=>{
                node.x+=dx;
                node.y+=dy;                
            });

            pos0mouseX=event.clientX;
            pos0mouseY=event.clientY;

            
            renderNodes();
            renderLinks();
        });


        let btn_del=document.getElementById("btn_del");
        btn_del.addEventListener("click", (event)=>{
            nodes=[];
            links=[];
            selectedNodeId = null;
            
            renderNodes();
            renderLinks();
        });
        

        //Fonction permettant d'importer un arbre grâce à un fichier json
        let input_import=document.getElementById('file-input');
        let div_err_import=document.getElementById("div_err_import");
        div_err_import.style.visibility='hidden';
        
        function importData(){
            input_import.click();
            
            /////A COMPLETER //////////////////////////////////////////////////////////////////////////
        }
        input_import.addEventListener('change', (event)=>{
            if(input_import.files==null) return;

            const file=input_import.files[0];
            console.log(file);

            if(!file.name.endsWith('json')){
                div_err_import.innerHTML=`ATTENTION : Fichier JSON requis`;
                div_err_import.style.color='red';
                div_err_import.style.visibility='visible';
            }
            else if(file.type !== "application/json"){
                div_err_import.innerHTML=`ATTENTION : Type de fichier invalide`;
                div_err_import.style.color='red';
                div_err_import.style.visibility='visible';
            }
            else{
                div_err_import.innerHTML=`Fichier chargé avec succès !`;
                div_err_import.style.color='green';
                div_err_import.style.visibility='visible';
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const data = JSON.parse(e.target.result);

                    // Vérification de structure
                    if (!data.nodes || !data.links) {
                        div_err_import.innerHTML=`ATTENTION : Fichier JSON invalide ou corrompu`;
                        div_err_import.style.color='red';
                        div_err_import.style.visibility='visible';
                    }
                    else{
                        div_err_import.innerHTML=`Fichier chargé avec succès !`;
                        div_err_import.style.color='green';
                        div_err_import.style.visibility='visible';

                        //Récupération et affichage des noeuds et des liens :
                        nodes=data.nodes;
                        links=data.links;

                        renderNodes();
                        renderLinks();
                    }

            };


            reader.readAsText(file);

        });



let input_project_name=document.getElementById("input_project_name");

let div_err_project_name=document.getElementById("div_err_project_name");
div_err_project_name.style.color="red";

async function saveData() {

    console.log(input_project_name.value);

    if(input_project_name.value.length==0){
        div_err_project_name.innerHTML="Veuillez entrer un nom pour ce projet";
        return;
    }
    let title=input_project_name.value;
    const projectData = { nodes, links, title}; // Récupère tes données actuelles

    try {
        const response = await fetch('/save-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData),
            
        });
        
        if (response.ok) {
            div_err_project_name.innerHTML="Projet sauvegardé avec succès";
            div_err_project_name.style.color="green";
        }
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
    }
}
        
