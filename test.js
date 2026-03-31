const https = require('https');

https.get('https://digitalboostai.tech', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<img[^>]+src=["']([^"']+)["']/gi);
    console.log("Images trouvées :");
    console.log(matches);
  });
}).on('error', err => console.log('Error: ', err.message));
