# JobSwap — application fonctionnelle (v5 : sécurité, référentiels, spécialisations)

Application web complète : inscription, profil détaillé (poste, rémunération,
avantages sociaux, prérequis, mobilité), matching pondéré multi-critères
(métier, classification, rémunération, attractivité, **distance ET temps
réel**), calcul du gain réel (économique, écologique), rayon de recherche
configurable, données de marché réelles, et base de données persistante.

## Nouveautés v5

- **Mot de passe oublié** : lien de réinitialisation envoyé par e-mail
  (Resend, gratuit jusqu'à 3000 e-mails/mois — voir `.env.example`). Sans
  clé configurée, la demande ne renvoie jamais d'erreur visible (sécurité :
  ne jamais révéler si un e-mail existe), mais aucun e-mail n'est envoyé.
- **Changer son mot de passe** une fois connecté, depuis l'onglet
  Confidentialité.
- **Codes ROME élargis** : passés de 16 à une centaine, couvrant les 14
  grands domaines professionnels du référentiel officiel, avec un champ de
  recherche au lieu d'une liste déroulante simple. Cette liste reste une
  sélection large mais **non exhaustive** (le référentiel officiel compte
  plusieurs centaines de fiches) — voir la note dans `lib/rome.ts` pour la
  piste d'exhaustivité totale via l'API officielle "ROME 4.0 - Métiers".
- **Secteurs NAF complets** : les 21 sections officielles (A à U) de la
  nomenclature INSEE, de façon exhaustive à ce niveau d'agrégation.
- **Spécialisations par métier** : pour les postes commerciaux (codes
  D14xx), deux champs supplémentaires apparaissent — type de clientèle
  (BtoB / BtoC / Mixte) et cycle de vente (court / long terme). Un champ
  libre "Spécificités du poste" couvre les autres nuances non modélisées.

## Nouveautés v4 (rappel)

- Base de données migrée de SQLite (fichier, non persistant sur la plupart
  des hébergeurs) vers **Postgres** (Neon recommandé, gratuit et durable).
- Rayon de recherche configurable, gain de temps de trajet comme critère de
  score à part entière (pas seulement le gain économique).

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Postgres** (hébergé, ex. Neon) via le driver `pg`
- **jose** : signature de session (JWT en cookie httpOnly)
- **bcryptjs** : hachage des mots de passe
- **Resend** (optionnel) : envoi d'e-mails de réinitialisation
- **OpenRouteService** (optionnel) : distance routière réelle
- **France Travail** (optionnel) et **INSEE Sirene** (aucune clé requise) :
  données de marché réelles

Les versions précédentes stockaient les données dans un simple fichier
(SQLite) sur le disque du serveur. Sur la plupart des hébergeurs (dont
Render), ce disque est recréé à neuf à chaque redéploiement — donc **toutes
les données de test disparaissaient** à chaque mise à jour de code ou de
variable d'environnement. Ce n'était pas un bug, mais une limite connue de
ce choix technique, indiquée dans les versions précédentes du README.

La v4 remplace ce fichier par une **vraie base Postgres externe** (hébergée
séparément du serveur d'application, par exemple sur **Neon**, gratuit et
sans limite de durée). Les données survivent désormais à tous les
redéploiements, changements de code, et redémarrages.

### Migrer votre déploiement existant

1. Créez un compte gratuit sur https://neon.tech
2. Créez un projet (nommez-le par exemple "jobswap")
3. Copiez la "Connection string" affichée (commence par `postgresql://`)
4. Sur Render : Environment → Add Environment Variable → clé `DATABASE_URL`,
   valeur = la chaîne copiée
5. Redéployez (Render le fait automatiquement après l'enregistrement des
   variables), puis lancez le peuplement des profils de démonstration une
   fois (voir plus bas)

**Important** : cette migration change le mécanisme de stockage. Les
données créées sous l'ancienne version (SQLite) ne sont pas transférées
automatiquement — c'est un nouveau départ, propre, mais vous devrez
recréer votre compte de test une fois la bascule faite.

### Lancer le peuplement des profils de démonstration sur Neon

Depuis votre machine, avec `DATABASE_URL` renseigné dans `.env` :
```bash
npm install
node db/seed.js
```
Ceci se connecte directement à votre base Neon et y insère les 90 profils
fictifs. Pas besoin de le refaire à chaque déploiement — c'est fait une
fois, les données restent en base.

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Postgres** (hébergé, ex. Neon) via le driver `pg`
- **jose** : signature de session (JWT en cookie httpOnly)
- **bcryptjs** : hachage des mots de passe
- **OpenRouteService** (optionnel) : distance routière réelle
- **France Travail** (optionnel) et **INSEE Sirene** (aucune clé requise) :
  données de marché réelles

## Démarrage en local

```bash
npm install
cp .env.example .env  # renseignez DATABASE_URL (Neon) et générez un vrai JWT_SECRET
node db/seed.js        # crée un bassin de 90 profils fictifs pour le matching de démo
npm run dev
```

Ouvrez http://localhost:3000.

## Activer les statistiques France Travail (optionnel)

1. Créez un compte gratuit sur https://francetravail.io
2. Créez une application, associez-la à l'API "Offres d'emploi"
3. Récupérez l'identifiant client et la clé secrète
4. Ajoutez `FT_CLIENT_ID` et `FT_CLIENT_SECRET` dans vos variables
   d'environnement (Render : Environment → Add Environment Variable)

Sans ces identifiants, la statistique correspondante est simplement
masquée — jamais de chiffre inventé. Les statistiques INSEE Sirene, elles,
fonctionnent sans aucune clé.

### Sur l'honnêteté de ces statistiques de marché

France Travail et INSEE Sirene décrivent le **marché de l'emploi en
général** (offres ouvertes, entreprises recensées) — ce ne sont **pas** des
salariés inscrits sur JobSwap prêts à échanger. L'interface le précise
explicitement. Il n'existe pas non plus, à ce jour, de donnée publique du
type "score de bien-être par métier précis" : l'enquête de référence sur le
sujet (Insee/Dares, "Conditions de travail et risques psychosociaux")
publie ses premiers résultats à partir de 2026 — à surveiller pour une
prochaine version.

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
