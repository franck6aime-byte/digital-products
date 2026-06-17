import os

template_html = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | DigitalBoost AI</title>
    <meta name="description" content="{excerpt}" />
    <link rel="canonical" href="https://digitalboostai.tech/blog/{file_name}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{excerpt}" />
    <meta property="og:image" content="https://digitalboostai.tech/img/{img_name}" />
    <meta name="theme-color" content="#0D1117" />
    <style>
@font-face {{ font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url('../fonts/dm-sans-v17-latin-400.woff2') format('woff2'); }}
@font-face {{ font-family:'Fraunces';font-style:normal;font-weight:700;font-display:swap;src:url('../fonts/fraunces-v38-latin-700.woff2') format('woff2'); }}
@font-face {{ font-family:'Fraunces';font-style:normal;font-weight:900;font-display:swap;src:url('../fonts/fraunces-v38-latin-900.woff2') format('woff2'); }}
        :root{{--ink:#0D1117;--paper:#FAFAF7;--gold:#B8912A;--gold-light:#F0E0A8;--accent:#1A6B3C;--accent-light:#E8F5EE;--muted:#6B7280;--border:#E5E2D9;--max:780px}}
        *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
        body{{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink);font-size:17px;line-height:1.8}}
        .site-header{{position:sticky;top:0;background:rgba(250,250,247,.95);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;z-index:100}}
        .site-header .logo{{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:900;color:var(--ink);text-decoration:none}}
        .site-header .logo span{{color:var(--gold)}}
        .header-cta{{background:var(--ink);color:var(--paper);padding:10px 20px;border-radius:100px;font-size:.85rem;font-weight:600;text-decoration:none}}
        .hero{{max-width:860px;margin:0 auto;padding:80px 24px 60px;text-align:center}}
        .category-tag{{display:inline-block;background:#D1E7DD;color:#0B4527;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:100px;margin-bottom:24px}}
        .hero h1{{font-family:'Fraunces',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;color:var(--ink);margin-bottom:24px}}
        .hero-subtitle{{font-size:1.15rem;color:var(--muted);max-width:600px;margin:0 auto 36px}}
        .hero-image{{max-width:860px;margin:0 auto;padding:0 24px 48px}}
        .hero-image-inner img{{width:100%;border-radius:20px;object-fit:cover;height:400px;}}
        .article-layout{{max-width:1100px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 280px;gap:60px;align-items:start}}
        @media(max-width:900px){{.article-layout{{grid-template-columns:1fr}} .sidebar{{display:none}} }}
        .article-body{{padding:60px 0;max-width:var(--max)}}
        .article-body h2{{font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;margin:56px 0 16px}}
        .article-body h3{{font-family:'Fraunces',serif;font-size:1.25rem;font-weight:700;margin:36px 0 14px}}
        .article-body p{{margin-bottom:20px}}
        .intro-block{{background:var(--ink);color:var(--paper);border-radius:16px;padding:32px 36px;margin:40px 0}}
        .intro-block p{{color:var(--paper);margin-bottom:14px;font-size:1.05rem;line-height:1.8}}
        .intro-block strong{{color:var(--gold)}}
        .accent-block{{border-left:4px solid var(--accent);background:var(--accent-light);padding:20px 24px;border-radius:0 12px 12px 0;margin:32px 0}}
        .cta-inline{{background:linear-gradient(135deg,var(--ink) 0%,#1a2a1a 100%);border-radius:20px;padding:44px 40px;margin:56px 0;text-align:center;color:var(--paper)}}
        .cta-inline h3{{font-family:'Fraunces',serif;font-size:1.6rem;margin-bottom:12px}}
        .cta-inline .btn-gold{{display:inline-block;background:var(--gold);color:var(--ink);padding:14px 28px;border-radius:100px;font-weight:700;text-decoration:none;margin-top:20px}}
        .sidebar-cta{{background:var(--ink);border-radius:16px;padding:28px 24px;text-align:center;color:var(--paper);margin-top:60px;position:sticky;top:100px;}}
        .sidebar-cta .btn-gold{{display:block;background:var(--gold);color:var(--ink);padding:14px 28px;border-radius:100px;font-weight:700;text-decoration:none;margin-top:20px}}
    </style>
</head>
<body>
<header class="site-header">
    <a href="https://digitalboostai.tech/" class="logo">⚡DigitalBoost <span>AI</span></a>
    <a href="https://digitalboostai.tech/#pricing" class="header-cta">Obtenir les produits →</a>
</header>
<div class="hero">
    <span class="category-tag">{emoji} {category}</span>
    <h1>{html_h1}</h1>
    <p class="hero-subtitle">{excerpt}</p>
</div>
<div class="hero-image">
    <div class="hero-image-inner">
        <img src="../img/{img_name}" alt="{title}">
    </div>
</div>
<div class="article-layout">
    <main class="article-body">
        {content}
        <div class="cta-inline">
            <h3>Passez à la vitesse supérieure</h3>
            <p>Découvrez nos workflows, templates et tutoriels avancés pour entrepreneurs modernes.</p>
            <a href="https://digitalboostai.tech/#pricing" class="btn-gold">Voir la boutique</a>
        </div>
    </main>
    <aside class="sidebar">
        <div class="sidebar-cta">
            <h2 style="font-family:'Fraunces',serif; margin-bottom:10px;">Le Pack IA</h2>
            <p style="font-size:0.85rem; opacity:0.8;">Tous les prompts et outils pour booster votre activité.</p>
            <a href="https://ppawzaph.mychariow.shop/prd_cav6sr" class="btn-gold">En savoir plus</a>
        </div>
    </aside>
</div>
</body>
</html>"""

articles_data = {
    "article-028": {
        "title": "Relier ChatGPT à Google Sheets : Le tutoriel nocode ultime",
        "excerpt": "La méthode étape par étape pour appeler une IA directement depuis une cellule de votre feuille Excel.",
        "file_name": "relier-chatgpt-a-google-sheets-le-tutoriel-nocode-ultime.html",
        "img_name": "chatgpt_google_sheets.png",
        "emoji": "📊",
        "category": "Automatisation",
        "html_h1": "Faites travailler l'IA <em>depuis vos Tableaux</em>",
        "content": """
        <div class="intro-block">
            <p>Pouvoir traduire 500 descriptions de produits, formater des noms de clients ou chercher l'adresse de 50 entreprises directement dans une cellule Google Sheets... C'est aujourd'hui possible en combinant Google Sheets et l'API d'OpenAI.</p>
        </div>
        <h2>Le module complémentaire GPT for Sheets</h2>
        <p>L'installation est enfantine :</p>
        <ol>
            <li>Dans Google Sheets, cliquez sur <strong>Extensions</strong> > Modules complémentaires > Télécharger des modules.</li>
            <li>Cherchez "GPT for Sheets and Docs" et installez-le.</li>
            <li>Insérez votre clé API (obtenue sur le site platform.openai.com) dans les paramètres du module.</li>
        </ol>
        <h2>Comment écrire vos formules</h2>
        <p>Une fois installé, de nouvelles formules s'ajoutent à votre tableur :</p>
        <div class="accent-block"><code>=GPT("Traduis en dialecte ivoirien", A2)</code></div>
        <p>Si la cellule A2 contient "Il pleut beaucoup", votre cellule de formule se chargera et affichera la traduction automatiquement.</p>
        <p>Vous pouvez étirer cette formule sur 1000 lignes, et l'IA traitera l'entièreté de votre fichier en quelques secondes.</p>
        """
    },
    "article-029": {
        "title": "Rédiger une Séquence Email de Bienvenue de A à Z avec Claude 3.5",
        "excerpt": "Les 5 emails psychologiques (Le Soap Opera Sequence) pour transformer un curieux en acheteur.",
        "file_name": "rediger-une-sequence-email-bienvenue.html",
        "img_name": "soap_opera_sequence_ia.png",
        "emoji": "✉️",
        "category": "Email Marketing",
        "html_h1": "La Séquence Email <em>Soap Opera</em> avec Claude 3.5",
        "content": """
        <div class="intro-block">
            <p>Quand quelqu'un s'abonne à votre newsletter ou télécharge un cadeau gratuit, il est dans son pic d'intérêt. Si vous attendez 2 semaines pour lui écrire, vous l'avez perdu. Voici comment automatiser 5 jours de bienvenue.</p>
        </div>
        <h2>C'est quoi la Soap Opera Sequence ?</h2>
        <p>Inventée par Russell Brunson (fondateur de ClickFunnels), c'est une technique calquée sur les séries télé. Chaque email se termine par un suspens ("cliffhanger") qui oblige à ouvrir l'email du lendemain.</p>
        <h2>Le Prompt pour Claude 3.5</h2>
        <p>Pourquoi Claude ? Car il excelle en narration continue, contrairement à ChatGPT qui a tendance à exagérer l'émotion.</p>
        <div class="accent-block"><p>"Agis comme un expert en Email Marketing (style Russell Brunson). Je vends [Mon Produit]. Rédige-moi une séquence 'Soap Opera' de 5 emails. \nJour 1 : Mettre en scène le décor et inclure un énorme suspens pour le Jour 2.\nJour 2 : Révéler le 'Coup de Théâtre' émotionnel de mon histoire passée.\nJour 3 : Le Moment de Clarté (Epiphany) où j'ai trouvé la solution.\nJour 4 : L'offre cachée et sa valeur ridicule.\nJour 5 : L'appel à l'action final avec un sentiment d'urgence."</p></div>
        <p>Intégrez ce résultat dans Mailchimp ou Brevo (Sendinblue), configurez l'envoi = "1 jour après", et regardez votre audience tisser un lien incroyable avec vous pendant leur première semaine.</p>
        """
    },
    "article-030": {
        "title": "Comment utiliser l'IA générative pour trouver une idée de Business rentable",
        "excerpt": "Utilisez ce prompt pour croiser vos compétences avec les problèmes réels du marché africain.",
        "file_name": "utiliser-ia-pour-trouver-idee-de-business.html",
        "img_name": "ai_business_idea.png",
        "emoji": "💡",
        "category": "Stratégie Business",
        "html_h1": "L'IA, votre Conseiller en <em>Création d'Entreprise</em>",
        "content": """
        <div class="intro-block">
            <p>Vous avez envie d'entreprendre mais le syndrome de la page blanche bloque vos envies ? Les brainstormings classiques mènent souvent à la même idée d'agence web ou de dropshipping. Utilisons la matrice de données massives de l'IA.</p>
        </div>
        <h2>La matrice : Compétences x Problème Local x Tendance</h2>
        <p>Une bonne idée d'entreprise naît de la collision entre ce que vous savez faire, ce dont un marché spécifique a besoin, et une tendance en pleine croissance.</p>
        <h2>Le Prompt de Génération Conceptuelle</h2>
        <div class="accent-block"><p>"J'ai une liste de compétences : [Vente, Montage Vidéo, Analyse de tableaux de bord]. Je vis en [Côte d'Ivoire/Sénégal/Cameroun] et je cible [les petites pharmacies de quartier / les agriculteurs modernisés]. Agis comme Y Combinator (Incubateur de Startups). Génère-moi 5 idées de business disruptifs et hyper-locaux qui lient mes 3 compétences à une énorme douleur de cette cible. Ne me propose rien de standard."</p></div>
        <p>L'IA pourrait vous sortir l'idée de : <em>Un Dashboard Notion pré-conçu vendu en One-Shot aux petites pharmacies pour suivre leurs péremptions de médicaments, couplé à une formation vidéo sur tablette sur la vente en comptoir.</em></p>
        <p>L'IA vient de créer le croisement parfait.</p>
        """
    },
    "article-031": {
        "title": "Les 5 erreurs fatales que tout le monde fait en Prompt Engineering",
        "excerpt": "Découvrez pourquoi vos résultats sont moyens et comment adopter une logique algorithmique.",
        "file_name": "5-erreurs-fatales-en-prompt-engineering.html",
        "img_name": "fatal_prompt_errors.png",
        "emoji": "🚨",
        "category": "Prompt Engineering",
        "html_h1": "Arrêtez de Parler à l'IA <em>comme à un Humain</em>",
        "content": """
        <div class="intro-block">
            <p>Si vos réponses de ChatGPT sont génériques, floues et manquent de "punch", c'est parce que 95% des utilisateurs communiquent avec la machine de la mauvaise de façon.</p>
        </div>
        <h2>Erreur #1 : Oublier de donner un Rôle</h2>
        <p>L'IA a lu tout internet. Si vous demandez un texte, il va moyenner toutes les écritures (un blogueur, un plombier, un avocat). Il *faut* lui imposer un rôle restrictif au début de chaque prompt : <em>"Agis comme un avocat spécialiste en droit des affaires de l'OHADA..."</em>.</p>
        <h2>Erreur #2 : Utiliser la politesse excessive</h2>
        <p>ChatGPT n'a pas de sentiments. Les mots "s'il te plaît", "pourrais-tu peut-être" ajoutent des tokens inutiles (bruit de langage) qui peuvent diluer vos instructions. Des verbes d'action à l'impératif sont la norme : <em>"Génère", "Classifie", "Ignore"</em>.</p>
        <h2>Erreur #3 : Demander trop d'une seule traite (Zero-Shot)</h2>
        <p>L'IA est un processeur probabiliste. Si vous demandez "Invente le nom d'une marque ET fais son logo ET son business plan". La qualité sera diluée. Utilisez le *Chain of Thought* (chaîne de pensées) : séparez ces tâches en 3 étapes de conversation.</p>
        """
    },
    "article-032": {
        "title": "Créer des vidéos TikTok sans visage : Logiciels et Stratégie",
        "excerpt": "Faceless YouTube Channel : les meilleurs outils d'avatar IA, de synthèse vocale et de montage B-Roll.",
        "file_name": "creer-des-videos-tiktok-sans-visage.html",
        "img_name": "faceless_tiktok_ia.png",
        "emoji": "🎭",
        "category": "Création de Contenu",
        "html_h1": "La Révolution <em>Faceless Creator</em>",
        "content": """
        <div class="intro-block">
            <p>Vous souhaitez créer une audience, monétiser vos vues ou vendre des produits, mais l'idée d'exposer votre visage devant une caméra vous effraie ? La création anonyme ("Faceless") n'a jamais été aussi puissante qu'en 2026.</p>
        </div>
        <h2>Le kit d'outils du créateur invisible</h2>
        <h3>1. L'Avatar (D-ID / HeyGen)</h3>
        <p>Vous pouvez générer une photo de présentateur ou d'animaux sur Midjourney, et lui donner vie pour qu'il articule parfaitement vos textes en bougeant naturellement la tête.</p>
        <h3>2. L'écriture (ChatGPT)</h3>
        <p>Demandez des scripts ultra-dynamiques avec des phrases punchy, spécialement calibrés pour un discours sous l'eau ou mystérieux (très efficace pour l'anonymat).</p>
        <h3>3. L'édition Magique (CapCut / Veed.io)</h3>
        <p>Pour des vidéos captivantes (B-roll), un avatar n'est pas toujours nécessaire. Mettez simplement la voix off (ElevenLabs) sur des boucles vidéos de luxe, de paysages ou d'abstraits. L'ajout automatique de sous-titres animés (style Hormozi) captera l'attention sur TikTok pendant 60 secondes.</p>
        <div class="accent-block"><p>⚡ Le Faceless n'est pas une excuse pour la médiocrité. La valeur de votre script audio (le scénario) est responsable à 90% du succès quand le visage n'est pas là.</p></div>
        """
    },
    "article-033": {
        "title": "Organiser sa journée d'entrepreneur avec l'IA (Workflow Notion + ChatGPT)",
        "excerpt": "Le système de productivité complet pour doubler vos résultats sans travailler 14h par jour.",
        "file_name": "organiser-journee-entrepreneur-ia-notion.html",
        "img_name": "entrepreneur_productivity_notion.png",
        "emoji": "📅",
        "category": "Outils & Productivité",
        "html_h1": "Le Mode Ultime de <em>Productivité Moderne</em>",
        "content": """
        <div class="intro-block">
            <p>La charge cognitive d'un entrepreneur est énorme : gérer la compta, répondre aux devis, poster sur les réseaux. L'IA n'est pas juste un moteur créatif, c'est aussi un assistant d'organisation redoutable.</p>
        </div>
        <h2>La matrice Notion AI</h2>
        <p>Notion est passé du simple "outil de notes" à un "cerveau interconnecté". Avec Notion AI directement dans vos pages, il peut scanner l'ensemble des notes de vos réunions de la semaine et générer lui-même de petits tickets "À Faire" de ce qui est en retard.</p>
        <h2>Le "Morning Brain Dump" avec ChatGPT</h2>
        <p>La règle des leaders :<br>Le matin, activez l'application vocale de ChatGPT (Mode Conversationnel fluide). Dites dans votre téléphone :</p>
        <div class="accent-block"><p>🗣️ "Je suis débordé aujourd'hui. Je dois faire le design du post Instagram, valider la facture de Mr. Koffi, prendre rdv chez le dentiste et réorganiser mon catalogue de formation. Applique la matrice d'Eisenhower et planifie ma journée heure par heure de 9h à 17h, avec des blocs dédiés au travail profond (Deep Work)."</p></div>
        <p>L'IA va agir comme le meilleur des secrétaires de direction, trier vos priorités, et vous imposer un temps de pause.</p>
        """
    },
    "article-034": {
        "title": "Gérer les clients difficiles : Prompts pour écrire des emails parfaits",
        "excerpt": "Comment répondre à une demande de remboursement ou un client agressif en restant ultra-diplomate.",
        "file_name": "gerer-les-clients-difficiles-prompts-ia.html",
        "img_name": "difficult_clients_email.png",
        "emoji": "🛡️",
        "category": "SAV & WhatsApp",
        "html_h1": "Diplomatie Augmentée : <em>Le SAV Parfait</em>",
        "content": """
        <div class="intro-block">
            <p>L'émotion de recevoir un message WhatsApp incendiaire d'un client insatisfait peut vous faire perdre votre sang froid, et votre réputation. L'IA n'a pas d'ego, et répare ce genre de situation brillamment.</p>
        </div>
        <h2>Le Prompt Désamorceur de Conflit</h2>
        <p>Copiez-collez le message agressif du client, laisez l'IA absorber la colère, et ordonnez avec ce prompt :</p>
        <div class="accent-block"><p>"Voici le message reçu d'un client très frustré [Message]. Je refuse de le rembourser mais je veux lui offrir un rabais pour la prochaine fois car la faute est partagée au niveau du délai. Rédige une réponse diplomatique, compatissante mais ferme, orientée vers la solution."</p></div>
        <p>Le taux d'apaisement grâce à un message structuré de cette manière par l'IA frôle les 95% sans perdre la face professionnelle de votre business.</p>
        """
    },
    "article-035": {
        "title": "Bilan Trimestriel : Comment l'automatisation a transformé DigitalBoost AI",
        "excerpt": "Les chiffres réels et processus internes après 3 mois passés à l'automatisation intégrale.",
        "file_name": "bilan-trimestriel-comment-l-automatisation-a-transforme-digitalboost-ai.html",
        "img_name": "q2_automation_report.png",
        "emoji": "📊",
        "category": "Bilan & Transparence",
        "html_h1": "Transparence Totale : <em>3 Mois d'Automatisation</em>",
        "content": """
        <div class="intro-block">
            <p>Le secret d'une grande entreprise, c'est ce qu'il se passe "au chaud" en arrière-plan (Workflow). Depuis avril, chez DigitalBoost AI, nous avons confié 90% des phases lourdes de la production de contenu à l'automatisation intelligente.</p>
        </div>
        <h2>Les métriques d'efficience</h2>
        <p><strong>Temps de création d'un article complet (SEO, HTML, CSS, Visuels, Relais Réseaux) :</strong>
        <br>Avant : 4h30.
        <br>Maintenant : 15 secondes d'exécution via un script backend Python + Agent.</p>
        <h2>Comment nous y sommes parvenus</h2>
        <p>Nous utilisons GitHub Actions, Vercel, et un script Google Apps lié à nos bases clients pour orchestrer une "boucle d'or" (Golden Loop). L'intelligence artificielle gère la structure, le codage sémantique, et un calendrier statique nous libère du stress de la "clique sur Publier".</p>
        <div class="accent-block"><p>🔥 La leçon : N'automatisez pas la relation humaine (le lien que j'ai avec vous). Automatisez uniquement la logistique numérique.</p></div>
        """
    }
}

os.makedirs('blog', exist_ok=True)
for key, data in articles_data.items():
    html_content = template_html.format(**data)
    filepath = os.path.join('blog', data['file_name'])
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ {filepath} écrit.")
