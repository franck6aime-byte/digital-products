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
    "article-024": {
        "title": "L'intelligence artificielle pour les Coachs : Automatiser votre onboarding",
        "excerpt": "Comment créer un parcours client VIP automatique avec Make.com : questionnaire IA, création de dossier et facturation.",
        "file_name": "intelligence-artificielle-pour-les-coachs-automatiser-onboarding.html",
        "img_name": "coach_onboarding_automation.png",
        "emoji": "🏆",
        "category": "Automatisation",
        "html_h1": "Fidélisez dès la Seconde Zéro : <em>L'Onboarding VIP automatisé</em>",
        "content": """
        <div class="intro-block">
            <p>Lorsqu'un client paie pour l'une de vos séances de coaching premium, les 5 prochaines minutes déterminent s'il vous perçoit comme un amateur ou un vrai professionnel de haut niveau.</p>
        </div>
        <h2>Le Problème du "Je t'écris sur WhatsApp"</h2>
        <p>Si après un paiement, vous devez manuellement dire à votre client "Super, voici le lien pour prendre RDV, et voici un PDF...", vous n'êtes pas un chef d'entreprise de votre coaching, vous en êtes l'esclave.</p>
        <h2>Le Workflow IA sur Make.com</h2>
        <p>Avec quelques noeuds sur Make.com (l'alternative visuelle à Zapier), vous pouvez construire ce pipeline magique :</p>
        <ol>
            <li><strong>Déclencheur (Trigger) :</strong> Le client paie via Stripe ou un portail local.</li>
            <li><strong>ChatGPT analyse :</strong> L'IA prend son nom, son secteur, génère un petit message de bienvenue ultra personnalisé en fonction de son métier.</li>
            <li><strong>Notion :</strong> Un dossier privé complet au nom du client se crée dans votre espace Notion de coaching.</li>
            <li><strong>Email de Luxe :</strong> Un email avec l'agenda Calendly et ses codes d'accès est envoyé sans AUCUNE action de votre part.</li>
        </ol>
        <div class="accent-block"><p>⚡ Résultat : Le client a une perception de qualité digne d'une grande école de commerce américaine, grâce à votre IA secrète.</p></div>
        """
    },
    "article-025": {
        "title": "Ne lancez pas de formation avant d'avoir testé cette stratégie IA",
        "excerpt": "Comment valider rapidement l'intérêt d'une audience africaine avant d'enregistrer 10 heures de vidéo inutiles.",
        "file_name": "ne-lancez-pas-de-formation-avant-davoir-teste-cette-strategie-ia.html",
        "img_name": "validate_course_idea_ia.png",
        "emoji": "🎓",
        "category": "Stratégie",
        "html_h1": "La Simulation de Marché : <em>Ne perdez plus des mois en studio</em>",
        "content": """
        <div class="intro-block">
            <p>Combien de formateurs passent des mois à filmer, monter et héberger une formation... pour réaliser le jour du lancement que PERSONNE n'en veut ? Trop.</p>
        </div>
        <h2>Le "Dummy Testing" ou Test de Façade assisté par l'IA</h2>
        <p>Aujourd'hui, il ne faut jamais créer le produit en premier. Vous devez créer "L'Offre". Et ChatGPT est votre associé pour ça.</p>
        <h3>Le processus de validation en 3 Jours</h3>
        <p>Demandez à ChatGPT de générer le plan détaillé (le syllabus) d'une formation sur votre sujet d'expertise. Puis demandez-lui d'en extraire "Les 3 plus grands bénéfices" pour l'acheteur.</p>
        <p>Utilisez Gamma.app (IA de design) pour générer une "Landing Page d'attente" (Waitlist) annonçant cette formation. L'offre existe virtuellement.</p>
        <div class="accent-block"><p>📈 Lancez une petite publicité Facebook de 5 000 FCFA. Si personne ne laisse son adresse email en 3 jours... Félicitations, vous venez d'économiser 3 mois de votre vie en évitant un produit qui ferait un flop.</p></div>
        <p>Si vous récoltez 50 emails excités, ALORS vous avez la garantie de pouvoir commencer à enregistrer vos vidéos.</p>
        """
    },
    "article-026": {
        "title": "Comment cloner la voix de vos vidéos avec l'IA (Tutoriel complet)",
        "excerpt": "ElevenLabs : le tutoriel complet pour traduire vos vidéos francophones en anglais parfait avec votre propre voix.",
        "file_name": "comment-cloner-la-voix-de-vos-videos-avec-ia.html",
        "img_name": "voice_cloning_tutorial.png",
        "emoji": "🎙️",
        "category": "IA & Création",
        "html_h1": "Parlez Anglais (et 29 autres langues) <em>avec votre propre voix</em>",
        "content": """
        <div class="intro-block">
            <p>Imaginez que votre chaîne YouTube ou vos publicités Instagram puissent être comprises aux USA, au Nigeria ou en Chine, sans aucun doublage de mauvais goût. C'est le pouvoir du Voice Cloning.</p>
        </div>
        <h2>L'âge d'or d'ElevenLabs et HeyGen</h2>
        <p>L'époque de la voix synthétique type "Google Traduction" robotique est totalement révolue en 2026. Des outils comme ElevenLabs reproduisent la chaleur, l'hésitation, et même le souffle de votre voix originale.</p>
        <h2>Comment cloner votre voix en 60 secondes</h2>
        <h3>1. L'Échantillon Mère</h3>
        <p>Prenez votre téléphone (avec un bon micro) et enregistrez-vous lisant un texte clair pendant 1 à 2 minutes. Idéalement dans une pièce parfaitement silencieuse, sans écho. Votre intonation doit être très dynamique (joie, tristesse, surprise) pour que l'IA capte votre "empreinte vocale".</p>
        <h3>2. Upload et Fusion</h3>
        <p>Sur <strong>ElevenLabs</strong> (fonctionnalité Voice Lab), téléversez votre bout d'audio. L'IA va créer un clone numérique. Tapez n'importe quel texte en anglais, en espagnol ou en bambara... L'audio sortira AVEC VOTRE VOIX, en respectant les accents !</p>
        <div class="accent-block"><p>🎥 Astuce Vidéo Ultime : Utilisez HeyGen (ou Rask AI) pour faire correspondre le mouvement de vos lèvres (Lip-Sync) avec la nouvelle voix générée. La synchronisation labiale est bluffante.</p></div>
        """
    },
    "article-027": {
        "title": "Audit SEO avec l'IA : Le prompt pour analyser les mots-clés de vos concurrents",
        "excerpt": "Utilisez Perplexity et ChatGPT pour voler légalement le trafic Google de vos concurrents directs en 2026.",
        "file_name": "audit-seo-avec-ia-le-prompt-pour-analyser-les-mots-cles.html",
        "img_name": "seo_audit_ia.png",
        "emoji": "🔍",
        "category": "SEO & Marketing",
        "html_h1": "L'Espionnage SEO <em>Légal et Automatisé</em>",
        "content": """
        <div class="intro-block">
            <p>La première page de Google est une guerre. Vos concurrents qui accaparent les premières positions n'ont pas forcément un meilleur produit, ils ont juste trouvé la faille dans les mots-clés de l'algorithme. L'IA permet d'isoler cette faille sans payer d'outils SEO hors de prix comme Ahrefs ou SEMRush.</p>
        </div>
        <h2>Le duo : Perplexity AI + GPT-4o</h2>
        <p>Perplexity est le roi de la donnée en direct. Allez sur Perplexity et demandez :<br><em>"Liste-moi les 10 articles de blog les plus visités du site web de mon concurrent [Site du Concurrent] en rapport avec [Votre Niche]."</em></p>
        <h2>Le Prompt Inversé d'extraction d'intention</h2>
        <p>Prenez le texte du meilleur article de votre concurrent et donnez-le à ChatGPT avec ce prompt d'ingénierie inverse :</p>
        <div class="accent-block"><p>"Voici le contenu du leader de mon marché. Agis comme un ingénieur SEO. <br>1. Identifie la requête (intention de recherche principale) de l'utilisateur qui atterrit sur cette page. <br>2. Montre-moi les lacunes de cet article (ce qu'il ne dit pas). <br>3. Génère-moi une structure d'article de blog 2x plus complète (Skyscraper technique) pour être mieux classé que cet URL exact."</p></div>
        <p>Vous n'avez plus qu'à rédiger votre propre article, plus long, plus profond, répondant aux mêmes requêtes, et Google vous privilégiera structurellement.</p>
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
