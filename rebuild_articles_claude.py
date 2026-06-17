"""
rebuild_articles_claude.py
==========================
Reconstruit les 21 articles dégradés (articles 15–35) en utilisant l'API Claude.
Chaque article sera généré avec la même structure premium que prompt-copywriting-page-vente.html :
- Schema.org JSON-LD complet
- Progress bar de lecture
- Google Translate automatique
- Boutons de partage social (WhatsApp, Facebook, LinkedIn)
- Table des matières sidebar
- Blocs intro/tip/accent/warning
- Section FAQ
- Footer complet
- Contenu rédactionnel long et de qualité (~400-500 lignes)

Usage:
    python rebuild_articles_claude.py --api-key sk-ant-...
    # ou définir la variable d'environnement ANTHROPIC_API_KEY
"""

import os
import sys
import json
import time
import argparse
import re
import anthropic

# ──────────────────────────────────────────────
#  LISTE DES 21 ARTICLES À RECONSTRUIRE
# ──────────────────────────────────────────────
ARTICLES = [
    {
        "id": "article-015",
        "numero": 15,
        "titre": "5 Outils IA Gratuits que Tout Entrepreneur Africain Devrait Connaître",
        "slug": "5-outils-ia-gratuits",
        "excerpt": "Découvrez les 5 outils gratuits sans carte bancaire pour automatiser votre comptabilité, créer vos visuels et écrire vos mails.",
        "image": "outils_ia_gratuits_afrique.png",
        "emoji": "🛠️",
        "category": "Outils & Productivité",
        "date": "2026-04-19",
        "keywords": "outils ia gratuits afrique, outils intelligence artificielle gratuits, claude gratuit, perplexity, capcut ia",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Découvrez les 5 outils gratuits sans carte bancaire pour automatiser votre comptabilité, créer vos visuels et écrire vos mails."
    },
    {
        "id": "article-016",
        "numero": 16,
        "titre": "Comment créer un Assistant Virtuel (GPT) personnalisé pour votre SAV",
        "slug": "comment-creer-assistant-virtuel-sav",
        "excerpt": "Fini les heures passées à répondre aux clients sur WhatsApp. Formez un GPT sur vos produits et laissez-le gérer 80% du SAV.",
        "image": "assistant_virtuel_sav.png",
        "emoji": "🤖",
        "category": "SAV & WhatsApp",
        "date": "2026-04-22",
        "keywords": "assistant virtuel gpt sav, chatbot whatsapp ia, automatiser service client afrique",
        "temps_lecture": "9 min de lecture",
        "description_courte": "Fini les heures passées à répondre aux clients sur WhatsApp. Formez un GPT sur vos produits et laissez-le gérer 80% du SAV."
    },
    {
        "id": "article-017",
        "numero": 17,
        "titre": "Le guide complet pour écrire des Prompts Midjourney ultra-réalistes",
        "slug": "le-guide-pour-ecrire-prompts-midjourney",
        "excerpt": "La structure V5/V6 exacte pour générer des images hyper-réalistes cinématographiques pour vos publicités locales.",
        "image": "midjourney_prompts_guide.png",
        "emoji": "🖼️",
        "category": "IA & Création",
        "date": "2026-04-26",
        "keywords": "prompts midjourney ultra réalistes, guide midjourney français, midjourney afrique, génération image ia",
        "temps_lecture": "9 min de lecture",
        "description_courte": "La structure V5/V6 exacte pour générer des images hyper-réalistes cinématographiques pour vos publicités locales."
    },
    {
        "id": "article-018",
        "numero": 18,
        "titre": "Pourquoi Excel est mort : Analysez vos ventes avec ChatGPT Advanced Data",
        "slug": "pourquoi-excel-est-mort-chatgpt-data",
        "excerpt": "Le tutoriel nocode pour uploader vos tableaux de ventes Shopify/Mobile Money et générer des prévisions financières en 2 minutes.",
        "image": "chatgpt_data_analysis.png",
        "emoji": "📈",
        "category": "Analyse de Données",
        "date": "2026-04-29",
        "keywords": "chatgpt advanced data analysis, analyse données ia, excel alternative ia, mobile money analyse ventes",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Le tutoriel nocode pour uploader vos tableaux de ventes Shopify/Mobile Money et générer des prévisions financières en 2 minutes."
    },
    {
        "id": "article-019",
        "numero": 19,
        "titre": "Comment écrire un Script YouTube viral grâce au Framework IA",
        "slug": "comment-ecrire-un-script-youtube-viral-grace-au-framework-ia",
        "excerpt": "La technique de rétention 'Hook-Story-Offer' écrite par l'IA pour doubler votre durée de vue et votre monétisation.",
        "image": "youtube_script_ia.png",
        "emoji": "🎥",
        "category": "Création de Contenu",
        "date": "2026-05-03",
        "keywords": "script youtube viral ia, hook story offer youtube, script video ia francais, monetisation youtube afrique",
        "temps_lecture": "9 min de lecture",
        "description_courte": "La technique de rétention 'Hook-Story-Offer' écrite par l'IA pour doubler votre durée de vue et votre monétisation."
    },
    {
        "id": "article-020",
        "numero": 20,
        "titre": "Vendre sur WhatsApp : Le prompt ultime pour relancer un client sans le braquer",
        "slug": "vendre-sur-whatsapp-le-prompt-ultime-pour-relancer",
        "excerpt": "Découvrez comment utiliser l'IA comportementale pour écrire le follow-up WhatsApp parfait et conclure vos ventes.",
        "image": "whatsapp_sales_prompt.png",
        "emoji": "💬",
        "category": "Copywriting & IA",
        "date": "2026-05-06",
        "keywords": "vendre whatsapp ia, follow up whatsapp prompt, relance client whatsapp, vente afrique whatsapp",
        "temps_lecture": "7 min de lecture",
        "description_courte": "Découvrez comment utiliser l'IA comportementale pour écrire le follow-up WhatsApp parfait et conclure vos ventes."
    },
    {
        "id": "article-021",
        "numero": 21,
        "titre": "Créer 30 jours de contenu Instagram en 45 minutes : Méthode 2026",
        "slug": "creer-30-jours-de-contenu-instagram-en-45-minutes",
        "excerpt": "Le workflow complet (ChatGPT + Canva Bulk Create) pour programmer vos Réels et publications pour tout le mois.",
        "image": "instagram_bulk_create.png",
        "emoji": "📱",
        "category": "Outils & Productivité",
        "date": "2026-05-10",
        "keywords": "contenu instagram ia 30 jours, canva bulk create chatgpt, créer contenu instagram automatique",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Le workflow complet (ChatGPT + Canva Bulk Create) pour programmer vos Réels et publications pour tout le mois."
    },
    {
        "id": "article-022",
        "numero": 22,
        "titre": "DALL-E 3 vs Midjourney v6 : Quel outil choisir pour vos visuels ?",
        "slug": "dalle-3-vs-midjourney-v6-quel-outil-choisir",
        "excerpt": "Comparatif honnête avec exemples réels : quel outil convient le mieux pour les visages africains et le design marketing ?",
        "image": "dalle3_vs_midjourney.png",
        "emoji": "⚖️",
        "category": "IA & Création",
        "date": "2026-05-13",
        "keywords": "dall-e 3 vs midjourney comparatif, générateur image ia, midjourney visages africains, dall-e 3 gratuit",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Comparatif honnête avec exemples réels : quel outil convient le mieux pour les visages africains et le design marketing ?"
    },
    {
        "id": "article-023",
        "numero": 23,
        "titre": "Rédiger des fiches produits E-commerce qui convertissent vraiment",
        "slug": "rediger-fiches-produits-e-commerce-qui-convertissent",
        "excerpt": "Arrêtez de copier Aliexpress. Voici 3 prompts Shopify pour générer des descriptions orientées bénéfices psychologiques.",
        "image": "ecommerce_product_description_ia.png",
        "emoji": "🛒",
        "category": "E-commerce & IA",
        "date": "2026-05-17",
        "keywords": "fiche produit ecommerce ia, description produit shopify chatgpt, copywriting ecommerce afrique",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Arrêtez de copier Aliexpress. Voici 3 prompts Shopify pour générer des descriptions orientées bénéfices psychologiques."
    },
    {
        "id": "article-024",
        "numero": 24,
        "titre": "L'intelligence artificielle pour les Coachs : Automatiser votre onboarding",
        "slug": "intelligence-artificielle-pour-les-coachs-automatiser-onboarding",
        "excerpt": "Comment créer un parcours client VIP automatique avec Make.com : questionnaire IA de bienvenue, création de dossier et facturation.",
        "image": "coach_onboarding_automation.png",
        "emoji": "🏆",
        "category": "Automatisation",
        "date": "2026-05-20",
        "keywords": "ia pour coachs, automatiser onboarding client, make.com coach, chatgpt coach automatisation",
        "temps_lecture": "9 min de lecture",
        "description_courte": "Comment créer un parcours client VIP automatique avec Make.com : questionnaire IA de bienvenue, création de dossier et facturation."
    },
    {
        "id": "article-025",
        "numero": 25,
        "titre": "Ne lancez pas de formation avant d'avoir testé cette stratégie IA",
        "slug": "ne-lancez-pas-de-formation-avant-davoir-teste-cette-strategie-ia",
        "excerpt": "Comment valider rapidement l'intérêt d'une audience africaine avant d'enregistrer 10 heures de vidéo inutiles.",
        "image": "validate_course_idea_ia.png",
        "emoji": "🎓",
        "category": "Stratégie",
        "date": "2026-05-24",
        "keywords": "valider idée formation en ligne, stratégie lancement formation ia, tester idée formation afrique",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Comment valider rapidement l'intérêt d'une audience africaine avant d'enregistrer 10 heures de vidéo inutiles."
    },
    {
        "id": "article-026",
        "numero": 26,
        "titre": "Comment cloner la voix de vos vidéos avec l'IA (Tutoriel complet)",
        "slug": "comment-cloner-la-voix-de-vos-videos-avec-ia",
        "excerpt": "ElevenLabs et HeyGen : le tutoriel complet pour traduire vos vidéos francophones en anglais parfait avec votre propre voix.",
        "image": "voice_cloning_tutorial.png",
        "emoji": "🎙️",
        "category": "IA & Création",
        "date": "2026-05-27",
        "keywords": "cloner voix ia, elevenlabs tutoriel français, heygen traduction vidéo, voice cloning afrique",
        "temps_lecture": "8 min de lecture",
        "description_courte": "ElevenLabs et HeyGen : le tutoriel complet pour traduire vos vidéos francophones en anglais parfait avec votre propre voix."
    },
    {
        "id": "article-027",
        "numero": 27,
        "titre": "Audit SEO avec l'IA : Le prompt pour analyser les mots-clés de vos concurrents",
        "slug": "audit-seo-avec-ia-le-prompt-pour-analyser-les-mots-cles",
        "excerpt": "Utilisez Perplexity et ChatGPT pour voler légalement le trafic Google de vos concurrents directs en 2026.",
        "image": "seo_audit_ia.png",
        "emoji": "🔍",
        "category": "SEO & Marketing",
        "date": "2026-05-31",
        "keywords": "audit seo ia, analyse mots clés concurrents ia, perplexity seo, chatgpt seo afrique",
        "temps_lecture": "9 min de lecture",
        "description_courte": "Utilisez Perplexity et ChatGPT pour voler légalement le trafic Google de vos concurrents directs en 2026."
    },
    {
        "id": "article-028",
        "numero": 28,
        "titre": "Relier ChatGPT à Google Sheets : Le tutoriel nocode ultime",
        "slug": "relier-chatgpt-a-google-sheets-le-tutoriel-nocode-ultime",
        "excerpt": "La méthode étape par étape pour appeler une IA directement depuis une cellule de votre feuille Excel/Sheets.",
        "image": "chatgpt_google_sheets.png",
        "emoji": "📊",
        "category": "Automatisation",
        "date": "2026-06-03",
        "keywords": "chatgpt google sheets, ia google sheets formule, nocode automatisation sheets, openai api sheets",
        "temps_lecture": "9 min de lecture",
        "description_courte": "La méthode étape par étape pour appeler une IA directement depuis une cellule de votre feuille Excel/Sheets."
    },
    {
        "id": "article-029",
        "numero": 29,
        "titre": "Rédiger une Séquence Email de Bienvenue de A à Z avec Claude 3.5",
        "slug": "rediger-une-sequence-email-bienvenue",
        "excerpt": "Les 5 emails psychologiques (Le Soap Opera Sequence) pour transformer un simple curieux en acheteur compulsif.",
        "image": "soap_opera_sequence_ia.png",
        "emoji": "✉️",
        "category": "Email Marketing",
        "date": "2026-06-07",
        "keywords": "séquence email bienvenue ia, soap opera sequence email, email marketing ia afrique, claude email marketing",
        "temps_lecture": "9 min de lecture",
        "description_courte": "Les 5 emails psychologiques (Le Soap Opera Sequence) pour transformer un simple curieux en acheteur compulsif."
    },
    {
        "id": "article-030",
        "numero": 30,
        "titre": "Comment utiliser l'IA générative pour trouver une idée de Business rentable",
        "slug": "utiliser-ia-pour-trouver-idee-de-business",
        "excerpt": "Arrêtez les brainstormings inutiles. Utilisez ce prompt pour croiser vos compétences avec les problèmes réels du marché africain.",
        "image": "ai_business_idea.png",
        "emoji": "💡",
        "category": "Stratégie Business",
        "date": "2026-06-10",
        "keywords": "trouver idée business ia, business rentable afrique 2026, idée business avec chatgpt, marché africain ia",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Arrêtez les brainstormings inutiles. Utilisez ce prompt pour croiser vos compétences avec les problèmes réels du marché africain."
    },
    {
        "id": "article-031",
        "numero": 31,
        "titre": "Les 5 erreurs fatales que tout le monde fait en Prompt Engineering",
        "slug": "5-erreurs-fatales-en-prompt-engineering",
        "excerpt": "Arrêtez de dire 'S'il te plaît' à l'IA. Découvrez pourquoi vos résultats sont moyens et comment adopter une logique algorithmique.",
        "image": "fatal_prompt_errors.png",
        "emoji": "🚨",
        "category": "Prompt Engineering",
        "date": "2026-06-14",
        "keywords": "erreurs prompt engineering, améliorer prompts ia, prompt engineering débutant, chatgpt meilleurs résultats",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Arrêtez de dire 'S'il te plaît' à l'IA. Découvrez pourquoi vos résultats sont moyens et comment adopter une logique algorithmique."
    },
    {
        "id": "article-032",
        "numero": 32,
        "titre": "Créer des vidéos TikTok sans visage : Logiciels et Stratégie",
        "slug": "creer-des-videos-tiktok-sans-visage",
        "excerpt": "Faceless YouTube Channel : les meilleurs outils d'avatar IA, de synthèse vocale et de montage B-Roll.",
        "image": "faceless_tiktok_ia.png",
        "emoji": "🎭",
        "category": "Création de Contenu",
        "date": "2026-06-17",
        "keywords": "tiktok sans visage ia, faceless youtube channel, vidéo ia sans visage afrique, synthèse vocale tiktok",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Faceless YouTube Channel : les meilleurs outils d'avatar IA, de synthèse vocale et de montage B-Roll."
    },
    {
        "id": "article-033",
        "numero": 33,
        "titre": "Organiser sa journée d'entrepreneur avec l'IA (Workflow Notion + ChatGPT)",
        "slug": "organiser-journee-entrepreneur-ia-notion",
        "excerpt": "Le système de productivité complet pour doubler vos résultats sans travailler 14h par jour.",
        "image": "entrepreneur_productivity_notion.png",
        "emoji": "📅",
        "category": "Outils & Productivité",
        "date": "2026-06-21",
        "keywords": "organisation journée entrepreneur ia, notion chatgpt productivité, workflow entrepreneur ia, notion afrique",
        "temps_lecture": "8 min de lecture",
        "description_courte": "Le système de productivité complet pour doubler vos résultats sans travailler 14h par jour."
    },
    {
        "id": "article-034",
        "numero": 34,
        "titre": "Gérer les clients difficiles : Prompts pour écrire des emails professionnels parfaits",
        "slug": "gerer-les-clients-difficiles-prompts-ia",
        "excerpt": "Comment répondre à une demande de remboursement ou un client agressif en restant ultra-diplomate grâce à l'IA.",
        "image": "difficult_clients_email.png",
        "emoji": "🛡️",
        "category": "SAV & WhatsApp",
        "date": "2026-06-24",
        "keywords": "gérer clients difficiles ia, email remboursement professionnel, répondre client agressif ia, sav ia afrique",
        "temps_lecture": "7 min de lecture",
        "description_courte": "Comment répondre à une demande de remboursement ou un client agressif en restant ultra-diplomate grâce à l'IA."
    },
    {
        "id": "article-035",
        "numero": 35,
        "titre": "Bilan Trimestriel : Comment l'automatisation a transformé DigitalBoost AI",
        "slug": "bilan-trimestriel-comment-l-automatisation-a-transforme-digitalboost-ai",
        "excerpt": "Les chiffres réels (trafic, ventes, temps gagné) après 3 mois passés à l'automatisation intégrale du processus éditorial.",
        "image": "q2_automation_report.png",
        "emoji": "📊",
        "category": "Bilan & Transparence",
        "date": "2026-06-28",
        "keywords": "bilan digitalboost ai, résultats automatisation blog ia, chiffres réels blog ia, transparence entrepreneur ivoirien",
        "temps_lecture": "10 min de lecture",
        "description_courte": "Les chiffres réels (trafic, ventes, temps gagné) après 3 mois passés à l'automatisation intégrale du processus éditorial."
    },
]

# ──────────────────────────────────────────────
#  TEMPLATE PROMPT POUR CLAUDE
# ──────────────────────────────────────────────
SYSTEM_PROMPT = """Tu es un expert en rédaction web de contenu éditorial premium pour le blog DigitalBoost AI, 
une plateforme d'éducation à l'IA pour les entrepreneurs africains francophones (audience principale : Côte d'Ivoire, Sénégal, Cameroun, Maroc).

Règles ABSOLUES :
1. Langue : Français impeccable, professionnel mais accessible, jamais condescendant.
2. Ton : Direct, expert, bienveillant. Tutoiement interdit. Pas de "vous" formel excessif.
3. Format : Rédige UNIQUEMENT le contenu HTML interne des sections demandées, SANS les balises <html>, <head>, <body>.
4. Longueur : Minimum 1800 mots de contenu visible, bien structuré en 4-6 sections H2.
5. Qualité SEO : Chaque H2 doit naturellement intégrer les mots-clés fournis.
6. Style : Utilise des exemples concrets liés à l'entrepreneuriat africain, avec des montants en FCFA quand pertinent.
7. Interdictions formelles : Pas de "Dans le paysage numérique d'aujourd'hui", pas de clichés IA génériques, pas de listes à puces excessives.
8. Contenu : Donne de vraies informations concrètes, des prompts réels, des chiffres plausibles, des étapes actionnables.
"""

def build_user_prompt(article):
    """Construit le prompt utilisateur pour un article donné."""
    date_parts = article["date"].split("-")
    mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    date_str = f"{int(date_parts[2])} {mois[int(date_parts[1])]} {date_parts[0]}"

    return f"""Génère le CONTENU COMPLET en HTML pour l'article de blog DigitalBoost AI suivant :

**Titre** : {article['titre']}
**Catégorie** : {article['category']}
**Date** : {date_str}
**Temps de lecture** : {article['temps_lecture']}
**Mots-clés SEO** : {article['keywords']}
**Description** : {article['excerpt']}

---

Génère EXACTEMENT ces blocs HTML dans cet ordre :

### BLOC 1 — INTRO BLOCK (fond sombre)
```html
<div class="intro-block">
  <div class="intro-eyebrow">[Titre court accrocheur]</div>
  <p>[Paragraphe d'accroche puissant, 2-3 phrases, problème réel de l'entrepreneur africain]</p>
  <p>[2e paragraphe qui promet la solution de manière concrète]</p>
</div>
```

### BLOC 2 — CORPS PRINCIPAL (4 à 6 sections H2)
Pour chaque section, utilise librement les blocs suivants selon pertinence :
- `<div class="tip-block"><div class="tip-label">💡 Astuce Pro</div><p>...</p></div>`
- `<div class="accent-block"><p>✅ ...</p></div>`
- `<div class="warning-block"><div class="warn-label">⚠️ Attention</div><p>...</p></div>`
- `<div class="prompt-box"><div class="prompt-label">✅ Prompt exact — [Nom]</div><p>[contenu du prompt réaliste]</p></div>`
- `<div class="output-box"><div class="output-label">Résultat généré par Claude 3.5</div><p>...</p></div>`

Minimum 4 blocs H2 avec contenu substantiel (300+ mots par section).

### BLOC 3 — CTA MID-ARTICLE
```html
<div class="cta-inline">
  <h3>[Titre CTA accrocheur]</h3>
  <p>Dans notre Pack d'outils, vous trouverez <strong>12 prompts stratégiques</strong> conçus pour [bénéfice lié au sujet].</p>
  <div class="cta-features">
    <span class="cta-feat">[Feature 1]</span>
    <span class="cta-feat">[Feature 2]</span>
    <span class="cta-feat">[Feature 3]</span>
    <span class="cta-feat">[Feature 4]</span>
  </div>
  <p>[Phrase de conviction finale]</p>
  <div class="cta-btn-group">
    <a href="https://ppawzaph.mychariow.shop/prd_cav6sr" class="btn-gold">📥 Accéder à l'Arsenal IA (100+ Prompts) — 2 000 FCFA <span style="font-size:.75em;opacity:.85;font-weight:normal;">(~3€ / 3.20$)</span></a>
  </div>
</div>
```

### BLOC 4 — FAQ (3 questions/réponses)
```html
<div class="faq-section">
  <h2>❓ Questions Fréquentes</h2>
  <details class="faq-item">
    <summary>[Question 1 pertinente]</summary>
    <p>[Réponse détaillée et experte]</p>
  </details>
  [... 2 autres questions]
</div>
```

### BLOC 5 — CONCLUSION
```html
<div class="conclusion">
  <h2>[Titre conclusion motivant]</h2>
  <p>[Paragraphe de synthèse puissant]</p>
  <p>[Appel à l'action final, lié au sujet et au Pack de Prompts]</p>
  <a href="https://ppawzaph.mychariow.shop/prd_cav6sr" class="btn-gold" style="margin-top:16px;">🔥 [CTA bouton accrocheur]</a>
</div>
```

### BLOC 6 — SEO TAGS
```html
<div class="seo-tags" style="margin-top:40px;">
  <span class="seo-tag">[tag1]</span>
  [... 5-6 tags total]
</div>
```

### BLOC 7 — TOC ITEMS (pour la sidebar, format liste)
Fournis en commentaire HTML à la fin :
<!-- TOC:
<li><a href="#[anchor1]">[Titre section 1]</a></li>
...
-->

IMPORTANT : Ajoute des attributs `id="[slug]"` sur chaque H2 pour le TOC.
"""


# ──────────────────────────────────────────────
#  TEMPLATE HTML COMPLET (enveloppe de l'article)
# ──────────────────────────────────────────────
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{titre} | DigitalBoost AI</title>
    <meta name="description" content="{description}" />
    <meta name="keywords" content="{keywords}" />
    <meta name="author" content="DigitalBoost AI" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://digitalboostai.tech/blog/{slug}" />

    <meta property="og:title" content="{titre}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://digitalboostai.tech/blog/{slug}" />
    <meta property="og:site_name" content="DigitalBoost AI" />
    <meta property="og:image" content="https://digitalboostai.tech/img/{image}" />
    <meta property="og:locale" content="fr_CI" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{titre}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="https://digitalboostai.tech/img/{image}" />

    <meta property="article:published_time" content="{date}T08:00:00+00:00" />
    <meta property="article:author" content="DigitalBoost AI" />
    <meta property="article:tag" content="{category}" />

    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{titre}",
      "description": "{description}",
      "author": {{ "@type": "Organization", "name": "DigitalBoost AI" }},
      "publisher": {{ "@type": "Organization", "name": "DigitalBoost AI" }},
      "datePublished": "{date}",
      "keywords": "{keywords}",
      "mainEntityOfPage": "https://digitalboostai.tech/blog/{slug}",
      "image": "https://digitalboostai.tech/img/{image}"
    }}
    </script>

    <meta name="theme-color" content="#0D1117" />

    <style>
@font-face {{ font-family:'DM Sans';font-style:normal;font-weight:300;font-display:swap;src:url('../fonts/dm-sans-v17-latin-300.woff2') format('woff2'); }}
@font-face {{ font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url('../fonts/dm-sans-v17-latin-400.woff2') format('woff2'); }}
@font-face {{ font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url('../fonts/dm-sans-v17-latin-500.woff2') format('woff2'); }}
@font-face {{ font-family:'DM Sans';font-style:normal;font-weight:600;font-display:swap;src:url('../fonts/dm-sans-v17-latin-600.woff2') format('woff2'); }}
@font-face {{ font-family:'Fraunces';font-style:normal;font-weight:300;font-display:swap;src:url('../fonts/fraunces-v38-latin-300.woff2') format('woff2'); }}
@font-face {{ font-family:'Fraunces';font-style:normal;font-weight:700;font-display:swap;src:url('../fonts/fraunces-v38-latin-700.woff2') format('woff2'); }}
@font-face {{ font-family:'Fraunces';font-style:normal;font-weight:900;font-display:swap;src:url('../fonts/fraunces-v38-latin-900.woff2') format('woff2'); }}

        :root{{
            --ink:#0D1117;
            --paper:#FAFAF7;
            --gold:#B8912A;
            --gold-light:#F0E0A8;
            --accent:#1A6B3C;
            --accent-light:#E8F5EE;
            --muted:#6B7280;
            --border:#E5E2D9;
            --max:780px
        }}
        img,svg{{max-width:100%;height:auto}}
        *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
        html{{scroll-behavior:smooth}}
        body{{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink);font-size:17px;line-height:1.8}}

        /* === PROGRESS BAR === */
        #progress-bar{{position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,var(--gold),var(--accent));z-index:9999;transition:width .1s linear}}

        /* === HEADER === */
        .site-header{{position:sticky;top:0;background:rgba(250,250,247,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;z-index:100}}
        .site-header .logo{{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-.5px}}
        .site-header .logo span{{color:var(--gold)}}
        .header-cta{{background:var(--ink);color:var(--paper);padding:10px 20px;border-radius:100px;font-size:.85rem;font-weight:600;text-decoration:none;transition:background .2s;min-height:44px;display:inline-flex;align-items:center}}
        .header-cta:hover{{background:var(--accent)}}

        /* === HERO === */
        .hero{{max-width:860px;margin:0 auto;padding:80px 24px 60px;text-align:center}}
        .category-tag{{display:inline-block;background:#D1E7DD;color:#0B4527;font-size:.78rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:24px}}
        .hero h1{{font-family:'Fraunces',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;letter-spacing:-1px;color:var(--ink);margin-bottom:24px}}
        .hero h1 em{{font-style:italic;color:var(--gold)}}
        .hero-subtitle{{font-size:1.15rem;color:var(--muted);max-width:600px;margin:0 auto 36px;line-height:1.7}}
        .meta-row{{display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;font-size:.85rem;color:var(--muted);padding-bottom:48px;border-bottom:1px solid var(--border)}}

        /* === HERO IMAGE === */
        .hero-image{{max-width:860px;margin:0 auto;padding:0 24px 48px}}
        .hero-image-inner{{width:100%;height:400px;border-radius:20px;overflow:hidden;position:relative}}
        .hero-image-inner img{{width:100%;height:100%;object-fit:cover}}
        .hero-image-overlay{{position:absolute;inset:0;background:linear-gradient(to top, rgba(13,17,23,0.8), transparent);display:flex;align-items:flex-end;padding:40px}}
        .hero-image-text{{text-align:left;z-index:1}}
        .hero-image-text .label{{font-size:.72rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:14px}}
        .hero-image-text h2{{font-family:'Fraunces',serif;color:var(--paper);font-size:clamp(1.4rem,3vw,2rem);font-weight:900;line-height:1.2;margin-bottom:10px}}
        .hero-image-text p{{color:rgba(250,250,247,.65);font-size:.9rem}}

        /* === LAYOUT === */
        .article-layout{{max-width:1100px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 280px;gap:60px;align-items:start}}
        @media(max-width:900px){{.article-layout{{grid-template-columns:1fr}}.sidebar{{display:none}}}}

        /* === ARTICLE BODY === */
        .article-body{{padding:60px 0;max-width:var(--max)}}
        .article-body h2{{font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;color:var(--ink);margin:56px 0 16px;letter-spacing:-.5px;line-height:1.25}}
        .article-body h3{{font-family:'Fraunces',serif;font-size:1.25rem;font-weight:700;color:var(--ink);margin:36px 0 14px}}
        .article-body p{{margin-bottom:20px;color:#2D3139}}
        .article-body strong{{color:var(--ink);font-weight:600}}
        .article-body ul{{margin:20px 0 20px 24px}}
        .article-body ul li{{margin-bottom:10px;color:#2D3139}}
        .section-hook{{font-size:1.05rem;color:var(--muted);font-style:italic;margin-bottom:24px;line-height:1.7;border-left:3px solid var(--gold);padding-left:16px}}

        /* === BLOCKS === */
        .intro-block{{background:var(--ink);color:var(--paper);border-radius:16px;padding:32px 36px;margin:40px 0;position:relative;overflow:hidden}}
        .intro-block::before{{content:'"';position:absolute;top:-20px;right:20px;font-family:'Fraunces',serif;font-size:120px;color:var(--gold);opacity:.3;line-height:1}}
        .intro-block p{{color:var(--paper);font-size:1.05rem;line-height:1.8;position:relative;z-index:1;margin-bottom:14px}}
        .intro-block p:last-child{{margin-bottom:0}}
        .intro-block .intro-eyebrow{{font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:14px;position:relative;z-index:1}}
        .intro-block strong{{color:var(--gold)}}
        .intro-block em{{color:var(--gold-light)}}

        .tip-block{{border-left:4px solid var(--gold);background:var(--gold-light);padding:20px 24px;border-radius:0 12px 12px 0;margin:32px 0}}
        .tip-block .tip-label{{font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8B6914;margin-bottom:8px}}
        .tip-block p{{margin:0;color:var(--ink)}}

        .accent-block{{border-left:4px solid var(--accent);background:var(--accent-light);padding:20px 24px;border-radius:0 12px 12px 0;margin:32px 0}}
        .accent-block p{{margin:0;color:var(--ink)}}

        .warning-block{{border-left:4px solid #D97706;background:#FEF3C7;padding:20px 24px;border-radius:0 12px 12px 0;margin:32px 0}}
        .warning-block .warn-label{{font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#92400E;margin-bottom:8px}}
        .warning-block p{{margin:0;color:#78350F}}

        /* === PROMPT / OUTPUT BOX === */
        .prompt-box{{background:#0D1117;border-radius:12px;padding:20px 24px;margin:20px 0;border:1px solid rgba(184,145,42,.2)}}
        .prompt-box .prompt-label{{font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}}
        .prompt-box p{{color:#E5E2D9;font-size:.93rem;line-height:1.7;margin:0;font-family:monospace;white-space:pre-wrap}}

        .output-box{{background:#F0FDF4;border:1.5px solid #6EE7B7;border-radius:12px;padding:24px 28px;margin:20px 0}}
        .output-box .output-label{{font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#065F46;margin-bottom:12px;display:flex;align-items:center;gap:8px}}
        .output-box .output-label::before{{content:'✦';font-size:.9rem}}
        .output-box p{{color:#1F4E3D;font-size:.93rem;line-height:1.75;margin:0 0 10px}}
        .output-box p:last-child{{margin-bottom:0}}
        .output-box .output-field{{font-weight:700;color:#065F46;font-size:.82rem;text-transform:uppercase;letter-spacing:.5px;margin-top:14px;margin-bottom:4px}}

        /* === CTA === */
        .cta-inline{{background:linear-gradient(135deg,var(--ink) 0%,#1a2a1a 100%);border-radius:20px;padding:44px 40px;margin:56px 0;text-align:center;position:relative;overflow:hidden}}
        .cta-inline::before{{content:'🚀';position:absolute;font-size:180px;opacity:.04;top:-30px;right:-20px;line-height:1}}
        .cta-inline h3{{font-family:'Fraunces',serif;color:var(--paper);font-size:1.6rem;margin-bottom:12px;letter-spacing:-.5px}}
        .cta-inline p{{color:rgba(250,250,247,.7);margin-bottom:8px;font-size:.95rem}}
        .cta-inline strong{{color:var(--gold)}}
        .cta-inline .cta-features{{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:20px 0 28px}}
        .cta-inline .cta-feat{{background:rgba(184,145,42,.15);border:1px solid rgba(184,145,42,.3);color:var(--gold-light);font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:100px}}
        .cta-btn-group{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
        .btn-gold{{display:inline-block;background:var(--gold);color:var(--ink);padding:14px 28px;border-radius:100px;font-weight:700;font-size:.95rem;text-decoration:none;transition:transform .2s,box-shadow .2s;min-height:48px;line-height:1.3}}
        .btn-gold:hover{{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,.4)}}

        /* === CONCLUSION === */
        .conclusion{{background:var(--ink);color:var(--paper);border-radius:20px;padding:48px 40px;margin:56px 0 0;text-align:center}}
        .conclusion h2{{font-family:'Fraunces',serif;color:var(--paper);font-size:1.8rem;margin-bottom:16px}}
        .conclusion p{{color:rgba(250,250,247,.75);margin-bottom:16px}}
        .conclusion strong{{color:var(--gold)}}

        /* === SIDEBAR === */
        .sidebar{{position:sticky;top:100px;padding:60px 0}}
        .sidebar-card{{background:white;border:1.5px solid var(--border);border-radius:16px;padding:28px 24px;margin-bottom:20px}}
        .sidebar-card h2{{font-family:'Fraunces',serif;font-size:1rem;font-weight:700;margin-bottom:16px;color:var(--ink)}}
        .toc-list{{list-style:none}}
        .toc-list li{{padding:7px 0;border-bottom:1px solid var(--border);font-size:.85rem}}
        .toc-list li:last-child{{border-bottom:none}}
        .toc-list a{{color:#374151;text-decoration:underline;text-decoration-color:transparent;transition:color .2s}}
        .toc-list a:hover{{color:#8B6914;text-decoration-color:#8B6914}}
        .sidebar-cta{{background:var(--ink);border-radius:16px;padding:28px 24px;text-align:center}}
        .sidebar-cta h2{{font-family:'Fraunces',serif;color:var(--paper);font-size:1.1rem;margin-bottom:10px}}
        .sidebar-cta p{{color:rgba(250,250,247,.65);font-size:.82rem;margin-bottom:20px}}
        .sidebar-cta .btn-gold{{width:100%;display:block}}

        /* === FAQ === */
        .faq-section{{margin:60px 0 0}}
        .faq-section h2{{font-family:'Fraunces',serif;font-size:1.6rem;font-weight:700;color:var(--ink);margin-bottom:28px;letter-spacing:-.5px}}
        details.faq-item{{border-bottom:1px solid var(--border);padding:20px 0}}
        details.faq-item:last-child{{border-bottom:none}}
        details.faq-item summary{{font-weight:600;cursor:pointer;color:var(--ink);font-size:1rem;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}}
        details.faq-item summary::-webkit-details-marker{{display:none}}
        details.faq-item summary::after{{content:'＋';font-size:1.2rem;color:var(--gold);flex-shrink:0;transition:transform .2s}}
        details.faq-item[open] summary::after{{transform:rotate(45deg)}}
        details.faq-item p{{margin:14px 0 0;color:#4B5563;font-size:.95rem;line-height:1.75}}

        /* === SHARE BUTTONS === */
        .share-wrapper{{text-align:center;padding:0 24px 40px}}
        .share-label{{font-size:.82rem;color:#6B7280;margin-bottom:14px;letter-spacing:.5px;text-transform:uppercase;font-weight:600}}
        .share-row{{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:0}}
        .share-btn{{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:100px;font-size:.85rem;font-weight:600;text-decoration:none;color:white;transition:transform .2s,opacity .2s,box-shadow .2s;border:none;cursor:pointer;min-height:44px}}
        .share-btn:hover{{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.18)}}
        .share-wa{{background:#25D366}}.share-fb{{background:#1877F2}}.share-li{{background:#0A66C2}}

        /* === SEO TAGS === */
        .seo-tags{{display:flex;flex-wrap:wrap;gap:8px;margin:32px 0}}
        .seo-tag{{background:var(--accent-light);color:var(--accent);font-size:.78rem;font-weight:500;padding:4px 12px;border-radius:100px}}

        /* === FOOTER === */
        .site-footer{{border-top:1px solid var(--border);padding:40px 24px;text-align:center;font-size:.85rem;color:var(--muted);margin-top:80px}}
        .site-footer a{{color:#8B6914;text-decoration:underline}}
    </style>
</head>

<body>
<!-- Google Translate -->
<div id="google_translate_element" style="display:none;"></div>
<script type="text/javascript">
    (function(){{
        try{{
            var countryToLang={{'DE':'de','AT':'de','CH':'de','ES':'es','MX':'es','AR':'es','CO':'es','PE':'es','CL':'es','US':'en','GB':'en','CA':'en','AU':'en','NZ':'en','IT':'it','PT':'pt','BR':'pt','CN':'zh-CN','TW':'zh-TW','JP':'ja','RU':'ru','SA':'ar','AE':'ar','MA':'ar','DZ':'ar','EG':'ar','NL':'nl','TR':'tr'}};
            fetch('https://get.geojs.io/v1/ip/country.json')
            .then(function(r){{return r.json();}})
            .then(function(data){{
                var langCode=countryToLang[data.country]||'fr';
                var expectedCookie="/fr/"+langCode;
                var domain=window.location.hostname;
                var currentCookie="";
                var match=document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
                if(match)currentCookie=match[2];
                if(currentCookie!==expectedCookie){{
                    if(langCode==='fr'){{
                        document.cookie="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        document.cookie="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain="+domain;
                        document.cookie="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=."+domain;
                    }}else{{
                        document.cookie="googtrans="+expectedCookie+"; path=/; domain="+domain;
                        document.cookie="googtrans="+expectedCookie+"; path=/;";
                        document.cookie="googtrans="+expectedCookie+"; path=/; domain=."+domain;
                    }}
                    var reloadKey='lang_rl_'+langCode;
                    if(!sessionStorage.getItem(reloadKey)){{sessionStorage.clear();sessionStorage.setItem(reloadKey,'1');window.location.reload();}}
                }}else{{
                    var k='lang_rl_'+langCode;
                    if(!sessionStorage.getItem(k)){{sessionStorage.clear();sessionStorage.setItem(k,'1');}}
                }}
            }}).catch(function(e){{console.error(e);}});
        }}catch(e){{}}
    }})();
    function googleTranslateElementInit(){{
        new google.translate.TranslateElement({{pageLanguage:'fr',autoDisplay:false}},'google_translate_element');
    }}
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
<style>
    .skiptranslate iframe,.skiptranslate .goog-te-banner-frame{{display:none!important}}
    body{{top:0!important}}
    #goog-gt-tt{{display:none!important}}
    .goog-text-highlight{{background-color:transparent!important;border:none!important;box-shadow:none!important}}
</style>

<div id="progress-bar" role="progressbar" aria-label="Progression de lecture"></div>

<!-- ===== HEADER ===== -->
<header class="site-header">
    <a href="https://digitalboostai.tech/" class="logo">⚡DigitalBoost <span>AI</span></a>
    <a href="https://digitalboostai.tech/#pricing" class="header-cta">Obtenir les produits →</a>
</header>

<!-- ===== HERO ===== -->
<div class="hero">
    <span class="category-tag">{emoji} {category}</span>
    <h1>{titre_h1}</h1>
    <p class="hero-subtitle">{description}</p>
    <div class="meta-row">
        <span>📅 {date_str}</span>
        <span>·</span>
        <span>⏱️ {temps_lecture}</span>
        <span>·</span>
        <span>👋 Par Franck-Aimé, DigitalBoost AI</span>
    </div>
</div>

<!-- ===== HERO IMAGE ===== -->
<div class="hero-image">
    <div class="hero-image-inner">
        <img src="../img/{image}" alt="{titre} - DigitalBoost AI">
        <div class="hero-image-overlay">
            <div class="hero-image-text">
                <div class="label" style="font-size:.72rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:14px;">DigitalBoost AI</div>
                <h2 style="font-family:'Fraunces',serif;color:var(--paper);font-size:clamp(1.4rem,3vw,2rem);font-weight:900;line-height:1.2;margin-bottom:10px;">{titre_overlay}</h2>
                <p style="color:rgba(250,250,247,.65);font-size:.9rem;">{description_courte}</p>
            </div>
        </div>
    </div>
</div>

<!-- ===== SHARE ROW HAUT ===== -->
<div class="share-wrapper">
    <p class="share-label">Partager cet article</p>
    <div class="share-row">
        <a href="#" onclick="window.open('https://api.whatsapp.com/send?text='+encodeURIComponent('🚀 {share_text}\\nhttps://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-wa" aria-label="Partager sur WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            Partager
        </a>
        <a href="#" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('https://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-fb" aria-label="Partager sur Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Partager
        </a>
        <a href="#" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-li" aria-label="Partager sur LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Partager
        </a>
    </div>
</div>

<!-- ===== ARTICLE LAYOUT ===== -->
<div class="article-layout">
    <main class="article-body" id="article-main">

{article_content}

    </main>

    <!-- ===== SIDEBAR ===== -->
    <aside class="sidebar">
        <div class="sidebar-card">
            <h2>📑 Sommaire</h2>
            <nav aria-label="Table des matières">
                <ul class="toc-list">
{toc_items}
                </ul>
            </nav>
        </div>
        <div class="sidebar-cta">
            <h2>100+ Prompts IA</h2>
            <p>L'arsenal que tout entrepreneur africain doit posséder. 124 prompts inclus.</p>
            <a href="https://ppawzaph.mychariow.shop/prd_cav6sr" class="btn-gold">Obtenir le Pack — 2 000 FCFA <span style="font-size:.72em;opacity:.85;font-weight:normal;">(~3€)</span> 🔥</a>
        </div>
    </aside>
</div>

<!-- SHARE ROW BAS -->
<div class="share-wrapper" style="padding-top:0;">
    <p class="share-label">Partager cet article avec un ami :</p>
    <div class="share-row">
        <a href="#" onclick="window.open('https://api.whatsapp.com/send?text='+encodeURIComponent('🚀 {share_text}\\nhttps://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-wa" aria-label="Partager sur WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            Partager
        </a>
        <a href="#" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('https://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-fb" aria-label="Partager sur Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Partager
        </a>
        <a href="#" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://digitalboostai.tech/blog/{slug}'),'_blank');return false;" class="share-btn share-li" aria-label="Partager sur LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Partager
        </a>
    </div>
</div>

<!-- ===== FOOTER ===== -->
<footer class="site-footer" role="contentinfo">
    <p>© 2026 <a href="https://digitalboostai.tech/" aria-label="Accueil DigitalBoost AI">DigitalBoost AI</a> — Tous droits réservés &nbsp;·&nbsp;
    <a href="/mentions-legales" aria-label="Mentions légales">Mentions légales</a> &nbsp;·&nbsp;
    <a href="/politique-confidentialite" aria-label="Politique de confidentialité">Confidentialité</a></p>
</footer>

<script>
    /* Progress bar */
    const progressBar = document.getElementById("progress-bar");
    window.addEventListener("scroll", () => {{
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
    }}, {{passive: true}});
</script>
</body>
</html>'''


# ──────────────────────────────────────────────
#  FICHIERS DE SORTIE EXISTANTS AVEC SLUGS CONNUS
# ──────────────────────────────────────────────
# Map article_id -> nom de fichier existant dans /blog
EXISTING_FILES = {
    "article-015": "5-outils-ia-gratuits.html",
    "article-016": "comment-creer-assistant-virtuel-sav.html",
    "article-017": "le-guide-pour-ecrire-prompts-midjourney.html",
    "article-018": "pourquoi-excel-est-mort-chatgpt-data.html",
    "article-019": "comment-ecrire-un-script-youtube-viral-grace-au-framework-ia.html",
    "article-020": "vendre-sur-whatsapp-le-prompt-ultime-pour-relancer.html",
    "article-021": "creer-30-jours-de-contenu-instagram-en-45-minutes.html",
    "article-022": "dalle-3-vs-midjourney-v6-quel-outil-choisir.html",
    "article-023": "rediger-fiches-produits-e-commerce-qui-convertissent.html",
    "article-024": "intelligence-artificielle-pour-les-coachs-automatiser-onboarding.html",
    "article-025": "ne-lancez-pas-de-formation-avant-davoir-teste-cette-strategie-ia.html",
    "article-026": "comment-cloner-la-voix-de-vos-videos-avec-ia.html",
    "article-027": "audit-seo-avec-ia-le-prompt-pour-analyser-les-mots-cles.html",
    "article-028": "relier-chatgpt-a-google-sheets-le-tutoriel-nocode-ultime.html",
    "article-029": "rediger-une-sequence-email-bienvenue.html",
    "article-030": "utiliser-ia-pour-trouver-idee-de-business.html",
    "article-031": "5-erreurs-fatales-en-prompt-engineering.html",
    "article-032": "creer-des-videos-tiktok-sans-visage.html",
    "article-033": "organiser-journee-entrepreneur-ia-notion.html",
    "article-034": "gerer-les-clients-difficiles-prompts-ia.html",
    "article-035": "bilan-trimestriel-comment-l-automatisation-a-transforme-digitalboost-ai.html",
}


def extract_toc_from_content(content):
    """Extrait les items TOC du commentaire généré par Claude."""
    toc_match = re.search(r'<!-- TOC:(.*?)-->', content, re.DOTALL)
    if toc_match:
        toc_raw = toc_match.group(1).strip()
        # Nettoyage du contenu Claude
        content = content[:toc_match.start()] + content[toc_match.end():]
        return content, toc_raw
    # Fallback : extraire les H2 directement
    h2s = re.findall(r'<h2[^>]*id="([^"]*)"[^>]*>(.*?)</h2>', content, re.DOTALL)
    toc_items = ""
    for anchor, text in h2s:
        clean_text = re.sub(r'<[^>]+>', '', text).strip()
        toc_items += f'                    <li><a href="#{anchor}">{clean_text}</a></li>\n'
    return content, toc_items


def format_date(date_str):
    """Formate une date ISO en date française lisible."""
    date_parts = date_str.split("-")
    mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    return f"{int(date_parts[2])} {mois[int(date_parts[1])]} {date_parts[0]}"


def make_titre_h1(titre):
    """Découpe le titre pour mettre une partie en italique dorée si possible."""
    # Cherche un délimiteur naturel (:, —, pour)
    for sep in [' : ', ' — ', ' pour ', ' avec ']:
        if sep in titre:
            parts = titre.split(sep, 1)
            return f"{parts[0]}{sep}<em>{parts[1]}</em>"
    return titre


def generate_article_content(client, article):
    """Appelle l'API Claude pour générer le contenu de l'article."""
    print(f"  🤖 Appel API Claude pour : {article['titre'][:60]}...")
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": build_user_prompt(article)}
        ]
    )
    
    return response.content[0].text


def build_full_html(article, article_content):
    """Assemble le HTML complet de l'article."""
    article_content, toc_items = extract_toc_from_content(article_content)
    
    # Fallback TOC si vide
    if not toc_items.strip():
        toc_items = '                    <li><a href="#">Introduction</a></li>\n'
    
    date_str = format_date(article["date"])
    slug_file = EXISTING_FILES.get(article["id"], article["slug"] + ".html")
    slug_url = slug_file.replace(".html", "")
    
    # Titre overlay court
    titre_overlay = article["titre"][:60] + ("..." if len(article["titre"]) > 60 else "")
    
    return HTML_TEMPLATE.format(
        titre=article["titre"],
        titre_h1=make_titre_h1(article["titre"]),
        titre_overlay=titre_overlay,
        description=article["excerpt"],
        description_courte=article["description_courte"],
        keywords=article["keywords"],
        image=article["image"],
        emoji=article["emoji"],
        category=article["category"],
        date=article["date"],
        date_str=date_str,
        temps_lecture=article["temps_lecture"],
        slug=slug_url,
        share_text=article["excerpt"][:100].replace("'", "\\'"),
        article_content=article_content,
        toc_items=toc_items,
    )


def rebuild_all_articles(api_key, blog_dir, start_from=None, only_id=None):
    """Reconstruit tous les articles dégradés."""
    client = anthropic.Anthropic(api_key=api_key)
    
    articles_to_process = ARTICLES
    if only_id:
        articles_to_process = [a for a in ARTICLES if a["id"] == only_id]
    elif start_from:
        articles_to_process = [a for a in ARTICLES if a["id"] >= start_from]
    
    total = len(articles_to_process)
    success = 0
    errors = []
    
    print(f"\n{'='*60}")
    print(f"🚀 RECONSTRUCTION DE {total} ARTICLES AVEC CLAUDE OPUS")
    print(f"{'='*60}\n")
    
    for i, article in enumerate(articles_to_process, 1):
        filename = EXISTING_FILES.get(article["id"], article["slug"] + ".html")
        output_path = os.path.join(blog_dir, filename)
        
        print(f"\n[{i}/{total}] 📝 {article['titre'][:55]}...")
        print(f"  📄 Fichier cible : {filename}")
        
        try:
            # Générer le contenu via Claude
            article_content = generate_article_content(client, article)
            
            # Assembler le HTML complet
            full_html = build_full_html(article, article_content)
            
            # Sauvegarder
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(full_html)
            
            size_kb = os.path.getsize(output_path) / 1024
            print(f"  ✅ Sauvegardé ({size_kb:.0f} KB) → {filename}")
            success += 1
            
            # Pause pour respecter les rate limits (1 req/sec)
            if i < total:
                print(f"  ⏳ Pause 2s...")
                time.sleep(2)
                
        except Exception as e:
            print(f"  ❌ Erreur : {e}")
            errors.append({"article": article["id"], "error": str(e)})
            time.sleep(5)  # Pause plus longue en cas d'erreur
    
    # Rapport final
    print(f"\n{'='*60}")
    print(f"✅ TERMINÉ : {success}/{total} articles reconstruits")
    if errors:
        print(f"❌ Erreurs ({len(errors)}) :")
        for e in errors:
            print(f"  - {e['article']}: {e['error']}")
    print(f"{'='*60}\n")
    
    return success, errors


def main():
    parser = argparse.ArgumentParser(
        description="Reconstruction des articles dégradés via Claude Opus"
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("ANTHROPIC_API_KEY", ""),
        help="Clé API Anthropic (ou via variable ANTHROPIC_API_KEY)"
    )
    parser.add_argument(
        "--blog-dir",
        default=os.path.join(os.path.dirname(__file__), "blog"),
        help="Dossier des articles blog"
    )
    parser.add_argument(
        "--start-from",
        default=None,
        help="Reprendre à partir de cet article ID (ex: article-020)"
    )
    parser.add_argument(
        "--only",
        default=None,
        help="Reconstruire un seul article par son ID (ex: article-015)"
    )
    
    args = parser.parse_args()
    
    if not args.api_key:
        print("❌ ERREUR : Clé API Anthropic manquante.")
        print("   Option 1 : --api-key sk-ant-...")
        print("   Option 2 : set ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)
    
    if not os.path.isdir(args.blog_dir):
        print(f"❌ ERREUR : Dossier blog introuvable : {args.blog_dir}")
        sys.exit(1)
    
    rebuild_all_articles(
        api_key=args.api_key,
        blog_dir=args.blog_dir,
        start_from=args.start_from,
        only_id=args.only
    )


if __name__ == "__main__":
    main()
