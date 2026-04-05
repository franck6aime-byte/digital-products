import os
import re

dir_path = r"c:\Users\FRANCK-AIME YAO\OneDrive\Documents\AGENT AI\digital-products"

NEW_GTRANSLATE_HTML = """    <!-- Google Translate Dynamic IP Script -->
    <div id="google_translate_element" style="display:none;"></div>
    <script type="text/javascript">
        (function() {
            try {
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

                fetch('https://get.geojs.io/v1/ip/country.json')
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    var langCode = countryToLang[data.country] || 'fr';
                    var expectedCookie = "/fr/" + langCode;
                    var domain = window.location.hostname;
                    
                    var currentCookie = "";
                    var match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
                    if (match) currentCookie = match[2];

                    if (currentCookie !== expectedCookie) {
                        if (langCode === 'fr') {
                            // Supprimer et forcer en français
                            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain;
                            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + domain;
                        } else {
                            // Activer la nouvelle langue
                            document.cookie = "googtrans=" + expectedCookie + "; path=/; domain=" + domain;
                            document.cookie = "googtrans=" + expectedCookie + "; path=/;";
                            document.cookie = "googtrans=" + expectedCookie + "; path=/; domain=." + domain;
                        }
                        
                        var reloadKey = 'lang_rl_' + langCode;
                        if (!sessionStorage.getItem(reloadKey)) {
                            sessionStorage.clear();
                            sessionStorage.setItem(reloadKey, '1');
                            window.location.reload();
                        }
                    } else {
                        var k = 'lang_rl_' + langCode;
                        if(!sessionStorage.getItem(k)) {
                            sessionStorage.clear();
                            sessionStorage.setItem(k, '1');
                        }
                    }
                })
                .catch(function(e) { console.error(e); });
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

    # Regex pour trouver soit l'ancien <!-- Google Translate Auto-Script --> soit <!-- Google Translate IP-Based Script -->
    pattern = re.compile(r"    <!-- Google Translate (Auto-Script|IP-Based Script) -->.*?</style>", re.DOTALL)
    
    if pattern.search(content):
        # Remplacement
        new_content = pattern.sub(NEW_GTRANSLATE_HTML, content)
        if new_content != content:
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
                
print(f"Modified {modified_count} HTML files dynamically.")
