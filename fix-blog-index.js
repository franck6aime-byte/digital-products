const fs = require('fs');

const file = 'blog.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /--accent:\s*#1A6B3C;/g,
    '--accent: #0F5132;'
);

content = content.replace(
    /--accent-light:\s*#E8F5EE;/g,
    '--accent-light: #D1E7DD;'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed blog.html');
