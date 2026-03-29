import json
import os
from datetime import datetime

CONFIG_FILE = "articles-config.json"
RSS_FILE = "rss.xml"

def generate_rss():
    print("📡 Génération du flux RSS...")
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ Erreur : {CONFIG_FILE} introuvable.")
        return

    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)

    site_info = config.get('blog', {})
    base_url = site_info.get('base_url', "https://digitalboostai.tech")
    
    # En-tête du flux RSS 2.0
    rss_content = [
        '<?xml version="1.0" encoding="UTF-8" ?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '  <title>DigitalBoost AI Blog</title>',
        f'  <link>{base_url}/blog</link>',
        '  <description>Workflows, stratégies et prompts concrets pour entrepreneurs et créateurs africains qui veulent aller plus vite grâce à l\'intelligence artificielle.</description>',
        '  <language>fr</language>',
        f'  <atom:link href="{base_url}/rss.xml" rel="self" type="application/rss+xml" />'
    ]

    articles = config.get('articles', [])
    # Inverser l'ordre pour avoir les plus récents en premier dans le flux
    for article in reversed(articles):
        title = article.get('titre', '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        url = article.get('url', '').replace('vercel.app', 'tech').replace('.html', '') # Utilisation du domaine pro et URL propre
        excerpt = article.get('excerpt', '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        category = article.get('categorie', '').replace('&', '&amp;')
        date_str = article.get('date_publication', '')
        
        # Convertir la date (AAAA-MM-JJ) en RFC 822
        pub_date = ""
        if date_str:
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                pub_date = dt.strftime("%a, %d %b %Y 08:00:00 +0000")
            except Exception:
                pub_date = ""

        rss_content.append('  <item>')
        rss_content.append(f'    <title>{title}</title>')
        rss_content.append(f'    <link>{url}</link>')
        rss_content.append(f'    <description>{excerpt}</description>')
        if pub_date:
            rss_content.append(f'    <pubDate>{pub_date}</pubDate>')
        rss_content.append(f'    <guid isPermaLink="true">{url}</guid>')
        if category:
            rss_content.append(f'    <category>{category}</category>')
        rss_content.append('  </item>')

    rss_content.append('</channel>')
    rss_content.append('</rss>')

    with open(RSS_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(rss_content))
    
    print(f"✅ Flux RSS généré avec succès dans {RSS_FILE} !")

if __name__ == "__main__":
    generate_rss()
