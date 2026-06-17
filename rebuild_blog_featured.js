const fs = require('fs');

const CONFIG_FILE = "articles-config.json";
const BLOG_INDEX = "blog.html";
const BASE_URL = "https://digitalboostai.tech";

const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

const format_date_fr = (date_iso) => {
    try {
        const d = new Date(date_iso);
        const mois = ["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
        return `${d.getDate()} ${mois[d.getMonth()+1]} ${d.getFullYear()}`;
    } catch { return date_iso; }
};

const articles = config.articles
    .filter(a => a.date_publication)
    .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));

const featured = articles[0];
const others = articles.slice(1);

console.log(`✅ Article à la une : ${featured.id} — ${featured.titre.substring(0,60)}`);
console.log(`   2e : ${articles[1].id} — ${articles[1].titre.substring(0,60)}`);

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

let blogContent = fs.readFileSync(BLOG_INDEX, 'utf8');

const total_articles = config.articles.length;
blogContent = blogContent.replace(
    /<span class="num">\d+<\/span><span class="label">Articles publiés<\/span>/,
    `<span class="num">${total_articles}</span><span class="label">Articles publiés</span>`
);

const pattern = /<!-- ARTICLE EN VEDETTE \(le plus récent\) -->[\s\S]*?(?=<!-- NEWSLETTER -->)/;
const replacement = `<!-- ARTICLE EN VEDETTE (le plus récent) -->\n${feat_html}\n${grid_html}\n\n    `;

if (pattern.test(blogContent)) {
    blogContent = blogContent.replace(pattern, replacement);
    fs.writeFileSync(BLOG_INDEX, blogContent, 'utf8');
    console.log("✅ blog.html mis à jour.");
} else {
    console.log("⚠️ Marqueurs introuvables dans blog.html.");
}
