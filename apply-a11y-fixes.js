const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'blog');
const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.html'));

let totalFixes = 0;

files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;

    // Fix h4 inside .tool-card divs  → h3
    // Pattern: <div class="tool-card">...<h4>...</h4>...
    content = content.replace(
        /(<div class="tool-card">[^]*?)<h4>([^<]*)<\/h4>/g,
        '$1<h3>$2</h3>'
    );

    // Fix .tool-card h4 CSS rule → h3
    content = content.replace(/\.tool-card h4\s*\{/g, '.tool-card h3 {');

    // Also fix agenda-content h4 → h3 (same hierarchy issue)
    content = content.replace(
        /(<div class="agenda-content">[^]*?)<h4>([^<]*)<\/h4>/g,
        '$1<h3>$2</h3>'
    );
    content = content.replace(/\.agenda-content h4\s*\{/g, '.agenda-content h3 {');

    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixes++;
        console.log(`✅ Fixed h4→h3 in tool/agenda cards: ${file}`);
    } else {
        console.log(`⏭️  No changes needed: ${file}`);
    }
});

console.log(`\nDone — ${totalFixes} file(s) updated.`);
