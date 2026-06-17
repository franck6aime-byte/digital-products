const fs = require('fs');
const path = require('path');

const blogDir = 'blog';
const files = fs.readdirSync(blogDir);

console.log(`Checking ${files.length} files in '${blogDir}'...`);

const lineNumPattern = /\b\d+:\s/g;

files.sort().forEach(file => {
    if (!file.endsWith('.html')) return;
    const filepath = path.join(blogDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Calculate word count (strip HTML tags first)
    const text = content.replace(/<[^>]+>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Find line number patterns
    const matches = content.match(lineNumPattern) || [];
    
    // Print status
    console.log(`${file.padEnd(80)} | Words: ${String(wordCount).padEnd(6)} | Line-num occurrences: ${matches.length}`);
});
