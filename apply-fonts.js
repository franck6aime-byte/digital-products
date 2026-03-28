const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const fontsConfig = `/* ============================================================
   @font-face AUTO-HÉBERGÉ — remplace Google Fonts externe
   font-display: swap → le texte s'affiche immédiatement
   avec la police de fallback, puis swap quand chargée
============================================================ */
@font-face {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('{{PREFIX}}fonts/dm-sans-v17-latin-300.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('{{PREFIX}}fonts/dm-sans-v17-latin-400.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('{{PREFIX}}fonts/dm-sans-v17-latin-500.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('{{PREFIX}}fonts/dm-sans-v17-latin-600.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Fraunces';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('{{PREFIX}}fonts/fraunces-v38-latin-300.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Fraunces';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url('{{PREFIX}}fonts/fraunces-v38-latin-700.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Fraunces';
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: url('{{PREFIX}}fonts/fraunces-v38-latin-900.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Fraunces';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url('{{PREFIX}}fonts/fraunces-v38-latin-italic-400.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

const preloadTemplate = `    <link rel="preload" href="{{PREFIX}}fonts/dm-sans-v17-latin-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{PREFIX}}fonts/fraunces-v38-latin-900.woff2" as="font" type="font/woff2" crossorigin>`;

function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== '.git' && file !== 'fonts' && file !== 'img') {
                getHtmlFiles(fullPath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it has Fraunces and DM Sans google fonts links
    if (!content.includes('family=Fraunces') && !content.includes('family=DM+Sans')) {
        return; // Skip files that don't need Fraunces/DM Sans
    }
    
    // Calculate prefix
    const rel = path.relative(path.dirname(filePath), projectRoot);
    const prefix = rel === '' ? './' : rel.replace(/\\/g, '/') + '/';

    console.log(`Processing: ${filePath}`);

    // Remove old google fonts lines
    const linkRegex = /<link[^>]*href="https:\/\/fonts\.googleapis\.com[^>]*>/gi;
    const preloadRegex = /<link[^>]*rel="preconnect"[^>]*href="https:\/\/fonts\.gstatic\.com"[^>]*>/gi;
    const preconnectRegex = /<link[^>]*rel="preconnect"[^>]*href="https:\/\/fonts\.googleapis\.com"[^>]*>/gi;
    const noscriptRegex = /<noscript>\s*<link[^>]*href="https:\/\/fonts\.googleapis\.com[^>]*>\s*<\/noscript>/gi;
    const importRegex = /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com[^)]+\)['"];?/gi;
    
    content = content.replace(linkRegex, '');
    content = content.replace(preloadRegex, '');
    content = content.replace(preconnectRegex, '');
    content = content.replace(noscriptRegex, '');
    content = content.replace(importRegex, '');

    // Inject @font-face rules into the FIRST <style> tag
    const fontCSS = fontsConfig.replace(/\{\{PREFIX\}\}/g, prefix);
    if (content.includes('<style>')) {
        content = content.replace('<style>', '<style>\n' + fontCSS);
    } else {
        // If there's no style tag, inject one before </head>
        content = content.replace('</head>', `<style>\n${fontCSS}</style>\n</head>`);
    }

    // Inject preloads before either the first <link rel="stylesheet"> or </head>
    const preloads = preloadTemplate.replace(/\{\{PREFIX\}\}/g, prefix);
    
    content = content.replace('</head>', preloads + '\n</head>');

    fs.writeFileSync(filePath, content, 'utf-8');
}

const htmlFiles = getHtmlFiles(projectRoot);
for (const file of htmlFiles) {
    // Avoid double processing the prompts.html which we already manually optimized
    if (path.basename(file) !== 'prompts.html') {
        processHtmlFile(file);
    }
}

// Ensure promos/ebook.html isn't duplicated etc - handled by the recursive reader!
console.log("Done updating HTML files.");
