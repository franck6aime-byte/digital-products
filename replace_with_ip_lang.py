import os
import re

dir_path = r"c:\Users\FRANCK-AIME YAO\OneDrive\Documents\AGENT AI\digital-products"

NEW_GTRANSLATE_HTML = """    <!-- Google Translate IP-Based Script -->
    <div id="google_translate_element" style="display:none;"></div>
    <script type="text/javascript">
        (function() {
            try {
                // Table de correspondance Pays -> Langue
                var countryToLang = {
                    'DE': 'de', 'AT': 'de', 'CH': 'de',
                    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'CL': 'es',
                    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en',
                    'IT': 'it', 
                    'PT': 'pt', 'BR': 'pt',
                    'CN': 'zh-CN', 'TW': 'zh-TW', 
                    'JP': 'ja', 
                    'RU': 'ru', 
                    'SA': 'ar', 'AE': 'ar', 'MA': 'ar', 'DZ': 'ar', 'EG': 'ar',
                    'NL': 'nl', 
                    'TR': 'tr'
                };

                if (document.cookie.indexOf('googtrans=') === -1 && !sessionStorage.getItem('ip_checked')) {
                    sessionStorage.setItem('ip_checked', 'true');
                    fetch('https://get.geojs.io/v1/ip/country.json')
                    .then(response => response.json())
                    .then(data => {
                        var country = data.country;
                        var langCode = countryToLang[country];
                        if (langCode && langCode !== 'fr') {
                            var domain = window.location.hostname;
                            document.cookie = "googtrans=/fr/" + langCode + "; path=/; domain=" + (domain || "");
                            document.cookie = "googtrans=/fr/" + langCode + "; path=/";
                            window.location.reload();
                        } else {
                            document.cookie = "googtrans=/fr/fr; path=/";
                        }
                    })
                    .catch(e => console.error(e));
                }
            } catch(e) {}
        })();
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'fr', autoDisplay: false}, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
    <style>
        .skiptranslate iframe, .skiptranslate .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        #goog-gt-tt { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
    </style>"""

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False

    # Regex pour trouver l'ancien bloc complet (à partir de <!-- Google Translate Auto-Script --> jusqu'à </style>)
    pattern = re.compile(r"    <!-- Google Translate Auto-Script -->.*?</style>", re.DOTALL)
    
    if pattern.search(content):
        # Remplacement
        new_content = pattern.sub(NEW_GTRANSLATE_HTML, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for root, _, files in os.walk(dir_path):
    if '.git' in root or '.vercel' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            if process_file(filepath):
                modified_count += 1
                
print(f"Modified {modified_count} HTML files with new IP script.")
