const fs = require('fs');

const CONFIG_FILE = "articles-config.json";
const BLOG_INDEX = "blog.html";

function updateStats() {
    console.log("📊 Chargement des statistiques depuis", CONFIG_FILE);
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`❌ Erreur: ${CONFIG_FILE} introuvable.`);
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const articles = config.articles || [];
    const todayStr = new Date().toISOString().split('T')[0];

    const publishedArticles = articles.filter(a => {
        const dateStr = a.date_publication;
        if (!dateStr) return true; // Keep old articles without publication date
        return dateStr <= todayStr;
    });

    const totalArticles = publishedArticles.length;
    const categories = new Set(publishedArticles.map(a => a.categorie).filter(Boolean));
    const totalCategories = categories.size;

    console.log(`✅ Comptage terminé : ${totalArticles} Articles publiés, ${totalCategories} Catégories.`);

    if (!fs.existsSync(BLOG_INDEX)) {
        console.error(`❌ Erreur: ${BLOG_INDEX} introuvable.`);
        return;
    }

    let content = fs.readFileSync(BLOG_INDEX, 'utf8');

    // Regex replacement for stats count
    content = content.replace(
        /<div class="stat"><span class="num">\d+<\/span><span class="label">Articles publiés<\/span><\/div>/g,
        `<div class="stat"><span class="num">${totalArticles}</span><span class="label">Articles publiés</span></div>`
    );

    content = content.replace(
        /<div class="stat"><span class="num">\d+<\/span><span class="label">Catégories<\/span><\/div>/g,
        `<div class="stat"><span class="num">${totalCategories}</span><span class="label">Catégories</span></div>`
    );

    // Also replace the simple selector count if any
    content = content.replace(
        /<span class="num">\d+<\/span><span class="label">Articles publiés<\/span>/g,
        `<span class="num">${totalArticles}</span><span class="label">Articles publiés</span>`
    );

    fs.writeFileSync(BLOG_INDEX, content, 'utf8');
    console.log("🎉 Fichier blog.html mis à jour avec les nouvelles statistiques avec succès !");
}

updateStats();
