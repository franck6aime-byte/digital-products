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
    "article-015": {
        "title": "5 Outils IA Gratuits que Tout Entrepreneur Africain Devrait Connaître",
        "excerpt": "Découvrez les 5 outils gratuits sans carte bancaire pour automatiser votre comptabilité, créer vos visuels et écrire vos mails.",
        "file_name": "5-outils-ia-gratuits.html",
        "img_name": "outils_ia_gratuits_afrique.png",
        "emoji": "🛠️",
        "category": "Outils & Productivité",
        "html_h1": "5 Outils IA <em>Totalement Gratuits</em> pour les Entrepreneurs",
        "content": """
        <div class="intro-block">
            <p>Payer un abonnement mensuel à 20$ en dollars quand on lance son activité depuis l'Afrique peut parfois être un frein. Pourtant, la révolution de l'IA n'est pas réservée à ceux qui paient.</p>
            <p>Aujourd'hui, il existe des alternatives <strong>aussi puissantes et 100% gratuites</strong> (souvent sans carte bancaire demandée à l'inscription) pour rivaliser avec les plus grands.</p>
        </div>
        <h2>1. Claude 3.5 Sonnet (Le meilleur pour la rédaction)</h2>
        <p>Oubliez la version gratuite limitée de ChatGPT. Anthropic offre un accès gratuit à <strong>Claude 3.5 Sonnet</strong>. Cet outil écrit le français avec un naturel incroyable, sans les clichés habituels du type "Dans le paysage numérique d'aujourd'hui". Parfait pour vos pages de vente et emails.</p>
        <div class="accent-block"><p>✅ Astuce : Fournissez-lui le contexte de votre marché local, il s'adapte parfaitement au ton professionnel demandé.</p></div>
        <h2>2. Microsoft Designer / Copilot (Le meilleur pour l'image)</h2>
        <p>Midjourney est payant, mais le même moteur (DALL-E 3) est accessible <strong>totalement gratuitement</strong> via Microsoft Copilot. Vous pouvez générer des images hyper-réalistes pour vos publicités WhatsApp ou Facebook sans dépenser un centime.</p>
        <h2>3. Gamma.app (Le Pitch Deck maker)</h2>
        <p>Besoin de créer un PDF commercial, une présentation Canva ou un site web express pour convaincre un partenaire ? Gamma lit votre texte basique et génère de superbes diapositives avec images en 30 secondes.</p>
        <h2>4. Perplexity AI (Le chercheur ultime)</h2>
        <p>Google affiche des pubs, Perplexity donne des réponses sourcées. Si vous devez faire une étude de marché, chercher la législation sur une importation ou analyser la concurrence, utilisez ce moteur de recherche IA. Les sources (liens) y sont transparentes.</p>
        <h2>5. CapCut (Le roi du montage vidéo)</h2>
        <p>Certains pensent que c'est réservé à TikTok, mais la version PC propose un sous-titrage automatique (auto-captions) propulsé par l'IA parmi les meilleurs du marché, y compris pour nos accents. Sa version gratuite est suffisante pour gérer vos réels Instagram pro de A à Z.</p>
        """
    },
    "article-016": {
        "title": "Comment créer un Assistant Virtuel (GPT) personnalisé pour votre SAV",
        "excerpt": "Fini les heures passées à répondre aux clients sur WhatsApp. Formez un GPT sur vos tarifs et laissez-le gérer 80% du SAV.",
        "file_name": "comment-creer-assistant-virtuel-sav.html",
        "img_name": "assistant_virtuel_sav.png",
        "emoji": "🤖",
        "category": "SAV & WhatsApp",
        "html_h1": "Créer votre <em>Assistant SAV IA</em> en 10 minutes",
        "content": """
        <div class="intro-block">
            <p>« Bonjour, c'est combien ? », « Vous livrez où ? », « Quelle est la taille de ce modèle ? »</p>
            <p>Si vous passez plus d'une heure par jour à répondre aux mêmes questions sur WhatsApp, vous perdez de l'argent et de l'énergie. <strong>L'automatisation du SAV par un IA personnalisé n'est plus de la science fiction.</strong></p>
        </div>
        <h2>Étape 1 : Le "Knowledge Base" (La mémoire)</h2>
        <p>La puissance d'un assistant IA ne vient pas du robot, elle vient de ce que vous lui apprenez. Prenez un simple Word/Notion et écrivez TOUT sur votre business :</p>
        <ul>
            <li>Vos tarifs exacts</li>
            <li>Vos zones géographiques de livraison et délais</li>
            <li>Votre politique de remboursement</li>
            <li>L'histoire de votre marque et votre "ton" de parole.</li>
        </ul>
        <h2>Étape 2 : Configurer un GPT Custom</h2>
        <p>Si vous utilisez la version payante de ChatGPT (Plus), vous pouvez créer un "GPT". Uploadez votre fichier document. Dans les instructions, indiquez : <em>"Tu es l'assistant de SAV de [Marque]. Réponds poliment, base-toi uniquement sur le document joint. Si tu ne sais pas, dis au client que Franck prendra le relai."</em></p>
        <div class="accent-block"><p>💡 Cette étape vous assure que l'IA n'invente jamais de prix ou de promesses que vous ne pouvez pas tenir (phénomène d'hallucination de l'IA évité à 100%).</p></div>
        <h2>Étape 3 : S'intégrer sur WhatsApp Business</h2>
        <p>Pour l'instant, des plateformes comme Wati ou ManyChat (API) permettent la liaison entre ce cerveau artificiel et votre compte WhatsApp. L'IA lit le message, consulte votre catalogue de prix caché, et répond automatiquement 24h/24 !</p>
        """
    },
    "article-017": {
        "title": "Le guide complet pour écrire des Prompts Midjourney ultra-réalistes",
        "excerpt": "La structure exacte pour générer des images hyper-réalistes cinématographiques pour vos publicités locales.",
        "file_name": "le-guide-pour-ecrire-prompts-midjourney.html",
        "img_name": "midjourney_prompts_guide.png",
        "emoji": "🖼️",
        "category": "IA & Création",
        "html_h1": "Le Secret des Prompts <em>Ultra-Réalistes</em>",
        "content": """
        <div class="intro-block">
            <p>Le web est rempli d'images générées par IA qui ont l'air fausses, plastifiées et saturées. Pour vendre un produit premium ou asseoir une identité de marque, <strong>la qualité visuelle est non négociable.</strong></p>
            <p>Voici l'anatomie secrète d'un prompt d'imagerie "Niveau Agence de communication".</p>
        </div>
        <h2>La Formule Magique (Sujet + Environnement + Éclairage + Matériel + Format)</h2>
        <p>Une bonne requête d'image ne décrit pas seulement un acte, elle décrit comment un réalisateur de film filmerait la scène :</p>
        <h3>1. Le Sujet</h3>
        <p>Soyez ultra spécifique : "Une femme entrepreneuse ivoirienne de 30 ans, portant un tailleur bleu roi élégant, concentrée..."</p>
        <h3>2. L'Environnement</h3>
        <p>Où est-elle ? "...dans un bureau moderne au Plateau à Abidjan avec des vitres laissant voir la ville..."</p>
        <h3>3. L'Éclairage (Le vrai secret)</h3>
        <p>Midjourney adore le vocabulaire de la photographie réelle : "...Éclairage naturel de fin d'après midi (golden hour), rayons volumétriques, contre-jour doux..."</p>
        <div class="accent-block"><p>📷 Les termes miracles : "Cinematic lighting", "Volumetric dust", "Studio lighting", "8k hyper-realistic".</p></div>
        <h3>4. Le format d'image (Aspect Ratio)</h3>
        <p>N'oubliez jamais de préciser le format avec le tag `--ar 16:9` (pour YouTube/Blog) ou `--ar 9:16` (pour TikTok/Reels).</p>
        """
    },
    "article-018": {
        "title": "Pourquoi Excel est mort : Analysez vos ventes avec ChatGPT",
        "excerpt": "Le tutoriel nocode pour uploader vos tableaux de ventes et générer des prévisions financières en 2 minutes.",
        "file_name": "pourquoi-excel-est-mort-chatgpt-data.html",
        "img_name": "chatgpt_data_analysis.png",
        "emoji": "📈",
        "category": "Analyse de Données",
        "html_h1": "L'IA remplace <em>votre tableur Excel</em>",
        "content": """
        <div class="intro-block">
            <p>Si vous êtes comme 90% des entrepreneurs, comprendre la formule RECHERCHEV d'Excel vous donne des migraines. La bonne nouvelle : ChatGPT sait lire et créer des graphiques statistiques à partir de n'importe quel fichier de vente brut (CSV) exporté de votre boutique.</p>
        </div>
        <h2>La fonctionnalité "Advanced Data Analysis"</h2>
        <p>Sur ChatGPT (même en version gratuite avec GPT-4o), le trombone en bas à gauche de la barre de tchat est votre meilleur ami.</p>
        <p><strong>Étape 1 :</strong> Allez sur Shopify, Gumroad, ou votre fichier de suivi manuel de ventes Mobile Money. Téléchargez-le en .csv ou .xlsx.<br>
        <strong>Étape 2 :</strong> Uploadez ce fichier directement dans ChatGPT.</p>
        <h2>Demandez des prévisions en langage naturel</h2>
        <p>Au lieu de créer un tableau croisé dynamique, parlez-lui :</p>
        <blockquote>"Voici l'export de mes ventes des 6 derniers mois. Nettoie les données erronées. Dis-moi quel produit m'a rapporté le plus de marge pure, et fais-moi un graphique camembert."</blockquote>
        <p>En 20 secondes, l'IA va exécuter un script en arrière-plan et afficher visuellement le graphique parfait pour votre réunion d'équipe.</p>
        <div class="accent-block"><p>🔒 Sécurité et RGPD : Pensez toujours à masquer les numéros de carte de crédit et les noms réels de vos clients avant d'importer le fichier, c'est une règle d'or pour la sécurité de vos données financières !</p></div>
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
