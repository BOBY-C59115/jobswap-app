# JobSwap — application fonctionnelle (v2 : critères complets + calculs officiels)

Application web complète : inscription, profil détaillé (poste, rémunération,
avantages sociaux, prérequis, mobilité), matching pondéré multi-critères,
calcul du gain réel (économique via le barème kilométrique fiscal officiel,
écologique via les facteurs ADEME) à partir d'une distance domicile-travail
calculée par itinéraire routier réel, et back-office RGPD.

## Nouveautés v2

- Résidence et lieu de travail sont désormais des champs distincts : le gain
  d'un match se calcule depuis VOTRE domicile vers le lieu de travail du
  candidat, pas une moyenne approximative.
- Distance calculée par itinéraire routier réel via **OpenRouteService**
  (clé API gratuite optionnelle — voir `.env.example`). Sans clé, une
  estimation corrigée (vol d'oiseau × 1,3) est utilisée à la place, et
  clairement indiquée comme telle dans l'interface.
- Coût annuel calculé avec le **vrai barème kilométrique fiscal 2026**
  (`lib/bareme.ts`), pas une approximation.
- CO2 calculé avec les **facteurs ADEME réels** (`lib/emissions.ts`) :
  carburant, fabrication amortie, mix électrique français.
- Formulaire de profil étendu : rémunération brute, avantages sociaux
  (mutuelle, RTT, télétravail, CSE...), conditions de travail, prérequis
  (diplôme, certifications, permis), critères subjectifs (management,
  ambiance, évolution, stress), véhicule actuel détaillé (motorisation,
  puissance fiscale, consommation), mobilité envisagée après échange.
- Le référentiel complet des critères (avec toutes les sources officielles)
  est dans `JobSwap_Criteres_v2.md`, fourni séparément.

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **better-sqlite3** : base de données fichier, aucune dépendance externe
- **jose** : signature de session (JWT en cookie httpOnly)
- **bcryptjs** : hachage des mots de passe
- **OpenRouteService** (optionnel) : distance routière réelle

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
