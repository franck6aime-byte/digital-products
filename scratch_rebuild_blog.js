const fs = require('fs');

const config = JSON.parse(fs.readFileSync('articles-config.json', 'utf8'));
let content = fs.readFileSync('blog.html', 'utf8');

const articles = config.articles.filter(a => a.date_publication).sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));

const format_date_fr = (date_iso) => {
    try {
        const d = new Date(date_iso);
        const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        return `${d.getDate()} ${mois[d.getMonth() + 1]} ${d.getFullYear()}`;
    } catch {
        return date_iso;
    }
};

const featured = articles[0];
const others = articles.slice(1);

const feat_img_name = featured.image_url.split('/').pop();
const feat_html = `
    <p class="featured-label">⭐ Article à la une <span style="font-size:.72rem;background:#FEF3C7;color:#92400E;padding:3px 10px;border-radius:100px;margin-left:8px;">Nouveau</span></p>
    <div id="featured-article-container">
        <a href="${featured.url}" class="featured-card" data-publish-date="${featured.date_publication}">
            <div>
                <span class="card-tag">${featured.categorie || ''}</span>
                <h2 class="card-title">${featured.titre}</h2>
                <p class="card-excerpt">${featured.excerpt}</p>
                <div class="card-meta">
                    <span>📅 ${format_date_fr(featured.date_publication)} &nbsp;·&nbsp; ⏱️ ${featured.temps_lecture}</span>
                    <span class="card-read">Lire l'article →</span>
                </div>
            </div>
            <div class="featured-img-wrapper">
                <img src="img/${feat_img_name}" alt="${featured.titre} - DigitalBoost AI">
            </div>
        </a>
    </div>
`;

let grid_html = `
    <p class="featured-label">📖 Tous les articles</p>
    <div class="articles-grid">
`;

for (const a of others) {
    const img_name = a.image_url.split('/').pop();
    grid_html += `
        <a href="${a.url}" class="article-card" data-publish-date="${a.date_publication}">
            <div class="card-img">
                <img src="img/${img_name}" alt="${a.titre} - DigitalBoost AI" loading="lazy">
            </div>
            <div class="card-body">
                <span class="card-tag">${a.categorie || ''}</span>
                <h3 class="card-title">${a.titre}</h3>
                <p class="card-excerpt">${a.excerpt}</p>
                <div class="card-meta">
                    <span>📅 ${format_date_fr(a.date_publication)} &nbsp;·&nbsp; ⏱️ ${a.temps_lecture}</span>
                    <span class="card-read">Lire →</span>
                </div>
            </div>
        </a>
`;
}
grid_html += "    </div>\n";

const pattern = /<!-- ARTICLE EN VEDETTE \(le plus récent\) -->[\s\S]*?(?=<!-- NEWSLETTER -->)/;
const replacement = `<!-- ARTICLE EN VEDETTE (le plus récent) -->\n${feat_html}\n${grid_html}\n\n    `;

if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync('blog.html', content, 'utf8');
    console.log("✅ Grille et article à la une mis à jour dynamiquement dans blog.html.");
} else {
    console.log("⚠️ Impossible de trouver les marqueurs dans blog.html pour la mise à jour.");
}
