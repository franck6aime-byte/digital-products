const fs = require('fs');
const { execSync } = require('child_process');
const http = require('https');

const CONFIG_FILE = "articles-config.json";
const BLOG_INDEX = "blog.html";
const BASE_URL = "https://digitalboostai.tech";
// Bug corrigé : la clé de sécurité doit être passée en paramètre ?key=
// Sans elle, doGet() rejette la requête avec "Clé de sécurité invalide"
const NEWSLETTER_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyPWPlHaXJrNYAMFubWVVHoioouR87t2XKPsuFePGwJB6CLl3hQO9REzSDnZ5VLY613ew/exec?key=dbai_security_2026_q2";

// Parse command line arguments
// Example: node publish_article.js --title "..." --excerpt "..." --file "..." --image "..." --emoji "..." --category "..." --time "..."
const args = {};
process.argv.slice(2).forEach((val, index, array) => {
    if (val.startsWith('--')) {
        const key = val.substring(2);
        const nextVal = array[index + 1];
        if (nextVal && !nextVal.startsWith('--')) {
            args[key] = nextVal;
        }
    }
});

const title = args.title;
const excerpt = args.excerpt;
const file_name = args.file;
const img_name = args.image;
const emoji = args.emoji;
const category = args.category;
const read_time = args.time;

if (!title || !excerpt || !file_name || !img_name || !emoji || !category || !read_time) {
    console.error("❌ Missing arguments. Required: --title, --excerpt, --file, --image, --emoji, --category, --time");
    process.exit(1);
}

if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ Error: ${CONFIG_FILE} not found.`);
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

// Auto-generate ID if not provided
let article_id = args.id;
if (!article_id) {
    // Find highest number in existing IDs (like article-035)
    let maxNum = 0;
    config.articles.forEach(a => {
        const match = a.id.match(/article-(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
        }
    });
    const nextNum = maxNum + 1;
    article_id = `article-${String(nextNum).padStart(3, '0')}`;
    console.log(`🤖 ID généré automatiquement : ${article_id}`);
}

// Remove if exists
config.articles = config.articles.filter(a => a.id !== article_id);

const today = new Date();
const date_iso = today.toISOString().split('T')[0];

const new_article = {
    id: article_id,
    titre: title,
    excerpt: excerpt,
    url: `${BASE_URL}/blog/${file_name.replace(/\.html$/g, '')}`,
    image_url: `${BASE_URL}/img/${img_name}`,
    emoji: emoji,
    categorie: category,
    temps_lecture: read_time,
    date_publication: date_iso,
    newsletter_envoyee: false
};

config.articles.push(new_article);

fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
console.log(`✅ ${CONFIG_FILE} mis à jour (ID: ${article_id}).`);

// Rebuild blog.html
const format_date_fr = (date_iso) => {
    try {
        const [y, m, d] = date_iso.split('-').map(Number);
        const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        return `${d} ${mois[m]} ${y}`;
    } catch {
        return date_iso;
    }
};

const articles = config.articles.filter(a => a.date_publication).sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));
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

let blogContent = fs.readFileSync(BLOG_INDEX, 'utf8');

// Update total articles counter
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
    console.log("✅ Grille et article à la une mis à jour dynamiquement dans blog.html.");
} else {
    console.log("⚠️ Impossible de trouver les marqueurs dans blog.html pour la mise à jour.");
}

// Generate RSS
try {
    console.log("📡 Mise à jour du flux RSS (rss.xml)...");
    execSync("node generate_rss.js", { stdio: 'inherit' });
} catch (e) {
    console.error("⚠️ Erreur lors de la génération RSS :", e.message);
}

// Trigger newsletter
console.log("🔔 Déclenchement de la distribution de la newsletter...");
fetch(NEWSLETTER_WEBHOOK_URL)
    .then(res => {
        if (res.ok) {
            return res.text();
        }
        throw new Error(`Code status ${res.status}`);
    })
    .then(data => {
        console.log("🚀 Newsletter : Signal envoyé avec succès !");
        console.log(`📡 Réponse : ${data}`);
    })
    .catch(err => {
        console.warn("⚠️ Newsletter : Échec de connexion au webhook :", err.message);
    });
