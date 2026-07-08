// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Demo user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@certprep.fr' },
    update: {},
    create: {
      email: 'demo@certprep.fr',
      name: 'Marie Lambert',
      password: hashedPassword,
      xp: 245,
      level: 3,
      streakDays: 4,
    },
  })

  // PL-300 Certification
  const pl300 = await prisma.certification.upsert({
    where: { code: 'PL-300' },
    update: { color: '#2563EB' },
    create: {
      code: 'PL-300',
      name: 'Power BI Data Analyst',
      provider: 'Microsoft',
      category: 'Data & Analytics',
      level: 'Intermédiaire',
      icon: 'bar-chart-3',
      color: '#2563EB',
      durationHours: 40,
      passScore: 70,
      description: 'Devenez un expert Power BI certifié Microsoft. Cette certification valide vos compétences en modélisation de données, DAX, Power Query et création de rapports professionnels.',
    },
  })

  // AZ-900
  const az900 = await prisma.certification.upsert({
    where: { code: 'AZ-900' },
    update: { color: '#334155' },
    create: {
      code: 'AZ-900',
      name: 'Azure Fundamentals',
      provider: 'Microsoft',
      category: 'Cloud',
      level: 'Débutant',
      icon: 'cloud',
      color: '#334155',
      durationHours: 20,
      passScore: 70,
      description: 'Maîtrisez les fondamentaux du cloud Azure : services, tarification, SLA et cycle de vie.',
    },
  })

  // AWS Cloud Practitioner
  await prisma.certification.upsert({
    where: { code: 'CLF-C02' },
    update: { color: '#B45309' },
    create: {
      code: 'CLF-C02',
      name: 'AWS Cloud Practitioner',
      provider: 'AWS',
      category: 'Cloud',
      level: 'Débutant',
      icon: 'server',
      color: '#B45309',
      durationHours: 25,
      passScore: 70,
    },
  })

  await prisma.certification.upsert({
    where: { code: 'SC-900' },
    update: { color: '#B91C1C' },
    create: {
      code: 'SC-900',
      name: 'Security, Compliance & Identity',
      provider: 'Microsoft',
      category: 'Security',
      level: 'Débutant',
      icon: 'shield-check',
      color: '#B91C1C',
      durationHours: 18,
      passScore: 70,
    },
  })

  await prisma.certification.upsert({
    where: { code: 'DP-900' },
    update: { color: '#64748B' },
    create: {
      code: 'DP-900',
      name: 'Azure Data Fundamentals',
      provider: 'Microsoft',
      category: 'Data & Analytics',
      level: 'Débutant',
      icon: 'database',
      color: '#64748B',
      durationHours: 22,
      passScore: 70,
    },
  })

  await prisma.certification.upsert({
    where: { code: 'PMP' },
    update: { color: '#15803D' },
    create: {
      code: 'PMP',
      name: 'Project Management Professional',
      provider: 'PMI',
      category: 'Management',
      level: 'Avancé',
      icon: 'clipboard-list',
      color: '#15803D',
      durationHours: 60,
      passScore: 61,
    },
  })

  // Modules PL-300
  const modulesData = [
    { order: 1, title: 'Introduction à Power BI', durationMin: 90, description: 'Découvrez l\'écosystème Power BI et ses composants principaux.' },
    { order: 2, title: 'Power Query & Préparation des données', durationMin: 180, description: 'Connectez-vous aux sources, nettoyez et transformez vos données.' },
    { order: 3, title: 'Modélisation des données', durationMin: 240, description: 'Construisez des modèles en étoile, gérez les relations et les cardinalités.' },
    { order: 4, title: 'DAX — Bases', durationMin: 180, description: 'Maîtrisez les mesures, colonnes calculées et fonctions essentielles.' },
    { order: 5, title: 'DAX — Avancé', durationMin: 210, description: 'CALCULATE, contextes de filtre, time-intelligence et patterns avancés.' },
    { order: 6, title: 'Visualisations & Rapports', durationMin: 150, description: 'Créez des rapports percutants avec les meilleures pratiques UX.' },
    { order: 7, title: 'Power BI Service & Partage', durationMin: 120, description: 'Publiez, partagez et gérez vos rapports dans le cloud.' },
    { order: 8, title: 'Administration & Gouvernance', durationMin: 90, description: 'Sécurité, RLS, capacités Premium et bonnes pratiques entreprise.' },
  ]

  const modules: any[] = []
  for (const m of modulesData) {
    const mod = await prisma.module.upsert({
      where: { id: `pl300-module-${m.order}` },
      update: {},
      create: {
        id: `pl300-module-${m.order}`,
        certificationId: pl300.id,
        ...m,
      },
    })
    modules.push(mod)
  }

  // Questions PL-300
  const questionsData = [
    {
      domain: 'Modélisation des données',
      type: 'single',
      difficulty: 'Difficile',
      text: 'Quel mode de stockage est le plus adapté pour FactSales (8,5M lignes) avec un rafraîchissement horaire et 500 utilisateurs simultanés ?',
      choices: [
        'Import — toutes les données en mémoire, refresh planifié toutes les heures',
        'DirectQuery sur Azure Synapse avec agrégations pré-calculées pour les visuels de synthèse',
        'Dual mode pour FactSales afin d\'optimiser selon le contexte de requête',
        'Live Connection vers un modèle Analysis Services hébergé dans Azure',
      ],
      correctAnswers: [1],
      explanation: 'DirectQuery + Synapse + agrégations : Synapse est optimisé MPP pour les requêtes analytiques massives. Les agrégations pré-calculées servent les visuels de synthèse. Import (A) risque de saturer la mémoire. Dual (C) s\'applique aux dimensions. Live Connection (D) nécessite un SSAS séparé.',
    },
    {
      domain: 'DAX',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Quelle mesure DAX calcule correctement le chiffre d\'affaires Year-to-Date (YTD) sur la table DimDate ?',
      choices: [
        'Revenue YTD = TOTALYTD([Total Revenue], DimDate[Date])',
        'Revenue YTD = CALCULATE([Total Revenue], DATESYTD(DimDate[Date]))',
        'Revenue YTD = CALCULATE([Total Revenue], FILTER(DimDate, DimDate[Year] = YEAR(TODAY())))',
        'Revenue YTD = SUMX(DATESYTD(DimDate[Date]), [Total Revenue])',
      ],
      correctAnswers: [1],
      explanation: 'CALCULATE + DATESYTD (B) est la forme préférée : plus flexible, permet un exercice fiscal personnalisé. TOTALYTD (A) est un raccourci équivalent mais moins flexible. C avec YEAR(TODAY()) brise le time-intelligence pour les analyses historiques.',
    },
    {
      domain: 'Modélisation des données',
      type: 'multi',
      difficulty: 'Difficile',
      text: 'Quelles affirmations concernant les agrégations dans Power BI sont CORRECTES ? (Choisissez 2 réponses)',
      choices: [
        'Les agrégations permettent à Power BI de servir les requêtes depuis une table résumée plutôt que la table de faits complète',
        'Les agrégations fonctionnent uniquement en mode Import, pas en DirectQuery',
        'Une table d\'agrégation doit contenir une ligne par combinaison unique des dimensions agrégées',
        'Power BI détecte automatiquement quelle requête peut utiliser l\'agrégation ou la table de détail',
        'Les agrégations remplacent complètement la table de faits dans le modèle',
      ],
      correctAnswers: [0, 3],
      explanation: 'A est correct : les agrégations pré-calculent des résumés (ex: ventes par mois/région). D est correct : Power BI détermine automatiquement si une requête peut utiliser l\'agrégation. B est faux : les agrégations fonctionnent aussi en DirectQuery/Composite.',
    },
    {
      domain: 'Power Query',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Dans Power BI Desktop, comment diagnostiquer si le "query folding" est actif ?',
      choices: [
        'Vérifier la barre de progression dans Power Query Editor',
        'Faire un clic droit sur l\'étape dans Applied Steps et vérifier si "View Native Query" est disponible',
        'Activer le mode Debug dans les paramètres Power Query',
        'Consulter le journal d\'activité dans Power BI Service',
      ],
      correctAnswers: [1],
      explanation: '"View Native Query" (clic droit sur une étape dans Applied Steps) affiche la requête SQL générée. Si l\'option est disponible, le query folding est actif. Si elle est grisée, le folding s\'est arrêté à cette étape.',
    },
    {
      domain: 'DAX',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Quelle est la différence entre RELATED() et LOOKUPVALUE() en DAX ?',
      choices: [
        'RELATED() traverse une relation existante ; LOOKUPVALUE() recherche une valeur sans relation définie',
        'RELATED() est pour les colonnes calculées uniquement ; LOOKUPVALUE() est pour les mesures',
        'LOOKUPVALUE() est plus performant car il n\'utilise pas le modèle de données',
        'RELATED() et LOOKUPVALUE() sont identiques mais RELATED() a une syntaxe plus courte',
      ],
      correctAnswers: [0],
      explanation: 'RELATED() traverse une relation many-to-one existante (plus performant, recommandé quand la relation existe). LOOKUPVALUE() recherche une valeur sans nécessiter de relation — équivalent d\'un VLOOKUP.',
    },
    {
      domain: 'Service & Déploiement',
      type: 'single',
      difficulty: 'Facile',
      text: 'Un rapport Power BI publié sur le Service montre des données obsolètes. Le dataset se connecte à une base SQL Server on-premises. Quelle est la cause la plus probable ?',
      choices: [
        'Le refresh automatique n\'est pas configuré — activer le planificateur',
        'La passerelle de données on-premises n\'est pas installée ou configurée',
        'Power BI Service ne supporte pas SQL Server — migrer vers Azure SQL',
        'La connexion DirectQuery ne supporte pas le refresh automatique',
      ],
      correctAnswers: [1],
      explanation: 'Pour actualiser des données depuis une source on-premises, une passerelle de données on-premises est obligatoire. Sans passerelle, le Service ne peut pas atteindre la base SQL Server locale.',
    },
    {
      domain: 'Visualisation',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Vous devez créer un paramètre permettant aux utilisateurs de choisir la granularité (Jour / Semaine / Mois). Quelle approche est la plus adaptée ?',
      choices: [
        'Créer trois pages de rapport séparées avec la bonne granularité sur chacune',
        'Utiliser un paramètre What-if avec une liste de valeurs texte et SWITCH() dans les mesures',
        'Créer trois rapports distincts dans trois workspaces différents',
        'Utiliser des bookmarks pour basculer entre les vues prédéfinies',
      ],
      correctAnswers: [1],
      explanation: 'Un paramètre What-if avec des valeurs texte (Jour/Semaine/Mois) combiné à SWITCH() dans les mesures DAX permet une granularité dynamique en temps réel.',
    },
    {
      domain: 'Service & Déploiement',
      type: 'multi',
      difficulty: 'Intermédiaire',
      text: 'Quelles options permettent de partager un rapport Power BI avec des utilisateurs externes ? (Choisissez 2 réponses)',
      choices: [
        'Publish to Web — créer un lien public accessible sans authentification',
        'Envoyer directement le fichier .pbix par email',
        'Azure B2B — inviter des utilisateurs externes via Azure Active Directory',
        'Partager un workspace avec des utilisateurs externes via leur email Microsoft',
        'Power BI Embedded A-SKU — intégrer dans une application publique',
      ],
      correctAnswers: [0, 2],
      explanation: 'Publish to Web (A) crée un lien public sans authentification. Azure B2B (C) invite des utilisateurs externes avec leur identité Azure AD. Envoyer le .pbix (B) partage le fichier mais pas le rapport publié.',
    },
    {
      domain: 'Power Query',
      type: 'single',
      difficulty: 'Facile',
      text: 'Dans Power Query, vous avez une colonne de dates au format texte "DD/MM/YYYY". Quelle est la méthode recommandée pour convertir en type Date ?',
      choices: [
        'Utiliser Transform > Data Type > Date (conversion automatique)',
        'Créer une colonne personnalisée avec Date.FromText([DateCol], [Culture="fr-FR"])',
        'Utiliser Replace Values pour remplacer "/" par "-" puis convertir',
        'Importer comme texte et convertir avec DATEVALUE() en DAX',
      ],
      correctAnswers: [1],
      explanation: 'Date.FromText avec la culture "fr-FR" est la méthode la plus fiable car elle prend en compte le format régional DD/MM/YYYY. La conversion automatique peut mal interpréter 05/06/2024 selon la locale.',
    },
    {
      domain: 'DAX',
      type: 'single',
      difficulty: 'Difficile',
      text: 'Quelle fonction DAX calcule le % des ventes de la catégorie sélectionnée par rapport au total général ?',
      choices: [
        '% of Total = DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Sales[Category])))',
        '% of Total = DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS()))',
        '% of Total = [Total Sales] / SUM(Sales[Amount])',
        '% of Total = DIVIDE([Total Sales], CALCULATE([Total Sales], ALLSELECTED(Sales[Category])))',
      ],
      correctAnswers: [0],
      explanation: 'ALL(Sales[Category]) supprime le filtre sur Category tout en conservant les autres filtres actifs (slicer région, etc.), permettant de calculer un pourcentage correct dans n\'importe quel contexte.',
    },
    {
      domain: 'DAX',
      type: 'single',
      difficulty: 'Difficile',
      text: 'Dans quel ordre Power BI évalue-t-il les contextes lors du calcul d\'une mesure dans une matrice ?',
      choices: [
        'Contexte de ligne → Contexte de filtre → Contexte de requête',
        'Contexte de requête → Contexte de filtre de ligne/colonne → CALCULATE modifie le contexte',
        'Contexte de filtre → Contexte de ligne → Mesure',
        'Mesure → Contexte de filtre → Contexte de ligne',
      ],
      correctAnswers: [1],
      explanation: 'Power BI part du contexte de requête (filtres rapport + slicers), ajoute le contexte de filtre des lignes/colonnes de la matrice, puis CALCULATE peut modifier ce contexte via ses arguments.',
    },
    {
      domain: 'Modélisation des données',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Vous avez deux tables FactSales et FactBudget reliées à DimDate. Quelle est la bonne approche pour éviter une relation ambiguë ?',
      choices: [
        'Créer une relation directe entre FactSales et FactBudget',
        'Utiliser USERELATIONSHIP() dans les mesures pour activer la bonne relation',
        'Marquer une relation comme active et l\'autre comme inactive, puis utiliser USERELATIONSHIP() pour la relation inactive',
        'Dupliquer DimDate en DimDateSales et DimDateBudget',
      ],
      correctAnswers: [2],
      explanation: 'Le pattern standard : une seule relation active (ex: FactSales ↔ DimDate), l\'autre inactive (FactBudget ↔ DimDate). Utilisez USERELATIONSHIP() dans les mesures Budget pour activer la relation inactive ponctuellement.',
    },
    {
      domain: 'Power Query',
      type: 'multi',
      difficulty: 'Intermédiaire',
      text: 'Quelles transformations Power Query PRÉSERVENT le query folding ? (Choisissez 2)',
      choices: [
        'Filtrer des lignes selon une valeur fixe',
        'Utiliser une fonction personnalisée (custom function)',
        'Renommer des colonnes',
        'Utiliser Table.Buffer()',
        'Grouper par une colonne avec une agrégation Sum',
      ],
      correctAnswers: [0, 4],
      explanation: 'Le filtre de lignes (A) et le Group By avec Sum (E) sont des opérations SQL natives — le query folding est préservé. Les fonctions personnalisées (B) et Table.Buffer() (D) brisent systématiquement le folding.',
    },
    {
      domain: 'Visualisation',
      type: 'single',
      difficulty: 'Facile',
      text: 'Quel visuel Power BI est le plus adapté pour montrer l\'évolution du CA mensuel avec une comparaison année précédente ?',
      choices: [
        'Graphique en anneau (Donut Chart)',
        'Graphique en courbes (Line Chart) avec deux séries',
        'Carte (Card) avec valeur de variation',
        'Treemap hiérarchique',
      ],
      correctAnswers: [1],
      explanation: 'Le graphique en courbes avec deux séries (année courante et année précédente) est le standard pour visualiser des tendances temporelles et comparer des périodes.',
    },
    {
      domain: 'Service & Déploiement',
      type: 'single',
      difficulty: 'Difficile',
      text: 'Vous devez déployer un rapport PL-300 en production avec des pipelines de déploiement. Quelle est la séquence correcte ?',
      choices: [
        'Dev → Prod → Test',
        'Dev → Test → Prod',
        'Test → Dev → Prod',
        'Prod → Test → Dev',
      ],
      correctAnswers: [1],
      explanation: 'Les pipelines de déploiement Power BI suivent la séquence standard SDLC : Développement → Test (UAT) → Production. Cela garantit la validation avant la mise en production.',
    },
    {
      domain: 'DAX',
      type: 'single',
      difficulty: 'Difficile',
      text: 'Quelle expression DAX calcule le ratio des ventes du mois courant par rapport à la moyenne mobile sur 3 mois ?',
      choices: [
        'DIVIDE([Sales], AVERAGEX(DATESINPERIOD(DimDate[Date], LASTDATE(DimDate[Date]), -3, MONTH), [Sales]))',
        'DIVIDE([Sales], CALCULATE([Sales], DATEADD(DimDate[Date], -3, MONTH)))',
        'DIVIDE([Sales], AVERAGEX(PREVIOUSMONTH(DimDate[Date]), [Sales]))',
        'DIVIDE([Sales], CALCULATE(AVERAGE([Sales]), LAST 3 MONTHS))',
      ],
      correctAnswers: [0],
      explanation: 'DATESINPERIOD avec -3 MONTH génère une table des 3 derniers mois à partir de la dernière date. AVERAGEX itère sur cette table et calcule la moyenne de la mesure [Sales], donnant la moyenne mobile correcte.',
    },
    {
      domain: 'Power Query',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Vous importez un fichier CSV avec des séparateurs décimaux "," (virgule) au lieu de ".". Quelle est la solution dans Power Query ?',
      choices: [
        'Utiliser Replace Values pour remplacer "," par "." avant de changer le type',
        'Changer le type de colonne en utilisant une locale spécifique (ex: fr-FR)',
        'Importer en texte et convertir en DAX',
        'Utiliser un paramètre de connexion au niveau du fichier CSV',
      ],
      correctAnswers: [1],
      explanation: 'Changer le type de colonne avec une locale spécifique (clic droit > Changer le type > Avec locale) indique à Power Query d\'interpréter "," comme séparateur décimal selon la convention française.',
    },
    {
      domain: 'Modélisation des données',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Quelle est la bonne cardinalité pour la relation entre FactSales et DimProduct dans un schéma en étoile ?',
      choices: [
        'Plusieurs à plusieurs (M:M)',
        'Un à un (1:1)',
        'Plusieurs à un (M:1) — FactSales côté Many, DimProduct côté One',
        'Un à plusieurs (1:M) — DimProduct côté One, FactSales côté Many (identique à C)',
      ],
      correctAnswers: [2],
      explanation: 'Dans un schéma en étoile, la table de faits (FactSales) contient plusieurs lignes par produit, donc elle est côté Many. DimProduct a une clé primaire unique, donc côté One. C et D sont équivalents mais C représente la convention Power BI (table actuelle → table liée).',
    },
    {
      domain: 'Visualisation',
      type: 'multi',
      difficulty: 'Intermédiaire',
      text: 'Quelles fonctionnalités Power BI permettent la navigation contextuelle entre rapports ? (Choisissez 2)',
      choices: [
        'Drillthrough — clic droit sur un point de données pour naviguer vers une page de détail',
        'Cross-filtering — sélectionner un élément filtre les autres visuels de la page',
        'Page navigation button — bouton configuré pour naviguer vers une page spécifique',
        'Report tooltip — survol d\'un visuel affiche une page de rapport en infobulle',
        'Sync slicers — synchroniser un slicer entre plusieurs pages',
      ],
      correctAnswers: [0, 2],
      explanation: 'Drillthrough (A) permet la navigation contextuelle vers une page de détail. Les boutons de navigation de page (C) permettent une navigation explicite. Cross-filtering (B) et Sync slicers (E) ne sont pas de la navigation mais du filtrage.',
    },
    {
      domain: 'Service & Déploiement',
      type: 'single',
      difficulty: 'Intermédiaire',
      text: 'Quelle licence est requise pour qu\'un utilisateur final consulte un rapport publié dans un workspace Premium ?',
      choices: [
        'Power BI Pro obligatoire pour tous les utilisateurs',
        'Power BI Free suffit si le workspace est sur une capacité Premium (P-SKU)',
        'Power BI Premium Per User (PPU) uniquement',
        'Microsoft 365 E3 inclut automatiquement les droits de lecture',
      ],
      correctAnswers: [1],
      explanation: 'Un workspace sur capacité Premium (P-SKU) permet aux utilisateurs avec une licence Free de consulter les rapports publiés. C\'est l\'un des avantages clés de Premium : distribution à grande échelle sans Pro pour les lecteurs.',
    },
  ]

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i]
    await prisma.question.upsert({
      where: { id: `pl300-q-${i + 1}` },
      update: {},
      create: {
        id: `pl300-q-${i + 1}`,
        certificationId: pl300.id,
        ...q,
      },
    })
  }

  // Enrollment for demo user
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_certificationId: { userId: user.id, certificationId: pl300.id } },
    update: {},
    create: {
      userId: user.id,
      certificationId: pl300.id,
    },
  })

  // Mark first 2 modules as done
  for (let i = 0; i < 2; i++) {
    await prisma.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: modules[i].id } },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        moduleId: modules[i].id,
        completedAt: new Date(),
        score: 85,
      },
    })
  }

  // AZ-900 enrollment
  const az900Enrollment = await prisma.enrollment.upsert({
    where: { userId_certificationId: { userId: user.id, certificationId: az900.id } },
    update: {},
    create: {
      userId: user.id,
      certificationId: az900.id,
    },
  })

  // Past exam sessions
  const pastSessions = [
    { score: 68, passed: false, timeSpentSec: 2520, completedAt: new Date('2025-06-20') },
    { score: 74, passed: false, timeSpentSec: 2280, completedAt: new Date('2025-06-22') },
    { score: 81, passed: true, timeSpentSec: 2100, completedAt: new Date('2025-06-25') },
  ]

  for (const s of pastSessions) {
    await prisma.examSession.create({
      data: {
        userId: user.id,
        certificationId: pl300.id,
        status: 'completed',
        mode: 'exam',
        totalQuestions: 30,
        timeLimitSec: 5400,
        ...s,
      },
    })
  }

  console.log('Seed terminé !')
  console.log('Utilisateur démo : demo@certprep.fr / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
