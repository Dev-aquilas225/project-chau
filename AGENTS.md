# Aquilas E-commerce — React + Firebase

> Plateforme e-commerce composée de **deux interfaces SPA React** partageant le même backend Firebase :
> - `frontend/` — **boutique client** (catalogue, panier, commande, compte)
> - `frontend-admin/` — **back-office admin** (gestion produits, commandes, stock, utilisateurs)
>
> Ce fichier est lu par tous les agents Claude au démarrage. Il définit le stack et les conventions qui font autorité.

## Stack technique
- **Backend / Serveur**: Firebase (BaaS) — **Firestore** (NoSQL temps réel), **Firebase Auth**, **Cloud Storage**. Pas de serveur applicatif custom ni de Cloud Functions : la logique sensible est garantie par les **Firestore Security Rules**.
- **Frontend**: React 18 + TypeScript + **Vite** — deux applications (`frontend/` client, `frontend-admin/` admin)
- **Base de données**: Cloud Firestore (mode natif, NoSQL orienté documents)
- **Auth**: Firebase Authentication (email/password + Google). Rôle admin via champ `users/{uid}.role` protégé par les Security Rules (option durcissement : custom claims posés par un script Admin SDK)
- **State / données**: **Zustand** (état UI/panier local) + **TanStack Query (React Query)** (cache des données Firestore, mutations, invalidation)
- **UI**: **Tailwind CSS** + **shadcn/ui** (composants headless Radix)
- **Conteneurs**: aucun (Firebase Hosting / Emulator Suite en local)
- **CI/CD**: GitHub Actions (lint → test → build → deploy Firebase)

## Structure du projet
```
aquilas-ecomerce-firebase/
├── frontend/               # SPA client React+Vite (boutique)
│   └── src/
│       ├── lib/firebase.ts        # init Firebase (app, auth, db, storage)
│       ├── features/              # par domaine : catalog, cart, checkout, account
│       ├── components/            # composants partagés (shadcn/ui dans ui/)
│       ├── hooks/                 # hooks React Query (useProducts, useOrder…)
│       ├── stores/                # stores Zustand (cart, ui)
│       └── routes/                # pages + routing
├── frontend-admin/         # SPA admin React+Vite (back-office)
│   └── src/                # même structure ; features : products, orders, stock, users
├── shared/                 # types TS partagés (Product, Order, User…) — OPTIONNEL
├── firestore.rules         # Security Rules Firestore (source de sécurité principale)
├── storage.rules           # Security Rules Cloud Storage
├── firestore.indexes.json  # index composites Firestore
├── firebase.json           # config Firebase (hosting, emulators, rules)
└── docs/                   # ADR, architecture, modèle de données
```

## Commandes essentielles

### Frontend client (`frontend/`)
```bash
npm run dev                      # Vite dev server (HMR)
npm run build                    # build production (tsc + vite build)
npm run preview                  # prévisualiser le build
npm run test                     # tests unitaires (Vitest)
npm run test:coverage            # tests avec couverture
npm run lint                     # ESLint
npm run e2e                      # tests E2E (Playwright)
```

### Frontend admin (`frontend-admin/`)
```bash
npm run dev                      # même set de scripts que le client
npm run build
npm run test
npm run e2e
```

### Firebase
```bash
firebase emulators:start         # Firestore + Auth + Storage en local
firebase deploy --only firestore:rules    # déployer les Security Rules
firebase deploy --only storage             # déployer les rules Storage
firebase deploy --only firestore:indexes   # déployer les index composites
firebase deploy --only hosting             # déployer les SPA
firebase deploy                            # tout déployer
```

## Architecture Backend (Firebase)

> Il n'y a pas d'API REST ni de couche serveur : le frontend parle **directement** à Firestore/Auth/Storage via le SDK. La sécurité n'est donc **jamais** côté client — elle est entièrement portée par `firestore.rules` et `storage.rules`. Toute règle métier qui doit être inviolable s'écrit dans les Security Rules.

### Collections / Domaines principaux
- **Auth** — Firebase Auth (email/password, Google). Document miroir `users/{uid}` créé à l'inscription (rôle, profil)
- **users** — `users/{uid}` : profil, `role` (`customer` | `admin`), adresses, créé à l'inscription
- **products** — catalogue : nom, description, prix, images (URLs Storage), `categoryId`, `stock`, `active`
- **categories** — arborescence de catégories produit
- **carts** — `carts/{uid}` : panier persistant de l'utilisateur (souvent aussi en local Zustand)
- **orders** — commandes : `userId`, lignes, total, `status` (`pending`→`paid`→`shipped`→`delivered`/`cancelled`), `createdAt`
- **reviews** — avis produits : `productId`, `userId`, note, commentaire

### Conventions de nommage
- Fichiers composants: `PascalCase.tsx` (ex: `ProductCard.tsx`)
- Fichiers hooks/utils/stores: `camelCase.ts` (ex: `useProducts.ts`, `cartStore.ts`)
- Composants & types: PascalCase (`ProductCard`, `OrderStatus`)
- Variables/fonctions: camelCase
- Constantes: UPPER_SNAKE_CASE
- Collections Firestore: camelCase pluriel (`products`, `orderItems`)
- Champs de documents: camelCase (`createdAt`, `categoryId`, `unitPrice`)

### Pattern d'accès aux données
Accès Firestore encapsulé dans une **couche `features/<domaine>/api.ts`** (fonctions typées : `getProducts`, `createOrder`…) consommée par des **hooks React Query** (`useProducts`, `useCreateOrder`). Jamais d'appel Firestore brut directement dans un composant. Typage strict via `FirestoreDataConverter<T>` pour mapper documents ⇄ types TS.

### Validation des inputs
**Zod** pour valider tous les formulaires (react-hook-form + `@hookform/resolvers/zod`) ET les données lues depuis Firestore avant usage. Un schéma Zod par entité, dérivé en type TS via `z.infer`. La validation côté client est de l'UX — la validation **de sécurité** vit dans les Security Rules.

### Gestion des erreurs
Erreurs Firebase (`FirebaseError.code`) mappées vers des messages utilisateur via un helper centralisé. React Query gère les états `isError`/`error` ; affichage via toast (shadcn/ui `sonner`). Error boundary React au niveau racine.

## Architecture Frontend

### Structure des modules (identique pour `frontend/` et `frontend-admin/`)
```
src/
├── lib/firebase.ts       # init SDK (initializeApp, getAuth, getFirestore, getStorage)
├── features/<domaine>/
│   ├── api.ts            # accès Firestore typé (converters)
│   ├── hooks.ts          # hooks React Query (queries + mutations)
│   ├── schemas.ts        # schémas Zod + types
│   └── components/       # composants spécifiques au domaine
├── components/ui/        # shadcn/ui (button, dialog, input…)
├── components/           # composants partagés transverses
├── hooks/                # hooks transverses (useAuth, useDebounce…)
├── stores/               # stores Zustand (cartStore, uiStore)
└── routes/               # pages + configuration du routing
```

### State management
- **Zustand** : état UI local et panier (`cartStore`) — léger, sans boilerplate
- **TanStack Query (React Query)** : toute donnée serveur (Firestore). `queryKey` namespacée (`['products', filters]`), invalidation après mutation, `staleTime` adapté. Pour le temps réel, `onSnapshot` synchronisé dans le cache React Query si nécessaire.
- Auth exposée via un `AuthProvider` + hook `useAuth()` (écoute `onAuthStateChanged`)

### Conventions
- Composants fonctionnels + hooks. `React.memo` sur les éléments de liste coûteux.
- Lazy loading par route (`React.lazy` + `Suspense`).
- Séparation **smart/dumb** : composants "container" gèrent les hooks/data, "presentational" reçoivent des props.
- `data-testid` sur tous les éléments interactifs testés.
- Tailwind pour le style ; pas de CSS inline arbitraire ; tokens de design centralisés (`tailwind.config`).

## Base de données (Firestore)

### Variables d'environnement (`frontend/.env` et `frontend-admin/.env`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATORS=false        # true en dev local pour brancher l'Emulator Suite
```
> ⚠️ La config Firebase web (`apiKey`…) **n'est pas un secret** : elle est publique côté client. La sécurité repose sur les Security Rules, pas sur la confidentialité de ces clés. Ne jamais mettre de clé Admin SDK ou de secret de paiement dans le frontend.

### Schéma principal (collections Firestore)
- `users/{uid}` — `email`, `displayName`, `role` (`customer`|`admin`), `addresses[]`, `createdAt`
- `products/{productId}` — `name`, `description`, `price`, `images[]`, `categoryId`, `stock`, `active`, `createdAt`
- `categories/{categoryId}` — `name`, `slug`, `parentId?`
- `carts/{uid}` — `items[]` (`{productId, qty, unitPrice}`), `updatedAt`
- `orders/{orderId}` — `userId`, `items[]`, `total`, `status`, `shippingAddress`, `createdAt`
- `reviews/{reviewId}` — `productId`, `userId`, `rating`, `comment`, `createdAt`

### Modélisation NoSQL
- **Dénormaliser pour la lecture** : copier `productName`/`unitPrice` dans les lignes de commande (une commande est un instantané immuable).
- **Index composites** déclarés dans `firestore.indexes.json` pour toute requête multi-champs (ex: `where('categoryId').orderBy('price')`).
- **Pas de jointures** : structurer les collections selon les écrans à servir.

## Sécurité (OWASP + spécifique Firebase)
- **Security Rules = ligne de défense principale.** Chaque collection a des règles `read`/`write` explicites. Refus par défaut (`allow read, write: if false`).
- **Contrôle d'accès** : un utilisateur ne lit/écrit que ses propres `orders`/`carts` (`request.auth.uid == resource.data.userId`). Les écritures admin (`products`, `categories`, modification de `status` de commande) exigent `isAdmin()`.
- **Rôle admin vérifié dans les rules** : `get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role == 'admin'` (ou custom claim `request.auth.token.admin == true`). Jamais de contrôle de rôle uniquement côté React.
- **Validation des écritures dans les rules** : types, bornes, champs autorisés (`request.resource.data.keys().hasOnly([...])`), empêcher un client de fixer `role`, `total`, `status` arbitrairement.
- **Storage rules** : upload d'images produit réservé aux admins ; taille et `contentType` (`image/*`) contraints.
- **Validation des inputs** côté client via Zod (UX) + **revalidation dans les Security Rules** (sécurité).
- **Pas de secret côté client** : aucune clé privée, secret de paiement, ni Admin SDK dans le frontend.
- **Auth** : sessions gérées par le SDK Firebase (tokens rafraîchis automatiquement, stockés par le SDK). Forcer la vérification d'email sur les actions sensibles si requis.
- **Énumération** : ne pas exposer via les rules/messages d'erreur l'existence de comptes.

## Tests
- **Unitaires / composants**: **Vitest** + **React Testing Library**
- **Security Rules**: **`@firebase/rules-unit-testing`** contre l'Emulator Suite (test des règles read/write par rôle) — **obligatoire** pour toute modification de `firestore.rules`
- **E2E**: **Playwright** (parcours client : ajout panier → checkout ; parcours admin : création produit)
- **Mocks Firebase**: Emulator Suite (Firestore/Auth/Storage) pour les tests d'intégration, pas de mock manuel du SDK quand l'émulateur suffit
- **Couverture minimale**: 80% sur les hooks/api/logique métier
- **Fixtures**: `@faker-js/faker` pour générer produits/commandes de test

## Qualité de code
- **ESLint + Prettier** (config partagée entre les deux apps)
- **TypeScript strict** (`strict: true`, pas de `any` implicite)
- Pre-commit hooks: **Husky + lint-staged**
- Convention de commits: **Conventional Commits**

---

## Agents disponibles (`.claude/agents/`)

Les agents sont des sous-agents spécialisés invocables via le tool `Agent`. Chaque fichier `.md` dans `.claude/agents/` définit un rôle, ses responsabilités et ses règles de travail. **Tous les agents lisent `CLAUDE.md` au démarrage** pour connaître le stack (React+Firebase) et les conventions du projet.

### Quand et comment les utiliser

Passer le contexte nécessaire dans le prompt de l'agent (fichiers concernés, objectif, contraintes, et **quelle app** : `frontend/` client ou `frontend-admin/` admin). Les agents ne lisent pas la conversation en cours — il faut les briefer explicitement.

### Catalogue des agents

#### Planification & Architecture
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **Orchestrateur** | `orchestrateur.md` | Dirige les autres agents en séquence pour livrer une fonctionnalité complète | On veut déléguer un workflow entier sans interventions manuelles |
| **Agenda** | `agenda.md` | Élabore un plan d'exécution détaillé avant toute implémentation majeure | Avant de commencer une nouvelle feature complexe |
| **Scout** | `scout.md` | Cartographie le code existant sans le modifier — localise patterns, fichiers, dette technique | En début de tâche pour explorer avant d'implémenter |

#### Développement
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **Codeur** | `codeur.md` | Implémente les fonctionnalités en respectant les conventions CLAUDE.md | Implémentation d'une feature après planification |
| **Spécialiste Firebase** | `specialiste-backend.md` | Expert Firestore/Auth/Storage — modèle de données, accès typé, **Security Rules**, custom claims | Travaux data/sécurité : collections, rules, auth, storage |
| **Spécialiste Frontend** | `specialiste-frontend.md` | Expert React — composants, Zustand, React Query, Tailwind/shadcn, routing | Travaux UI (client ou admin) |
| **Fullstack + Perf** | `fullstack-et-perf.md` | Implémente de bout en bout (Firestore → rules → hooks → UI → tests) et optimise les performances | Feature complète cross-couches ou goulots d'étranglement |

#### Qualité & Tests
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **Testeur** | `testeur.md` | Écrit/exécute les tests (Vitest, RTL, Playwright, rules-unit-testing) ; bloque si couverture insuffisante | Écriture de tests, vérification de couverture/rules |
| **Réviseur** | `reviseur.md` | Code review rigoureux (qualité, sécurité, perf) avant merge | Avant toute PR — vérification finale |
| **Débogueur** | `debogueur.md` | Analyse les erreurs par RCA (root cause analysis) sans fix hâtif | Investigation de bug |

#### Sécurité
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **Auditeur Sécurité** | `auditeur-securite.md` | Audit OWASP + Firebase — Security Rules, exposition côté client, dépendances | Avant une release ou après modif des rules |
| **Pentester** | `pentester.md` | Simule des attaques (bypass de rules, IDOR Firestore, escalade de rôle) | Test d'intrusion avant mise en production |

#### Infrastructure & Données
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **DevOps** | `devops.md` | Firebase CLI, Emulator Suite, GitHub Actions, déploiement Hosting/Rules, env vars | Changements config Firebase, pipeline, déploiement |
| **DBA / Data Modeler** | `dba.md` | Modélisation Firestore, dénormalisation, index composites, migrations de données | Conception/évolution du modèle de données, requêtes lentes |

#### Design & Documentation
| Agent | Fichier | Rôle | Déclencher quand… |
|-------|---------|------|-------------------|
| **Concepteur UI** | `concepteur-ui.md` | Définit UX, cohérence visuelle, design system (Tailwind/shadcn), interactions | Specs d'interface, design system, accessibilité |
| **Documentation** | `documentation.md` | Maintient README, modèle de données, CONTRIBUTING, CHANGELOG, ADR | Avant/après chaque release, ajout de feature |

### Workflows types (via Orchestrateur)

```
Nouvelle feature complète :
  Agenda → Scout → DBA (modèle + rules) → Spécialiste Firebase → Spécialiste Frontend → Testeur → Réviseur

Bug critique :
  Débogueur → Codeur → Testeur → Réviseur

Préparation release :
  Testeur → Auditeur Sécurité (rules!) → Réviseur → Documentation → DevOps (deploy)

Évolution du modèle de données :
  Scout → DBA → Spécialiste Firebase (rules + migration script) → Testeur
```

### Exemple d'invocation

```
Agent({
  prompt: "Ajoute la gestion du statut de commande dans le back-office.
           App : frontend-admin/. Collection Firestore : orders (champ status).
           Mettre à jour firestore.rules pour autoriser la transition de statut aux admins uniquement.
           Fichiers : frontend-admin/src/features/orders/. Respecter les conventions de CLAUDE.md."
})
```

> **Note** : Les agents lisent `CLAUDE.md` au démarrage. Toujours préciser l'app concernée (`frontend/` ou `frontend-admin/`), les collections Firestore touchées, et l'impact sur les Security Rules.
