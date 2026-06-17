/**
 * ⚠️ SCRIPT DE NETTOYAGE D'URGENCE ⚠️
 * À exécuter une seule fois pour corriger l'incident du 14/04/2026.
 */

const CONFIG_NETTOYAGE = {
  NOM_FEUILLE_JOURNAL: 'Journal_Newsletters',
  ARTICLE_ID_DEBUT: 'article-014',
  ARTICLE_ID_FIN: 'article-025',
  DATE_INCIDENT: '14/04/2026'
};

/**
 * 1. Nettoie les lignes du journal de la newsletter.
 */
function nettoyerJournal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feuille = ss.getSheetByName(CONFIG_NETTOYAGE.NOM_FEUILLE_JOURNAL);
  if (!feuille) {
    Logger.log('❌ Feuille "' + CONFIG_NETTOYAGE.NOM_FEUILLE_JOURNAL + '" introuvable.');
    return;
  }

  const data = feuille.getDataRange().getValues();
  let supCount = 0;

  // On parcourt de bas en haut
  for (let i = data.length - 1; i >= 1; i--) {
    const idArticle = data[i][0] ? data[i][0].toString() : '';

    // Supprimer tous les articles >= 014 (sans s'embêter avec la date qui peut poser problème)
    if (idArticle.startsWith('article-')) {
      const num = parseInt(idArticle.split('-')[1]);
      if (num >= 14) {
        feuille.deleteRow(i + 1);
        Logger.log('✅ Ligne supprimée (Journal Sheet) : ' + idArticle);
        supCount++;
      }
    }
  }
  Logger.log('🧹 Total de lignes supprimées : ' + supCount);
}

/**
 * 2. Déplace les emails envoyés par erreur vers la corbeille (Côté expéditeur).
 */
function nettoyerEmailsEnvoyes() {
  const sujetsAchercher = [
    "Prompt Copywriting",
    "5 Outils IA Gratuits",
    "Assistant Virtuel (GPT)",
    "Prompts Midjourney",
    "Pourquoi Excel est mort",
    "Script YouTube viral",
    "Vendre sur WhatsApp",
    "Créer 30 jours de contenu Instagram",
    "DALL-E 3 vs Midjourney",
    "Rédiger des fiches produits",
    "intelligence artificielle pour les Coachs",
    "Ne lancez pas de formation"
  ];

  Logger.log('🚀 Recherche des emails envoyés par erreur...');
  let totalMisEnCorbeille = 0;
  
  sujetsAchercher.forEach(sujet => {
    let start = 0;
    while(true) {
      // is:sent after:2026/04/13 pour filtrer ceux d'aujourd'hui
      const query = 'is:sent after:2026/04/13 subject:("' + sujet + '")';
      const threads = GmailApp.search(query, start, 50); // Réduit à 50 pour éviter les timeouts
      
      if (threads.length === 0) break;
      
      try {
        GmailApp.moveThreadsToTrash(threads);
        totalMisEnCorbeille += threads.length;
        Logger.log('🗑️ [' + sujet + '] : ' + threads.length + ' emails déplacés.');
      } catch (e) {
        Logger.log('⚠️ Erreur lot pour [' + sujet + '], tentative individuelle...');
        threads.forEach(thread => { 
          try {
            thread.moveToTrash(); 
            totalMisEnCorbeille++;
          } catch(err) {
            Logger.log('❌ Impossible de supprimer un thread: ' + err.message);
          }
        });
      }
      
      if (threads.length < 50) break; // Fin de la recherche
      start += 50;
    }
  });
  
  Logger.log('🏁 NETTOYAGE TERMINÉ');
  Logger.log('📊 Journal Sheet : Lignes supprimées.');
  Logger.log('📧 Gmail : ' + totalMisEnCorbeille + ' emails envoyés par erreur mis en corbeille.');
}
