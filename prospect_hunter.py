#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
╔══════════════════════════════════════════════════════════════════════╗
║  DIGITALBOOST AI — PROSPECT HUNTER (Machine à Leads Automatisée)     ║
║  Cherche des prospects en ligne, extrait leurs emails, et les        ║
║  ajoute à ta liste de Cold Emailing sur Brevo (Sendinblue).          ║
║  Version : 1.0                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import urllib.request
import urllib.parse
import re
import json
import time
from html.parser import HTMLParser

# ==========================================================
# ⚙️ CONFIGURATION
# ==========================================================

# Tes mots-clés de recherche (Entrepreneurs, E-commerce, Agences en Afrique)
KEYWORDS = [
    "boutique en ligne dakar contact email",
    "agence marketing digital abidjan email",
    "consultant formateur douala contact",
    "ecommerce senegal adresse email"
]

# Clé API Brevo (Sendinblue) pour ajouter automatiquement le prospect
BREVO_API_KEY = "TA_CLE_API_BREVO_ICI"
BREVO_LIST_ID = 2  # L'ID de ta liste "Cold Prospects" sur Brevo

# ==========================================================
# 🛠️ FONCTIONS DE RECHERCHE ET D'EXTRACTION
# ==========================================================

def search_duckduckgo(keyword):
    """Effectue une recherche basique sur DuckDuckGo Lite pour trouver des liens."""
    print(f"🔍 Recherche de prospects pour : '{keyword}'...")
    url = f"https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({'q': keyword}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    try:
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        
        # Extraction rudimentaire des liens de résultats (Balises <a> ayant class="result-url")
        links = re.findall(r'href="([^"]+)"', html)
        
        # Filtrer les liens utiles (ignorer les liens internes de DDG)
        clean_links = [l for l in links if l.startswith('http') and 'duckduckgo' not in l]
        return list(set(clean_links))[:5] # On prend les 5 premiers sites pour tester
    except Exception as e:
        print(f"⚠️ Erreur lors de la recherche : {e}")
        return []

def extract_emails_from_url(url):
    """Visite un site web et tente d'y trouver une adresse email publique."""
    print(f"   🌐 Analyse du site : {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=5)
        html = response.read().decode('utf-8', errors='ignore')
        
        # Regex basique pour trouver les emails
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        emails = re.findall(email_pattern, html)
        
        # Nettoyage (enlever les faux positifs comme les images png, etc.)
        valid_emails = [e for e in emails if not e.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', 'sentry.io'))]
        return list(set(valid_emails))
    except Exception as e:
        # Beaucoup de sites bloquent les bots, on ignore silencieusement
        return []

# ==========================================================
# 🚀 ENVOI VERS BREVO (AUTOMATISATION)
# ==========================================================

def add_to_brevo(email):
    """Ajoute le prospect trouvé directement dans ta séquence d'emailing Brevo."""
    if BREVO_API_KEY == "TA_CLE_API_BREVO_ICI":
        print(f"   [Simulation] Prospect trouvé ajouté à Brevo : {email}")
        return
        
    url = "https://api.brevo.com/v3/contacts"
    payload = {
        "email": email,
        "listIds": [BREVO_LIST_ID],
        "updateEnabled": False
    }
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        response = urllib.request.urlopen(req)
        print(f"   ✅ Prospect {email} injecté dans le tunnel Brevo !")
    except Exception as e:
        print(f"   ⚠️ Erreur d'ajout Brevo pour {email}")

# ==========================================================
# 🏁 SCRIPT PRINCIPAL
# ==========================================================

def main():
    print("╔══════════════════════════════════════════════════╗")
    print("║  🚀 LANCEMENT DE LA MACHINE À PROSPECTION        ║")
    print("╚══════════════════════════════════════════════════╝\n")
    
    total_emails_found = []

    for keyword in KEYWORDS:
        urls = search_duckduckgo(keyword)
        for url in urls:
            emails = extract_emails_from_url(url)
            for email in emails:
                if email not in total_emails_found:
                    print(f"   🎯 BINGO ! Email trouvé : {email}")
                    add_to_brevo(email)
                    total_emails_found.append(email)
            time.sleep(2) # Pause pour ne pas saturer les serveurs
            
    print("\n====================================================")
    print(f"✅ Mission terminée. {len(total_emails_found)} nouveaux prospects qualifiés injectés.")
    print("====================================================")

if __name__ == "__main__":
    main()
