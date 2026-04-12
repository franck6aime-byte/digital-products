import json
import os
import subprocess
import argparse
from datetime import datetime
import re

# CONFIGURATION
CONFIG_FILE = "articles-config.json"
BLOG_INDEX = "blog.html"
BASE_URL = "https://digitalboostai.tech"

def add_to_blog_html(title, excerpt, file_name, img_name, emoji, read_time, date_str, total_articles):
    with open(BLOG_INDEX, "r", encoding="utf-8") as f:
        content = f.read()

    # Mise à jour du compteur d'articles
    content = re.sub(
        r'<span class="num">\d+</span><span class="label">Articles publiés</span>',
        f'<span class="num">{total_articles}</span><span class="label">Articles publiés</span>',
        content
    )
    
    # Éviter les doublons de carte
    if file_name in content:
        print(f"⚠️ La carte pour {file_name} semble déjà exister dans blog.html.")
        return

    # Création du bloc HTML de la nouvelle carte d'article
    gradient = "linear-gradient(135deg, #0D1117 0%, #1A4B9E 50%, #C9A84C 100%)"
    
    # Format HTML de la nouvelle carte d'article
    new_card = f"""
        <a href="https://digitalboostai.tech/blog/{file_name}" class="article-card">
            <div class="card-img">
                <img src="img/{img_name}" alt="{title} - DigitalBoost AI" loading="lazy">
            </div>
            <div class="card-body">
                <span class="card-tag">{category}</span>
                <h3 class="card-title">{title}</h3>
                <p class="card-excerpt">{excerpt}</p>
                <div class="card-meta">
                    <span>📅 {date_str} &nbsp;·&nbsp; ⏱️ {read_time}</span>
                    <span class="card-read">Lire →</span>
                </div>
            </div>
        </a>"""

    # Injection au sommet de la grille d'articles
    target = '<div class="articles-grid">\n'
    if target in content:
        content = content.replace(target, target + new_card + "\n")
    else:
        print("⚠️ 'articles-grid' non trouvé dans blog.html, injection de base.")
        # Fallback au pire si la grille bouge
        content = content.replace("</main>", new_card + "\n    </main>")

    with open(BLOG_INDEX, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ blog.html mis à jour visuellement (nouvelle carte ajoutée).")

def publish_article(article_id, title, excerpt, file_name, img_name, emoji, category, read_time):
    print(f"🚀 Préparation Publication Totale : {title}")
    
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ Erreur : {CONFIG_FILE} introuvable.")
        return

    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)

    # 1. Mise à jour config (JSON)
    for article in config['articles']:
        if article['id'] == article_id:
            print(f"⚠️ L'article {article_id} existe déjà dans {CONFIG_FILE}. Remplacement...")
            config['articles'].remove(article)
            break

    # Date formatée
    mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    now = datetime.now()
    date_str = f"{now.day} {mois[now.month]} {now.year}"
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
    
    print(f"✅ {CONFIG_FILE} mis à jour (pour la Newsletter).")

    # 2. Ajout de la carte (HTML) et mise à jour du compteur
    total_articles = len(config['articles'])
    add_to_blog_html(title, excerpt, file_name, img_name, emoji, read_time, date_str, total_articles)

    # 3. Génération du Flux RSS
    print("📡 Mise à jour du flux RSS (rss.xml)...")
    try:
        subprocess.run(["python", "generate_rss.py"], check=True)
    except Exception as e:
        print(f"⚠️ Erreur lors de la génération RSS : {e}")

    # 3. Déploiement Vercel automatique
    print("☁️ Déploiement sur serveur Vercel...")
    try:
        subprocess.run(["npx", "vercel", "--prod", "--yes"], capture_output=True, text=True, check=True)
        print("🎉 Déploiement 100% réussi !")
        print(f"🔗 URL LIVE : {BASE_URL}/blog/{file_name}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur de déploiement Vercel : {e.stderr}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automatisation TOTALE Publication Blog")
    parser.add_argument("--id", required=True, help="Identifiant unique (ex: article-004)")
    parser.add_argument("--title", required=True, help="Titre principal de l'article")
    parser.add_argument("--excerpt", required=True, help="Résumé court (2-3 phrases)")
    parser.add_argument("--file", required=True, help="Nom du fichier (ex: le-nom.html)")
    parser.add_argument("--image", required=True, help="Nom de l'image (ex: image.png)")
    parser.add_argument("--emoji", required=True, help="Un emoji (ex: 🚀)")
    parser.add_argument("--category", required=True, help="Catégorie (ex: Intelligence Artificielle)")
    parser.add_argument("--time", required=True, help="Temps de lecture (ex: 5 min de lecture)")
    args = parser.parse_args()

    publish_article(args.id, args.title, args.excerpt, args.file, args.image, args.emoji, args.category, args.time)
