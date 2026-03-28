const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

async function fetchFont(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            if (response.statusCode >= 300 && response.headers.location) {
                // Handle redirect if needed
                fetchFont(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function run() {
    console.log("Fetching DM Sans metadata...");
    let req1 = await new Promise(r => https.get('https://gwfh.mranftl.com/api/fonts/dm-sans?subsets=latin', res => {
        let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => r(JSON.parse(body)));
    }));
    
    console.log("Fetching Fraunces metadata...");
    let req2 = await new Promise(r => https.get('https://gwfh.mranftl.com/api/fonts/fraunces?subsets=latin', res => {
        let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => r(JSON.parse(body)));
    }));
    
    // Process dm-sans variants
    const dmVariantsReq = ["300", "regular", "400", "500", "600"];
    for (const variant of req1.variants) {
        if (dmVariantsReq.includes(variant.id) && variant.fontStyle === 'normal') {
            const woff2Url = variant.woff2;
            let weightStr = variant.fontWeight;
            let name = `dm-sans-${req1.version}-latin-${weightStr}.woff2`;
            console.log(`Downloading ${name}...`);
            await fetchFont(woff2Url, path.join(fontsDir, name));
        }
    }

    // Process fraunces variants
    const frauncesNormalReq = ["300", "700", "900"];
    const frauncesItalicReq = ["regular", "400italic", "italic"];
    for (const variant of req2.variants) {
        if (frauncesNormalReq.includes(variant.id) && variant.fontStyle === 'normal') {
            const woff2Url = variant.woff2;
            let weightStr = variant.fontWeight;
            let name = `fraunces-${req2.version}-latin-${weightStr}.woff2`;
            console.log(`Downloading ${name}...`);
            await fetchFont(woff2Url, path.join(fontsDir, name));
        }
        if (variant.fontStyle === 'italic') {
            if (variant.fontWeight === "400" || variant.id.includes("400") || variant.id === "italic") {
                const woff2Url = variant.woff2;
                let name = `fraunces-${req2.version}-latin-italic-400.woff2`;
                console.log(`Downloading ${name}...`);
                await fetchFont(woff2Url, path.join(fontsDir, name));
            }
        }
    }

    console.log("All fonts downloaded successfully.");
}

run().catch(console.error);
