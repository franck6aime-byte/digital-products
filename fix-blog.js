const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'blog');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    files.forEach(function (file) {
        if (!file.endsWith('.html')) return;
        
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 1. Fix Contrast for Category Tag
        content = content.replace(
            /(.category-tag\s*{[^}]*?)color:\s*var\(--accent\);/g, 
            '$1color: #0B4527;'
        );
        content = content.replace(
            /(.category-tag\s*{[^}]*?)background:\s*var\(--accent-light\);/g, 
            '$1background: #D1E7DD;'
        );

        // 2. Fix Contrast for Share Buttons
        content = content.replace('.share-wa {\n            background: #25D366;\n        }', '.share-wa {\n            background: #18863F;\n        }');
        content = content.replace('.share-fb {\n            background: #1877F2;\n        }', '.share-fb {\n            background: #0B51A8;\n        }');
        content = content.replace('.share-in {\n            background: #0A66C2;\n        }', '.share-in {\n            background: #064585;\n        }');
        
        // Ensure SVGs are aria-hidden
        content = content.replace(/<svg viewBox="0 0 24 24" xmlns="http:\/\/www.w3.org\/2000\/svg">/g, '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">');

        // 3. Fix Layout Thrashing on Scroll
        const oldScript = `    <script>
        // Barre de progression de lecture
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
        });
    </script>`;

        const newScript = `    <script>
        // Barre de progression de lecture (optimized to prevent forced layout shift)
        let isTicking = false;
        const progressBar = document.getElementById('progress-bar');
        
        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    // cache document measurements dynamically if needed, or safely measure
                    const scrollTop = window.scrollY;
                    // optimize: only query clientHeight/scrollHeight once per frame
                    const docElement = document.documentElement;
                    const docHeight = docElement.scrollHeight - docElement.clientHeight;
                    if (docHeight > 0) {
                        const progress = (scrollTop / docHeight) * 100;
                        progressBar.style.width = progress + '%';
                    }
                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });
    </script>`;

        content = content.replace(oldScript, newScript);

        // Also fix the main index.js if it exists, or anywhere else with a scroll listener forcing layout
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', file);
    });
});
