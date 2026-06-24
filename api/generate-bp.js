const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(req, res) {
    // 1. CORS Headers (si on appelle depuis un autre domaine, sinon pas strictment nécessaire)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { projet, secteur, pays, budget } = req.body;

        if (!projet || !secteur || !pays || !budget) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
        }

        // Vérification du mot de passe rudimentaire (côté serveur pour plus de sécurité)
        const pass = req.headers['authorization'];
        if (pass !== 'Bearer DIGITALBOOST_PRO') {
            return res.status(401).json({ error: 'Accès non autorisé. Mot de passe invalide.' });
        }

        // Vérification de la clé API
        if (!process.env.GEMINI_API_KEY) {
            console.error("ERREUR : GEMINI_API_KEY non définie sur Vercel.");
            return res.status(500).json({ error: 'Erreur de configuration serveur.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
Tu es un consultant en stratégie d'entreprise de classe mondiale. Un entrepreneur basé en Afrique (${pays}) lance un projet appelé "${projet}" dans le secteur "${secteur}" avec un budget de démarrage de ${budget}.

Rédige un Business Plan exécutif percutant, réaliste et structuré. Il doit inclure :
1. Executive Summary (Résumé du projet)
2. Étude de marché simplifiée (Opportunités et défis spécifiques à ${pays} pour le secteur ${secteur})
3. Modèle de revenus (Comment gagner de l'argent concrètement)
4. Stratégie Marketing & Acquisition (Adaptée au marché local et budget)
5. Plan Financier simplifié (Allocation du budget de ${budget})

Format de sortie : Code HTML propre. Utilise des balises <h3>, <h4>, <ul>, <li>, et des paragraphes. Ajoute quelques icônes (emojis). Ne mets pas de balise <html> ou <body>, juste le contenu direct. Ne mets pas de bloc de code markdown.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return res.status(200).json({ html: text });
    } catch (error) {
        console.error('Erreur API Gemini :', error);
        return res.status(500).json({ error: 'Une erreur est survenue lors de la génération du Business Plan.' });
    }
}
