import json
import os
import subprocess
import argparse
from datetime import datetime
import re
import requests

# CONFIGURATION
CONFIG_FILE = "articles-config.json"
BLOG_INDEX = "blog.html"
BASE_URL = "https://digitalboostai.tech"

# URL de l'Application Web Google Script (à mettre à jour après déploiement)
NEWSLETTER_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyPWPlHaXJrNYAMFubWVVHoioouR87t2XKPsuFePGwJB6CLl3hQO9REzSDnZ5VLY613ew/exec"

def format_date_fr(date_iso):
    try:
        d = datetime.strptime(date_iso, "%Y-%m-%d")
        mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        return f"{d.day} {mois[d.month]} {d.year}"
    except:
        return date_iso

def rebuild_blog_grid(config):
    articles = config.get('articles', [])
    # Filtrer les articles qui n'ont pas de date ou date invalide
    valid_articles = [a for a in articles if 'date_publication' in a]
    # Trier par date décroissante
    valid_articles.sort(key=lambda x: x['date_publication'], reverse=True)
    
    if not valid_articles:
        return "", ""

    featured = valid_articles[0]
    others = valid_articles[1:]

    # Featured HTML
    feat_img_name = featured['image_url'].split('/')[-1]
    feat_html = f"""
    <p class="featured-label">⭐ Article à la une <span style="font-size:.72rem;background:#FEF3C7;color:#92400E;padding:3px 10px;border-radius:100px;margin-left:8px;">Nouveau</span></p>
    <div id="featured-article-container">
        <a href="{featured['url']}" class="featured-card" data-publish-date="{featured['date_publication']}">
            <div>
                <span class="card-tag">{featured.get('categorie', '')}</span>
                <h2 class="card-title">{featured['titre']}</h2>
                <p class="card-excerpt">{featured['excerpt']}</p>
                <div class="card-meta">
                    <span>📅 {format_date_fr(featured['date_publication'])} &nbsp;·&nbsp; ⏱️ {featured['temps_lecture']}</span>
                    <span class="card-read">Lire l'article →</span>
                </div>
            </div>
            <div class="featured-img-wrapper">
                <img src="img/{feat_img_name}" alt="{featured['titre']} - DigitalBoost AI">
            </div>
        </a>
    </div>
"""

    # Grid HTML
    grid_html = """
    <p class="featured-label">📖 Tous les articles</p>
    <div class="articles-grid">
"""
    for a in others:
        img_name = a['image_url'].split('/')[-1]
        grid_html += f"""
        <a href="{a['url']}" class="article-card" data-publish-date="{a['date_publication']}">
            <div class="card-img">
                <img src="img/{img_name}" alt="{a['titre']} - DigitalBoost AI" loading="lazy">
            </div>
            <div class="card-body">
                <span class="card-tag">{a.get('categorie', '')}</span>
                <h3 class="card-title">{a['titre']}</h3>
                <p class="card-excerpt">{a['excerpt']}</p>
                <div class="card-meta">
                    <span>📅 {format_date_fr(a['date_publication'])} &nbsp;·&nbsp; ⏱️ {a['temps_lecture']}</span>
                    <span class="card-read">Lire →</span>
                </div>
            </div>
        </a>
"""
    grid_html += "    </div>\n"
    return feat_html, grid_html


def add_to_blog_html(config):
    with open(BLOG_INDEX, "r", encoding="utf-8") as f:
        content = f.read()

    # Mise à jour du compteur d'articles (statistiques en haut de la page)
    total_articles = len(config['articles'])
    # Trouver et remplacer le compteur d'articles
    content = re.sub(
        r'<span class="num">\d+</span><span class="label">Articles publiés</span>',
        f'<span class="num">{total_articles}</span><span class="label">Articles publiés</span>',
        content
    )

    # Obtenir les catégories uniques
    categories = set(a.get('categorie') for a in config['articles'] if a.get('categorie'))
    total_categories = len(categories)
    # Trouver et remplacer le compteur de catégories
    content = re.sub(
        r'<span class="num">\d+</span><span class="label">Catégories</span>',
        f'<span class="num">{total_categories}</span><span class="label">Catégories</span>',
        content
    )

    # Regénérer toute la grille HTML
    feat_html, grid_html = rebuild_blog_grid(config)

    # Injecter dans le HTML
    pattern = re.compile(r'<!-- ARTICLE EN VEDETTE \(le plus récent\) -->.*?(?=<!-- NEWSLETTER -->)', re.DOTALL)
    replacement = f"<!-- ARTICLE EN VEDETTE (le plus récent) -->\n{feat_html}\n{grid_html}\n\n    "
    
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        print("✅ Grille et article à la une mis à jour dynamiquement dans blog.html.")
    else:
        print("⚠️ Impossible de trouver les marqueurs dans blog.html pour la mise à jour.")

    with open(BLOG_INDEX, "w", encoding="utf-8") as f:
        f.write(content)

def trigger_newsletter_distribution():
    """
    Appelle le webhook du Google Apps Script pour forcer la distribution immédiate.
    """
    if not NEWSLETTER_WEBHOOK_URL or "REMPLACER_PAR_URL" in NEWSLETTER_WEBHOOK_URL:
        print("⚠️ Newsletter : URL Webhook non configurée. Distribution automatique ignorée.")
        return

    print("🔔 Déclenchement de la distribution de la newsletter...")
    try:
        response = requests.get(NEWSLETTER_WEBHOOK_URL, timeout=10)
        if response.status_code == 200:
            print("🚀 Newsletter : Signal envoyé avec succès !")
            print(f"📡 Réponse : {response.text}")
        else:
            print(f"❌ Newsletter : Erreur signal (Code: {response.status_code})")
    except Exception as e:
        print(f"⚠️ Newsletter : Échec de connexion au webhook : {e}")

def publish_article(article_id, title, excerpt, file_name, img_name, emoji, category, read_time):
    print(f"🚀 Préparation Publication Totale : {title}")
    
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ Erreur : {CONFIG_FILE} introuvable.")
        return

    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)

    # Auto-génération de l'ID si non fourni
    if not article_id:
        total_articles = len(config['articles'])
        article_id = f"article-{total_articles + 1:03d}"
        print(f"🤖 ID généré automatiquement : {article_id}")

    # 1. Mise à jour config (JSON)
    for article in config['articles']:
        if article['id'] == article_id:
            print(f"⚠️ L'article {article_id} existe déjà dans {CONFIG_FILE}. Remplacement...")
            config['articles'].remove(article)
            break

    # Date formatée
    now = datetime.now()
    date_iso = now.strftime("%Y-%m-%d")

    new_article = {
        "id": article_id,
        "titre": title,
        "excerpt": excerpt,
        "url": f"{BASE_URL}/blog/{file_name}",
        "image_url": f"{BASE_URL}/img/{img_name}",
        "emoji": emoji,
        "categorie": category,
        "temps_lecture": read_time,
        "date_publication": date_iso,
        "newsletter_envoyee": False
    }
    config['articles'].append(new_article)

    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {CONFIG_FILE} mis à jour (ID: {article_id}).")

    # 2. Ajout de la carte (HTML) et mise à jour du compteur
    add_to_blog_html(config)

    # 3. Génération du Flux RSS
    print("📡 Mise à jour du flux RSS (rss.xml)...")
    try:
        subprocess.run(["python", "generate_rss.py"], check=True)
    except Exception as e:
        print(f"⚠️ Erreur lors de la génération RSS : {e}")

    # 4. Déploiement Vercel automatique
    print("☁️ Déploiement sur serveur Vercel...")
    try:
        subprocess.run(["npx", "vercel", "--prod", "--yes"], capture_output=True, text=True, check=True)
        print("🎉 Déploiement 100% réussi !")
        print(f"🔗 URL LIVE : {BASE_URL}/blog/{file_name}")

        # 5. Déclencheur Newsletter (immédiat)
        trigger_newsletter_distribution()

    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur de déploiement Vercel : {e.stderr}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automatisation TOTALE Publication Blog")
    parser.add_argument("--id", required=False, help="Identifiant unique (ex: article-036). Optionnel, généré auto si omis.")
    parser.add_argument("--title", required=True, help="Titre principal de l'article")
    parser.add_argument("--excerpt", required=True, help="Résumé court (2-3 phrases)")
    parser.add_argument("--file", required=True, help="Nom du fichier (ex: le-nom.html)")
    parser.add_argument("--image", required=True, help="Nom de l'image (ex: image.png)")
    parser.add_argument("--emoji", required=True, help="Un emoji (ex: 🚀)")
    parser.add_argument("--category", required=True, help="Catégorie (ex: Intelligence Artificielle)")
    parser.add_argument("--time", required=True, help="Temps de lecture (ex: 5 min de lecture)")
    args = parser.parse_args()

    publish_article(args.id, args.title, args.excerpt, args.file, args.image, args.emoji, args.category, args.time)
