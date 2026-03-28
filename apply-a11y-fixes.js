const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'blog');

fs.readdir(directoryPath, function (err, files) {
    if (err) return console.log('Unable to scan directory: ' + err);

    let fixCount = 0;

    files.forEach(function (file) {
        if (!file.endsWith('.html')) return;
        
        // Skip the one we already perfectly fixed
        if (file === 'automatiser-business-ia.html') return;
        
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Generic Sidebar h4 to h2 Fix
        content = content.replace(/<div class="sidebar-card">\s*<h4>(.*?)<\/h4>/g, '<div class="sidebar-card">\n                <h2>$1</h2>');
        content = content.replace(/<div class="sidebar-cta">\s*<h4>(.*?)<\/h4>/g, '<div class="sidebar-cta">\n                <h2>$1</h2>');

        // Update CSS for sidebar h2 instead of h4
        content = content.replace(/\.sidebar-card h4\s*{/g, '.sidebar-card h2 {');
        content = content.replace(/\.sidebar-cta h4\s*{/g, '.sidebar-cta h2 {');
        
        // Progress Bar Aria injection (handling progressBar and bar variations)
        content = content.replace(/progressBar\.style\.width\s*=\s*progress\s*\+\s*["']%["'];/g, "progressBar.style.width = progress + '%';\n            progressBar.setAttribute('aria-valuenow', progress);");

        fs.writeFileSync(filePath, content, 'utf8');
        fixCount++;
        console.log(`Successfully fixed generic h4 headers in ${file}`);
    });
    
    console.log(`Completed applying generic A11y patch to ${fixCount} files.`);
});
