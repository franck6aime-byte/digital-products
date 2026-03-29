import json
import re

CONFIG_FILE = "articles-config.json"
BLOG_INDEX = "blog.html"

def update_stats():
    print("📊 Chargement des statistiques depuis", CONFIG_FILE)
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
    except Exception as e:
        print(f"❌ Erreur lors de la lecture de {CONFIG_FILE}: {e}")
        return

    articles = config.get('articles', [])
    
    # 1. Calcul du nombre d'articles pertinents
    total_articles = len(articles)
    
    # 2. Calcul du nombre de catégories uniques
    categories = set(article.get('categorie') for article in articles if article.get('categorie'))
    total_categories = len(categories)
    
    print(f"✅ Comptage terminé : {total_articles} Articles, {total_categories} Catégories.")

    # 3. Lecture du fichier blog.html
    try:
        with open(BLOG_INDEX, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Erreur lors de la lecture de {BLOG_INDEX}: {e}")
        return

    # 4. Remplacement dynamique via Expressions Régulières (Regex)
    # Met à jour la balise qui contient le nombre d'articles
    content = re.sub(
        r'<div class="stat"><span class="num">\d+</span><span class="label">Articles publiés</span></div>',
        f'<div class="stat"><span class="num">{total_articles}</span><span class="label">Articles publiés</span></div>',
        content
    )
    
    # Met à jour la balise qui contient le nombre de catégories
    content = re.sub(
        r'<div class="stat"><span class="num">\d+</span><span class="label">Catégories</span></div>',
        f'<div class="stat"><span class="num">{total_categories}</span><span class="label">Catégories</span></div>',
        content
    )

    # 5. Sauvegarde de la mise à jour
    try:
        with open(BLOG_INDEX, 'w', encoding='utf-8') as f:
            f.write(content)
        print("🎉 Fichier blog.html mis à jour avec les nouvelles statistiques avec succès !")
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture de {BLOG_INDEX}: {e}")

if __name__ == "__main__":
    update_stats()
