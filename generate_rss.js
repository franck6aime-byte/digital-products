const fs = require('fs');
const path = require('path');

const CONFIG_FILE = "articles-config.json";
const RSS_FILE = "rss.xml";

function generateRss() {
    console.log("GENERATING RSS FEED...");
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`Error: ${CONFIG_FILE} not found.`);
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const siteInfo = config.blog || {};
    const baseUrl = siteInfo.base_url || "https://digitalboostai.tech";

    const rssContent = [
        '<?xml version="1.0" encoding="UTF-8" ?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '  <title>DigitalBoost AI Blog</title>',
        `  <link>${baseUrl}/blog</link>`,
        '  <description>Workflows, stratégies et prompts concrets pour entrepreneurs et créateurs africains qui veulent aller plus vite grâce à l\'intelligence artificielle.</description>',
        '  <language>fr</language>',
        `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />`
    ];

    const today = new Date();
    const articles = (config.articles || [])
        .filter(a => a.date_publication)
        .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));

    for (const article of articles) {
        const title = (article.titre || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const url = (article.url || '').replace(/vercel\.app/g, 'tech').replace(/\.html$/g, '');
        const excerpt = (article.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const category = (article.categorie || '').replace(/&/g, '&amp;');
        const dateStr = article.date_publication || '';

        let pubDate = "";
        let isFuture = false;

        if (dateStr) {
            try {
                const parts = dateStr.split('-');
                const dt = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 8, 0, 0));
                if (dt > today) {
                    isFuture = true;
                }
                // Format: Mon, 15 Jun 2026 08:00:00 +0000
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                pubDate = `${days[dt.getUTCDay()]}, ${String(dt.getUTCDate()).padStart(2, '0')} ${months[dt.getUTCMonth()]} ${dt.getUTCFullYear()} 08:00:00 +0000`;
            } catch (e) {
                pubDate = "";
            }
        }

        if (isFuture) {
            continue;
        }

        rssContent.push('  <item>');
        rssContent.push(`    <title>${title}</title>`);
        rssContent.push(`    <link>${url}</link>`);
        rssContent.push(`    <description>${excerpt}</description>`);
        if (pubDate) {
            rssContent.push(`    <pubDate>${pubDate}</pubDate>`);
        }
        rssContent.push(`    <guid isPermaLink="true">${url}</guid>`);
        if (category) {
            rssContent.push(`    <category>${category}</category>`);
        }
        rssContent.push('  </item>');
    }

    rssContent.push('</channel>');
    rssContent.push('</rss>');

    fs.writeFileSync(RSS_FILE, rssContent.join('\n'), 'utf8');
    console.log(`Flux RSS généré avec succès dans ${RSS_FILE} !`);
}

generateRss();
