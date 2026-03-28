const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'blog');
const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.html'));

let totalFixes = 0;

files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;

    // Fix 1: Increase specificity of .intro-block p to override .article-body p
    // Replace simple selector with compound selector
    content = content.replace(
        /(\s*)\.intro-block p \{/g,
        '$1.intro-block p,\n$1.article-body .intro-block p {'
    );

    // Fix 2: Intro-block strong should be var(--gold) or var(--paper), not #2D3139
    // Replace any .intro-block strong that sets color to dark ink
    content = content.replace(
        /\.intro-block strong \{\s*color:\s*var\(--paper\);\s*font-weight:\s*700;\s*\}/g,
        '.intro-block strong,\n        .article-body .intro-block strong {\n            color: var(--gold);\n            font-weight: 700;\n        }'
    );

    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixes++;
        console.log(`✅ Fixed intro-block text visibility in: ${file}`);
    } else {
        console.log(`⏭️  No change needed: ${file}`);
    }
});

console.log(`\nDone — ${totalFixes} file(s) updated.`);
