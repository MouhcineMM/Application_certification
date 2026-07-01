# CertPrep Pro

Plateforme de préparation aux certifications professionnelles (Power BI PL-300, Azure, AWS, PMI...) construite avec Next.js 14, Prisma, PostgreSQL et NextAuth.js.

## Stack

- **Framework** : Next.js 14 (App Router, Server Components)
- **Base de données** : PostgreSQL via Prisma ORM
- **Authentification** : NextAuth.js v5 (credentials, extensible OAuth)
- **Style** : Tailwind CSS + CSS-in-JS inline (design tokens partagés)
- **Validation** : Zod

## Installation

### 1. Prérequis

- Node.js 18.17+ 
- PostgreSQL 14+ (local, Docker, ou un service managé type Supabase/Neon/Railway)

### 2. Cloner et installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` et renseignez :
- `DATABASE_URL` : votre chaîne de connexion PostgreSQL
- `NEXTAUTH_SECRET` : générez-en un avec `openssl rand -base64 32`

### 4. Initialiser la base de données

```bash
npm run db:push     # crée les tables à partir du schema Prisma
npm run db:seed     # insère les certifications, modules et 20 questions PL-300
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

### Compte de démonstration

```
Email    : demo@certprep.fr
Mot de passe : password123
```

## Structure du projet

```
src/
  app/
    login/                  Page de connexion
    dashboard/
      layout.tsx            Shell avec sidebar (protégé par auth)
      page.tsx               Tableau de bord (métriques, certifs en cours)
      catalog/                Catalogue des certifications + filtres
      cert/[code]/            Détail d'une certification (modules, historique)
      exam/                   Configuration + déroulé de l'examen blanc
      progress/               Graphiques de progression et recommandations
    api/
      auth/[...nextauth]/     Handler NextAuth
      enrollments/            Inscription à une certification
      exams/start/            Démarrage d'une session d'examen (questions aléatoires)
      exams/[sessionId]/submit/  Soumission et correction de l'examen
  components/
    layout/Sidebar.tsx        Navigation latérale
  lib/
    auth.ts                  Config NextAuth (credentials + Prisma adapter)
    prisma.ts                Client Prisma singleton
  types/
    index.ts                  Types partagés front
    next-auth.d.ts            Augmentation des types de session NextAuth

prisma/
  schema.prisma               Modèle de données complet
  seed.ts                     Données de démo (6 certifications, 20 questions PL-300)
```

## Modèle de données (résumé)

- **User** — profil, XP, niveau, streak
- **Certification** → **Module** → **Lesson** — contenu pédagogique
- **Enrollment** / **ModuleProgress** — suivi de progression par utilisateur
- **Question** — banque de questions (DAX, Power Query, Modélisation...) avec choix, réponses correctes (JSON), explication
- **ExamSession** / **ExamQuestion** — une session d'examen et ses questions tirées au sort, avec réponses utilisateur et correction
- **QuestionAnswer** — historique brut pour les statistiques par domaine

## Fonctionnalités implémentées

- Authentification par email/mot de passe (extensible à Google/GitHub OAuth)
- Catalogue de certifications avec filtres par catégorie et inscription en un clic
- Page de détail certification : modules, progression, historique d'examens
- Examen blanc configurable : nombre de questions (10/20/30/50), mode Révision (feedback immédiat) ou Examen (chronométré, résultats à la fin)
- Questions tirées aléatoirement depuis la base, choix unique et choix multiples
- Correction automatique avec calcul du score, statistiques par domaine, XP gagné
- Tableau de bord avec métriques globales et performance par domaine (jauges circulaires SVG)
- Page Progression avec graphique d'évolution des scores (SVG natif, sans dépendance de charting) et recommandations personnalisées générées à partir des domaines faibles

## Prochaines étapes suggérées

- Pages de contenu des modules (`Lesson`) avec lecteur vidéo/texte et suivi de complétion
- OAuth Google/GitHub (déjà préparé dans `lib/auth.ts`, providers commentés à activer)
- Paiement Stripe pour les certifications payantes
- Upload d'avatar / pièces jointes via S3
- Mode hors-ligne / PWA pour réviser sans connexion
- Tests unitaires (Vitest) et end-to-end (Playwright) sur le flux d'examen

## Déploiement

Le projet est prêt pour un déploiement sur **Vercel** (frontend + API routes) avec une base PostgreSQL managée (Neon, Supabase, Railway, ou RDS). Pensez à exécuter `npm run db:push` et `npm run db:seed` après le premier déploiement, ou à configurer une migration Prisma classique (`prisma migrate deploy`) pour la production.
