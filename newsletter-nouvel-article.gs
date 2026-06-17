/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  DIGITALBOOST AI — NEWSLETTER AUTOMATIQUE                           ║
 * ║  Détecte les nouveaux articles et informe les abonnés               ║
 * ║  Version: 4.0 — Corrigée (bug déclaration fonction + clé webhook)   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════
// 🔧 CONFIGURATION — REMPLIR UNE SEULE FOIS
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  SHEET_ID: '1dB2PqGI9kx5tbXv5lAoDk5_fLHqzrDMBe8VdX80vJvo',
  FEUILLE_ABONNES: 'Réponses au formulaire 1',
  FEUILLE_JOURNAL: 'Journal_Newsletters',
  COL_EMAIL: 3,
  COL_PRENOM: 2,
  PREMIERE_LIGNE: 2,
  NOM_EXPEDITEUR: 'DigitalBoost AI',
  EMAIL_REPONDRE: 'noreply@digitalboostai.com',
  URL_CONFIG_ARTICLES: 'https://digitalboostai.tech/articles-config.json',
  FREQUENCE_HEURES: 6,
  TIMEZONE: 'Africa/Abidjan',
  WEBHOOK_KEY: 'dbai_security_2026_q2',
  // Délai de grâce : on envoie pour les articles publiés jusqu'à X jours en arrière
  DELAI_GRACE_JOURS: 5
};

// ═══════════════════════════════════════════════════════════
// 🚀 DÉCLENCHEUR AUTOMATIQUE — Installe le timer toutes les 6h
// ═══════════════════════════════════════════════════════════

function installerDeclencheurAutomatique() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('verifierNouveauxArticles')
           .timeBased()
           .everyHours(CONFIG.FREQUENCE_HEURES)
           .create();
  _initialiserJournal();
  Logger.log('✅ Déclencheur installé — vérification toutes les ' + CONFIG.FREQUENCE_HEURES + 'h.');
}

// ═══════════════════════════════════════════════════════════
// 🔍 VÉRIFICATION AUTOMATIQUE DES ARTICLES
// ► Appelée automatiquement par le déclencheur toutes les 6h
// ► Bug v3 corrigé : la déclaration de fonction manquait !
// ═══════════════════════════════════════════════════════════

function verifierNouveauxArticles() {

  // 1. Verrou anti-concurrence
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    Logger.log('🔒 Processus déjà en cours — abandon.');
    return;
  }

  // 2. Garde-fou journalier : un seul envoi par jour
  const proprietes = PropertiesService.getScriptProperties();
  const maintenant = new Date();
  const aujourdhuiStr = Utilities.formatDate(maintenant, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  if (ArticleSentToday(aujourdhuiStr)) {
    Logger.log('✅ Une newsletter a déjà été envoyée aujourd\'hui (' + aujourdhuiStr + ').');
    lock.releaseLock();
    return;
  }

  Logger.log('🔍 Vérification des articles pour le ' + aujourdhuiStr + '...');

  // 3. Charger articles-config.json depuis le site
  let configData;
  try {
    const response = UrlFetchApp.fetch(CONFIG.URL_CONFIG_ARTICLES + '?t=' + Date.now());
    configData = JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('❌ Impossible de charger articles-config.json : ' + e.message);
    lock.releaseLock();
    return;
  }

  const articles = (configData.articles || [])
    .filter(a => a.date_publication)
    .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication)); // Plus récent en premier

  const aujourd_hui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());

  for (const article of articles) {

    // Déjà envoyé ?
    if (article.newsletter_envoyee === true || _articleDejaEnvoye(article.id)) {
      continue;
    }

    const parts = article.date_publication.split('-');
    if (parts.length !== 3) continue;

    const datePub = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    // Article dans le futur → on attend
    if (datePub > aujourd_hui) {
      Logger.log('⏳ ' + article.id + ' (' + article.date_publication + ') est dans le futur — ignoré.');
      continue;
    }

    // Article trop vieux (plus de DELAI_GRACE_JOURS jours) → on évite le spam d'historique
    const diffJours = (aujourd_hui.getTime() - datePub.getTime()) / (1000 * 3600 * 24);
    if (diffJours > CONFIG.DELAI_GRACE_JOURS) {
      Logger.log('⚠️ ' + article.id + ' (' + article.date_publication + ') trop ancien (' + Math.floor(diffJours) + 'j) — ignoré.');
      continue;
    }

    // Tout est bon — on envoie !
    Logger.log('🚀 ENVOI NEWSLETTER pour : ' + article.id + ' — ' + article.titre);
    const succes = _envoyerNewsletterPourArticle(article, configData.blog);

    if (succes) {
      proprietes.setProperty('DATE_DERNIER_ENVOI', aujourdhuiStr);
      Logger.log('✅ Envoi terminé. Verrou journalier activé.');
    }

    lock.releaseLock();
    return; // Un seul article par cycle
  }

  Logger.log('ℹ️ Aucun article à envoyer aujourd\'hui.');
  lock.releaseLock();
}

// ═══════════════════════════════════════════════════════════
// 📧 ENVOI MANUEL — Ignorer toutes les gardes, envoyer immédiatement
// Pour déclencher manuellement : appeler envoyerMaintenant() depuis l'éditeur
// OU appeler envoyerManuelParId('article-037')
// ═══════════════════════════════════════════════════════════

function envoyerMaintenant() {
  // Envoie la newsletter pour le tout dernier article publié, sans tenir compte des gardes
  let configData;
  try {
    const response = UrlFetchApp.fetch(CONFIG.URL_CONFIG_ARTICLES + '?t=' + Date.now());
    configData = JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('❌ Impossible de charger la config : ' + e.message);
    return;
  }

  const articles = (configData.articles || [])
    .filter(a => a.date_publication && !a.newsletter_envoyee && !_articleDejaEnvoye(a.id))
    .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));

  if (articles.length === 0) {
    Logger.log('ℹ️ Tous les articles ont déjà une newsletter envoyée.');
    return;
  }

  const article = articles[0];
  Logger.log('📧 Envoi MANUEL pour : ' + article.id + ' — ' + article.titre);
  _envoyerNewsletterPourArticle(article, configData.blog);
}

function envoyerManuelParId(articleId) {
  // Envoie pour un article spécifique (ex: envoyerManuelParId('article-037'))
  let configData;
  try {
    const response = UrlFetchApp.fetch(CONFIG.URL_CONFIG_ARTICLES + '?t=' + Date.now());
    configData = JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('❌ Impossible de charger la config : ' + e.message);
    return;
  }

  const article = (configData.articles || []).find(a => a.id === articleId);
  if (!article) {
    Logger.log('❌ Article introuvable : ' + articleId);
    return;
  }

  Logger.log('📧 Envoi MANUEL pour : ' + article.id + ' — ' + article.titre);
  _envoyerNewsletterPourArticle(article, configData.blog);
}

// ═══════════════════════════════════════════════════════════
// 🛡️ WEBHOOK sécurisé (appel GET depuis publish_article.js)
// URL : ?key=dbai_security_2026_q2
// ═══════════════════════════════════════════════════════════

function doGet(e) {
  const key = e.parameter && e.parameter.key;
  if (key !== CONFIG.WEBHOOK_KEY) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Clé de sécurité invalide.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    verifierNouveauxArticles();
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Vérification lancée.' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ═══════════════════════════════════════════════════════════
// 🛡️ WEBHOOK POST (inscription newsletter depuis le formulaire)
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const data = JSON.parse(e.postData.contents);
    const prenom = (data.prenom || '').trim() || 'Ami(e)';
    const email = (data.email || '').toLowerCase().trim();
    const domaine = email.split('@')[1] || '';

    const domainesBlacklist = ['yopmail.com', 'temp-mail.org', '10minutemail.com', 'mailinator.com',
                               'guerrillamail.com', 'throwawaymail.com', 'mohmal.com'];

    if (!email || !email.includes('@') || domainesBlacklist.includes(domaine)) {
      lock.releaseLock();
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Email invalide.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.FEUILLE_ABONNES);
    sheet.appendRow([new Date().toLocaleString('fr-FR'), prenom, email]);

    _envoyerCadeauBienvenue(email, prenom);
    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ═══════════════════════════════════════════════════════════
// 📨 EMAIL DE BIENVENUE (nouvel abonné)
// ═══════════════════════════════════════════════════════════

function _envoyerCadeauBienvenue(email, prenom) {
  try {
    GmailApp.sendEmail(email, '🎁 Ton cadeau : 10 Prompts IA Indispensables', '', {
      htmlBody: _genererHTMLBienvenue(prenom),
      name: CONFIG.NOM_EXPEDITEUR,
      replyTo: CONFIG.EMAIL_REPONDRE
    });
    Logger.log('✅ Email de bienvenue envoyé à : ' + email);
  } catch (e) {
    Logger.log('❌ Erreur bienvenue (' + email + ') : ' + e.message);
  }
}

function _genererHTMLBienvenue(prenom) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#0D1117;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#FAFAF7;letter-spacing:-0.5px;">⚡DigitalBoost <span style="color:#C9A84C;">AI</span></p>
          <p style="margin:6px 0 0;font-size:11px;color:rgba(250,250,247,0.5);letter-spacing:2px;text-transform:uppercase;">Bienvenue dans la communauté !</p>
        </td>
      </tr>
      <tr>
        <td style="background:#FFFFFF;padding:40px;">
          <p style="margin:0 0 20px;font-size:17px;color:#0D1117;">Bonjour <strong>${prenom}</strong> 👋</p>
          <p style="margin:0 0 20px;font-size:15px;color:#2D3139;line-height:1.7;">
            Bienvenue dans la famille DigitalBoost AI ! Tu as bien fait de t'inscrire.<br><br>
            Voici ton cadeau : <strong>les 10 Prompts IA Indispensables</strong> que j'utilise chaque jour pour travailler 4× moins tout en produisant plus.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr>
              <td style="background:#C9A84C;border-radius:100px;">
                <a href="https://digitalboostai.tech/Guide_Gratuit_10_Prompts.pdf" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0D1117;text-decoration:none;">
                  📥 Télécharger mon guide gratuit →
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#6B7280;line-height:1.6;">
            Tu recevras nos meilleurs articles sur l'IA pour entrepreneurs directement dans ta boîte email.<br><br>
            À très bientôt,<br><strong style="color:#0D1117;">L'équipe DigitalBoost AI ⚡</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#F8F8F5;border-top:1px solid #E5E2D9;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">© 2026 DigitalBoost AI — <a href="https://digitalboostai.tech" style="color:#C9A84C;">digitalboostai.tech</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// 📧 ENVOI DE LA NEWSLETTER POUR UN ARTICLE
// ═══════════════════════════════════════════════════════════

function _envoyerNewsletterPourArticle(article, blogConfig) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const feuille = ss.getSheetByName(CONFIG.FEUILLE_ABONNES);
  const data = feuille.getDataRange().getValues();

  let envoyes = 0;
  let erreurs = 0;

  for (let i = CONFIG.PREMIERE_LIGNE - 1; i < data.length; i++) {
    const email = String(data[i][CONFIG.COL_EMAIL - 1] || '').trim();
    const prenom = String(data[i][CONFIG.COL_PRENOM - 1] || 'ami(e)').trim();

    if (!email || !email.includes('@')) continue;

    try {
      MailApp.sendEmail({
        to: email,
        subject: article.emoji + ' ' + article.titre,
        htmlBody: _genererHTML(article, prenom, blogConfig),
        name: CONFIG.NOM_EXPEDITEUR
      });
      envoyes++;
      Utilities.sleep(200); // Évite les limites de débit Gmail
    } catch (e) {
      Logger.log('❌ Erreur envoi à ' + email + ' : ' + e.message);
      erreurs++;
    }
  }

  Logger.log('📊 Bilan : ' + envoyes + ' envoyés, ' + erreurs + ' erreurs.');
  _enregistrerEnvoi(article.id, article.titre, envoyes, erreurs);
  return envoyes > 0 || erreurs === 0;
}

// ═══════════════════════════════════════════════════════════
// 🎨 TEMPLATE HTML EMAIL NEWSLETTER
// ═══════════════════════════════════════════════════════════

function _genererHTML(article, prenom, blog) {
  const dateFormatee = _formaterDate(article.date_publication);
  const blogUrl = (blog && blog.base_url) ? blog.base_url : 'https://digitalboostai.tech';
  const blogArticlesUrl = (blog && blog.blog_url) ? blog.blog_url : 'https://digitalboostai.tech/blog';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.titre}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr>
        <td style="background:#0D1117;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#FAFAF7;letter-spacing:-0.5px;">
            ⚡DigitalBoost <span style="color:#C9A84C;">AI</span>
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:rgba(250,250,247,0.5);letter-spacing:2px;text-transform:uppercase;">
            📬 Nouvel Article Publié
          </p>
        </td>
      </tr>

      <!-- HERO CATÉGORIE -->
      <tr>
        <td style="background:linear-gradient(135deg,#0D1117 0%,#1a2d1a 100%);padding:48px 40px;text-align:center;border-left:4px solid #C9A84C;">
          <p style="margin:0 0 14px;font-size:52px;line-height:1;">${article.emoji}</p>
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;">
            ${article.categorie}
          </p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#FFFFFF;line-height:1.35;letter-spacing:-0.5px;">
            ${article.titre}
          </h1>
        </td>
      </tr>

      <!-- CORPS -->
      <tr>
        <td style="background:#FFFFFF;padding:40px;">

          <p style="margin:0 0 20px;font-size:17px;color:#0D1117;line-height:1.6;">
            Bonjour <strong>${prenom}</strong> 👋
          </p>

          <p style="margin:0 0 20px;font-size:15px;color:#2D3139;line-height:1.75;">
            Nous venons de publier un nouvel article sur le blog — et nous pensons qu'il va
            <strong>particulièrement vous intéresser</strong>&nbsp;!
          </p>

          <!-- CARD ARTICLE -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#F8F8F5;border:2px solid #E5E2D9;border-radius:14px;margin:28px 0;">
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C9A84C;">
                  ${article.emoji} ${article.categorie}
                </p>
                <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0D1117;line-height:1.35;">
                  ${article.titre}
                </p>
                <p style="margin:0 0 16px;font-size:12px;color:#6B7280;">
                  📅 ${dateFormatee} &nbsp;·&nbsp; ⏱️ ${article.temps_lecture}
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:#2D3139;line-height:1.7;">
                  ${article.excerpt}
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#0D1117;border-radius:100px;">
                      <a href="${article.url}"
                         style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                        Lire l'article complet →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- SÉPARATEUR -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-top:1px solid #E5E2D9;">&nbsp;</td></tr>
          </table>

          <!-- CTA PRODUITS -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#0D1117;border-radius:16px;">
            <tr>
              <td style="padding:32px;text-align:center;">
                <p style="margin:0 0 8px;font-size:17px;font-weight:900;color:#FAFAF7;">
                  🚀 Passez à l'action avec nos produits IA
                </p>
                <p style="margin:0 0 20px;font-size:14px;color:rgba(250,250,247,0.65);line-height:1.65;">
                  Prompts testés, guides stratégiques, templates pro — tout pour automatiser votre business.
                </p>
                <table cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    <td style="background:#C9A84C;border-radius:100px;">
                      <a href="${blogUrl}"
                         style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#0D1117;text-decoration:none;">
                        Découvrir nos produits IA →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:32px 0 0;font-size:14px;color:#2D3139;line-height:1.7;">
            Merci de faire partie de notre communauté DigitalBoost AI 🙏<br>
            On continue de vous apporter le meilleur de l'IA chaque semaine.
          </p>
          <p style="margin:14px 0 0;font-size:14px;color:#0D1117;font-weight:700;">
            L'équipe DigitalBoost AI &#9889;
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#F8F8F5;border-top:1px solid #E5E2D9;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
            Vous recevez cet email car vous êtes abonné(e) à la newsletter
            <a href="${blogUrl}" style="color:#C9A84C;text-decoration:none;">DigitalBoost AI</a>.
          </p>
          <p style="margin:0;font-size:11px;color:#9CA3AF;">
            © 2026 DigitalBoost AI · Tous droits réservés
            &nbsp;·&nbsp;
            <a href="${blogArticlesUrl}" style="color:#9CA3AF;text-decoration:none;">Voir tous les articles</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// 🛠️ FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

function _formaterDate(dateStr) {
  const mois = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
                'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
  try {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) {
    return dateStr;
  }
}

function _initialiserJournal() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  if (!ss.getSheetByName(CONFIG.FEUILLE_JOURNAL)) {
    const sheet = ss.insertSheet(CONFIG.FEUILLE_JOURNAL);
    sheet.appendRow(['ID Article', 'Titre', 'Date Envoi', 'Nb Envoyés', 'Nb Erreurs']);
    Logger.log('✅ Feuille Journal_Newsletters créée.');
  }
}

function _articleDejaEnvoye(articleId) {
  try {
    const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
    if (!journal) return false;
    const data = journal.getDataRange().getValues();
    return data.slice(1).some(r => r[0] === articleId);
  } catch (e) {
    return false;
  }
}

function _enregistrerEnvoi(id, titre, envoyes, erreurs) {
  try {
    const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
    if (!journal) return;
    journal.appendRow([id, titre, new Date(), envoyes, erreurs]);
  } catch (e) {
    Logger.log('❌ Erreur enregistrement journal : ' + e.message);
  }
}

function ArticleSentToday(dateStr) {
  // Vérifie via Properties (rapide)
  const props = PropertiesService.getScriptProperties().getProperty('DATE_DERNIER_ENVOI');
  if (props === dateStr) return true;

  // Vérifie via Journal Sheet (sécurité croisée)
  try {
    const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
    if (!journal) return false;
    const data = journal.getDataRange().getValues();
    return data.slice(1).some(r => {
      if (r[2] instanceof Date) {
        return Utilities.formatDate(r[2], CONFIG.TIMEZONE, 'yyyy-MM-dd') === dateStr;
      }
      return false;
    });
  } catch (e) {
    return false;
  }
}
