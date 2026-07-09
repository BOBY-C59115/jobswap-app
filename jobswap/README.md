# JobSwap — application fonctionnelle (v3 : données de marché réelles)

Application web complète : inscription, profil détaillé (poste, rémunération,
avantages sociaux, prérequis, mobilité), matching pondéré multi-critères,
calcul du gain réel (économique via le barème kilométrique fiscal officiel,
écologique via les facteurs ADEME), et données de marché réelles (offres
d'emploi France Travail, établissements INSEE Sirene) pour donner du
contexte tant qu'il y a peu de profils inscrits.

## Nouveautés v3

- **Page publique "Pourquoi JobSwap"** (`/pourquoi`) : statistiques citées et
  sourcées sur le lien trajet/bien-être (études IFOP, OpinionWay), plus un
  widget en direct interrogeant deux APIs publiques réelles.
- **Onglet "Marché"** dans le tableau de bord : les mêmes données, calculées
  automatiquement à partir du profil de l'utilisateur connecté.
- **France Travail** (`lib/francetravail.ts`) : nombre réel d'offres
  d'emploi ouvertes pour le code ROME et le département de l'utilisateur,
  avec quelques exemples et attribution de la source. Nécessite un compte
  gratuit sur francetravail.io (voir `.env.example`). Sans identifiants
  configurés, la statistique est simplement masquée — jamais de chiffre
  inventé.
- **INSEE Sirene** (`lib/entreprises.ts`), via l'API publique et **gratuite
  sans inscription** `recherche-entreprises.api.gouv.fr` : nombre réel
  d'établissements du secteur d'activité choisi, recensés à proximité.
  Fonctionne dès le déploiement, aucune clé requise.

### Sur l'honnêteté de ces statistiques

Ces deux sources décrivent le **marché de l'emploi en général** (offres
ouvertes, entreprises recensées) — ce ne sont **pas** des salariés inscrits
sur JobSwap prêts à échanger. L'interface le précise explicitement pour ne
jamais laisser croire à un volume de matches qui n'existe pas encore. Il n'y
a pas non plus, à ce jour, de donnée publique du type "score de bien-être
par métier précis" : l'enquête de référence sur le sujet (Insee/Dares,
"Conditions de travail et risques psychosociaux") publie ses premiers
résultats à partir de 2026 — à surveiller pour une v4.

### Activer les statistiques France Travail

1. Créez un compte gratuit sur https://francetravail.io
2. Créez une application, associez-la à l'API "Offres d'emploi"
3. Récupérez l'identifiant client et la clé secrète
4. Ajoutez `FT_CLIENT_ID` et `FT_CLIENT_SECRET` dans vos variables
   d'environnement (Render : Settings → Environment)

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **better-sqlite3** : base de données fichier, aucune dépendance externe
- **jose** : signature de session (JWT en cookie httpOnly)
- **bcryptjs** : hachage des mots de passe
- **OpenRouteService** (optionnel) : distance routière réelle
- **France Travail** (optionnel) et **INSEE Sirene** (aucune clé requise) :
  données de marché réelles

## Démarrage en local

```bash
npm install
node db/seed.js       # crée un bassin de 90 profils fictifs pour le matching de démo
cp .env.example .env  # puis générez un vrai JWT_SECRET (voir commentaire dans le fichier)
npm run dev
```

Ouvrez http://localhost:3000.

## Activer la distance réelle par la route (recommandé)

1. Créez un compte gratuit sur https://openrouteservice.org/dev/#/signup
2. Récupérez votre clé API
3. Ajoutez `ORS_API_KEY=votre_clé` dans votre fichier `.env` (en local) ou dans
   les variables d'environnement de votre hébergeur (Render, etc.)

Sans cette clé, l'application fonctionne quand même, avec une estimation
moins précise, clairement signalée comme telle dans l'interface.

## Build de production

```bash
npm run build
npm start
```

## Mise en ligne réelle — ce qu'il reste à faire

Ce code est un vrai backend fonctionnel, mais avant une mise en ligne
publique, complétez ces points :

1. **Hébergement** : SQLite fonctionne très bien sur un serveur avec disque
   persistant (VPS, Railway, Render, Fly.io, Docker). Il n'est **pas**
   adapté à un hébergement serverless sans disque persistant (Vercel
   Functions, par exemple) — dans ce cas, remplacez `better-sqlite3` par
   une base Postgres managée (Neon, Supabase, Railway Postgres) : seul le
   fichier `db/client.ts` et `db/queries.ts` sont à adapter, le reste de
   l'application (API, pages) n'a pas besoin de changer.
2. **JWT_SECRET** : générez une vraie valeur aléatoire
   (`openssl rand -base64 48`) et définissez-la comme variable
   d'environnement sur votre hébergeur. Ne jamais utiliser la valeur par
   défaut en production.
3. **Nom de domaine + HTTPS** : à configurer chez votre hébergeur.
4. **Mentions légales et CGU** : à faire relire par un juriste avant mise
   en ligne (la page confidentialité couvre les mécanismes RGPD mais pas
   les mentions légales obligatoires).
5. **DPO réel** : remplacez `dpo@jobswap.fr` par une adresse surveillée.
6. **Sauvegardes** : mettez en place une sauvegarde régulière du fichier
   SQLite (ou de la base Postgres) si vous passez en production.
7. **Paiement** (si vous activez l'abonnement B2B/Premium du pitch) :
   intégration Stripe à ajouter, non incluse ici.
8. **Volumes de profils réels** : le bassin de 90 profils de démonstration
   (`db/seed.js`) sert uniquement à peupler le matching en l'absence
   d'utilisateurs réels. Retirez-le ou remplacez-le progressivement par de
   vrais utilisateurs une fois en production.

## Structure du projet

```
app/
  page.tsx                    landing page
  inscription/, connexion/    auth (client components)
  dashboard/                  espace connecté (protégé par middleware.ts)
    profil/                   édition du profil anonymisé
    matches/                  matches calculés côté serveur
    simulateur/               simulateur coût/temps/CO2
    confidentialite/          consentements RGPD, export, suppression
  api/                        route handlers (vraie logique serveur)
db/
  schema.sql                  schéma SQL
  client.ts                   connexion SQLite + bootstrap du schéma
  queries.ts                  toutes les requêtes (utilisateurs, profils,
                               consentements, bassin de matching)
  seed.js                     script de peuplement du bassin de démo
lib/
  auth.ts                     hash mot de passe + session JWT
  matching.ts                 algorithme de scoring multi-critères
  geo.ts                      distances géographiques (haversine)
  rome.ts                     référentiel de métiers (codes ROME)
middleware.ts                 protège les routes /dashboard/*
```

## Algorithme de matching

Score sur 100 points, calculé en temps réel côté serveur
(`lib/matching.ts`) :

- **Métier (40 pts)** : code ROME identique = 40, même famille = 26,
  sinon 6
- **Classification (20 pts)** : dégressif selon l'écart de niveau
- **Type de contrat (10 pts)** : CDI/CDI ou CDD/CDD = 10, sinon 4
- **Proximité géographique (30 pts)** : dégressif selon la distance
  (haversine) entre les deux lieux de travail

Le matching respecte le consentement RGPD : si la phase 2 est désactivée
par l'utilisateur, l'API `/api/matches` retourne une liste vide avec une
explication, sans calculer aucun score.
