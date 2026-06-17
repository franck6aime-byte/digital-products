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
    "article-019": {
        "title": "Comment écrire un Script YouTube viral grâce au Framework IA",
        "excerpt": "La technique de rétention 'Hook-Story-Offer' écrite par l'IA pour doubler votre durée de vue et votre monétisation.",
        "file_name": "comment-ecrire-un-script-youtube-viral-grace-au-framework-ia.html",
        "img_name": "youtube_script_ia.png",
        "emoji": "🎥",
        "category": "Création de Contenu",
        "html_h1": "Le Script YouTube Viral : <em>L'IA au service de la Rétention</em>",
        "content": """
        <div class="intro-block">
            <p>Une belle vidéo sans fond ne fait pas de vues. Sur YouTube, la règle absolue est la rétention (combien de temps le spectateur reste). Et la rétention se joue dès les 15 premières secondes !</p>
        </div>
        <h2>Le Framework : Hook - Retain - Reward</h2>
        <p>Ne demandez jamais à ChatGPT : "Écris une vidéo sur l'intelligence artificielle". Il vous fera une introduction Wikipédia ennuyeuse. Utilisez plutôt le système HRR.</p>
        <h3>1. Le Hook (Les 15 secondes)</h3>
        <p>Demandez : "Rédige une introduction YouTube de 15 secondes sur le sujet [X]. Elle doit commencer par une question provocatrice, briser une croyance populaire, et promettre une solution unique à la fin de la vidéo."</p>
        <div class="accent-block"><p>Exemple de Hook généré : "Vous pensez que créer un site internet coûte 2 millions de FCFA ? J'ai cru ça pendant 5 ans. Aujourd'hui je vais vous montrer comment j'ai fait le mien en 12 minutes, montre en main."</p></div>
        <h3>2. Retain (Le corps structuré)</h3>
        <p>L'IA doit structurer votre contenu sous forme de liste numérotée ou d'étapes (Step-by-step). C'est psychologiquement addictif pour le cerveau humain qui veut voir "l'étape suivante".</p>
        <h3>3. Le Reward (Call to Action naturel)</h3>
        <p>À la fin, l'IA ne doit pas juste vous dire "Abonnez-vous". Elle doit proposer une transition naturelle vers un aimant à prospect (Lead Magnet). "Rédige un appel à l'action naturel pour inviter le spectateur à cliquer sur le premier lien en description pour obtenir ma liste secrète."</p>
        """
    },
    "article-020": {
        "title": "Vendre sur WhatsApp : Le prompt ultime pour relancer un client sans le braquer",
        "excerpt": "Découvrez comment utiliser l'IA comportementale pour écrire le follow-up WhatsApp parfait et conclure vos ventes.",
        "file_name": "vendre-sur-whatsapp-le-prompt-ultime-pour-relancer.html",
        "img_name": "whatsapp_sales_prompt.png",
        "emoji": "💬",
        "category": "Copywriting & IA",
        "html_h1": "Relances WhatsApp : Le Prompt <em>Conversion Sans Pression</em>",
        "content": """
        <div class="intro-block">
            <p>Le message fatal du vendeur inexpérimenté : "Bonjour mon frère, tu n'as plus fait suite pour l'article". Ce message génère des "vus" indignés ou des blocages.</p>
        </div>
        <h2>La psychologie de la relance (Follow-up)</h2>
        <p>Quand un prospect ne répond plus, c'est généralement parce qu'il n'a pas l'argent MAINTENANT, ou qu'il a oublié, ou qu'il a peur de dire non. Votre relance doit lui donner une porte de sortie ou lui apporter de la valeur avant de demander quoi que ce soit.</p>
        <h2>Le Prompt Interdit</h2>
        <div class="accent-block"><p>"Agis comme un copywriter expert en ventes WhatsApp en Afrique. Un prospect m'a demandé le prix d'un ordinateur il y a 3 jours et ne répond plus. Rédige un message court de relance (max 3 phrases). N'utilise PAS un ton insistant. Utilise un ton amical, apporte une mini information utile sur l'ordinateur, et pose une question ouverte et douce à la fin qui ne nécessite pas d'acheter immédiatement."</p></div>
        <h3>Résultat Typique :</h3>
        <p><em>"Salut Cédric ! J'espère que tu vas bien. Au fait, j'ai oublié de te préciser que l'ordinateur HP dont on parlait a un clavier rétroéclairé, super pratique si tu travailles parfois le soir. Tu penses commencer ton nouveau projet dessus ce mois-ci ou plus tard ?"</em></p>
        <p>Magique, n'est-ce pas ? La conversation est relancée sans forcer l'achat direct.</p>
        """
    },
    "article-021": {
        "title": "Créer 30 jours de contenu Instagram en 45 minutes : Méthode 2026",
        "excerpt": "Le workflow complet (ChatGPT + Canva Bulk Create) pour programmer vos Réels et publications pour tout le mois.",
        "file_name": "creer-30-jours-de-contenu-instagram-en-45-minutes.html",
        "img_name": "instagram_bulk_create.png",
        "emoji": "📱",
        "category": "Outils & Productivité",
        "html_h1": "Le Mode Usine : <em>30 Posts Insta en 45 min</em>",
        "content": """
        <div class="intro-block">
            <p>Publier au jour le jour est la meilleure façon d'abandonner au bout de deux semaines. La vraie productivité, c'est le "Batching" (le travail par lots). Voici le secret absolu pour ne plus jamais manquer de contenu.</p>
        </div>
        <h2>L'Alliance Imparable : ChatGPT + Canva "Création en Marque"</h2>
        <h3>1. Générer la donnée brute</h3>
        <p>Ouvrez ChatGPT et tapez : <em>"Génère-moi sous forme de tableau 30 faits méconnus ou conseils de productivité sur [Votre Niche]. Colonne 1 : Titre court. Colonne 2 : Explication concise."</em></p>
        <h3>2. L'export</h3>
        <p>Copiez ce tableau et collez-le dans Google Sheets, ou enregistrez-le en fichier CSV.</p>
        <h3>3. L'automatisation Canva</h3>
        <p>Allez sur Canva. Créez un joli template de post carré. Dans la barre latérale, cherchez l'application "Création en masse" (Bulk Create). Importez votre fichier CSV. Liez le champ "Titre" à votre gros texte, et "Explication" à votre petit texte.</p>
        <div class="accent-block"><p>⚡ En un seul clic sur "Générer 30 pages", Canva va créer vos 30 posts prêts à être publiés !</p></div>
        <p>Vous n'avez plus qu'à utiliser Meta Business Suite pour programmer un post à 18h chaque jour du mois. Fini !</p>
        """
    },
    "article-022": {
        "title": "DALL-E 3 vs Midjourney v6 : Quel outil choisir pour vos visuels ?",
        "excerpt": "Comparatif honnête avec exemples réels : quel outil convient le mieux pour les visages africains et le design marketing ?",
        "file_name": "dalle-3-vs-midjourney-v6-quel-outil-choisir.html",
        "img_name": "dalle3_vs_midjourney.png",
        "emoji": "⚖️",
        "category": "IA & Création",
        "html_h1": "DALL-E 3 vs Midjourney : <em>Le Choc des Titans Visuels</em>",
        "content": """
        <div class="intro-block">
            <p>Quand on parle de génération d'images, deux mastodontes dominent le marché. Mais Lequel mérite votre argent et votre temps ? Lequel comprend vraiment nos réalités locales ?</p>
        </div>
        <h2>DALL-E 3 (Intégré à ChatGPT) : La compréhension du texte</h2>
        <p>Le point fort absolu de DALL-E, c'est sa capacité à scrupuleusement respecter vos consignes. Si vous demandez "Un homme ivoirien devant une affiche où il est écrit PROMO", DALL-E écrira parfaitement le mot PROMO sur l'image, sans fautes d'orthographe (un miracle en IA).</p>
        <div class="accent-block"><p>Avantage absolu : Intégration à ChatGPT, gratuit via Bing/Copilot, et respect strict du texte inséré.</p></div>
        <h2>Midjourney V6 : Le Réalisme Cinématographique Absolu</h2>
        <p>Si DALL-E fait parfois un effet "dessin animé très lisse", Midjourney crève l'écran. La version 6 génère des textures de peaux, des éclairages et des imperfections tellement réalistes qu'elles trompent les photographes professionnels.</p>
        <p>De plus, en utilisant les bons prompts (`an african man, natural lighting, shot on 35mm lens --style raw`), la représentation de la carnation noire est bien plus respectueuse et naturelle que l'aspect souvent caricatural d'autres modèles.</p>
        <h3>Le Verdict pour les Entrepreneurs</h3>
        <p>Pour des logos, des flyers drôles ou des maquettes intégrant du texte : **DALL-E 3**.<br>Pour des publicités e-commerce premium, des portraits ou des concepts artistiques : **Midjourney V6** incontestablement.</p>
        """
    },
    "article-023": {
        "title": "Rédiger des fiches produits E-commerce qui convertissent vraiment",
        "excerpt": "Arrêtez de copier Aliexpress. Voici 3 prompts Shopify pour générer des descriptions orientées bénéfices psychologiques.",
        "file_name": "rediger-fiches-produits-e-commerce-qui-convertissent.html",
        "img_name": "ecommerce_product_description_ia.png",
        "emoji": "🛒",
        "category": "E-commerce & IA",
        "html_h1": "La Fiche Produit IA : <em>Focus Conversion</em>",
        "content": """
        <div class="intro-block">
            <p>Le copier-coller AliExpress ruine votre marque. Une simple liste de caractéristiques techniques n'a jamais fait rêver personne. Ce qu'il faut, ce sont les "bénéfices".</p>
        </div>
        <h2>La Règle d'or : Caractéristiques vs Bénéfices</h2>
        <p>Caractéristique : "Batterie de 5000 mAh."<br>Bénéfice : "Partez en weekend sans chargeur : 2 jours complets d'autonomie pour filmer vos souvenirs."</p>
        <h2>Le Prompt Fédérateur</h2>
        <div class="accent-block"><p>"Agis comme le meilleur copywriter E-commerce francophone. Voici un vieux texte technique de fournisseur : [insérer texte]. Transforme-le en une description séduisante de 200 mots. Divise la description en 3 mini-paragraphes titrés avec des emojis. Le langage doit se focaliser sur comment ce produit va améliorer la vie de l'acheteur."</p></div>
        <h2>Gérer l'Urgence et la Confiance</h2>
        <p>Demandez également à l'IA de vous générer une section "Garantie" ou "FAQ Produit".</p>
        <p><em>Exemple IA :</em> "Vous avez un doute ? Nous offrons 15 jours pour essayer ce sac. Si les finitions ne sont pas à la hauteur de vos attentes, retournez-le sans frais."<br>C'est ce niveau de détail, généré en 5 secondes, qui différencie un amateur d'un e-commerçant à succès.</p>
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
