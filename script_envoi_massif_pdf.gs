/**
 * SCRIPT PONCTUEL : Envoi massif du Guide Gratuit aux abonnés existants
 * 
 * INSTRUCTIONS :
 * 1. Ouvre ton projet Apps Script existant (celui lié à ta newsletter).
 * 2. Crée un nouveau fichier (Fichier > Nouveau > Script) et nomme-le "EnvoiCadeau".
 * 3. Colle tout ce code dedans.
 * 4. Sauvegarde (Ctrl+S).
 * 5. Clique sur "Exécuter" en haut. Le script parcourra ta liste et enverra les emails.
 */

function envoyerGuideMassif() {
  const SHEET_ID = '1dB2PqGI9kx5tbXv5lAoDk5_fLHqzrDMBe8VdX80vJvo';
  const FEUILLE_ABONNES = 'Réponses au formulaire 1';
  const URL_PDF = 'https://digitalboostai.tech/downloads/DigitalBoost_AI_10_Regles_Redaction_Administrative.pdf';
  const NOM_EXPEDITEUR = 'DigitalBoost AI';
  const EMAIL_REPONDRE = 'noreply@digitalboostai.com';

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const feuille = ss.getSheetByName(FEUILLE_ABONNES);
  const data = feuille.getDataRange().getValues();
  
  let envoyes = 0;
  let erreurs = 0;

  // On commence à la ligne 2 (après les en-têtes)
  for (let i = 1; i < data.length; i++) {
    const email = data[i][2]; // Colonne C (index 2)
    const prenom = data[i][1] || 'ami(e)'; // Colonne B (index 1)

    if (email && email.includes('@')) {
      try {
        const sujet = "🎁 Ton cadeau : Le Mini-Guide des 10 Règles d'Or";
        const corpsHtml = `
          <div style="font-family: Arial, sans-serif; color: #0D1117; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1A4B9E;">⚡DigitalBoost <span style="color:#C9A84C;">AI</span></h2>
            </div>
            
            <p>Bonjour <strong>${prenom}</strong> 👋,</p>
            
            <p>Pour te remercier de faire partie de notre communauté, nous t'offrons aujourd'hui un cadeau exclusif :</p>
            
            <div style="background-color: #F8F8F5; padding: 15px; border-left: 4px solid #C9A84C; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0D1117;">📘 Le Mini-Guide PDF : Les 10 Règles d'Or de la Rédaction Administrative avec l'IA</h3>
              <p style="margin-bottom: 0;">Découvre comment générer des notes de service impeccables et professionnelles en moins de 2 minutes.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${URL_PDF}" style="background-color: #0D1117; color: #FAFAF7; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">
                📥 Télécharger mon guide gratuit
              </a>
            </div>
            
            <p>À très vite pour de nouvelles astuces IA !</p>
            <p><strong>L'équipe DigitalBoost AI</strong> 🚀</p>
          </div>
        `;

        MailApp.sendEmail({
          to: email,
          subject: sujet,
          htmlBody: corpsHtml,
          name: NOM_EXPEDITEUR,
          replyTo: EMAIL_REPONDRE
        });
        
        envoyes++;
        
        // Petite pause pour éviter les limites de l'API Google
        Utilities.sleep(500); 

      } catch (e) {
        Logger.log("Erreur pour " + email + " : " + e.message);
        erreurs++;
      }
    }
  }

  Logger.log("✅ Opération terminée. " + envoyes + " emails envoyés avec succès. " + erreurs + " erreurs.");
}
