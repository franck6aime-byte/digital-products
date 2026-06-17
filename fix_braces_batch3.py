"""
fix_braces_batch3.py
Corrige les {{ et }} résiduels dans TOUS les blocs <style> et <script>
(avec ou sans attributs) des 7 articles générés par rebuild_batch3.py.
"""
import os, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BLOG_DIR = os.path.join(os.path.dirname(__file__), "blog")

FILES = [
    "rediger-une-sequence-email-bienvenue.html",
    "utiliser-ia-pour-trouver-idee-de-business.html",
    "5-erreurs-fatales-en-prompt-engineering.html",
    "creer-des-videos-tiktok-sans-visage.html",
    "organiser-journee-entrepreneur-ia-notion.html",
    "gerer-les-clients-difficiles-prompts-ia.html",
    "bilan-trimestriel-comment-l-automatisation-a-transforme-digitalboost-ai.html",
]

def fix_braces(block_content):
    """Remplace {{ -> { et }} -> } dans un bloc CSS ou JS."""
    return block_content.replace('{{', '{').replace('}}', '}')

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix <style ...>...</style> blocks (with or without attributes)
    content = re.sub(
        r'(<style[^>]*>)(.*?)(</style>)',
        lambda m: m.group(1) + fix_braces(m.group(2)) + m.group(3),
        content, flags=re.DOTALL
    )

    # Fix <script ...>...</script> blocks (with or without attributes, incl. JSON-LD)
    content = re.sub(
        r'(<script[^>]*>)(.*?)(</script>)',
        lambda m: m.group(1) + fix_braces(m.group(2)) + m.group(3),
        content, flags=re.DOTALL
    )

    if content == original:
        print(f"  Deja correct : {os.path.basename(filepath)}")
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # Count remaining doubles as sanity check
    remaining = content.count('{{') + content.count('}}')
    print(f"  CORRIGE : {os.path.basename(filepath)} (doubles restantes hors HTML: {remaining})")
    return True

print("=" * 60)
print("FIX {{ }} BRACES - Batch 3 HTML files (passe 2)")
print("=" * 60)
fixed = 0
for fname in FILES:
    fpath = os.path.join(BLOG_DIR, fname)
    if not os.path.exists(fpath):
        print(f"  ABSENT : {fname}")
        continue
    if fix_file(fpath):
        fixed += 1

print(f"\nTermine : {fixed}/{len(FILES)} fichiers traites.")
