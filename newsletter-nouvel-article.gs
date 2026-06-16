  /**
  * ╔══════════════════════════════════════════════════════════════════════╗
  * ║  DIGITALBOOST AI — NEWSLETTER AUTOMATIQUE                           ║
  * ║  Détecte les nouveaux articles et informe les abonnés               ║
  * ║  Version: 3.0 — Automatique avec Webhook (doGet)                    ║
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
    WEBHOOK_KEY: 'dbai_security_2026_q2' // À protéger !
  };

  // ═══════════════════════════════════════════════════════════
  // 🛡️ API WEBHOOK (Admission des abonnés)
  // ═══════════════════════════════════════════════════════════
  
  function doPost(e) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      const data = JSON.parse(e.postData.contents);
      const prenom = data.prenom ? data.prenom.trim() : "Anonyme";
      const email = data.email ? data.email.toLowerCase().trim() : "";
      const domaine = email.split('@')[1];
      const domainesArnaque = ['yopmail.com', 'temp-mail.org', '10minutemail.com']; 
      
      if (!email || !email.includes('@') || domainesArnaque.includes(domaine)) {
        lock.releaseLock();
        return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Email invalide."}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.FEUILLE_ABONNES);
      sheet.appendRow([new Date().toLocaleString('fr-FR'), prenom, email]);
      _envoyerCadeauBienvenue(email, prenom);
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.message}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }

  function _envoyerCadeauBienvenue(email, prenom) {
    try {
      const subject = "🎁 Ton cadeau : 10 Prompts IA Indispensables";
      const htmlBody = _genererHTMLBienvenue(prenom);
      GmailApp.sendEmail(email, subject, "", {
        htmlBody: htmlBody,
        name: CONFIG.NOM_EXPEDITEUR,
        replyTo: CONFIG.EMAIL_REPONDRE
      });
    } catch (e) { console.error(e.message); }
  }

  function _genererHTMLBienvenue(prenom) {
    return `<html><body><h1>Bienvenue ${prenom}</h1><p>Merci de nous rejoindre !</p></body></html>`; // Version simplifiée pour la restauration
  }

  // ═══════════════════════════════════════════════════════════
  // 🚀 INITIALISATION & DÉCLENCHEURS (Vérification des articles)
  // ═══════════════════════════════════════════════════════════

  function installerDeclencheurAutomatique() {
    ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
    ScriptApp.newTrigger('verifierNouveauxArticles').timeBased().everyHours(CONFIG.FREQUENCE_HEURES).create();
    _initialiserJournal();
  }

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000); // Augmenté à 15s
    } catch (e) {
      Logger.log('🔒 Processus déjà en cours (Verrou).');
      return;
    }

    // ⛔ 2. Garde-fou journalier (ATTENTION : Placé SOUS le verrou)
    const proprietes = PropertiesService.getScriptProperties();
    const maintenant = new Date();
    const aujourdhuiStr = Utilities.formatDate(maintenant, CONFIG.TIMEZONE || Session.getScriptTimeZone(), "yyyy-MM-dd");
    const dernierEnvoi = ArticleSentToday(aujourdhuiStr); // Vérification croisée (Props + Journal)

    if (dernierEnvoi) {
      Logger.log('✅ Limite de sécurité atteinte : Une newsletter a déjà été envoyée aujourd\'hui (' + aujourdhuiStr + ').');
      lock.releaseLock();
      return;
    }

    Logger.log('🔍 Début de la vérification des articles pour le ' + aujourdhuiStr + '...');
    
    let configData;
    try {
      const response = UrlFetchApp.fetch(CONFIG.URL_CONFIG_ARTICLES + "?t=" + new Date().getTime()); // Anti-cache
      configData = JSON.parse(response.getContentText());
    } catch (e) { 
      Logger.log('❌ Erreur de récupération du config.json');
      lock.releaseLock();
      return; 
    }

    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    Logger.log('📅 Date de référence (aujourd\'hui local) : ' + aujourdhuiStr);

    const articles = configData.articles || [];
    
    // Trier par date pour s'assurer de traiter les plus anciens d'abord
    articles.sort((a,b) => new Date(a.date_publication) - new Date(b.date_publication));

    for (const article of articles) {
      if (!article.date_publication) continue;
      
      const dParts = article.date_publication.split('-');
      if (dParts.length !== 3) {
        Logger.log('⚠️ Format de date invalide pour ' + article.id);
        continue;
      }
      
      const datePub = new Date(dParts[0], dParts[1]-1, dParts[2]);

      // 🛡️ 3. TRAVAIL DE FOND : Cohérence Éditoriale
      // Les articles doivent être publiés uniquement les Mercredis (3) ou Dimanches (0)
      const jourSemaine = datePub.getDay();
      if (jourSemaine !== 0 && jourSemaine !== 3) {
        Logger.log('⚠️ INCOHÉRENCE ÉDITORIALE : ' + article.id + ' est programmé le jour ' + jourSemaine + ' (pas un Mercredi ni un Dimanche). Ignoré.');
        continue;
      }

      if (article.newsletter_envoyee === true || _articleDejaEnvoye(article.id)) {
        continue; // L'article a déjà été traité
      }

      // 📅 4. Alignement Absolu & Garde-fou de Récence
      // On ne part que si la date du jour est AU MOINS ÉGALE à la date prévue.
      if (datePub > aujourdhui) {
        Logger.log('⏳ Article ' + article.id + ' en attente. Prévu le ' + article.date_publication);
        continue;
      }

      // SÉCURITÉ : On ignore les articles qui ont plus de 3 jours de retard (évite le spam d'historique)
      const diffTemps = aujourdhui.getTime() - datePub.getTime();
      const diffJours = diffTemps / (1000 * 3600 * 24);
      if (diffJours > 2) {
        Logger.log('⚠️ Article ' + article.id + ' trop ancien (' + Math.floor(diffJours) + ' jours). Distribution ignorée par sécurité.');
        continue;
      }

      // 🚀 Tout est cohérent : on envoie
      Logger.log('🚀 DÉCLENCHEMENT NEWSLETTER : ' + article.id);
      const succed = _envoyerNewsletterPourArticle(article, configData.blog);
      
      if (succed) {
        // On verrouille la journée entière pour éviter les envois par paquets
        proprietes.setProperty('DATE_DERNIER_ENVOI', aujourdhuiStr);
        Logger.log('✅ Envoi réussi. La distribution est verrouillée pour le reste de la journée.');
      }
      
      lock.releaseLock();
      return; // SÉCURITÉ ABSOLUE : Un seul article par cycle.
    }
    
    Logger.log('🏁 Fin de vérification : Aucun article cohérent n\'est arrivé à échéance.');
    lock.releaseLock();
  }

  function _envoyerNewsletterPourArticle(article, blogConfig) {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const feuille = ss.getSheetByName(CONFIG.FEUILLE_ABONNES);
    const data = feuille.getDataRange().getValues();
    let envoyes = 0;

    for (let i = CONFIG.PREMIERE_LIGNE - 1; i < data.length; i++) {
      const email = data[i][CONFIG.COL_EMAIL - 1];
      const prenom = data[i][CONFIG.COL_PRENOM - 1] || 'ami(e)';
      if (email && email.includes('@')) {
        try {
          MailApp.sendEmail({
            to: email,
            subject: article.emoji + ' ' + article.titre,
            htmlBody: _genererHTML(article, prenom, blogConfig),
            name: CONFIG.NOM_EXPEDITEUR
          });
          envoyes++;
        } catch (e) {
          Logger.log('❌ Erreur envoi à ' + email);
        }
      }
    }
    _enregistrerEnvoi(article.id, article.titre, envoyes, 0);
    return true;
  }

  function _genererHTML(article, prenom, blog) {
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#003087 0%,#1A4B9E 60%,#C9A84C 100%);padding:48px 40px;text-align:center;">
            <p style="margin:0 0 14px;font-size:52px;line-height:1;">${article.emoji}</p>
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);">
              ${article.categorie}
            </p>
            <h1 style="margin:0;font-size:22px;font-weight:900;color:#FFFFFF;line-height:1.3;letter-spacing:-0.5px;">
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

            <p style="margin:0 0 20px;font-size:16px;color:#2D3139;line-height:1.7;">
              Nous venons de publier un nouvel article sur notre blog — et nous pensons qu'il va <strong>particulièrement vous intéresser</strong> !
            </p>

            <!-- Card article -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F5;border:2px solid #E5E2D9;border-radius:12px;margin:28px 0;">
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C9A84C;">
                    ${article.emoji} ${article.categorie}
                  </p>
                  <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0D1117;line-height:1.35;">
                    ${article.titre}
                  </p>
                  <p style="margin:0 0 16px;font-size:13px;color:#6B7280;">
                    📅 ${_formaterDate(article.date_publication)} &nbsp;·&nbsp; ⏱️ ${article.temps_lecture}
                  </p>
                  <p style="margin:0 0 24px;font-size:15px;color:#2D3139;line-height:1.65;">
                    ${article.excerpt}
                  </p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#0D1117;border-radius:100px;">
                        <a href="${article.url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                          Lire l'article complet →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Séparateur -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
              <tr><td style="border-top:1px solid #E5E2D9;">&nbsp;</td></tr>
            </table>

            <!-- CTA produit -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:16px;">
              <tr>
                <td style="padding:32px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:17px;font-weight:900;color:#FAFAF7;">
                    🚀 Passez à l'action dès aujourd'hui !
                  </p>
                  <p style="margin:0 0 20px;font-size:14px;color:rgba(250,250,247,0.65);line-height:1.6;">
                    Maîtrisez l'IA avec nos ressources premium — prompts testés, guides stratégiques et bien plus.
                  </p>
                  <table cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td style="background:#C9A84C;border-radius:100px;">
                        <a href="${blog.base_url}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#0D1117;text-decoration:none;">
                          Découvrir nos produits IA →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:32px 0 0;font-size:15px;color:#2D3139;line-height:1.7;">
              Merci de faire partie de notre communauté DigitalBoost AI ! 🙏<br>
              On continue de vous apporter le meilleur de l'IA chaque semaine.
            </p>
            <p style="margin:14px 0 0;font-size:15px;color:#0D1117;font-weight:600;">
              L'équipe DigitalBoost AI &#9889;
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8F8F5;border-top:1px solid #E5E2D9;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
              Vous recevez cet email car vous êtes abonné(e) à la newsletter
              <a href="${blog.base_url}" style="color:#C9A84C;text-decoration:none;">DigitalBoost AI</a>.
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 DigitalBoost AI — Tous droits réservés
              &nbsp;·&nbsp;
              <a href="${blog.blog_url}" style="color:#9CA3AF;">Voir tous les articles</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
  </body>
  </html>`;
  }

  function _formaterDate(dateStr) {
    const mois = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
  }

  function _initialiserJournal() {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    if (!ss.getSheetByName(CONFIG.FEUILLE_JOURNAL)) {
      ss.insertSheet(CONFIG.FEUILLE_JOURNAL).appendRow(['ID', 'Titre', 'Date', 'Envoyés', 'Erreurs']);
    }
  }

  function _articleDejaEnvoye(id) {
    const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
    const data = journal.getDataRange().getValues();
    return data.some(r => r[0] === id);
  }

  function _enregistrerEnvoi(id, titre, n, err) {
    const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
    journal.appendRow([id, titre, new Date(), n, err]);
  }

  /**
   * 🌐 WEBHOOK : Déclenchement immédiat (Sécurisé par clé)
   */
  function doGet(e) {
    const key = e.parameter.key;
    if (key !== CONFIG.WEBHOOK_KEY) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Clé de sécurité invalide."}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    try {
      verifierNouveauxArticles();
      return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                           .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.message}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }

  /**
   * 🛡️ Double vérification (Props + Journal)
   */
  function ArticleSentToday(dateStr) {
    const props = PropertiesService.getScriptProperties().getProperty('DATE_DERNIER_ENVOI');
    if (props === dateStr) return true;

    try {
      const journal = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.FEUILLE_JOURNAL);
      const data = journal.getDataRange().getValues();
      const formatJournal = "yyyy-MM-dd";
      
      return data.some(r => {
        if (r[2] instanceof Date) {
          return Utilities.formatDate(r[2], CONFIG.TIMEZONE || Session.getScriptTimeZone(), formatJournal) === dateStr;
        }
        return false;
      });
    } catch (e) { return false; }
  }
