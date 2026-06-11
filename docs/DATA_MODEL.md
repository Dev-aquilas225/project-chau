# Modèle de données Firestore

> NoSQL orienté documents. Pas de jointures : on **dénormalise** pour servir les écrans.
> La source de vérité de sécurité est `firestore.rules`.

## `users/{uid}`
Profil miroir créé à l'inscription.
| Champ | Type | Notes |
|-------|------|-------|
| `email` | string | |
| `displayName` | string | |
| `photoURL` | string? | |
| `role` | `customer` \| `admin` | **immuable côté client** (rule) |
| `addresses` | Address[] | `{ fullName, line1, city, zip, country }` |
| `createdAt` | timestamp | |

**Accès** : lecture/écriture par le propriétaire (sans changer `role`) ou admin.

## `categories/{id}`
`{ name, slug, parentId? }` — lecture publique, écriture admin.

## `products/{id}`
| Champ | Type | Notes |
|-------|------|-------|
| `name`, `brand`, `description` | string | |
| `price` | number ≥ 0 | |
| `category` | string | id de catégorie |
| `images` | string[] | URLs Storage |
| `stock` | int ≥ 0 | |
| `condition`, `size`, `location` | string? | |
| `active` | boolean | visible en boutique |
| `weLove` | boolean | coup de cœur |
| `createdAt` | timestamp | |

**Accès** : lecture publique ; création/modif/suppression **admin** (avec validation prix/stock/nom).
**Index** : `(active, category, price)`, `(active, createdAt)`, `(active, category, createdAt)`.

## `carts/{uid}`
`{ items: CartItem[], updatedAt }` — **privé au propriétaire**.

## `favorites/{uid}`
`{ productIds: string[], updatedAt }` — **privé au propriétaire**.

## `orders/{id}`
Instantané immuable de la commande (nom/prix produits copiés).
| Champ | Type | Notes |
|-------|------|-------|
| `userId` | string (uid) | propriétaire |
| `items` | OrderItem[] | `{ productId, name, brand, image, unitPrice, qty }` |
| `subtotal`, `discount`, `total` | number | |
| `promoCode` | string? | |
| `status` | `pending`→`paid`→`shipped`→`delivered`/`cancelled` | |
| `shippingAddress` | Address | |
| `paymentMethod` | string | |
| `createdAt` | timestamp | |

**Accès** : lecture propriétaire ou admin ; création par le propriétaire avec `status='pending'` ;
mise à jour (statut) **admin only** ; suppression interdite.
**Index** : `(userId, createdAt desc)`, `(status, createdAt desc)`.

## `promos/{CODE}`
L'ID du document est le code (unique).
`{ code, type: 'percentage'|'fixed', value, active, minAmount?, usageLimit?, usedCount }`
**Accès** : lecture par utilisateur connecté (validation au checkout) ; écriture admin.
