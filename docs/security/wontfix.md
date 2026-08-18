# Décisions sur les vulnérabilités de dépendances (npm audit)

Dernière revue : 2026-08-18, suite à l'audit de sécurité complet (backend NestJS + frontend + frontend-admin).
`npm audit fix` (non-breaking) a été appliqué sur les 3 packages. Les vulnérabilités restantes nécessitent
une montée de version majeure et sont documentées ci-dessous plutôt que corrigées immédiatement.

## backend/

| Package | Sévérité | Chaîne | Décision | Raison | Réévaluer |
|---|---|---|---|---|---|
| `@nestjs/platform-express`, `multer`, `body-parser`, `express` | Haute | directe (`@nestjs/platform-express` v10) | **WONTFIX (planifié)** | Nécessite la migration NestJS v10 → v11, qui touche `platform-express`/`multer`/`body-parser` en cascade. Le risque `multer` (DoS upload) est déjà partiellement mitigé côté applicatif (limite 5 Mo + validation magic-bytes ajoutée lors de cet audit). | À la prochaine migration NestJS majeure planifiée |
| `@nestjs/cli`, `glob`, `picomatch`, `tmp`, `webpack`, `inquirer`, `external-editor` | Haute/Modérée | devDependency (`@nestjs/cli`) | **WONTFIX** | Outillage de build/CLI uniquement, jamais exécuté en production ni exposé au réseau. | Prochaine montée majeure de `@nestjs/cli` |
| `lodash` | Haute | transitive (`@nestjs/config` v3) | **WONTFIX (documenté)** | Prototype pollution via `_.template` — le projet n'utilise jamais `_.template` avec une entrée utilisateur (config statique uniquement). | À la migration `@nestjs/config` v4 |
| `uuid` | Modérée | transitive (`@nestjs/typeorm`) | **WONTFIX** | Fix disponible uniquement via `@nestjs/typeorm@11` (breaking). Impact limité (bounds-check sur buffer fourni, non exploitable via l'API publique). | À la prochaine migration TypeORM majeure |
| `tar`, `@mapbox/node-pre-gyp`, `brace-expansion`, `js-yaml` | Critique/Haute | transitive | ✅ **FIX appliqué** (`npm audit fix`) | — | — |

## frontend/ et frontend-admin/

| Package | Sévérité | Décision | Raison | Réévaluer |
|---|---|---|---|---|
| `vitest`, `@vitest/coverage-v8` | Critique | **WONTFIX (documenté)** | devDependency, jamais bundlée/exécutée en production. La CVE nécessite que le serveur UI Vitest tourne (jamais le cas en CI/prod headless). | Prochaine montée majeure Vitest 2→4 |
| `vite` | Haute | **WONTFIX (court terme)** | Path traversal/bypass affectant le **dev server** uniquement (non exposé en prod — le build statique est servi par nginx). | Montée majeure Vite 5→8 à planifier et tester séparément |
| `react-router` / `react-router-dom` | Haute/Critique | **WONTFIX (documenté)** | Fix nécessite `react-router-dom@7` (breaking change sur le routing, actuellement en v6). Risque : open redirect via backslash dans `<Link>`/`useNavigate` — le projet ne construit jamais de route dynamique à partir d'une entrée utilisateur non validée. | À planifier comme migration dédiée avec suite de tests E2E complète |
| `postcss`, `brace-expansion`, `js-yaml`, `nanoid`, `socket.io-parser`, `esbuild` | Haute/Modérée | ✅ **FIX appliqué** (`npm audit fix`) | — | — |

## Process

Toute nouvelle vulnérabilité "critical"/"high" détectée par `npm audit` doit être triée ici avant merge :
FIX si un correctif non-breaking existe, sinon WONTFIX documenté avec raison + date de réévaluation.
