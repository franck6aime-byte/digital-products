#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  DIGITALBOOST AI — AUTOMATISATION BLOG                             ║
 * ║  Génère, publie et déploie automatiquement les articles du          ║
 * ║  calendrier éditorial via l'API Gemini.                            ║
 * ║  Version : 1.0                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Usage :
 *   node automate_blog.js                    → Publie le prochain article planifié
 *   node automate_blog.js --article 33       → Publie l'article N°33 spécifiquement
 *   node automate_blog.js --dry-run          → Génère sans sauvegarder ni publier
 *   node automate_blog.js --no-push          → Génère et sauvegarde, mais ne git push pas
 *   node automate_blog.js --no-newsletter    → Ne déclenche pas la newsletter
 *
 * Configuration :
 *   Créer un fichier .env ou définir la variable d'environnement :
 *   GEMINI_API_KEY=votre_clé_api_gemini
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════
// 🔧 CONFIGURATION
// ═══════════════════════════════════════════════════════════

const PROJECT_DIR = __dirname;
const SCHEDULE_FILE = path.join(PROJECT_DIR, 'blog-schedule.json');
const CONFIG_FILE = path.join(PROJECT_DIR, 'articles-config.json');
const TEMPLATE_FILE = path.join(PROJECT_DIR, 'blog', 'components', 'article-template.html');
const PROMPT_FILE = path.join(PROJECT_DIR, 'prompts', 'article-generation-prompt.md');
const BLOG_DIR = path.join(PROJECT_DIR, 'blog');
const IMG_DIR = path.join(PROJECT_DIR, 'img');
const BASE_URL = 'https://digitalboostai.tech';

// ═══════════════════════════════════════════════════════════
// 📋 PARSE ARGUMENTS
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const NO_PUSH = args.includes('--no-push');
const NO_NEWSLETTER = args.includes('--no-newsletter');

let TARGET_ARTICLE_NUM = null;
const articleArgIdx = args.indexOf('--article');
if (articleArgIdx !== -1 && args[articleArgIdx + 1]) {
    TARGET_ARTICLE_NUM = parseInt(args[articleArgIdx + 1]);
}

// ═══════════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  ⚡ DigitalBoost AI — Automatisation Blog v1.0      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    if (DRY_RUN) console.log('🧪 MODE DRY-RUN — Aucun fichier ne sera modifié.\n');

    // 1. Vérifier la clé API
    const apiKey = loadApiKey();
    if (!apiKey) {
        console.error('❌ Clé API Gemini manquante !');
        console.error('   Créez un fichier .env avec GEMINI_API_KEY=votre_clé');
        console.error('   Ou définissez la variable d\'environnement GEMINI_API_KEY');
        console.error('   Obtenez une clé gratuite sur : https://aistudio.google.com/apikey');
        process.exit(1);
    }
    console.log('✅ Clé API Gemini chargée.');

    // 2. Charger le calendrier éditorial
    const schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
    const articlesConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log(`📅 Calendrier chargé : ${schedule.articles_planifies.length} articles planifiés.`);

    // 3. Trouver le prochain article à publier
    const article = findNextArticle(schedule, articlesConfig);
    if (!article) {
        console.log('\n✅ Aucun article à publier pour aujourd\'hui. Tout est à jour !');
        process.exit(0);
    }

    console.log(`\n📝 Article sélectionné :`);
    console.log(`   ID    : ${article.id}`);
    console.log(`   N°    : ${article.numero}`);
    console.log(`   Titre : ${article.titre_suggere}`);
    console.log(`   Date  : ${article.date}`);
    console.log(`   Cat.  : ${article.categorie}`);
    console.log('');

    // 4. Vérifier que le fichier blog n'existe pas déjà
    const slug = generateSlug(article.titre_suggere);
    const htmlFilename = `${slug}.html`;
    const htmlPath = path.join(BLOG_DIR, htmlFilename);

    if (fs.existsSync(htmlPath)) {
        console.log(`⚠️  Le fichier blog/${htmlFilename} existe déjà.`);
        console.log(`   → L'article sera publié dans articles-config.json et blog.html sans re-générer le contenu.`);
        publishExistingArticle(article, slug, htmlFilename, articlesConfig, schedule);
        return;
    }

    // 5. Charger le prompt et le template
    const systemPrompt = fs.readFileSync(PROMPT_FILE, 'utf8');
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    console.log('📄 Template et prompt chargés.');

    // 6. Générer le contenu via Gemini
    console.log('🤖 Appel à l\'API Gemini pour la rédaction de l\'article...');
    const generatedContent = await generateArticleContent(apiKey, systemPrompt, article);

    if (!generatedContent) {
        console.error('❌ Échec de la génération de contenu.');
        process.exit(1);
    }
    console.log('✅ Contenu généré avec succès !');

    // 7. Construire le HTML final
    const finalHTML = buildArticleHTML(template, article, generatedContent, slug);

    // 8. Déterminer le nom de l'image
    const imageFilename = generateImageFilename(slug);

    if (DRY_RUN) {
        console.log('\n🧪 DRY-RUN : Voici un aperçu du contenu généré :');
        console.log('─'.repeat(60));
        console.log(`Titre      : ${generatedContent.titre}`);
        console.log(`Excerpt    : ${generatedContent.excerpt}`);
        console.log(`Meta desc  : ${generatedContent.meta_description}`);
        console.log(`Keywords   : ${generatedContent.keywords}`);
        console.log(`Hero       : ${generatedContent.hero_tagline}`);
        console.log(`TOC items  : ${generatedContent.toc_items.length} sections`);
        console.log(`SEO tags   : ${generatedContent.seo_tags.join(', ')}`);
        console.log(`Body (HTML): ${generatedContent.article_body.length} caractères`);
        console.log('─'.repeat(60));
        console.log('\n✅ Dry run terminé. Aucun fichier modifié.');
        process.exit(0);
    }

    // 9. Sauvegarder le fichier HTML
    fs.writeFileSync(htmlPath, finalHTML, 'utf8');
    console.log(`✅ Article sauvegardé : blog/${htmlFilename}`);

    // 10. Créer une image placeholder si elle n'existe pas
    ensureImageExists(imageFilename, article.titre_suggere);

    // 11. Publier via publish_article.js
    const emoji = guessEmoji(article.categorie);
    const excerpt = generatedContent.excerpt || article.titre_suggere;

    console.log('\n📡 Publication via publish_article.js...');
    try {
        const publishCmd = [
            'node', 'publish_article.js',
            '--title', JSON.stringify(article.titre_suggere),
            '--excerpt', JSON.stringify(excerpt),
            '--file', JSON.stringify(htmlFilename),
            '--image', JSON.stringify(imageFilename),
            '--emoji', JSON.stringify(emoji),
            '--category', JSON.stringify(article.categorie),
            '--time', JSON.stringify('10 min de lecture'),
            '--id', JSON.stringify(article.id)
        ].join(' ');

        execSync(publishCmd, { cwd: PROJECT_DIR, stdio: 'inherit' });
        console.log('✅ publish_article.js exécuté avec succès.');
    } catch (e) {
        console.error('⚠️ Erreur publish_article.js :', e.message);
    }

    // 12. Mettre à jour le statut dans blog-schedule.json
    updateScheduleStatus(schedule, article.numero, 'publié');
    console.log('✅ blog-schedule.json mis à jour (statut: publié).');

    // 13. Git commit + push
    if (!NO_PUSH) {
        console.log('\n🚀 Git commit + push...');
        try {
            execSync('git add -A', { cwd: PROJECT_DIR, stdio: 'pipe' });
            execSync(`git commit -m "📝 Nouvel article : ${article.titre_suggere}"`, { cwd: PROJECT_DIR, stdio: 'pipe' });
            execSync('git push origin main', { cwd: PROJECT_DIR, stdio: 'inherit' });
            console.log('✅ Poussé vers GitHub → Vercel déploiera automatiquement.');
        } catch (e) {
            console.error('⚠️ Erreur Git :', e.message);
            console.log('   Vous pouvez git push manuellement.');
        }
    } else {
        console.log('\n⏸️  --no-push : Git push ignoré. Pensez à git push manuellement.');
    }

    console.log('\n══════════════════════════════════════════════════════');
    console.log('🎉 PUBLICATION TERMINÉE !');
    console.log(`   📄 blog/${htmlFilename}`);
    console.log(`   📅 ${article.date}`);
    console.log(`   📰 ${article.titre_suggere}`);
    console.log('══════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════
// 🔑 GESTION CLÉ API
// ═══════════════════════════════════════════════════════════

function loadApiKey() {
    // 1. Variable d'environnement
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

    // 2. Fichier .env
    const envPath = path.join(PROJECT_DIR, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
        if (match) return match[1].trim();
    }

    // 3. Fichier .env.gemini (dédié)
    const envGeminiPath = path.join(PROJECT_DIR, '.env.gemini');
    if (fs.existsSync(envGeminiPath)) {
        const envContent = fs.readFileSync(envGeminiPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
        if (match) return match[1].trim();
    }

    return null;
}

// ═══════════════════════════════════════════════════════════
// 📅 SÉLECTION DU PROCHAIN ARTICLE
// ═══════════════════════════════════════════════════════════

function findNextArticle(schedule, articlesConfig) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si un numéro spécifique est demandé
    if (TARGET_ARTICLE_NUM !== null) {
        const found = schedule.articles_planifies.find(a => a.numero === TARGET_ARTICLE_NUM);
        if (!found) {
            console.error(`❌ Article N°${TARGET_ARTICLE_NUM} introuvable dans le calendrier.`);
            process.exit(1);
        }
        return found;
    }

    // Trouver le prochain article dont :
    // - la date est ≤ aujourd'hui
    // - le statut est "planifié"
    // - il n'existe pas encore dans articles-config.json
    const existingIds = new Set((articlesConfig.articles || []).map(a => a.id));

    const candidates = schedule.articles_planifies
        .filter(a => {
            const articleDate = new Date(a.date);
            articleDate.setHours(0, 0, 0, 0);
            return articleDate <= today
                && (a.statut === 'planifié' || !a.statut)
                && !existingIds.has(a.id);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return candidates[0] || null;
}

// ═══════════════════════════════════════════════════════════
// 🤖 GÉNÉRATION CONTENU VIA GEMINI
// ═══════════════════════════════════════════════════════════

async function generateArticleContent(apiKey, systemPrompt, article) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json'
        }
    });

    const userPrompt = `
Rédige un article complet pour le blog DigitalBoost AI avec les informations suivantes :

- **Titre** : ${article.titre_suggere}
- **Catégorie** : ${article.categorie}
- **Date de publication** : ${article.date}
- **ID** : ${article.id}

Respecte TOUTES les consignes du prompt système (identité éditoriale, conformité ARTCI, structure HTML, qualité linguistique).

Retourne un objet JSON valide avec les champs : titre, titre_html, excerpt, meta_description, keywords, hero_tagline, hero_subtitle, share_text, cta_emoji, article_body, toc_items, seo_tags.

Le champ article_body doit contenir du HTML valide complet avec tous les composants requis (intro-block, sections h2, prompt-box, output-box, tip-block ou warning-block, cta-inline, faq-section, conclusion, seo-tags).
`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        // Validation minimale
        if (!parsed.article_body || !parsed.titre) {
            console.error('❌ Réponse Gemini incomplète (champs manquants).');
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('❌ Erreur API Gemini :', error.message);

        // Retry une fois avec température plus basse
        console.log('🔄 Nouvelle tentative avec température réduite...');
        try {
            const retryModel = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    topP: 0.9,
                    maxOutputTokens: 16384,
                    responseMimeType: 'application/json'
                }
            });

            const result = await retryModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            });

            return JSON.parse(result.response.text());
        } catch (retryError) {
            console.error('❌ Deuxième tentative échouée :', retryError.message);
            return null;
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 🏗️ CONSTRUCTION HTML
// ═══════════════════════════════════════════════════════════

function buildArticleHTML(template, article, content, slug) {
    const dateFr = formatDateFr(article.date);
    const imageFilename = generateImageFilename(slug);

    // Construire les items du sommaire (TOC)
    let tocHTML = '';
    if (content.toc_items && content.toc_items.length > 0) {
        tocHTML = content.toc_items.map(item =>
            `                <li><a href="#${item.id}">${item.label}</a></li>`
        ).join('\n');
    }

    // Remplacements des placeholders
    let html = template;
    const replacements = {
        '{{TITRE}}': escapeHtml(content.titre || article.titre_suggere),
        '{{TITRE_HTML}}': content.titre_html || escapeHtml(article.titre_suggere),
        '{{META_DESCRIPTION}}': escapeHtml(content.meta_description || content.excerpt || ''),
        '{{KEYWORDS}}': escapeHtml(content.keywords || ''),
        '{{SLUG}}': slug,
        '{{IMAGE_FILENAME}}': imageFilename,
        '{{DATE_ISO}}': article.date,
        '{{DATE_FR}}': dateFr,
        '{{CATEGORIE}}': escapeHtml(article.categorie),
        '{{EMOJI}}': content.cta_emoji || guessEmoji(article.categorie),
        '{{EXCERPT}}': escapeHtml(content.excerpt || article.titre_suggere),
        '{{TEMPS_LECTURE}}': '10 min de lecture',
        '{{HERO_TAGLINE}}': escapeHtml(content.hero_tagline || article.titre_suggere),
        '{{HERO_SUBTITLE}}': escapeHtml(content.hero_subtitle || ''),
        '{{SHARE_TEXT}}': escapeHtml(content.share_text || article.titre_suggere),
        '{{CTA_EMOJI}}': content.cta_emoji || '🚀',
        '{{ARTICLE_BODY}}': content.article_body,
        '{{TOC_ITEMS}}': tocHTML
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
        html = html.split(placeholder).join(value);
    }

    return html;
}

// ═══════════════════════════════════════════════════════════
// 📁 PUBLICATION D'UN ARTICLE EXISTANT
// ═══════════════════════════════════════════════════════════

function publishExistingArticle(article, slug, htmlFilename, articlesConfig, schedule) {
    const emoji = guessEmoji(article.categorie);
    const imageFilename = generateImageFilename(slug);

    console.log('\n📡 Publication via publish_article.js...');
    try {
        const publishCmd = [
            'node', 'publish_article.js',
            '--title', JSON.stringify(article.titre_suggere),
            '--excerpt', JSON.stringify(article.titre_suggere),
            '--file', JSON.stringify(htmlFilename),
            '--image', JSON.stringify(imageFilename),
            '--emoji', JSON.stringify(emoji),
            '--category', JSON.stringify(article.categorie),
            '--time', JSON.stringify('10 min de lecture'),
            '--id', JSON.stringify(article.id)
        ].join(' ');

        execSync(publishCmd, { cwd: PROJECT_DIR, stdio: 'inherit' });
    } catch (e) {
        console.error('⚠️ Erreur :', e.message);
    }

    updateScheduleStatus(schedule, article.numero, 'publié');

    if (!NO_PUSH) {
        try {
            execSync('git add -A', { cwd: PROJECT_DIR, stdio: 'pipe' });
            execSync(`git commit -m "📝 Publié : ${article.titre_suggere}"`, { cwd: PROJECT_DIR, stdio: 'pipe' });
            execSync('git push origin main', { cwd: PROJECT_DIR, stdio: 'inherit' });
            console.log('✅ Poussé vers GitHub.');
        } catch (e) {
            console.error('⚠️ Erreur Git :', e.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 🛠️ FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')                     // Remove special chars
        .replace(/\s+/g, '-')                              // Spaces to hyphens
        .replace(/-+/g, '-')                               // Collapse hyphens
        .replace(/^-|-$/g, '')                             // Trim hyphens
        .substring(0, 80);                                 // Max length
}

function generateImageFilename(slug) {
    return slug.replace(/-/g, '_') + '.png';
}

function formatDateFr(dateStr) {
    const mois = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    try {
        const parts = dateStr.split('-');
        const d = parseInt(parts[2]);
        const m = parseInt(parts[1]);
        const y = parts[0];
        return `${d} ${mois[m]} ${y}`;
    } catch (e) {
        return dateStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function guessEmoji(categorie) {
    const catLower = (categorie || '').toLowerCase();
    const emojiMap = {
        'automatisation': '⚡', 'business': '📈', 'création': '🎨',
        'contenu': '📱', 'copywriting': '✍️', 'email': '📩',
        'e-commerce': '🛒', 'éducation': '🎓', 'marketing': '📊',
        'outils': '🛠️', 'productivité': '⏱️', 'seo': '🔍',
        'stratégie': '🎯', 'mindset': '💡', 'sav': '🤖',
        'whatsapp': '💬', 'youtube': '🎥', 'tiktok': '🎭',
        'data': '📈', 'coach': '🏆', 'formation': '🎓',
        'rédaction': '💼', 'instagram': '📱', 'linkedin': '💼'
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (catLower.includes(key)) return emoji;
    }
    return '🚀';
}

function updateScheduleStatus(schedule, articleNum, newStatus) {
    const article = schedule.articles_planifies.find(a => a.numero === articleNum);
    if (article) {
        article.statut = newStatus;
        fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2), 'utf8');
    }
}

function ensureImageExists(imageFilename, title) {
    const imgPath = path.join(IMG_DIR, imageFilename);
    if (!fs.existsSync(imgPath)) {
        console.log(`⚠️  Image ${imageFilename} manquante dans /img/`);
        console.log(`   → Vous devrez ajouter l'image manuellement ou utiliser une image existante.`);
        console.log(`   → Taille recommandée : 1200x630px (format OG Image)`);

        // Créer un fichier SVG placeholder minimal
        const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect fill="#0D1117" width="1200" height="630"/>
  <text x="600" y="280" font-family="sans-serif" font-size="48" fill="#B8912A" text-anchor="middle" font-weight="bold">DigitalBoost AI</text>
  <text x="600" y="370" font-family="sans-serif" font-size="24" fill="#FAFAF7" text-anchor="middle" opacity="0.7">${escapeHtml(title).substring(0, 60)}</text>
</svg>`;
        // Save as .png placeholder name (actually SVG but will render)
        const svgPath = imgPath.replace('.png', '_placeholder.svg');
        fs.writeFileSync(svgPath, svgPlaceholder, 'utf8');
        console.log(`   → Placeholder SVG créé : ${path.basename(svgPath)}`);
    }
}

// ═══════════════════════════════════════════════════════════
// 🏁 LANCEMENT
// ═══════════════════════════════════════════════════════════

main().catch(err => {
    console.error('\n💥 Erreur fatale :', err.message);
    console.error(err.stack);
    process.exit(1);
});
