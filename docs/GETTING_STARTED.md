# Démarrage — Aquilas E-commerce (React + Firebase)

Boutique de mode de luxe d'occasion, inspirée de Vestiaire Collective. Deux applications React + Vite
partageant un même backend Firebase :

| App | Dossier | Port dev | Rôle |
|-----|---------|----------|------|
| Boutique client | `frontend/` | http://localhost:5173 | Catalogue, panier, favoris, commande, compte |
| Back-office admin | `frontend-admin/` | http://localhost:5174 | Dashboard, produits, stock, commandes, users, promos, paiements |

Backend : **Firestore** (données), **Firebase Auth** (email/mot de passe + Google), **Storage** (images produit).
La sécurité repose entièrement sur `firestore.rules` et `storage.rules`.

---

## 1. Prérequis
- Node.js 20+
- Firebase CLI : `npm i -g firebase-tools`

## 2. Installation
```bash
cd frontend && npm install && cd ..
cd frontend-admin && npm install && cd ..
cd scripts && npm install && cd ..
```

## 3. Configuration (.env)
Copier `.env.example` → `.env` dans **chaque** app (`frontend/` et `frontend-admin/`).

- **Dev local (recommandé)** : laisser `VITE_USE_EMULATORS=true`. Les clés Firebase peuvent rester vides.
- **Prod / projet Firebase réel** : `VITE_USE_EMULATORS=false` + renseigner les clés `VITE_FIREBASE_*`
  (Console Firebase → Paramètres du projet → Vos applications). Ces clés sont **publiques** (pas des secrets).

## 4. Lancer en local avec l'Emulator Suite
Dans 3 terminaux :
```bash
# 1) Émulateurs Firestore + Auth + Storage (UI : http://localhost:4000)
firebase emulators:start

# 2) Données de démo (produits, catégories, codes promo, comptes admin + client)
#    Le script cible l'émulateur automatiquement (l'émulateur doit tourner — étape 1).
cd scripts && npm run seed

# 3) Les apps
cd frontend && npm run dev          # client  → http://localhost:5173
cd frontend-admin && npm run dev    # admin   → http://localhost:5174
```

### Comptes de démo (créés par le seed)
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@aquilas.com` | `admin1234` |
| Client | `client@aquilas.com` | `client1234` |

### Codes promo de démo
- `WELCOME10` — 10 % dès 50 $ d'achat
- `LUXE50` — 50 $ de réduction dès 300 $

---

## 5. Fonctionnalités

### Boutique client (`frontend/`)
- Inscription / connexion **email-mot de passe** et **Google**
- Catalogue avec **recherche** et **filtres** (catégorie, prix min/max, tri)
- Page **détail produit** (galerie, état, taille, origine, authenticité)
- **Panier** (Zustand, persistant) avec quantités
- **Favoris** (locaux + synchronisés dans Firestore quand connecté)
- **Checkout** : adresse, code promo, paiement (simulé), création de commande
- **Suivi des commandes** avec statuts
- **Profil** : nom, adresses, déconnexion
- Design responsive (logo serif, cartes « WE LOVE », navigation bas d'écran)

### Back-office admin (`frontend-admin/`)
- **Routes protégées** (`RequireAdmin` + rôle vérifié dans les rules)
- **Dashboard** : chiffre d'affaires, commandes, articles vendus, alertes stock, commandes par statut
- **Produits** : ajout / modification / suppression + **upload d'images** (Storage)
- **Stock** : ajustement + alertes de rupture / stock faible
- **Commandes** : changement de statut, détail (adresse, articles, paiement)
- **Utilisateurs** : liste + promotion/rétrogradation de rôle
- **Promotions** : création / suppression de codes promo
- **Paiements (monétique)** : récap des transactions par statut et par moyen

---

## 6. Déploiement (Firebase Hosting)
```bash
# Cibler deux sites Hosting (à créer dans la console)
firebase target:apply hosting client <site-client>
firebase target:apply hosting admin  <site-admin>

# Toujours déployer les RULES avant le hosting
firebase deploy --only firestore:rules,firestore:indexes,storage

cd frontend && npm run build && cd ..
cd frontend-admin && npm run build && cd ..
firebase deploy --only hosting
```

## 7. Promouvoir un admin en production
```bash
cd scripts
# Avec une clé de service (GOOGLE_APPLICATION_CREDENTIALS) :
node set-admin.mjs email@exemple.com
```

---

## 8. Sécurité — points clés
- **Refus par défaut** dans `firestore.rules` ; chaque collection a des règles explicites.
- Un client ne lit/écrit que **ses** `carts`, `favorites`, `orders`.
- Écritures `products`, `categories`, `promos` et changement de statut de commande : **admin only**.
- Un client **ne peut pas** s'auto-promouvoir admin, ni fixer `status`/`total` d'une commande (validé par les rules).
- Upload Storage d'images produit : **admin only**, `image/*`, taille bornée.
- Aucune clé secrète / Admin SDK dans le frontend. Le paiement réel doit passer par un backend (Cloud Function + PSP).

## 9. Tester les Security Rules
```bash
cd tests && npm install
# nécessite l'émulateur Firestore lancé
firebase emulators:exec --only firestore "npm test"
```

## 10. Modèle de données
Voir [DATA_MODEL.md](DATA_MODEL.md).
