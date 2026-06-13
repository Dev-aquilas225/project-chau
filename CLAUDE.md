# Aquilas E-commerce — React + NestJS + PostgreSQL

> Plateforme e-commerce composée de **deux interfaces SPA React** partageant la même API REST :
> - `frontend/` — **boutique client** (catalogue, panier, commande, compte)
> - `frontend-admin/` — **back-office admin** (gestion produits, commandes, stock, utilisateurs)
> - `backend/` — **API REST NestJS** + PostgreSQL (TypeORM)
>
> Ce fichier est lu par tous les agents Claude au démarrage. Il définit le stack et les conventions qui font autorité.
>
> ⚠️ **Migration Firebase → NestJS/PostgreSQL effectuée.** Les fichiers `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json` sont **obsolètes/legacy** (conservés temporairement pour référence, seront supprimés dans un commit de nettoyage séparé). Ne plus s'appuyer sur le SDK Firebase ni sur les Security Rules : la sécurité est désormais portée par les **Guards NestJS** (`JwtAuthGuard`, `RolesGuard`).

## Stack technique
- **Backend / Serveur**: **NestJS** (Node.js/TypeScript) — API REST modulaire, exposée sous le préfixe `/api`. Pas de BaaS : la logique métier et la sécurité vivent dans les modules NestJS (services + guards + DTOs).
- **Frontend**: React 18 + TypeScript + **Vite** — deux applications (`frontend/` client, `frontend-admin/` admin)
- **Base de données**: **PostgreSQL** via **TypeORM** (entités, migrations, `synchronize: false`)
- **Auth**: JWT (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`). Mot de passe hashé avec **bcrypt**. Rôle admin via champ `users.role` (`customer`|`admin`), vérifié par `RolesGuard` + décorateur `@Roles('admin')`
- **State / données**: **Zustand** (état UI/panier local) + **TanStack Query (React Query)** (cache des données API REST, mutations, invalidation)
- **UI**: **Tailwind CSS** + **shadcn/ui** (composants headless Radix)
- **Conteneurs**: Docker / docker-compose (services `postgres`, `backend`, `frontend`, `frontend-admin`)
- **CI/CD**: GitHub Actions (lint → test → build → deploy)

## Structure du projet
```
project-chau/
├── backend/                # API REST NestJS + TypeORM + PostgreSQL
│   └── src/
│       ├── main.ts                # bootstrap (CORS, ValidationPipe, préfixe /api, static /uploads)
│       ├── app.module.ts          # TypeOrmModule + imports des modules métier
│       ├── data-source.ts         # DataSource CLI (migrations)
│       ├── auth/                  # AuthModule : register/login/me, JwtStrategy, guards, decorators
│       ├── users/                 # UsersModule : profil, gestion rôles (admin)
│       ├── categories/            # CategoriesModule : CRUD catégories
│       ├── products/              # ProductsModule : CRUD produits, filtres, recherche
│       ├── orders/                # OrdersModule : commandes (création, suivi statut)
│       ├── uploads/                # UploadsModule : upload images produit (admin, Multer)
│       └── migrations/            # migrations TypeORM
├── frontend/               # SPA client React+Vite (boutique)
│   └── src/
│       ├── lib/http.ts             # client HTTP (apiFetch, ApiError, token JWT)
│       ├── features/              # par domaine : catalog, cart, checkout, account, auth, orders
│       ├── components/            # composants partagés (shadcn/ui dans ui/)
│       ├── hooks/                 # hooks React Query (useProducts, useOrder…)
│       ├── stores/                # stores Zustand (cart, ui, favorites)
│       └── routes/                # pages + routing
├── frontend-admin/         # SPA admin React+Vite (back-office)
│   └── src/                # même structure ; features : products, orders, stock, users
├── shared/                 # types TS partagés (Product, Order, User…) — OPTIONNEL
├── docker-compose.yaml     # services postgres + backend + frontend + frontend-admin
├── firestore.rules         # ⚠️ OBSOLÈTE (legacy Firebase, à supprimer plus tard)
├── storage.rules           # ⚠️ OBSOLÈTE (legacy Firebase, à supprimer plus tard)
├── firestore.indexes.json  # ⚠️ OBSOLÈTE (legacy Firebase, à supprimer plus tard)
├── firebase.json           # ⚠️ OBSOLÈTE (legacy Firebase, à supprimer plus tard)
└── docs/                   # ADR, architecture, modèle de données
```

## Commandes essentielles

### Backend (`backend/`)
```bash
npm run start:dev                # NestJS en mode watch
npm run build                    # build production (tsc)
npm run test                     # tests unitaires (Jest)
npm run test:e2e                 # tests e2e (Jest + Supertest, nécessite Postgres)
npm run test:cov                 # couverture
npm run lint                     # ESLint
npm run migration:generate -- src/migrations/NomMigration
npm run migration:run
npm run migration:revert
npm run seed                     # crée l'admin par défaut (admin@gmail.com / admin1234) si absent — idempotent
```

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

### Docker / local
```bash
docker compose up -d postgres    # PostgreSQL local
docker compose up --build        # tous les services (backend + 2 SPA + postgres)
```

## Architecture Backend (NestJS + PostgreSQL)

> Le frontend parle à l'API REST NestJS via `apiFetch` (`lib/http.ts`). La sécurité n'est **jamais** côté client — elle est portée par les **guards NestJS** (`JwtAuthGuard`, `RolesGuard`) et la validation des DTOs (`class-validator`, `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`).

### Modules / Domaines principaux
- **AuthModule** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`. JWT signé via `@nestjs/jwt`, payload `{ sub, email, role }`. Mots de passe hashés avec bcrypt (`passwordHash`, colonne `select: false`).
- **UsersModule** — `users` : profil (`email`, `displayName`, `role`, `addresses[]` jsonb, `createdAt`). `GET/PATCH /api/users/me` (self), `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id/role` (admin uniquement, `RolesGuard`).
- **CategoriesModule** — `categories` : arborescence (`name`, `slug`, `parentId`). Lecture publique, écriture admin uniquement.
- **ProductsModule** — `products` : catalogue (`name`, `brand`, `description`, `price`, `images[]` jsonb, `categoryId`, `stock`, `active`, `weLove`, `condition`, `size`, `location`). Lecture publique avec filtres (`category`, `minPrice`/`maxPrice`, `search`, `sort`), écriture admin uniquement (`RolesGuard`).
- **OrdersModule** — `orders` : `userId`, `items[]` (jsonb, dénormalisé : `productName`/`unitPrice`/`qty`/`image` figés à la commande), `subtotal`/`discount`/`total`, `promoCode`, `status` (`pending`→`paid`→`shipped`→`delivered`/`cancelled`), `shippingAddress` (jsonb), `paymentMethod`, `createdAt`/`updatedAt`. Client crée/lit ses propres commandes (`POST /api/orders`, `GET /api/orders/mine`) ; admin gère le statut (`GET /api/orders`, `PATCH /api/orders/:id/status`).
- **UploadsModule** — `POST /api/uploads/product-image` (admin uniquement) : upload Multer vers `./uploads/products`, servi statiquement sous `/uploads/`.
- **ReviewsModule** — `reviews` : `userId`, `productId`, `rating` (1-5), `comment`, `createdAt`. `GET /api/products/:id/reviews` (lecture publique, renvoie `{ items, average, count }`), `POST /api/products/:id/reviews` (utilisateur authentifié, `JwtAuthGuard`).
- **FavoritesModule** — `favorites` : `userId`, `productId` (unique par paire). `GET /api/favorites` (mes favoris), `POST /api/favorites` (`{ productId }`), `DELETE /api/favorites/:productId` — toutes les routes exigent `JwtAuthGuard` (un user ne voit/modifie que ses propres favoris).
- **PromoCodesModule** — `promo_codes` : `code` (unique), `discountType` (`percentage`|`fixed`), `discountValue`, `minAmount`, `expiresAt`, `active`. `POST /api/promo-codes/validate` (public, `{ code, subtotal }` → `{ discount, total, ... }`, source de vérité pour le calcul de remise au checkout). CRUD admin (`GET/POST/PATCH/DELETE /api/promo-codes`, `RolesGuard` + `@Roles('admin')`).
- **AdminDashboardModule** — `GET /api/admin/dashboard/stats` (admin uniquement) : chiffre d'affaires (commandes `paid`+`shipped`+`delivered`), nombre de commandes par statut, produits en rupture de stock (`stock = 0`), 5 dernières commandes.
- **SeedModule** — `SeedService` exécuté au démarrage (`OnModuleInit`) : crée un utilisateur admin par défaut (`admin@gmail.com` / `admin1234`, rôle `admin`) si absent (idempotent). Exécutable aussi en standalone via `npm run seed`.

> Hors scope v1 (non migré) : **carts** (panier persistant serveur — reste en local Zustand ; les favoris, eux, sont synchronisés via `favorites`).

### Conventions de nommage
- Fichiers composants: `PascalCase.tsx` (ex: `ProductCard.tsx`)
- Fichiers hooks/utils/stores: `camelCase.ts` (ex: `useProducts.ts`, `cartStore.ts`)
- Composants & types: PascalCase (`ProductCard`, `OrderStatus`)
- Variables/fonctions: camelCase
- Constantes: UPPER_SNAKE_CASE
- Modules NestJS par domaine : `*.module.ts`, `*.controller.ts`, `*.service.ts`, `entities/`, `dto/`
- Tables PostgreSQL: camelCase pluriel (`products`, `orders`)
- Colonnes: camelCase (`createdAt`, `categoryId`, `unitPrice`)

### Pattern d'accès aux données
Frontend : accès API encapsulé dans une **couche `features/<domaine>/api.ts`** (fonctions typées : `getProducts`, `createOrder`…) consommée par des **hooks React Query** (`useProducts`, `useCreateOrder`). Jamais d'appel `fetch` brut dans un composant — toujours via `apiFetch<T>()` (`lib/http.ts`).
Backend : chaque module a un `service` qui encapsule l'accès TypeORM (repository pattern), un `controller` qui expose les routes REST avec guards/DTOs, et des `entities/` typées.

### Validation des inputs
**Frontend** : **Zod** pour valider tous les formulaires (react-hook-form + `@hookform/resolvers/zod`). Validation côté client = UX.
**Backend** : **class-validator**/**class-transformer** sur les DTOs (`CreateProductDto`, `CreateOrderDto`, etc.), appliqués globalement via `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`. La validation **de sécurité** vit dans les DTOs + guards NestJS, jamais uniquement côté React.

### Gestion des erreurs
Le backend renvoie des erreurs HTTP standard NestJS (`ConflictException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, erreurs 400 de validation). Le frontend capture ces erreurs via `ApiError` (`status`, `code`, `message` — `lib/http.ts`) et les mappe vers des messages utilisateur via `apiErrorMessage()` (`lib/utils.ts`). React Query gère les états `isError`/`error` ; affichage via toast (shadcn/ui `sonner`). Error boundary React au niveau racine.

## Architecture Frontend

### Structure des modules (identique pour `frontend/` et `frontend-admin/`)
```
src/
├── lib/http.ts            # client HTTP (apiFetch<T>, ApiError, getToken/setToken JWT)
├── features/<domaine>/
│   ├── api.ts            # accès API REST typé (apiFetch)
│   ├── hooks.ts          # hooks React Query (queries + mutations)
│   ├── schemas.ts        # schémas Zod + types
│   └── components/       # composants spécifiques au domaine
├── components/ui/        # shadcn/ui (button, dialog, input…)
├── components/           # composants partagés transverses
├── hooks/                # hooks transverses (useAuth, useDebounce…)
├── stores/                # stores Zustand (cartStore, uiStore, favoritesStore)
└── routes/                # pages + configuration du routing
```

### State management
- **Zustand** : état UI local et panier (`cartStore`), favoris (`favoritesStore`, persisté localement) — léger, sans boilerplate
- **TanStack Query (React Query)** : toute donnée serveur (API REST). `queryKey` namespacée (`['products', filters]`), invalidation après mutation, `staleTime` adapté.
- Auth exposée via un `AuthProvider` + hook `useAuth()` : au montage, lit le JWT stocké (`localStorage`, clé `auth_token`) et appelle `GET /api/auth/me` pour récupérer le profil/rôle. `refresh()` permet de recharger le profil après login/update.

### Conventions
- Composants fonctionnels + hooks. `React.memo` sur les éléments de liste coûteux.
- Lazy loading par route (`React.lazy` + `Suspense`).
- Séparation **smart/dumb** : composants "container" gèrent les hooks/data, "presentational" reçoivent des props.
- `data-testid` sur tous les éléments interactifs testés.
- Tailwind pour le style ; pas de CSS inline arbitraire ; tokens de design centralisés (`tailwind.config`).

## Base de données (PostgreSQL via TypeORM)

### Variables d'environnement

`backend/.env` :
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

`frontend/.env` et `frontend-admin/.env` :
```
VITE_API_URL=http://localhost:3000/api
```
> ⚠️ Ne jamais mettre `JWT_SECRET`, les credentials DB, ni aucun secret backend dans le frontend. Seule `VITE_API_URL` (URL publique de l'API) est exposée côté client.

### Schéma principal (tables PostgreSQL)
- `users` — `id` (uuid), `email` (unique), `displayName`, `passwordHash` (`select: false`), `role` (`customer`|`admin`, défaut `customer`), `addresses` (jsonb[]), `createdAt`
- `categories` — `id` (uuid), `name`, `slug` (unique), `parentId` (auto-référence)
- `products` — `id` (uuid), `name`, `brand`, `description`, `price` (numeric 10,2), `images` (jsonb), `categoryId` (FK nullable), `stock`, `condition`/`size`/`location` (nullable), `active` (défaut true), `weLove` (défaut false), `createdAt`/`updatedAt`
- `orders` — `id` (uuid), `userId` (FK), `items` (jsonb — lignes dénormalisées `{productId, productName, unitPrice, qty, image}`), `subtotal`/`discount`/`total` (numeric 10,2), `promoCode` (nullable), `status` (`pending`|`paid`|`shipped`|`delivered`|`cancelled`, défaut `pending`), `shippingAddress` (jsonb), `paymentMethod`, `createdAt`/`updatedAt`
- `reviews` — `id` (uuid), `userId` (FK → users, cascade), `productId` (FK → products, cascade), `rating` (int 1-5), `comment` (text), `createdAt`
- `favorites` — `id` (uuid), `userId` (FK → users, cascade), `productId` (FK → products, cascade), contrainte unique `(userId, productId)`, `createdAt`
- `promo_codes` — `id` (uuid), `code` (unique), `discountType` (`percentage`|`fixed`), `discountValue` (numeric 10,2), `minAmount` (numeric 10,2, défaut 0), `expiresAt` (nullable), `active` (défaut true), `createdAt`

### Modélisation
- **Dénormaliser pour la lecture** : `items[]` d'une commande copie `productName`/`unitPrice`/`image` au moment de la création (instantané immuable, indépendant des modifications ultérieures du produit).
- **Index** déclarés dans les migrations TypeORM : `IDX_products_active_createdAt`, `IDX_products_categoryId`, `IDX_orders_userId`, `IDX_orders_status`.
- **Migrations** : toute évolution de schéma passe par `npm run migration:generate` / `migration:run` — jamais de `synchronize: true` en production.

## Sécurité (OWASP + NestJS)
- **Guards NestJS = ligne de défense principale.** `JwtAuthGuard` (authentification, vérifie le JWT), `RolesGuard` + `@Roles('admin')` (autorisation par rôle). Refus par défaut sur les routes sensibles.
- **Contrôle d'accès** : un utilisateur ne lit/écrit que ses propres `orders` (`userId` extrait du JWT via `@CurrentUser()`, jamais accepté depuis le body client). Les écritures admin (`products`, `categories`, modification de `status` de commande, gestion des rôles `users`) exigent `RolesGuard` + `@Roles('admin')`.
- **Rôle admin vérifié côté serveur** : `RolesGuard` lit `request.user.role` (issu du JWT signé serveur). Jamais de contrôle de rôle uniquement côté React.
- **Validation des écritures via DTOs** : `class-validator` + `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })` — rejette tout champ non déclaré, empêche un client de fixer `role`, `total`, `status`, `userId` arbitrairement (ces champs sont forcés/dérivés côté service).
- **Uploads** : `POST /api/uploads/product-image` réservé aux admins (`RolesGuard`) ; taille (5 Mo max) et MIME (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) contraints par Multer.
- **Validation des inputs** côté client via Zod (UX) + **revalidation via DTOs NestJS** (sécurité).
- **Pas de secret côté client** : aucune clé privée, `JWT_SECRET`, credentials DB, ni secret de paiement dans le frontend.
- **Auth** : JWT stocké côté client (`localStorage`, clé `auth_token`), attaché via header `Authorization: Bearer <token>` (`lib/http.ts`). Mots de passe hashés avec bcrypt (cost factor 10), jamais stockés/retournés en clair (`passwordHash` exclu des réponses).
- **Énumération** : messages d'erreur génériques sur login/register pour ne pas révéler l'existence d'un compte.
- **SQL Injection** : toutes les requêtes passent par TypeORM (repository/queryBuilder paramétré) — jamais de SQL concaténé avec une entrée utilisateur.

## Tests
- **Backend** : **Jest** — tests unitaires des services/guards (`*.spec.ts`) + tests e2e (`test/*.e2e-spec.ts`, Supertest) contre une vraie instance PostgreSQL (auth, guards, CRUD products/orders).
- **Unitaires / composants frontend**: **Vitest** + **React Testing Library** (jsdom), setup dans `src/test/setup.ts`
- **E2E**: **Playwright** (parcours client : ajout panier → checkout ; parcours admin : création produit) — contre une API NestJS + Postgres de test
- **Couverture minimale**: 80% (lines/functions/branches/statements) sur hooks/api/logique métier (frontend) et services/guards (backend)
- **Fixtures**: `@faker-js/faker` pour générer produits/commandes de test

## Qualité de code
- **ESLint + Prettier** (config partagée entre les deux apps frontend ; config NestJS dédiée pour `backend/`)
- **TypeScript strict** (`strict: true`, pas de `any` implicite ; `strictPropertyInitialization: false` côté `backend/` pour compatibilité TypeORM)
- Pre-commit hooks: **Husky + lint-staged**
- Convention de commits: **Conventional Commits**

---

## Agents disponibles (`.claude/agents/`)

Les agents sont des sous-agents spécialisés invocables via le tool `Agent`. Chaque fichier `.md` dans `.claude/agents/` définit un rôle, ses responsabilités et ses règles de travail. **Tous les agents lisent `CLAUDE.md` au démarrage** pour connaître le stack (React + NestJS + PostgreSQL) et les conventions du projet.

> Note : les rôles "Spécialiste Firebase" / Security Rules / DBA Firestore listés ci-dessous s'appliquent désormais au backend NestJS/TypeORM (modules, guards, entités, migrations) — les fichiers `.claude/agents/*.md` seront renommés/adaptés dans une itération ultérieure de documentation.

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
