import re
import sys

new_main_content = """<main class="article-body" id="article-main">

                <!-- INTRO -->
                <div class="intro-block">
                    <p><strong>Mot de DIGITALBOOST AI</strong></p>
                    <p>
                        Chez DIGITALBOOST AI, notre mission est d’aider les individus, les organisations et les institutions à comprendre, adopter et maîtriser l’intelligence artificielle — non comme une menace, mais comme un levier de transformation. Ce compte-rendu de la 2e Tribune de l’IA de l’UVCI s’inscrit pleinement dans cet engagement : rendre accessible, sans jargon, ce qui se pense et se pratique au plus haut niveau sur l’IA en Afrique. <strong>Notre rédaction web a mené une vérification approfondie</strong> et visionné l'intégralité de ces 5 heures de contenu pour vous.
                    </p>
                </div>

                <h2 id="contexte">1. Une salle comble, deux mondes connectés</h2>
                <p>
                    Ce 5 mars 2026, une soixantaine de participants en présentiel, une soixantaine d’autres en ligne depuis le Sénégal, le Togo, la Côte d’Ivoire et même les États-Unis : telle était la configuration de la 2e Tribune de l’IA, organisée par la Chaire UNESCO Intelligence Artificielle, Humanités et Science Ouverte (IAHSO), hébergée à l’Université Virtuelle de Côte d’Ivoire (UVCI). Le thème : <em>Dispositifs et pratiques d’intégration de l’IA dans les environnements d’apprentissage</em>.
                </p>
                <p>
                    Une journée intense, pratique, parfois chahutée par les aléas techniques du direct — mais précisément pour cela, profondément humaine. Car parler d’IA dans l’éducation, ce n’est pas parler de robots et d’algorithmes. C’est parler de professeurs qui doutent, d’étudiants qui innovent, et d’institutions qui cherchent leur chemin dans une révolution qui n’attend personne.
                </p>

                <!-- VIDEO EMBED -->
                <div class="video-embed">
                    <iframe src="https://www.youtube.com/embed/2oY8v3L1mwU"
                        title="Tribune de l'IA - Chaire UNESCO IAHSO" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                    <div class="video-caption">📺 Tribune de l'IA — Chaire UNESCO IAHSO | UVCI TV — 5 mars 2026 (5h de contenu)</div>
                </div>

                <h2 id="defis">2. Le défi de fond : enseigner à des milliers avec les moyens du possible</h2>
                <p>
                    Avant de parler d’outils, il faut poser le problème. Le <strong>Professeur Kouamé Fernand</strong>, Titulaire de la Chaire UNESCO IAHSO, l’a formulé sans détour dès l’ouverture :
                </p>

                <div class="quote-block">
                    <p>"Pour 1 000 étudiants, il faut peut-être cinq enseignants. Comment faire en sorte que chaque élève ait son tuteur, puisse poser une question et recevoir une réponse adaptée à son niveau ?"</p>
                    <cite>— Prof. Kouamé Fernand, Chaire UNESCO IAHSO, UVCI</cite>
                </div>

                <p>
                    C’est la question centrale de l’éducation de masse en Afrique. Classes surchargées, hétérogénéité des apprenants, déficit de ressources humaines qualifiées : l’IA n’apparaît plus comme un gadget, mais comme un levier stratégique incontournable. Et le Professeur Kouamé Fernand a ajouté une formule qui résonne comme un avertissement : <em>« L’éducation coûte cher. Mais pensez aussi au coût de l’ignorance. »</em>
                </p>

                <h3>La vraie question n’est plus « faut-il utiliser l’IA ? »</h3>
                <p>
                    <strong>Un expert en technopédagogie</strong> a posé le cadre avec une franchise désarmante. Une étude menée par des chercheurs universitaires révèle que :
                </p>
                <ul class="styled-list">
                    <li>Près de 75 % des étudiants utilisent déjà l’IA régulièrement</li>
                    <li>100 % des enseignants l’utilisent également — sans formation formelle, par tâtonnement et curiosité</li>
                </ul>
                <p>
                    La conclusion s’impose : la vraie question est comment faire en sorte que l’IA serve l’apprentissage et non qu’elle le détourne ? C’est précisément la vocation de <strong>DIGITALBOOST AI</strong> : vous accompagner pour passer d’un usage instinctif de l’IA à une pratique réfléchie, éthique et véritablement transformatrice.
                </p>

                <h2 id="pedagogie">3. Les six peurs des enseignants face à l’IA — et comment les dépasser</h2>

                <div class="accent-block">
                    <p><strong>1. « L’IA va rendre les étudiants paresseux »</strong><br>
                    La calculatrice a-t-elle rendu les étudiants nuls en mathématiques ? Non. Ce n’est pas l’outil qui rend paresseux, c’est l’usage qu’on en fait. Un devoir bien conçu peut intégrer l’IA tout en exigeant de l’étudiant une véritable réflexion critique.</p>
                </div>

                <div class="accent-block">
                    <p><strong>2. « L’IA donnera des réponses inadaptées au contexte africain »</strong><br>
                    C’est un risque réel. Les modèles sont majoritairement entraînés sur des données occidentales. Mais c’est précisément là que le rôle de l’enseignant africain devient essentiel : apporter l’éclairage local, exercer l’esprit critique, enrichir les requêtes du contexte régional.</p>
                </div>

                <div class="accent-block">
                    <p><strong>3. « Nos enseignants ne sont pas formés »</strong><br>
                    Ni ceux d’Oxford, ni ceux de Harvard, ni ceux du MIT ne l’étaient non plus. Personne n’a été formé à quelque chose qui n’existait pas. C’est un défi, pas un retard.</p>
                </div>

                <div class="accent-block">
                    <p><strong>4. « On va devenir dépendants des plateformes géantes (GAFAM) »</strong><br>
                    Des stratégies existent : diversifier les outils, privilégier les logiciels libres, ne jamais confier de données sensibles à des plateformes tierces. La dépendance se gère, elle ne se subit pas.</p>
                </div>

                <div class="accent-block">
                    <p><strong>5. « L’IA va atrophier nos capacités intellectuelles »</strong><br>
                    Utilise-t-on une voiture parce qu’on ne sait pas marcher ? L’outil permet d’aller plus loin, plus vite. Il amplifie la capacité intellectuelle, à condition de garder la main.</p>
                </div>

                <div class="accent-block">
                    <p><strong>6. « Qu’en est-il de ma valeur en tant qu’enseignant ? »</strong><br>
                    L’IA peut-elle regarder un étudiant dans les yeux et sentir qu’il n’a pas compris ? Non. Un formateur expert a résumé la situation de façon limpide : <br><em>« L’IA fait les tâches, l’enseignant fait la relation. L’IA traite l’information, l’enseignant construit du sens. L’IA exécute, l’enseignant inspire. »</em></p>
                </div>

                <!-- CTA MILIEU -->
                <div class="cta-inline">
                    <h3>Vous voulez maîtriser ces outils IA ?</h3>
                    <p>Notre guide de 50 prompts IA vous permet de démarrer immédiatement — que vous soyez enseignant, entrepreneur ou étudiant.</p>
                    <div class="cta-btn-group">
                        <a href="https://digitalboostai.vercel.app/products/prompts.html" class="btn-gold">Obtenir les 50 Prompts IA →</a>
                        <a href="https://digitalboostai.vercel.app/#products" class="btn-outline">Voir tous les produits</a>
                    </div>
                </div>

                <h2 id="outils">4. Des outils concrets, testés en salle</h2>
                <p>
                    La tribune avait la volonté d’être pratique. <strong>Plusieurs experts et formateurs TICE</strong> ont présenté des démonstrations en direct — avec les coupures de connexion et les bugs en prime, ce qui, paradoxalement, rendait les présentations encore plus crédibles.
                </p>

                <div class="tools-grid">
                    <div class="tool-card">
                        <span class="tool-icon">🪄</span>
                        <div class="tool-name">Magic School AI + Knowledge AI</div>
                        <div class="tool-desc">Magic School AI joue le rôle de « couteau suisse » de l’enseignant : génération de plans de cours, rubriques d’évaluation, textes adaptés. Knowledge AI va plus loin : il transforme des ressources brutes en cours interactifs.</div>
                        <span class="tool-use">✅ Automatisation pédagogique</span>
                    </div>
                    <div class="tool-card">
                        <span class="tool-icon">📅</span>
                        <div class="tool-name">Almanac AI + Microsoft Copilot</div>
                        <div class="tool-desc">Microsoft Copilot pour la recherche documentaire structurée adaptée au contexte africain. Puis importation dans Almanac AI pour générer un syllabus structuré selon la taxonomie de Bloom.</div>
                        <span class="tool-use">✅ Planification & Structure</span>
                    </div>
                    <div class="tool-card">
                        <span class="tool-icon">💻</span>
                        <div class="tool-name">Google AI Studio + Lovable AI</div>
                        <div class="tool-desc">Créer une application en langage naturel (vibe coding). En quelques minutes, il est possible de générer des applications web complètes. Des perspectives pour l'employabilité et les startups.</div>
                        <span class="tool-use">✅ Vibe Coding & Startups</span>
                    </div>
                    <div class="tool-card">
                        <span class="tool-icon">🧠</span>
                        <div class="tool-name">ChatGPT, Gemini, Perplexity</div>
                        <div class="tool-desc">Outils complémentaires : Gemini pour synthèses, Perplexity pour recherches documentées avec citations, ChatGPT pour feedbacks. Avertissement : toujours vérifier les sources générées.</div>
                        <span class="tool-use">✅ Recherche & Vérification</span>
                    </div>
                </div>

                <h3>Repenser l’évaluation : le chantier le plus urgent</h3>
                <p>
                    Les QCM classiques sont obsolètes. Un étudiant peut coller le sujet dans ChatGPT et obtenir 20/20 en cinq minutes. La solution n’est pas d’interdire — c’est d’évoluer. 
                </p>
                <ul class="styled-list">
                    <li>Demander à l’étudiant de critiquer une réponse produite par l’IA.</li>
                    <li>Exiger l’historique de la conversation avec l’IA comme pièce jointe au devoir.</li>
                    <li>Valoriser le processus d’apprentissage autant que le résultat final.</li>
                    <li>Privilégier les présentations orales, études de cas locales.</li>
                    <li>Intégrer la taxonomie de Bloom : l'analyse et la création sont plus dures à déléguer à une machine.</li>
                </ul>

                <div class="tip-block">
                    <div class="tip-label">💡 La règle d'or de l'évaluation</div>
                    <p>Un enseignant qui conçoit une évaluation doit être capable d’y obtenir 20/20 lui-même. Si ce n’est pas le cas, l’évaluation est mal calibrée.</p>
                </div>

                <h2 id="action">5. Éthique, souveraineté et le plan d'action africain</h2>
                <p>
                    Les IA génératives ont été entraînées sur des données massivement occidentales. Elles peuvent répondre avec des biais sur des sujets africains. Rappel flagrant : en 2024, seules 42 des 2 000 langues ethniques africaines étaient représentées dans les datasets des IA.
                </p>
                <p>
                    À court terme : enrichir systématiquement les prompts avec le contexte local. À long terme, l'urgence de produire des ressources en langues africaines a été soulignée. Le <strong>Professeur Kone Tiémoman</strong>, Président de l’UVCI, a annoncé le financement d’un projet structurant sur les langues nationales, avec un démonstrateur d’IA en langue locale prévu d'ici un an ou deux.
                </p>

                <h3>Ce que les institutions doivent faire maintenant</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Acteur</th>
                                <th>Action immédiate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>🏛️ Ministères & Institutions</td>
                                <td>Élaborer une stratégie nationale d’intégration de l’IA et un cadre éthique. Développer des chartes de bon usage co-construites.</td>
                            </tr>
                            <tr>
                                <td>🎓 Chaires & Chercheurs</td>
                                <td>Renforcer les formations, produire des référentiels de bonnes pratiques, étudier l’impact réel de l’IA sur l'apprentissage.</td>
                            </tr>
                            <tr>
                                <td>👨🏾‍🏫 Enseignants</td>
                                <td>S’approprier les outils progressivement, créer des communautés d’entraide locales sans attendre une formation institutionnelle.</td>
                            </tr>
                            <tr>
                                <td>📚 Apprenants</td>
                                <td>Utiliser l’IA comme support d’apprentissage, respecter l’intégrité académique, développer la compétence clé du prompt engineering.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="quote-block">
                    <p>"L’IA ne rend pas paresseux. Elle révèle la paresse. Mais elle peut aussi révéler la curiosité, l’intelligence, la créativité."</p>
                    <cite>— Un expert en technopédagogie, Conférence UNESCO IAHSO, Mars 2026</cite>
                </div>

                <!-- CONCLUSION -->
                <div class="conclusion">
                    <h2>🎯 DIGITALBOOST AI — Votre partenaire pour la révolution IA</h2>
                    <p>
                        Ce que vous venez de lire illustre exactement pourquoi DIGITALBOOST AI a été créée. Le monde de l’IA évolue à une vitesse que peu d’organisations peuvent suivre seules. Nous sommes là pour vous accompagner.
                    </p>
                    
                    <ul class="styled-list">
                        <li><strong>Veille et vulgarisation IA :</strong> Des analyses accessibles, sans jargon, ancrées dans le contexte africain.</li>
                        <li><strong>Formation et montée en compétences :</strong> De la prise en main des outils à la maîtrise du prompt engineering, pour tous.</li>
                        <li><strong>Conseil et intégration :</strong> Identifier les bons outils pour vos besoins réels, éviter les pièges.</li>
                        <li><strong>Contenu et communication IA :</strong> Supports de formation, guides pratiques et ressources pédagogiques sur mesure.</li>
                    </ul>

                    <p style="font-size: 0.85rem; color: #6B7280; font-style: italic; margin-top: 24px; text-align: left;">
                        Note éditoriale : Les noms de plusieurs intervenants ayant contribué à des démonstrations ou interventions ont été volontairement anonymisés pour cette publication web. Les seuls noms conservés sont ceux portant la représentation officielle de la chaire ou des institutions universitaires en présence (Professeur Kouamé Fernand, Professeur Kone Tiémoman).
                    </p>
                    
                    <div class="cta-btn-group" style="margin-top:20px;">
                        <a href="https://digitalboostai.vercel.app/products/prompts.html" class="btn-gold">Commencer avec nos Prompts IA →</a>
                        <a href="https://digitalboostai.vercel.app/blog.html" class="btn-outline">← Retour au Blog</a>
                    </div>
                </div>

                <!-- TAGS SEO -->
                <div class="seo-tags" style="margin-top: 48px;">
                    <span class="seo-tag">IA Éducation</span>
                    <span class="seo-tag">UNESCO Afrique</span>
                    <span class="seo-tag">Côte d'Ivoire</span>
                    <span class="seo-tag">UVCI</span>
                    <span class="seo-tag">Magic School AI</span>
                    <span class="seo-tag">Prompt Engineering</span>
                    <span class="seo-tag">Classe Inversée</span>
                    <span class="seo-tag">Intelligence Artificielle 2026</span>
                    <span class="seo-tag">Enseignement Supérieur</span>
                    <span class="seo-tag">Digital Transformation</span>
                </div>

                <!-- PARTAGE -->
                <div class="share-section">
                    <h3>📢 Cet article vous a été utile ?</h3>
                    <p>Partagez-le avec vos collègues, étudiants et entrepreneurs de votre réseau !</p>
                    <!-- PARTAGE BOTTOM (Boutons injectés dynamiquement) -->
                    <div id="share-buttons-container-bottom"></div>
                </div>

            </main>"""

file_path = "blog/ia-education-afrique-unesco.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# On remplace l'ancien <main> par le nouveau
pattern = r'<main class="article-body" id="article-main">.*?</main>'
new_text = re.sub(pattern, new_main_content, text, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_text)

print("Article mis à jour avec la nouvelle structure anonymisée.")
