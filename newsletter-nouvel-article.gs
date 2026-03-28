  /**
  * ╔══════════════════════════════════════════════════════════════════════╗
  * ║  DIGITALBOOST AI — NEWSLETTER AUTOMATIQUE                           ║
  * ║  Détecte les nouveaux articles et informe les abonnés               ║
  * ║  Version: 2.0 — Automatique avec déclencheur temporel             ║
  * ╚══════════════════════════════════════════════════════════════════════╝
  *
  * 📌 INSTRUCTIONS D'INSTALLATION (une seule fois) :
  * ─────────────────────────────────────────────────
  * 1. Ouvrez votre Google Sheet des abonnés
  * 2. Extensions → Apps Script
  * 3. Collez ce script complet
  * 4. Remplissez la section CONFIG ci-dessous
  * 5. Exécutez d'abord : installerDeclencheurAutomatique()
  * 6. Autorisez les permissions demandées
  * 7. C'est tout ! Le script tourne maintenant automatiquement.
  */

  // ═══════════════════════════════════════════════════════════
  // 🔧 CONFIGURATION — REMPLIR UNE SEULE FOIS
  // ═══════════════════════════════════════════════════════════

  const CONFIG = {

    // 📋 GOOGLE SHEET DES ABONNÉS
    // ID rétabli
    SHEET_ID: '1dB2PqGI9kx5tbXv5lAoDk5_fLHqzrDMBe8VdX80vJvo', 

    // Nom exact affiché dans vos onglets
    FEUILLE_ABONNES: 'Réponses au formulaire 1',

    // Journal des envois
    FEUILLE_JOURNAL: 'Journal_Newsletters',

    // Colonnes (1=A, 2=B, 3=C...). 
    // Email en colonne C (3)
    COL_EMAIL: 3, 
    COL_PRENOM: 2, 
    PREMIERE_LIGNE: 2, // Ignorer les en-têtes

    // 📧 PARAMÈTRES EMAIL
    NOM_EXPEDITEUR: 'DigitalBoost AI',
    EMAIL_REPONDRE: 'noreply@digitalboostai.com',

    // 🔗 URL du fichier de config des articles (sur Vercel)
    URL_CONFIG_ARTICLES: 'https://digitalboostai.vercel.app/articles-config.json',

    // ⏱ Fréquence de vérification (en heures)
    // 6 = vérification 4 fois par jour
    FREQUENCE_HEURES: 6,
  };


  // ═══════════════════════════════════════════════════════════
  // 🛡️ API WEBHOOK — SÉCURITÉ ANTI-SPAM (REMPLACE GOOGLE FORMS)
  // ═══════════════════════════════════════════════════════════
  // Déployez ce script en tant "qu'Application Web" pour générer une URL sécurisée
  // Mettez cette URL dans "index.html" au lieu de "https://docs.google.com/forms..."
  
  function doPost(e) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000); // Évite les collisions si 10 personnes s'inscrivent en même temps

      // Extraction des données POSTées depuis le nouveau script Frontend (index.html)
      const data = JSON.parse(e.postData.contents);
      const prenom = data.prenom ? data.prenom.trim() : "Anonyme";
      const email = data.email ? data.email.toLowerCase().trim() : "";
      const domaine = email.split('@')[1];

      // 1. Double check anti-spam SERVEUR
      const domainesArnaque = ['mailna.co', 'mailna.me', 'mailna.in', 'mohmal.com', 'mohmal.in', 'yopmail.com', 'cleantempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com', 'simplelogin.io', 'emailondeck.com', 'mailinator.com', 'tempmail.plus', 'throwawaymail.com']; 
      
      if (!email || !email.includes('@') || domainesArnaque.includes(domaine)) {
        lock.releaseLock();
        return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Email invalide ou temporaire bloqué."}))
                             .setMimeType(ContentService.MimeType.JSON);
      }

      // 2. Enregistrement
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.FEUILLE_ABONNES);
      const rowData = [new Date().toLocaleString('fr-FR'), prenom, email];
      sheet.appendRow(rowData);

      // 3. Envoi de l'email de bienvenue avec le cadeau (PDF)
      _envoyerCadeauBienvenue(email, prenom);

      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Abonnement réussi !"}))
                           .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.message}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }

  /**
   * Fonction interne pour envoyer le mail de bienvenue et le PDF
   */
  function _envoyerCadeauBienvenue(email, prenom) {
    try {
      const subject = "&#127873; Ton cadeau : 10 Prompts IA Indispensables";
      const htmlBody = _genererHTMLBienvenue(prenom);

      const pdfUrl = "https://digitalboostai.vercel.app/Guide_Gratuit_10_Prompts.pdf";
      
      let attachments = [];
      try {
        const pdfResponse = UrlFetchApp.fetch(pdfUrl, { muteHttpExceptions: true });
        if (pdfResponse.getResponseCode() === 200) {
          const pdfBlob = pdfResponse.getBlob().setName("Guide_Gratuit_10_Prompts.pdf");
          attachments = [pdfBlob];
        } else {
          console.warn("Échec du téléchargement du PDF. Code réponse : " + pdfResponse.getResponseCode());
        }
      } catch (fetchError) {
        console.error("Erreur Fetch PDF : " + fetchError.message);
      }

      GmailApp.sendEmail(email, subject, "", {
        htmlBody: htmlBody,
        name: CONFIG.NOM_EXPEDITEUR,
        replyTo: CONFIG.EMAIL_REPONDRE,
        attachments: attachments
      });
      
      console.log("Email de bienvenue envoyé à : " + email + (attachments.length > 0 ? " (avec PDF)" : " (SANS PDF)"));
    } catch (e) {
      console.error("Erreur envoi email : " + e.message);
    }
  }

  /**
   * 🎨 TEMPLATE HTML EMAIL BIENVENUE & CADEAU
   */
  function _genererHTMLBienvenue(prenom) {
    const baseUrl = "https://digitalboostai.vercel.app";
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
              &#9889;DigitalBoost <span style="color:#C9A84C;">AI</span>
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:rgba(250,250,247,0.5);letter-spacing:2px;text-transform:uppercase;">
              &#127873; Bienvenue & Cadeau Gratuit
            </p>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A6B3C 0%,#0F4D28 60%,#C9A84C 100%);padding:48px 40px;text-align:center;">
            <p style="margin:0 0 14px;font-size:52px;line-height:1;">&#127873;</p>
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);">
              Accès Immédiat
            </p>
            <h1 style="margin:0;font-size:24px;font-weight:900;color:#FFFFFF;line-height:1.3;letter-spacing:-0.5px;">
              Bravo ! Voici vos 10 Prompts IA Indispensables
            </h1>
          </td>
        </tr>

        <!-- CORPS -->
        <tr>
          <td style="background:#FFFFFF;padding:40px;">

            <p style="margin:0 0 20px;font-size:17px;color:#0D1117;line-height:1.6;">
              Bonjour <strong>${prenom}</strong> &#128075;
            </p>

            <p style="margin:0 0 20px;font-size:16px;color:#2D3139;line-height:1.7;">
              Merci de rejoindre la communauté <strong>DigitalBoost AI</strong> ! On est ravis de t'aider à dominer l'IA.
            </p>
            
            <p style="margin:0 0 20px;font-size:16px;color:#2D3139;line-height:1.7;">
              Comme promis, voici ton guide contenant les mêmes prompts que j'utilise chaque jour pour travailler 4× moins.
            </p>

            <!-- Card Cadeau -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F5;border:2px solid #E5E2D9;border-radius:12px;margin:28px 0;">
              <tr>
                <td style="padding:28px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C9A84C;">
                    &#128194; Fichier à Télécharger
                  </p>
                  <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0D1117;line-height:1.35;">
                    Guide Complet : 10 Prompts IA Indispensables
                  </p>
                  <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.65;">
                    Ce PDF contient les structures exactes pour ChatGPT, Claude et Gemini. Copiez, collez, progressez.
                  </p>
                  <table cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td style="background:#0D1117;border-radius:100px;">
                        <a href="${baseUrl}/Guide_Gratuit_10_Prompts.pdf" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                          &#128229; Télécharger le Guide (PDF)
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">
                    (Le fichier est également joint à cet email)
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;font-size:16px;color:#2D3139;line-height:1.7;">
              <strong>Que faire maintenant ?</strong><br>
              Chaque semaine, je t'enverrai un nouveau workflow ou une astuce concrète directement dans ta boîte mail. Reste attentif(ve) !
            </p>

            <!-- Séparateur -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
              <tr><td style="border-top:1px solid #E5E2D9;">&nbsp;</td></tr>
            </table>

            <!-- CTA produit -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:16px;">
              <tr>
                <td style="padding:32px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:17px;font-weight:900;color:#FAFAF7;">
                    &#128640; Prêt(e) à passer au niveau supérieur ?
                  </p>
                  <p style="margin:0 0 20px;font-size:14px;color:rgba(250,250,247,0.65);line-height:1.6;">
                    Découvre notre Pack Complet : 100+ Prompts Premium, eBook Stratégique et Templates Professionnels.
                  </p>
                  <table cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td style="background:#C9A84C;border-radius:100px;">
                        <a href="${baseUrl}/#pricing" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#0D1117;text-decoration:none;">
                          Voir l'offre exclusive →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:32px 0 0;font-size:15px;color:#2D3139;line-height:1.7;">
              À très vite,<br>
              <strong>L'équipe DigitalBoost AI &#9889;</strong>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8F8F5;border-top:1px solid #E5E2D9;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
              © 2026 DigitalBoost AI — Tous droits réservés
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              <a href="${baseUrl}" style="color:#9CA3AF;">Site Officiel</a> &nbsp;·&nbsp;
              <a href="${baseUrl}/blog.html" style="color:#9CA3AF;">Blog</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
  </body>
  </html>`;
  }

  /**
   * Déclencheur automatique quand une ligne est ajoutée au Google Sheet (via Google Form)
   * ⚠️ Nécessite d'installer un déclencheur "Au moment de l'envoi du formulaire" dans l'interface Apps Script
   */
  function onFormSubmit(e) {
    try {
      if (!e || !e.values) return;
      
      // Récupération des données du formulaire (B=Prenom, C=Email selon CONFIG)
      const prenom = e.values[CONFIG.COL_PRENOM - 1] || "Ami(e)";
      const email = e.values[CONFIG.COL_EMAIL - 1] || "";
      
      if (email && email.includes("@")) {
        _envoyerCadeauBienvenue(email, prenom);
      }
    } catch (err) {
      console.error("Erreur onFormSubmit : " + err.message);
    }
  }


  // ═══════════════════════════════════════════════════════════
  // &#128640; ÉTAPE 1 : INSTALLER LE DÉCLENCHEUR (exécuter UNE FOIS)
  // ═══════════════════════════════════════════════════════════

  function installerDeclencheurAutomatique() {
    // Supprimer d'abord les anciens déclencheurs
    ScriptApp.getProjectTriggers().forEach(trigger => {
      const func = trigger.getHandlerFunction();
      if (func === 'verifierNouveauxArticles' || func === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
      }
    });

    // 1. Déclencheur temporel (Vérifier nouveaux articles)
    ScriptApp.newTrigger('verifierNouveauxArticles')
      .timeBased()
      .everyHours(CONFIG.FREQUENCE_HEURES)
      .create();

    // 2. Déclencheur sur envoi de formulaire (Pour envoyer le PDF)
    // On essaie de l'attacher à la feuille active pour automatisation
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(sheet)
        .onFormSubmit()
        .create();
      Logger.log('&#9989; Déclencheur onFormSubmit installé !');
    } catch (e) {
      Logger.log('⚠️ Impossible d\'installer le déclencheur Form : ' + e.message);
    }

    // Créer le journal si inexistant
    _initialiserJournal();

    Logger.log('&#9989; Installation terminée !');
    Logger.log('&#128197; Vérification toutes les ' + CONFIG.FREQUENCE_HEURES + ' heures.');
    Logger.log('📖 Prochaine vérification dans ' + CONFIG.FREQUENCE_HEURES + 'h.');
  }


  // ═══════════════════════════════════════════════════════════
  // 🔍 DÉTECTEUR DE NOUVEAUX ARTICLES (s'exécute automatiquement)
  // ═══════════════════════════════════════════════════════════

  function verifierNouveauxArticles() {
    Logger.log('🔍 Vérification des nouveaux articles — ' + new Date().toLocaleString('fr-FR'));

    // 1. Récupérer la config des articles depuis Vercel
    let configData;
    try {
      const response = UrlFetchApp.fetch(CONFIG.URL_CONFIG_ARTICLES, {
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) {
        Logger.log('❌ Impossible de récupérer articles-config.json (code: ' + response.getResponseCode() + ')');
        return;
      }

      configData = JSON.parse(response.getContentText());
    } catch (e) {
      Logger.log('❌ Erreur de chargement : ' + e.message);
      return;
    }

    const articles = configData.articles || [];
    const articlesNouveaux = [];

    // 2. Filtrer les articles non encore envoyés
    for (const article of articles) {
      if (article.newsletter_envoyee === false) {
        // Vérifier aussi dans le journal local (double sécurité)
        if (!_articleDejaEnvoye(article.id)) {
          articlesNouveaux.push(article);
          Logger.log('📰 Nouvel article détecté : ' + article.titre);
        }
      }
    }

    if (articlesNouveaux.length === 0) {
      Logger.log('&#9989; Aucun nouvel article à envoyer. Tout est à jour.');
      return;
    }

    // 3. Pour chaque nouvel article, envoyer la newsletter
    for (const article of articlesNouveaux) {
      Logger.log('📧 Envoi de la newsletter pour : ' + article.titre);
      _envoyerNewsletterPourArticle(article, configData.blog);
    }
  }


  // ═══════════════════════════════════════════════════════════
  // 📧 ENVOI DE LA NEWSLETTER POUR UN ARTICLE
  // ═══════════════════════════════════════════════════════════

  function _envoyerNewsletterPourArticle(article, blogConfig) {
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    } catch (e) {
      Logger.log('❌ Impossible d\'ouvrir le Google Sheet : ' + e.message);
      return;
    }

    const feuille = spreadsheet.getSheetByName(CONFIG.FEUILLE_ABONNES);
    if (!feuille) {
      Logger.log('❌ Onglet "' + CONFIG.FEUILLE_ABONNES + '" introuvable.');
      return;
    }

    const derniereIigne = feuille.getLastRow();
    if (derniereIigne < CONFIG.PREMIERE_LIGNE) {
      Logger.log('⚠️ Aucun abonné trouvé.');
      return;
    }

    let envoyes = 0;
    let erreurs = 0;
    let ignores = 0;

    for (let ligne = CONFIG.PREMIERE_LIGNE; ligne <= derniereIigne; ligne++) {
      const email = feuille.getRange(ligne, CONFIG.COL_EMAIL).getValue().toString().trim();
      
      Logger.log('Ligne ' + ligne + ' - Valeur lue dans Col ' + CONFIG.COL_EMAIL + ' : "' + email + '"');

      if (!email || !email.includes('@') || !email.includes('.')) {
        ignores++;
        continue;
      }

      let prenom = 'ami(e)';
      if (CONFIG.COL_PRENOM > 0) {
        const prenomBrut = feuille.getRange(ligne, CONFIG.COL_PRENOM).getValue().toString().trim();
        if (prenomBrut) {
          prenom = prenomBrut.split(' ')[0];
          prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
        }
      }

      try {
        MailApp.sendEmail({
          to: email,
          subject: article.emoji + ' Nouvel article : ' + article.titre,
          htmlBody: _genererHTML(article, prenom, blogConfig),
          name: CONFIG.NOM_EXPEDITEUR,
          replyTo: CONFIG.EMAIL_REPONDRE
        });

        envoyes++;
        Utilities.sleep(250); // Pause anti-spam

      } catch (e) {
        erreurs++;
        Logger.log('❌ Erreur pour ' + email + ' : ' + e.message);
      }
    }

    // Enregistrer dans le journal
    _enregistrerEnvoi(article.id, article.titre, envoyes, erreurs);

    Logger.log('════════════════════════════════');
    Logger.log('📊 RAPPORT — ' + article.titre);
    Logger.log('&#9989; Emails envoyés : ' + envoyes);
    Logger.log('⚠️  Ignorés : ' + ignores);
    Logger.log('❌ Erreurs : ' + erreurs);
    Logger.log('════════════════════════════════');
  }


  // ═══════════════════════════════════════════════════════════
  // 🎨 TEMPLATE HTML EMAIL (s'adapte à chaque article)
  // ═══════════════════════════════════════════════════════════

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
              &#9889;DigitalBoost <span style="color:#C9A84C;">AI</span>
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
              Bonjour <strong>${prenom}</strong> &#128075;
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
                    &#128197; ${_formaterDate(article.date_publication)} &nbsp;·&nbsp; &#9201;&#65039; ${article.temps_lecture}
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
                    &#128640; Passez à l'action dès aujourd'hui !
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


  // ═══════════════════════════════════════════════════════════
  // 📒 JOURNAL DES ENVOIS (évite les doublons)
  // ═══════════════════════════════════════════════════════════

  function _initialiserJournal() {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let journal = ss.getSheetByName(CONFIG.FEUILLE_JOURNAL);

    if (!journal) {
      journal = ss.insertSheet(CONFIG.FEUILLE_JOURNAL);
      journal.appendRow(['ID Article', 'Titre', 'Date envoi', 'Emails envoyés', 'Erreurs']);
      journal.getRange(1, 1, 1, 5).setFontWeight('bold')
        .setBackground('#0D1117')
        .setFontColor('#FAFAF7');
      Logger.log('&#9989; Onglet Journal créé.');
    }
  }

  function _articleDejaEnvoye(articleId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      const journal = ss.getSheetByName(CONFIG.FEUILLE_JOURNAL);
      if (!journal) return false;

      const data = journal.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === articleId) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function _enregistrerEnvoi(articleId, titre, envoyes, erreurs) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      let journal = ss.getSheetByName(CONFIG.FEUILLE_JOURNAL);
      if (!journal) _initialiserJournal();
      journal = ss.getSheetByName(CONFIG.FEUILLE_JOURNAL);

      journal.appendRow([
        articleId,
        titre,
        new Date().toLocaleString('fr-FR'),
        envoyes,
        erreurs
      ]);
      Logger.log('📒 Envoi enregistré dans le journal.');
    } catch (e) {
      Logger.log('⚠️ Impossible d\'écrire dans le journal : ' + e.message);
    }
  }

  function _formaterDate(dateStr) {
    const mois = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
      'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
  }


  // ═══════════════════════════════════════════════════════════
  // 🧪 TESTS MANUELS (facultatif)
  // ═══════════════════════════════════════════════════════════

  /** Envoyer un email de test à soi-même */
  function testerEmailSurMoi() {
    const MON_EMAIL = 'VOTRE_EMAIL@gmail.com'; // ← Modifier
    const articleTest = {
      id: 'test-001',
      titre: "[TEST] L'IA va transformer l'éducation africaine — conférence UNESCO 2026",
      excerpt: "Ceci est un email de test pour vérifier le bon fonctionnement de la newsletter automatique DigitalBoost AI.",
      url: 'https://digitalboostai.vercel.app/blog/ia-education-afrique-unesco.html',
      emoji: '🎓',
      categorie: 'IA & Éducation en Afrique',
      temps_lecture: '12 min de lecture',
      date_publication: '2026-03-07'
    };
    const blogConfig = {
      base_url: 'https://digitalboostai.vercel.app',
      blog_url: 'https://digitalboostai.vercel.app/blog.html'
    };

    MailApp.sendEmail({
      to: MON_EMAIL,
      subject: '[TEST] ' + articleTest.emoji + ' ' + articleTest.titre,
      htmlBody: _genererHTML(articleTest, 'Franck', blogConfig),
      name: CONFIG.NOM_EXPEDITEUR
    });
    Logger.log('&#9989; Email de test envoyé à : ' + MON_EMAIL);
  }

  /** Forcer une vérification immédiate (pour tester) */
  function forcerVerification() {
    verifierNouveauxArticles();
  }

  /** Lister les déclencheurs actifs */
  function voirDeclencheurs() {
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log('Déclencheurs actifs : ' + triggers.length);
    triggers.forEach(t => {
      Logger.log('- ' + t.getHandlerFunction() + ' | Type: ' + t.getTriggerSource());
    });
  }

  /** Désinstaller le déclencheur automatique */
  function desinstallerDeclencheur() {
    ScriptApp.getProjectTriggers().forEach(trigger => {
      if (trigger.getHandlerFunction() === 'verifierNouveauxArticles') {
        ScriptApp.deleteTrigger(trigger);
        Logger.log('🗑️ Déclencheur supprimé.');
      }
    });
  }
