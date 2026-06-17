import json
import re
import datetime
import shutil

CONFIG_FILE = "articles-config.json"
BLOG_FILE = "blog.html"

# Les 21 prochains articles
# (id, titre, excerpt, image, emoji, category, date)
ARTICLES = [
    ("article-015", "5 Outils IA Gratuits que Tout Entrepreneur Africain Devrait Connaître", "Découvrez les 5 outils gratuits sans carte bancaire pour automatiser votre comptabilité, créer vos visuels et écrire vos mails.", "outils_ia_gratuits_afrique.png", "🛠️", "Outils & Productivité", "2026-04-19"),
    ("article-016", "Comment créer un Assistant Virtuel (GPT) personnalisé pour votre SAV", "Fini les heures passées à répondre aux clients sur WhatsApp. Formez un GPT sur vos produits et laissez-le gérer 80% du SAV.", "assistant_virtuel_sav.png", "🤖", "SAV & WhatsApp", "2026-04-22"),
    ("article-017", "Le guide complet pour écrire des Prompts Midjourney ultra-réalistes", "La structure V5/V6 exacte pour générer des images hyper-réalistes cinématographiques pour vos publicités locales.", "midjourney_prompts_guide.png", "🖼️", "IA & Création", "2026-04-26"),
    ("article-018", "Pourquoi Excel est mort : Analysez vos ventes avec ChatGPT Advanced Data", "Le tutoriel nocode pour uploader vos tableaux de ventes Shopify/Mobile Money et générer des prévisions financières en 2 minutes.", "chatgpt_data_analysis.png", "📈", "Analyse de Données", "2026-04-29"),
    ("article-019", "Comment écrire un Script YouTube viral grâce au Framework IA", "La technique de rétention 'Hook-Story-Offer' écrite par l'IA pour doubler votre durée de vue et votre monétisation.", "youtube_script_ia.png", "🎥", "Création de Contenu", "2026-05-03"),
    ("article-020", "Vendre sur WhatsApp : Le prompt ultime pour relancer un client sans le braquer", "Découvrez comment utiliser l'IA comportementale pour écrire le follow-up WhatsApp parfait et conclure vos ventes.", "whatsapp_sales_prompt.png", "💬", "Copywriting & IA", "2026-05-06"),
    ("article-021", "Créer 30 jours de contenu Instagram en 45 minutes : Méthode 2026", "Le workflow complet (ChatGPT + Canva Bulk Create) pour programmer vos Réels et publications pour tout le mois.", "instagram_bulk_create.png", "📱", "Outils & Productivité", "2026-05-10"),
    ("article-022", "DALL-E 3 vs Midjourney v6 : Quel outil choisir pour vos visuels ?", "Comparatif honnête avec exemples réels : quel outil convient le mieux pour les visages africains et le design marketing ?", "dalle3_vs_midjourney.png", "⚖️", "IA & Création", "2026-05-13"),
    ("article-023", "Rédiger des fiches produits E-commerce qui convertissent vraiment", "Arrêtez de copier Aliexpress. Voici 3 prompts Shopify pour générer des descriptions orientées bénéfices psychologiques.", "ecommerce_product_description_ia.png", "🛒", "E-commerce & IA", "2026-05-17"),
    ("article-024", "L'intelligence artificielle pour les Coachs : Automatiser votre onboarding", "Comment créer un parcours client VIP automatique avec Make.com : questionnaire IA de bienvenue, création de dossier et facturation.", "coach_onboarding_automation.png", "🏆", "Automatisation", "2026-05-20"),
    ("article-025", "Ne lancez pas de formation avant d'avoir testé cette stratégie IA", "Comment valider rapidement l'intérêt d'une audience africaine avant d'enregistrer 10 heures de vidéo inutiles.", "validate_course_idea_ia.png", "🎓", "Stratégie", "2026-05-24"),
    ("article-026", "Comment cloner la voix de vos vidéos avec l'IA (Tutoriel complet)", "ElevenLabs et HeyGen : le tutoriel complet pour traduire vos vidéos francophones en anglais parfait avec votre propre voix.", "voice_cloning_tutorial.png", "🎙️", "IA & Création", "2026-05-27"),
    ("article-027", "Audit SEO avec l'IA : Le prompt pour analyser les mots-clés de vos concurrents", "Utilisez Perplexity et ChatGPT pour voler légalement le trafic Google de vos concurrents directs en 2026.", "seo_audit_ia.png", "🔍", "SEO & Marketing", "2026-05-31"),
    ("article-028", "Relier ChatGPT à Google Sheets : Le tutoriel nocode ultime", "La méthode étape par étape pour appeler une IA directement depuis une cellule de votre feuille Excel/Sheets.", "chatgpt_google_sheets.png", "📊", "Automatisation", "2026-06-03"),
    ("article-029", "Rédiger une Séquence Email de Bienvenue de A à Z avec Claude 3.5", "Les 5 emails psychologiques (Le Soap Opera Sequence) pour transformer un simple curieux en acheteur compulsif.", "soap_opera_sequence_ia.png", "✉️", "Email Marketing", "2026-06-07"),
    ("article-030", "Comment utiliser l'IA générative pour trouver une idée de Business rentable", "Arrêtez les brainstormings inutiles. Utilisez ce prompt pour croiser vos compétences avec les problèmes réels du marché africain.", "ai_business_idea.png", "💡", "Stratégie Business", "2026-06-10"),
    ("article-031", "Les 5 erreurs fatales que tout le monde fait en Prompt Engineering", "Arrêtez de dire 'S'il te plaît' à l'IA. Découvrez pourquoi vos résultats sont moyens et comment adopter une logique algorithmique.", "fatal_prompt_errors.png", "🚨", "Prompt Engineering", "2026-06-14"),
    ("article-032", "Créer des vidéos TikTok sans visage : Logiciels et Stratégie", "Faceless YouTube Channel : les meilleurs outils d'avatar IA, de synthèse vocale et de montage B-Roll.", "faceless_tiktok_ia.png", "🎭", "Création de Contenu", "2026-06-17"),
    ("article-033", "Organiser sa journée d'entrepreneur avec l'IA (Workflow Notion + ChatGPT)", "Le système de productivité complet pour doubler vos résultats sans travailler 14h par jour.", "entrepreneur_productivity_notion.png", "📅", "Outils & Productivité", "2026-06-21"),
    ("article-034", "Gérer les clients difficiles : Prompts pour écrire des emails professionnels parfaits", "Comment répondre à une demande de remboursement ou un client agressif en restant ultra-diplomate grâce à l'IA.", "difficult_clients_email.png", "🛡️", "SAV & WhatsApp", "2026-06-24"),
    ("article-035", "Bilan Trimestriel : Comment l'automatisation a transformé DigitalBoost AI", "Les chiffres réels (trafic, ventes, temps gagné) après 3 mois passés à l'automatisation intégrale du processus éditorial.", "q2_automation_report.png", "📊", "Bilan & Transparence", "2026-06-28")
]

def update_config():
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)
        
    existing_ids = set(a['id'] for a in config.get('articles', []))
    
    for art_id, titre, excerpt, image, emoji, category, date_pub in ARTICLES:
        if art_id not in existing_ids:
            # File formulation
            file_name = file_name = re.sub(r'[^a-z0-9]+', '-', titre.lower().replace("é", "e").replace("à", "a").replace("è", "e").replace("ô", "o").replace("ç", "c").replace("'", "-"))
            file_name = file_name.strip('-') + '.html'
            
            config['articles'].append({
                "id": art_id,
                "titre": titre,
                "excerpt": excerpt,
                "url": f"https://digitalboostai.tech/blog/{file_name}",
                "image_url": f"https://digitalboostai.tech/img/{image}",
                "emoji": emoji,
                "categorie": category,
                "temps_lecture": "10 min de lecture", # par defaut
                "date_publication": date_pub,
                "newsletter_envoyee": False
            })
            
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    print("✅ articles-config.json mis à jour massivement.")

def update_blog_html():
    with open(BLOG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    new_cards = []
    
    # Inverser pour ajouter du plus récent (juin) vers le plus ancien (fin avril)
    # Pour qu'ils s'affichent en haut, le 28 juin sera le tout premier "A la une" futur
    for art_id, titre, excerpt, image, emoji, category, date_pub in reversed(ARTICLES):
        file_name = file_name = re.sub(r'[^a-z0-9]+', '-', titre.lower().replace("é", "e").replace("à", "a").replace("è", "e").replace("ô", "o").replace("ç", "c").replace("'", "-"))
        file_name = file_name.strip('-') + '.html'
        
        # Check if already added
        if file_name in content:
            continue
            
        dt = datetime.datetime.strptime(date_pub, "%Y-%m-%d")
        months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        date_str = f"{dt.day} {months[dt.month - 1]} {dt.year}"
        
        card = f'''
        <a href="https://digitalboostai.tech/blog/{file_name}" class="article-card" data-publish-date="{date_pub}">
            <div class="card-img">
                <img src="img/{image}" alt="{titre} - DigitalBoost AI" loading="lazy">
            </div>
            <div class="card-body">
                <span class="card-tag">{category}</span>
                <h3 class="card-title">{titre}</h3>
                <p class="card-excerpt">{excerpt}</p>
                <div class="card-meta">
                    <span>📅 {date_str} &nbsp;·&nbsp; ⏱️ 10 min de lecture</span>
                    <span class="card-read">Lire →</span>
                </div>
            </div>
        </a>'''
        new_cards.append(card)
        
    if new_cards:
        target = '<div class="articles-grid">\n'
        content = content.replace(target, target + '\n'.join(new_cards) + '\n')
        
    # Update count
    match = re.search(r'<span class="num">(\d+)</span><span class="label">Articles publiés</span>', content)
    if match:
        current_count = int(match.group(1))
        # Add only new items
        new_count = current_count + len(new_cards)
        content = re.sub(
            r'<span class="num">\d+</span><span class="label">Articles publiés</span>',
            f'<span class="num">{new_count}</span><span class="label">Articles publiés</span>',
            content
        )
        
    with open(BLOG_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ blog.html mis à jour : {len(new_cards)} nouvelles cartes insérées.")

if __name__ == "__main__":
    update_config()
    update_blog_html()
