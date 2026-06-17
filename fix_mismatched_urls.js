const fs = require('fs');
const path = require('path');

const replacements = {
    "5-outils-ia-gratuits-que-tout-entrepreneur-africain-devrait-conna-tre": "5-outils-ia-gratuits",
    "comment-creer-un-assistant-virtuel-gpt-personnalise-pour-votre-sav": "comment-creer-assistant-virtuel-sav",
    "le-guide-complet-pour-ecrire-des-prompts-midjourney-ultra-realistes": "le-guide-pour-ecrire-prompts-midjourney",
    "pourquoi-excel-est-mort-chatgpt-data-analysis": "pourquoi-excel-est-mort-chatgpt-data",
    "vendre-sur-whatsapp-le-prompt-ultime-pour-relancer-un-client-sans-le-braquer": "vendre-sur-whatsapp-le-prompt-ultime-pour-relancer",
    "creer-30-jours-de-contenu-instagram-en-45-minutes-methode-2026": "creer-30-jours-de-contenu-instagram-en-45-minutes",
    "dall-e-3-vs-midjourney-v6-quel-outil-choisir-pour-vos-visuels": "dalle-3-vs-midjourney-v6-quel-outil-choisir",
    "rediger-des-fiches-produits-e-commerce-qui-convertissent-vraiment": "rediger-fiches-produits-e-commerce-qui-convertissent",
    "l-intelligence-artificielle-pour-les-coachs-automatiser-votre-onboarding": "intelligence-artificielle-pour-les-coachs-automatiser-onboarding",
    "ne-lancez-pas-de-formation-avant-d-avoir-teste-cette-strategie-ia": "ne-lancez-pas-de-formation-avant-davoir-teste-cette-strategie-ia",
    "comment-cloner-la-voix-de-vos-videos-avec-l-ia-tutoriel-complet": "comment-cloner-la-voix-de-vos-videos-avec-ia",
    "audit-seo-avec-l-ia-le-prompt-pour-analyser-les-mots-cles-de-vos-concurrents": "audit-seo-avec-ia-le-prompt-pour-analyser-les-mots-cles",
    "rediger-une-sequence-email-de-bienvenue-de-a-a-z-avec-claude-3-5": "rediger-une-sequence-email-bienvenue",
    "comment-utiliser-l-ia-generative-pour-trouver-une-idee-de-business-rentable": "utiliser-ia-pour-trouver-idee-de-business",
    "les-5-erreurs-fatales-que-tout-le-monde-fait-en-prompt-engineering": "5-erreurs-fatales-en-prompt-engineering",
    "creer-des-videos-tiktok-sans-visage-logiciels-et-strategie": "creer-des-videos-tiktok-sans-visage",
    "organiser-sa-journee-d-entrepreneur-avec-l-ia-workflow-notion-chatgpt": "organiser-journee-entrepreneur-ia-notion",
    "gerer-les-clients-difficiles-prompts-pour-ecrire-des-emails-professionnels-parfaits": "gerer-les-clients-difficiles-prompts-ia"
};

function updateFileContent(filepath) {
    if (!fs.existsSync(filepath)) {
        console.log(`File ${filepath} not found.`);
        return;
    }
    console.log(`Processing ${filepath}...`);
    let content = fs.readFileSync(filepath, 'utf8');
    let replacedCount = 0;

    for (const [oldSlug, newSlug] of Object.entries(replacements)) {
        // Match both with and without .html extension
        const regex = new RegExp(oldSlug, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, newSlug);
            replacedCount++;
            console.log(`  Replaced: ${oldSlug} -> ${newSlug}`);
        }
    }

    if (replacedCount > 0) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`✅ Successfully updated ${filepath} (${replacedCount} replacements).`);
    } else {
        console.log(`ℹ️ No replacements needed in ${filepath}.`);
    }
}

// Update sitemap, config, and blog.html
updateFileContent('articles-config.json');
updateFileContent('blog.html');
updateFileContent('sitemap.xml');
