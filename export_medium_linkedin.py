import os
import re
import sys
import glob

def export_to_markdown(html_file):
    print(f"📄 Analyse de {html_file}...")
    if not os.path.exists(html_file):
        print("❌ Fichier introuvable.")
        return

    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Extraire uniquement le contenu de main.article-body
    match = re.search(r'<main class="article-body"[^>]*>(.*?)</main>', html, re.DOTALL)
    if not match:
        print("❌ Balise <main class=\"article-body\"> introuvable.")
        return
    
    body = match.group(1)

    # Nettoyage et conversion basique vers Markdown
    
    # 1. Supprimer les divs complexes qui ne passent pas bien (on garde leur contenu texte interne)
    body = re.sub(r'<div class="(cta-inline|seo-tags)".*?</div>', '', body, flags=re.DOTALL)
    
    # 2. Remplacer les éléments de bloc
    body = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n\n', body, flags=re.IGNORECASE)
    body = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n\n', body, flags=re.IGNORECASE)
    body = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n\n', body, flags=re.IGNORECASE)
    body = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', body, flags=re.IGNORECASE|re.DOTALL)
    body = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', body, flags=re.IGNORECASE|re.DOTALL)
    body = re.sub(r'<ul[^>]*>(.*?)</ul>', r'\1\n', body, flags=re.IGNORECASE|re.DOTALL)
    
    # Raccourcis pour les blocs spéciaux
    body = re.sub(r'<div class="prompt-box"[^>]*>.*?<p[^>]*>(.*?)</p>.*?</div>', r'```text\n\1\n```\n\n', body, flags=re.IGNORECASE|re.DOTALL)
    body = re.sub(r'<div class="intro-block"[^>]*>.*?<p[^>]*>(.*?)</p>.*?</div>', r'> \1\n\n', body, flags=re.IGNORECASE|re.DOTALL)
    
    # 3. Remplacer les éléments en ligne
    body = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', body, flags=re.IGNORECASE|re.DOTALL)
    body = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', body, flags=re.IGNORECASE|re.DOTALL)
    body = re.sub(r'<a href="(.*?)"[^>]*>(.*?)</a>', r'[\2](\1)', body, flags=re.IGNORECASE|re.DOTALL)
    
    # 4. Nettoyer le reste des balises HTML
    body = re.sub(r'<[^>]+>', '', body)
    
    # 5. Nettoyer les espaces multiples
    body = re.sub(r'\n{3,}', '\n\n', body)
    body = body.replace('&#x27;', "'").replace('&amp;', '&').replace('&nbsp;', ' ')

    # Ajout du Call-To-Action final
    cta = "\n\n---\n*Cet article a été initialement publié sur le blog de [DigitalBoost AI](https://digitalboostai.tech). Vous y trouverez des outils complets, des prompts et des workflows pour intégrer l'Intelligence Artificielle de manière concrète dans votre business en Afrique.*"
    body += cta

    # Sauvegarde
    os.makedirs('exports', exist_ok=True)
    basename = os.path.basename(html_file).replace('.html', '.md')
    export_path = os.path.join('exports', basename)
    
    with open(export_path, 'w', encoding='utf-8') as f:
        f.write(body.strip())
        
    print(f"✅ Export Markdown réussi : {export_path}")
    print("👉 Vous pouvez maintenant ouvrir ce fichier .md, tout copier, et coller directement sur LinkedIn Articles ou Medium !")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Export HTML to Markdown for Medium/LinkedIn")
    parser.add_argument("--file", help="Fichier HTML à exporter. Si vide, prend le plus récent dans le dossier blog/")
    args = parser.parse_args()

    target_file = args.file
    if not target_file:
        # Trouver le fichier HTML le plus récent dans le dossier blog
        files = glob.glob("blog/*.html")
        if files:
            target_file = max(files, key=os.path.getmtime)
            print(f"🔍 Aucun fichier passé. Sélection du fichier le plus récent : {target_file}")
        else:
            print("❌ Aucun fichier HTML trouvé dans le dossier 'blog/'.")
            sys.exit(1)

    export_to_markdown(target_file)
