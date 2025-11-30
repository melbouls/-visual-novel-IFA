/* --- CONFIGURATION DES IMAGES (VERSION SANS ACCENT ET COHÉRENTE) --- */
const assets = {
    bg: {
        salle: "assets/bgdoki.png",
        noir: "assets/bgnoir.png", 
        sang: "assets/bgsacrifice.png"
    },
    char: {
        // IMAGE DE GROUPE
        tous_choques: "assets/antoine dead.png", 
        
        // La théière volante (Clé sans accent pour la stabilité)
        theiere: "assets/theiere.png", 

        // FATIHA
        fatiha: "assets/fatiha normal.png", 
        fatiha_choquee: "assets/fatiha choqué.png", 

        // ANTOINE
        antoine: "assets/smiling antoine.png", 
        antoine_choque: "assets/confused antoine.png", 
        // Doit correspondre à 'dead antoine.png'
        antoine_mort: "assets/dead antoine.png", 
        
        // CHERIFA
        cherifette: "assets/cherifa normal.png",
        cherifette_peur: "assets/cherifa scared.png", 
        cherifette_ko: "assets/cherifa dead.png", 

        // ANISSA
        anissa: "assets/Nissa smiling.png", 
        anissa_folle: "assets/crazy Anissa.png", 
        
        // AYMEN
        aymen: "assets/aymen normal.png", 
        aymen_theiere: "assets/aymen theiere.png", 

        // AMIR
        amir: "assets/amir normal.png", 
        amir_peur: "assets/Amir scared.png", 

        // MEHA
        meha: "assets/maha normal.png", 
        meha_folle: "assets/maha couteau.png" 
    }
};

/* --- MOTEUR DE JEU (Aucun changement ici) --- */
const game = {
    playerName: "Joueur",
    currentScene: [],
    stepIndex: 0,
    flags: {
        anissa_jealousy: 0,
        aymen_respect: 0,
        meha_suspicion: 0
    },

    // Gestion des Crédits
    showCredits: () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('credits-screen').classList.remove('hidden');
    },
    hideCredits: () => {
        document.getElementById('credits-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    },

    showNameScreen: () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('name-input-screen').classList.remove('hidden');
    },

    startGame: () => {
        const input = document.getElementById('player-name-input').value;
        // Réinitialiser les flags à chaque nouvelle partie
        game.flags = { anissa_jealousy: 0, aymen_respect: 0, meha_suspicion: 0 };
        
        if(input.trim()) game.playerName = input;
        
        document.getElementById('name-input-screen').classList.add('hidden');
        document.getElementById('game-play').classList.remove('hidden');
        
        game.loadScene('intro');
    },

    // Affichage des résultats / Score
    showScoreScreen: () => {
        document.getElementById('game-play').classList.add('hidden');
        const statsDiv = document.getElementById('final-stats');
        
        let comment = "Vos choix ont façonné ce terrible événement. ";

        if (game.flags.meha_suspicion > 1) {
            comment += "<br>⚠️ **Maha** vous a clairement identifié comme une menace potentielle.";
        } else if (game.flags.meha_suspicion > 0) {
             comment += "<br>⚠️ **Maha** vous a trouvé légèrement suspect.";
        } else {
             comment += "<br>✅ **Maha** ne vous a pas remarqué.";
        }

        if (game.flags.anissa_jealousy > 3) {
            comment += "<br>💔 **Nissa** était incontrôlable et a causé une catastrophe !";
        } else if (game.flags.anissa_jealousy < 0) {
             comment += "<br>🤝 **Nissa** était plus détendue grâce à vous.";
        } else {
             comment += "<br>🔥 **Nissa** restait sur ses gardes.";
        }

        if (game.flags.aymen_respect > 0) {
            comment += "<br>🎨 **Aymen** a respecté votre approche du débat.";
        } else if (game.flags.aymen_respect < 0) {
             comment += "<br>📉 **Aymen** n'a pas aimé votre critique.";
        } else {
             comment += "<br>🎨 **Aymen** a gardé son calme artistique.";
        }

        statsDiv.innerHTML = `
            <p>🔥 Jalousie de Nissa : <strong>${game.flags.anissa_jealousy}</strong></p>
            <p>🎨 Respect d'Aymen : <strong>${game.flags.aymen_respect}</strong></p>
            <p>🔪 Suspicion de Maha : <strong>${game.flags.meha_suspicion}</strong></p>
            <hr>
            <p style="font-size:18px; font-style: italic;">${comment}</p>
        `;

        document.getElementById('score-screen').classList.remove('hidden');
    },

    loadScene: (sceneName) => {
        if (sceneName === "score_recap") {
            game.showScoreScreen();
            return;
        }

        if(scenario[sceneName]) {
            game.currentScene = scenario[sceneName];
            game.stepIndex = 0;
            game.updateDisplay();
        } else {
            console.error("Scène introuvable: " + sceneName);
        }
    },

    updateDisplay: () => {
        const step = game.currentScene[game.stepIndex];
        const ui = {
            bg: document.getElementById('background-layer'),
            char: document.getElementById('char-img'),
            name: document.getElementById('speaker-name'),
            text: document.getElementById('dialogue-text'),
            choices: document.getElementById('choices-container'),
            box: document.getElementById('dialogue-box')
        };

        if(step.choices) {
            ui.box.style.pointerEvents = 'none'; 
            ui.choices.innerHTML = "";
            ui.choices.classList.remove('hidden');

            step.choices.forEach(opt => {
                const btn = document.createElement('div');
                btn.className = "choice-btn";
                btn.innerText = opt.text;
                btn.onclick = () => {
                    ui.choices.classList.add('hidden');
                    ui.box.style.pointerEvents = 'auto';
                    if(opt.effect) opt.effect(); 
                    game.loadScene(opt.next);
                };
                ui.choices.appendChild(btn);
            });
            return;
        }

        if(step.action === "shake") {
            document.getElementById('game-container').classList.add('shake');
            setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 500);
        }
        if(step.action === "flash") {
            document.getElementById('fx-layer').classList.add('flash-red');
            setTimeout(() => document.getElementById('fx-layer').classList.remove('flash-red'), 200);
        }

        if(step.bg) ui.bg.style.backgroundImage = `url('${assets.bg[step.bg]}')`;

        if(step.char) {
            if (assets.char[step.char]) {
                ui.char.src = assets.char[step.char];
                ui.char.classList.remove('hidden');
            } else {
                ui.char.classList.add('hidden');
            }
        } else if (step.char === null) {
            ui.char.classList.add('hidden');
        }

        ui.name.innerText = step.speaker;
        ui.text.innerText = step.text.replace("{player}", game.playerName);
    },

    nextStep: () => {
        const step = game.currentScene[game.stepIndex];
        if(step.choices) return; 

        game.stepIndex++;
        
        if(game.stepIndex < game.currentScene.length) {
            game.updateDisplay();
        } else {
            const lastStep = game.currentScene[game.currentScene.length - 1];
            if(lastStep.next) {
                game.loadScene(lastStep.next);
            }
        }
    }
};

/* --- SCÉNARIO --- */
const scenario = {
    // 1. INTRO
    intro: [
        { speaker: "Fatiha", text: "C'est ta première Débatèque ! Tout le monde te découvre.", char: "fatiha", bg: "salle" },
        { speaker: "Antoine", text: "Bonjour ! Je suis Antoine, le directeur.", char: "antoine" },
        { speaker: "Antoine", text: "Ici, on cherche à se dépasser. J'espère que tu es prêt.", char: "antoine", next: "interaction_fatiha" } 
    ],

    // INTERACTION FATIHA
    interaction_fatiha: [
        { speaker: "Fatiha", text: "Puisque tu es nouveau, je te donne un conseil : ne pose pas trop de questions indiscrètes sur l'ambiance.", char: "fatiha" },
        { speaker: "Fatiha", text: "Ça pourrait vexer les plus 'passionnés'.", char: "fatiha_choquee" },
        {
            choices: [
                { text: "A: Je comprends. Silence radio.", next: "reponse_fatiha_A" },
                { text: "B: Quoi ? C'est quoi cette ambiance étrange ici ?", next: "reponse_fatiha_B", effect: () => game.flags.meha_suspicion += 1 }
            ]
        }
    ],
    reponse_fatiha_A: [
        { speaker: "Fatiha", text: "Bien. C'est plus sûr.", char: "fatiha", next: "interaction_cherifette" }
    ],
    reponse_fatiha_B: [
        { speaker: "Fatiha", text: "Chut ! On dirait que Maha t'a entendu...", char: "fatiha_choquee", next: "interaction_cherifette" }
    ],

    // 2. INTERACTION CHERIFA & NISSA
    interaction_cherifette: [
        { speaker: "Chérifa", text: "Salut ! Alors, première Débatèque ? T'es quel type de débatteur ?", char: "cherifette" },
        { 
            choices: [
                { text: "A: Logique.", next: "reponse_cherifette_A", effect: () => game.flags.anissa_jealousy += 1 },
                { text: "B: Je suis là pour rigoler.", next: "reponse_cherifette_B", effect: () => game.flags.anissa_jealousy -= 1 },
                { text: "C: Je suis là pour gagner.", next: "reponse_cherifette_C", effect: () => game.flags.anissa_jealousy += 5 }
            ]
        }
    ],
    reponse_cherifette_A: [
        { speaker: "", text: "Chérifa apprécie ton sérieux. Nissa commence à te surveiller du coin de l'œil.", char: "anissa", next: "interaction_aymen" }
    ],
    reponse_cherifette_B: [
        { speaker: "", text: "Chérifa sourit. Nissa se détend visiblement.", char: "cherifette", next: "interaction_aymen" }
    ],
    reponse_cherifette_C: [
        { speaker: "", text: "Chérifa aime ton ambition. Nissa te voit immédiatement comme une menace.", char: "anissa_folle", next: "interaction_aymen" }
    ],

    // 3. INTERACTION AYMEN
    interaction_aymen: [
        { speaker: "Aymen", text: "Première soirée ici ? Les débutants s'en sortent rarement, mais fais de ton mieux.", char: "aymen" },
        {
            choices: [
                { text: "A: Tu me sous-estimes.", next: "reponse_aymen_A", effect: () => game.flags.aymen_respect += 1 },
                { text: "B: Merci pour ton soutien... ?", next: "reponse_aymen_B" },
                { text: "C: Je connais Eloquentia.", next: "reponse_aymen_C", effect: () => game.flags.meha_suspicion += 1 }
            ]
        }
    ],
    reponse_aymen_A: [ { speaker: "", text: "Aymen hausse un sourcil. Il commence à te respecter.", char: "aymen", next: "interaction_amir" } ],
    reponse_aymen_B: [ { speaker: "", text: "Aymen te prend doucement de haut.", char: "aymen", next: "interaction_amir" } ],
    reponse_aymen_C: [ { speaker: "", text: "Aymen panique intérieurement. Maha tourne la tête vers toi.", char: "meha", next: "interaction_amir" } ],

    // 4. INTERACTION AMIR
    interaction_amir: [
        { speaker: "Amir", text: "Pst... {player}... fais attention.", char: "amir_peur" },
        { speaker: "Amir", text: "Certaines personnes sont dangereuses. Maha... elle est spéciale.", char: "amir_peur" },
        {
            choices: [
                { text: "A: Tu exagères.", next: "reponse_amir_A" },
                { text: "B: Qu'est-ce que tu veux dire ?", next: "reponse_amir_B" },
                { text: "C: Oui, elle m'inquiète.", next: "reponse_amir_C" }
            ]
        }
    ],
    reponse_amir_A: [ { speaker: "", text: "Amir s'éloigne, déçu.", char: "amir", next: "interaction_meha" } ], 
    reponse_amir_B: [ { speaker: "Amir", text: "Juste... observe-la.", char: "amir", next: "interaction_meha" } ], 
    reponse_amir_C: [ { speaker: "Amir", text: "Elle n'est pas comme nous. Fais gaffe.", char: "amir_peur", next: "interaction_meha" } ], 

    // INTERACTION MAHA
    interaction_meha: [
        { speaker: "Maha", text: "J'ai entendu une conversation intéressante.", char: "meha" },
        { speaker: "Maha", text: "Tu as l'air de juger la méthode de certaines personnes ici, {player}.", char: "meha_folle" },
        {
            choices: [
                { text: "A: Je pense qu'Aymen est parfois trop extrême.", next: "reponse_meha_A", effect: () => game.flags.aymen_respect -= 2 },
                { text: "B: Je pense que Nissa est trop émotive.", next: "reponse_meha_B", effect: () => game.flags.anissa_jealousy -= 2 }
            ]
        }
    ],
    reponse_meha_A: [
        { speaker: "Maha", text: "Son chaos a une certaine valeur artistique. Mais soit. Passons au débat.", char: "meha", next: "le_debat" }
    ],
    reponse_meha_B: [
        { speaker: "Maha", text: "L'émotion est un virus. Tu as raison de la craindre. Maintenant, le débat.", char: "meha", next: "le_debat" }
    ],

    // 5. LE DÉBAT
    le_debat: [
        { speaker: "Antoine", text: "La séance commence ! Aujourd'hui : La liberté commence-t-elle par le chaos ou par l'ordre ?", char: "antoine" },
        { speaker: "", text: "Les habitués entrent instantanément en mode Super Saiyan.", char: null },
        { speaker: "", text: "Chérifa argumente comme une avocate, Aymen lève la main toutes les 14 secondes.", char: "cherifette" },
        { speaker: "Antoine", text: "{player}, c'est le moment de choisir ton camp pour orienter le débat !", char: "antoine" },
        {
            choices: [
                { text: "Soutenir Aymen et le Chaos Artistique (Vers Fin 1)", next: "fin_1_start" },
                { text: "Soutenir Chérifa avec Passion (Vers Fin 2)", next: "fin_2_start" },
                { text: "Rester silencieux et observer Maha (Vers Fin 3)", next: "fin_3_start" }
            ]
        }
    ],

    // --- FIN 1 : MORT D'ANTOINE (THÉIÈRE VOLANTE et dead antoine.png) ---
    fin_1_start: [
        { speaker: "Antoine", text: "Le débat s'enflamme ! Changeons de sujet. Faut-il mettre du sucre dans le thé ?", char: "antoine" },
        { speaker: "Aymen", text: "JAMAAAIS ! C'est une insulte à l'Art !", char: "aymen_theiere", action: "shake" },
        { speaker: "", text: "Antoine glisse sur une tasse de café !", char: "antoine_choque", action: "shake" },
        
        // LA THÉIÈRE VOLANTE (char: "theiere")
        { speaker: "", text: "La théière d'Aymen s'envole, décrivant un arc parfait dans les airs !", char: "theiere" }, 
        { speaker: "", text: "Elle effectue son arc...", char: "theiere" }, 
        { speaker: "", text: "BAM.", char: null, bg: "noir", action: "flash" },
        
        // Image de groupe choqué (char: "antoine_mort" qui pointe vers dead antoine.png)
        { speaker: "", text: "Le directeur s'effondre. Tout le monde est choqué.", char: "tous_choques", bg: "salle" }, 
        
        { speaker: "Maha", text: "Techniquement... c'est un traumatisme crânien bénin.", char: "meha" },
        { speaker: "", text: "FIN 1 : Antoine - Mort par thé artistique.", char: null, next: "score_recap" }
    ],

    // --- FIN 2 : MORT DE CHERIFA (NISSA) ---
    fin_2_start: [
        { speaker: "", text: "Tu prends la défense de Chérifa sur le débat du sommeil.", char: "cherifette" },
        { speaker: "", text: "Elle te sourit. Nissa, dans un coin, bouillonne.", char: "anissa_folle", action: "shake" },
        
        // CHERIFA APEURÉE
        { speaker: "Chérifa", text: "Euh... Nissa ? Pourquoi tu me regardes comme ça ? J'ai peur...", char: "cherifette_peur" },
        
        { speaker: "", text: "Soudain, les lumières s'éteignent !", char: null, bg: "noir" },
        { speaker: "", text: "Un cri. Un bruit sourd.", char: null, action: "shake" },
        { speaker: "", text: "La lumière revient. Chérifa est au sol.", char: "cherifette_ko", bg: "salle" },
        
        // IMAGE DE GROUPE CHOQUÉ (image générique tous_choques)
        { speaker: "Fatiha", text: "Ya latif ! Qu'est-ce qui s'est passé ?!", char: "tous_choques" },
        
        { speaker: "Nissa", text: "Je voulais juste qu'elle me regarde...", char: "anissa" },
        { speaker: "", text: "FIN 2 : Chérifa - Décès accidentel par amour non reciproque.", char: null, next: "score_recap" }
    ],

    // --- FIN 3 : MORT DE CHERIFA (MAHA SACRIFICE) ---
    fin_3_start: [
        { speaker: "", text: "La lumière grésille étrangement.", char: null, bg: "noir" },
        { speaker: "Maha", text: "Chérifa... approche. J'ai une question scientifique.", char: "meha", bg: "salle" },
        { speaker: "", text: "Chérifa s'approche, innocente.", char: "cherifette" },
        { speaker: "", text: "Maha sort un couteau !", char: "meha_folle", action: "flash" },
        
        // CHERIFA APEURÉE
        { speaker: "Chérifa", text: "Maha ?! Pose ça, c'est pas drôle ! J'ai peur...", char: "cherifette_peur", action: "shake" },
        
        { speaker: "", text: "Dans un geste rapide, elle plante la lame.", char: "meha_folle", bg: "sang", action: "shake" },
        { speaker: "", text: "Maha est devenue invincible.", char: "meha_folle" },
        
        // IMAGE DE GROUPE CHOQUÉ (image générique tous_choques)
        { speaker: "", text: "Tout le monde recule, terrifié.", char: "tous_choques" },
        
        { speaker: "Maha", text: "La science ne faillit jamais.", char: "meha_folle" },
        { speaker: "", text: "FIN 3 : Maha domine la scène.", char: null, next: "score_recap" }
    ],

    score_recap: [
        { speaker: "", text: "Merci d'avoir joué à Doki Doki IF Constantine. Voici vos résultats.", char: null, bg: "noir", next: "score_recap" }
    ]
};