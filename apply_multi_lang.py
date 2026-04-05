import os
import re

dir_path = r"c:\Users\FRANCK-AIME YAO\OneDrive\Documents\AGENT AI\digital-products"

GTRANSLATE_HTML = """
    <!-- Google Translate Auto-Script -->
    <div id="google_translate_element" style="display:none;"></div>
    <script type="text/javascript">
        (function() {
            try {
                var userLang = navigator.language || navigator.userLanguage;
                var langCode = userLang.split('-')[0];
                var validLangs = ['en', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru', 'ar', 'nl', 'tr'];
                // If browser language is not French and is a valid target language
                if (langCode !== 'fr' && document.cookie.indexOf('googtrans=') === -1) {
                    var domain = window.location.hostname;
                    // Add cookie for current session
                    document.cookie = "googtrans=/fr/" + langCode + "; path=/; domain=" + (domain || "");
                    document.cookie = "googtrans=/fr/" + langCode + "; path=/";
                }
            } catch(e) {}
        })();
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'fr', autoDisplay: false}, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
    <style>
        /* Invisible Google Translate Banner & Widget */
        .skiptranslate iframe, .skiptranslate .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        #goog-gt-tt { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
    </style>
"""

# Prices to replace mapping
PRICES = {
    "9 900 FCFA": r"9 900 FCFA <span class='price-converted' style='font-size:0.75em;opacity:0.85;font-weight:normal;'>(~15€ / 16$)</span>",
    "2 000 FCFA": r"2 000 FCFA <span class='price-converted' style='font-size:0.75em;opacity:0.85;font-weight:normal;'>(~3€ / 3.20$)</span>",
    "14 900 FCFA": r"14 900 FCFA <span class='price-converted' style='font-size:0.75em;opacity:0.85;font-weight:normal;'>(~23€ / 25$)</span>",
    "2 500 FCFA": r"2 500 FCFA <span class='price-converted' style='font-size:0.75em;opacity:0.85;font-weight:normal;'>(~3.80€ / 4$)</span>",
    "4 900 FCFA": r"4 900 FCFA <span class='price-converted' style='font-size:0.75em;opacity:0.85;font-weight:normal;'>(~7.50€ / 8$)</span>"
}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False

    original_content = content
    
    # Check if Google Translate is already injected
    if 'google_translate_element' not in content:
        if '</head>' in content:
            content = content.replace('</head>', f'{GTRANSLATE_HTML}\n</head>')
        else:
            content += GTRANSLATE_HTML
            
    def replace_text_in_html(html, prices_map):
        parts = re.split(r'(<[^>]+>)', html)
        for i in range(len(parts)):
            if i % 2 == 0: 
                if not re.search(r'span class=[\'"]price-converted[\'"]', parts[i]):
                    for k, v in prices_map.items():
                        parts[i] = parts[i].replace(k, v)
            else: 
                for k, v in prices_map.items():
                    plain_text_v = re.sub(r'<[^>]+>', '', v)
                    if k in parts[i]:
                        parts[i] = parts[i].replace(k, plain_text_v)
        return "".join(parts)
        
    new_content = replace_text_in_html(content, PRICES)
    
    if new_content != original_content:
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
                
print(f"Modified {modified_count} HTML files.")
