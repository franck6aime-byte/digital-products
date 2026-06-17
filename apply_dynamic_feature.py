import re

BLOG_FILE = "blog.html"

with open(BLOG_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remplacer la section "À la une" statique par un conteneur dynamique
static_featured = r'<a href="https://digitalboostai.tech/blog/52-newsletters-1-heure-prompt-chatgpt.html" class="featured-card">.*?</a>'
dynamic_featured = '''<div id="featured-article-container">
    <!-- Le JavaScript insérera ici automatiquement le dernier article publié -->
</div>'''

content = re.sub(static_featured, dynamic_featured, content, flags=re.DOTALL)

# 2. S'assurer que l'article "52 newsletters" est dans la grille
article_52 = '''
        <a href="https://digitalboostai.tech/blog/52-newsletters-1-heure-prompt-chatgpt.html" class="article-card" data-publish-date="2026-04-12">
            <div class="card-img">
                <img src="img/newsletter_52_en_1_heure.png" alt="52 newsletters en 1 heure ChatGPT - DigitalBoost AI" loading="lazy">
            </div>
            <div class="card-body">
                <span class="card-tag">📩 Copywriting &amp; IA</span>
                <h3 class="card-title">52 newsletters en 1 heure : le prompt ChatGPT qui change tout</h3>
                <p class="card-excerpt">Démonstration en live des prompts ChatGPT #24, #76 et #78 pour générer et automatiser vos 52 newsletters de l'année en 1 heure.</p>
                <div class="card-meta">
                    <span>📅 12 Avril 2026 &nbsp;·&nbsp; ⏱️ 5 min</span>
                    <span class="card-read">Lire →</span>
                </div>
            </div>
        </a>'''

if "52-newsletters-1-heure-prompt-chatgpt.html" not in content.split('<div class="articles-grid">')[1]:
    content = content.replace('<div class="articles-grid">\n', '<div class="articles-grid">\n' + article_52 + '\n')

# 3. Remplacer le script JS basique par le script dynamique
old_script_regex = r'<!-- Script de programmation d\'articles -->.*?</body>'
new_script = '''<!-- Script de programmation d'articles -->
<script>
    document.addEventListener("DOMContentLoaded", function() {
        const today = new Date();
        today.setHours(0,0,0,0);
        let firstValidCard = null;
        
        document.querySelectorAll('.article-card').forEach(card => {
            const dateStr = card.getAttribute('data-publish-date');
            
            // Gestion des anciens articles non-programmés
            if(!dateStr) {
                if(!firstValidCard) firstValidCard = card;
                return;
            }

            const pubDate = new Date(dateStr);
            if(pubDate > today) {
                card.style.display = 'none'; // Cacher articles futurs
            } else {
                if(!firstValidCard) firstValidCard = card; // Le plus récent valide
            }
        });

        if(firstValidCard) {
            const featContainer = document.getElementById('featured-article-container');
            if(featContainer) {
                const imgEl = firstValidCard.querySelector('.card-img img');
                const tagEl = firstValidCard.querySelector('.card-tag');
                const titleEl = firstValidCard.querySelector('.card-title');
                const excerptEl = firstValidCard.querySelector('.card-excerpt');
                const metaEl = firstValidCard.querySelector('.card-meta span:first-child');
                const href = firstValidCard.getAttribute('href');
                
                const featHTML = `
                <a href="${href}" class="featured-card">
                    <div>
                        <span class="card-tag">${tagEl ? tagEl.innerHTML : ''}</span>
                        <h2 class="card-title">${titleEl ? titleEl.innerHTML : ''}</h2>
                        <p class="card-excerpt">${excerptEl ? excerptEl.innerHTML : ''}</p>
                        <div class="card-meta">
                            <span>${metaEl ? metaEl.innerHTML : ''}</span>
                            <span class="card-read">Lire l'article →</span>
                        </div>
                    </div>
                    <div class="featured-img-wrapper">
                        <img src="${imgEl ? imgEl.getAttribute('src') : ''}" alt="${imgEl ? imgEl.getAttribute('alt') : ''}">
                    </div>
                </a>
                `;
                featContainer.innerHTML = featHTML;
                firstValidCard.style.display = 'none'; // Retirer de la grille classique
            }
        }
    });
</script>
</body>'''

content = re.sub(old_script_regex, new_script, content, flags=re.DOTALL)

with open(BLOG_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ blog.html mis à jour : système dynamique À la une ajouté.")
