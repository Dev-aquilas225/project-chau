# ai-project — Dossier d'agents IA multi-plateforme

Un système d'agents IA spécialisés pour le développement logiciel, compatible avec **Claude Code**, **Gemini CLI** et **OpenAI Codex**. Chaque agent couvre un rôle précis du cycle de vie d'un projet : planification, développement, tests, sécurité, infrastructure et documentation.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure du dépôt](#structure-du-dépôt)
- [Démarrage rapide](#démarrage-rapide)
- [Catalogue des agents](#catalogue-des-agents)
- [Skills](#skills)
- [Workflows types](#workflows-types)
- [Référence des fichiers de configuration](#référence-des-fichiers-de-configuration)
- [Bonnes pratiques](#bonnes-pratiques)
- [FAQ](#faq)

---

## Vue d'ensemble

```
Votre projet
├── CLAUDE.md          ← Config pour Claude Code  (à remplir)
├── GEMINI.md          ← Config pour Gemini CLI   (à remplir)
├── AGENTS.md          ← Config pour Codex        (à remplir)
├── .claude/agents/    ← 16 agents Claude Code
├── .gemini/agents/    ← 16 agents Gemini CLI
└── .codex/agents/     ← 16 agents Codex
```

Le principe est simple : vous décrivez votre projet une fois dans le fichier de configuration de votre outil (CLAUDE.md, GEMINI.md ou AGENTS.md), et tous les agents s'y réfèrent automatiquement pour adapter leur comportement à votre stack.

---

## Structure du dépôt

```
ai-project/
├── CLAUDE.md                        # Fichier de configuration Claude Code
├── GEMINI.md                        # Fichier de configuration Gemini CLI
├── AGENTS.md                        # Fichier de configuration Codex
├── .gitignore                       # Exclut les fichiers locaux sensibles
│
├── .claude/
│   ├── settings.local.json          # Permissions locales (non commité)
│   ├── agents/                      # 16 agents Claude Code
│   │   ├── orchestrateur.md
│   │   ├── agenda.md
│   │   ├── scout.md
│   │   ├── codeur.md
│   │   ├── specialiste-backend.md
│   │   ├── specialiste-frontend.md
│   │   ├── fullstack-et-perf.md
│   │   ├── testeur.md
│   │   ├── reviseur.md
│   │   ├── debogueur.md
│   │   ├── auditeur-securite.md
│   │   ├── pentester.md
│   │   ├── devops.md
│   │   ├── dba.md
│   │   ├── concepteur-ui.md
│   │   └── documentation.md
│   └── skills/                      # 6 skills Claude Code (invocation /skill-name)
│       ├── new-feature.md
│       ├── fix-bug.md
│       ├── security-audit.md
│       ├── new-module.md
│       ├── release.md
│       └── review-mr.md
│
├── .gemini/
│   ├── agents/                      # 16 agents Gemini CLI
│   └── skills/                      # 6 skills Gemini CLI (activation auto ou /skills)
│       ├── new-feature/SKILL.md
│       ├── fix-bug/SKILL.md
│       ├── security-audit/SKILL.md
│       ├── new-module/SKILL.md
│       ├── release/SKILL.md
│       └── review-mr/SKILL.md
│
├── .codex/agents/                   # 16 agents Codex (routage par frontmatter YAML)
│
└── .agents/skills/                  # 6 skills Codex (standard OpenAI)
    ├── new-feature/
    │   ├── SKILL.md
    │   └── agents/openai.yaml
    ├── fix-bug/
    │   ├── SKILL.md
    │   └── agents/openai.yaml
    ├── security-audit/
    │   ├── SKILL.md
    │   └── agents/openai.yaml       # allow_implicit_invocation: false
    ├── new-module/
    │   ├── SKILL.md
    │   └── agents/openai.yaml
    ├── release/
    │   ├── SKILL.md
    │   └── agents/openai.yaml       # allow_implicit_invocation: false
    └── review-mr/
        ├── SKILL.md
        └── agents/openai.yaml       # allow_implicit_invocation: false
```

---

## Démarrage rapide

### Étape 1 — Copier les dossiers dans votre projet

```bash
# Depuis ce dépôt, copier dans votre projet
cp CLAUDE.md  /votre-projet/CLAUDE.md
cp GEMINI.md  /votre-projet/GEMINI.md
cp AGENTS.md  /votre-projet/AGENTS.md
cp -r .claude /votre-projet/.claude
cp -r .gemini /votre-projet/.gemini
cp -r .codex  /votre-projet/.codex
```

### Étape 2 — Remplir votre fichier de configuration

Ouvrir le fichier correspondant à votre outil et remplacer tous les `[PLACEHOLDER]`.

Les champs sont annotés `[REQUIS]` ou `[OPTIONNEL]` :

| Annotation | Signification |
|------------|---------------|
| `[REQUIS]` | À remplir obligatoirement — les agents ne fonctionnent pas correctement sans |
| `[OPTIONNEL]` | À remplir si applicable, supprimer la ligne sinon |

**Exemple pour un projet NestJS + Angular + PostgreSQL :**

```markdown
# Mon API — NestJS + Angular + PostgreSQL

## Stack technique
- **Backend / Serveur**: NestJS 10 / Node.js 20
- **Frontend**: Angular 17 (standalone components)
- **Base de données**: PostgreSQL 15
- **Auth**: JWT access (15min) + refresh (7j) httpOnly cookies
- **Conteneurs**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## Commandes essentielles
### Backend
  cd backend && npm run start:dev    # dev avec hot-reload
  cd backend && npm run build        # build production
  cd backend && npm run test         # tests unitaires
  cd backend && npm run test:e2e     # tests end-to-end
  cd backend && npm run migration:run
  cd backend && npm run migration:revert
  cd backend && npm run seed         # crée l'admin par défaut (admin@gmail.com / admin1234) si absent

## Tests
- **Unitaires**: Jest
- **Intégration / E2E backend**: Supertest
- **E2E frontend**: Playwright
- **Couverture minimale**: 80%
```

### Étape 3 — Protéger les fichiers locaux

Ajouter au `.gitignore` du projet :

```
.claude/settings.local.json
.gemini/settings.local.json
.codex/settings.local.json
.env
.env.local
```

### Étape 4 — Copier les skills dans votre projet

```bash
cp -r .claude/skills  /votre-projet/.claude/skills
cp -r .gemini/skills  /votre-projet/.gemini/skills
cp -r .agents/skills  /votre-projet/.agents/skills
```

### Étape 5 — Invoquer un agent

**Claude Code :**
```
# Dans le terminal Claude Code
Agent({
  prompt: "Planifie l'ajout d'un système de commentaires sur les tâches.
           Lire CLAUDE.md pour le stack. Fichiers concernés : src/tasks/"
})

# Ou via l'orchestrateur pour un workflow complet
"orchestre la fonctionnalité commentaires"
```

**Gemini CLI :**
```
@orchestrateur orchestre la fonctionnalité commentaires
@agenda planifie l'ajout d'un système de notifications
@reviseur revis le fichier src/tasks/tasks.service.ts
```

**Codex :**
```
# Codex route automatiquement vers l'agent le plus pertinent
# selon la description du fichier frontmatter
"Ajoute un endpoint PATCH /tasks/:id/complete avec tests"
```

---

## Catalogue des agents

### Planification & Architecture

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **Orchestrateur** | `orchestrateur.md` | Chef d'orchestre — enchaîne les agents en séquence avec règles de fail-fast | Pour déléguer un workflow complet (feature, bug, release, audit) |
| **Agenda** | `agenda.md` | Planificateur — décompose en tâches atomiques, identifie les risques | Avant toute implémentation majeure |
| **Scout** | `scout.md` | Explorateur — cartographie le code sans le modifier | En début de tâche pour comprendre l'existant |

### Développement

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **Codeur** | `codeur.md` | Développeur principal — implémente en respectant les conventions | Implémentation d'une feature après planification |
| **Spécialiste Backend** | `specialiste-backend.md` | Expert API — modules, DTOs, services, repositories, guards | Travaux purement backend |
| **Spécialiste Frontend** | `specialiste-frontend.md` | Expert UI — composants, state management, routing, HTTP services | Travaux purement frontend |
| **Fullstack + Perf** | `fullstack-et-perf.md` | De bout en bout — DB → API → Frontend → Tests + optimisation perf | Feature cross-couches ou goulots d'étranglement |

### Qualité & Tests

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **Testeur** | `testeur.md` | QA Engineer — tests unitaires, intégration, E2E ; bloque si couverture insuffisante | Écriture et vérification des tests |
| **Réviseur** | `reviseur.md` | Code Reviewer — qualité, sécurité, perf, conventions | Avant toute PR/MR |
| **Débogueur** | `debogueur.md` | Root Cause Analysis — méthodologie structurée, `git bisect run`, pas de fix hâtif | Investigation de bug |

### Sécurité

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **Auditeur Sécurité** | `auditeur-securite.md` | Audit OWASP A01–A10 — dépendances directes ET transitives, wontfix documenté | Avant une release ou après un endpoint sensible |
| **Pentester** | `pentester.md` | Test d'intrusion — auth bypass, IDOR, injection, rate limiting effectif (429), fuzzing | Avant mise en production (dev/staging uniquement) |

### Infrastructure & Données

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **DevOps** | `devops.md` | Docker, CI/CD, reverse proxy, secrets, monitoring | Changements infra ou pipeline |
| **DBA** | `dba.md` | Schémas, migrations réversibles avec `down()`, data migrations par batch, index | Modifications de schéma ou requêtes lentes |

### Design & Documentation

| Agent | Fichier | Rôle | Quand l'utiliser |
|-------|---------|------|-----------------|
| **Concepteur UI** | `concepteur-ui.md` | Design system, UX, accessibilité WCAG AA | Specs d'interface ou design system |
| **Documentation** | `documentation.md` | Swagger/OpenAPI, README, CONTRIBUTING, CHANGELOG, ADR | Avant/après chaque release |

---

## Skills

Les skills sont des raccourcis qui encapsulent les workflows d'agents en une seule commande. Chaque skill lit le fichier de configuration de la plateforme (`CLAUDE.md`, `GEMINI.md` ou `AGENTS.md`) puis orchestre la séquence d'agents correspondante.

### Catalogue des skills (commun aux 3 plateformes)

| Skill | Workflow | Description |
|-------|----------|-------------|
| `new-feature` | WF-1 | Feature complète : Agenda → Scout → DBA → Codeur → Testeur → Réviseur → Doc |
| `fix-bug` | WF-2 | Fix de bug : Débogueur → Scout → Codeur → Testeur → Réviseur |
| `security-audit` | WF-3 | Audit OWASP + intrusion : Auditeur → Pentester → Réviseur |
| `new-module` | WF-4 | Scaffold module : Agenda → DBA → Codeur → Frontend → Testeur → Doc → DevOps |
| `release` | WF-5 | Préparation release : Testeur → Auditeur → DBA → Perf → Réviseur → Doc → DevOps |
| `review-mr` | WF-6 | Revue PR/MR : Scout → Réviseur → Testeur → Auditeur → Verdict |

### Invocation par plateforme

**Claude Code** — commande `/skill-name` :
```
/new-feature système de commentaires
/fix-bug crash au login avec Google OAuth
/security-audit
/new-module notifications
/release 1.2.0
/review-mr
```

**Gemini CLI** — activation automatique ou via `/skills` :
```
@orchestrateur nouvelle feature : système de commentaires
/skills new-feature système de commentaires
/skills fix-bug crash au login
/skills security-audit
/skills release 1.2.0
```

**Codex** — invocation explicite (`$skill-name`) ou implicite (auto-routing par description) :
```
$new-feature système de commentaires
$fix-bug crash au login avec Google OAuth
$security-audit          # invocation explicite requise (allow_implicit_invocation: false)
$new-module notifications
$release 1.2.0           # invocation explicite requise (allow_implicit_invocation: false)
$review-mr               # invocation explicite requise (allow_implicit_invocation: false)
```

### Politique d'invocation implicite (Codex)

Certaines skills Codex nécessitent une invocation **explicite** pour éviter des déclenchements non intentionnels sur des opérations sensibles :

| Skill | Invocation implicite | Raison |
|-------|---------------------|--------|
| `new-feature` | ✅ Autorisée | Tâche courante, pas de risque |
| `fix-bug` | ✅ Autorisée | Tâche courante, pas de risque |
| `new-module` | ✅ Autorisée | Tâche courante, pas de risque |
| `security-audit` | ❌ Explicite uniquement | Lance des tests d'intrusion |
| `release` | ❌ Explicite uniquement | Action irréversible en production |
| `review-mr` | ❌ Explicite uniquement | Requiert un diff fourni manuellement |

### Emplacements des skills

| Plateforme | Chemin | Format |
|------------|--------|--------|
| Claude Code | `.claude/skills/*.md` | Markdown, invoqué via `/skill-name` |
| Gemini CLI | `.gemini/skills/<name>/SKILL.md` | YAML frontmatter + Markdown |
| Codex | `.agents/skills/<name>/SKILL.md` | YAML frontmatter + Markdown + `openai.yaml` optionnel |

---

## Workflows types

### Nouvelle fonctionnalité complète
```
"orchestre la fonctionnalité [NOM]"

Séquence :
  1. Agenda      → Plan détaillé
  2. Scout       → Exploration du code existant
  3. DBA         → Migration DB + entité
  4. Codeur      → Backend (service, controller, DTO)
  5. Codeur      → Frontend (store, composants)
  6. Testeur     → Tests unitaires + E2E
  7. Réviseur    → Code review
  8. Documentation → Swagger + CHANGELOG
```

### Correction de bug
```
"orchestre le fix du bug [DESCRIPTION]"

Séquence :
  1. Débogueur   → Root cause analysis (avec git bisect run si nécessaire)
  2. Scout       → Contexte autour du bug
  3. Codeur      → Correction minimale
  4. Testeur     → Test rouge → vert
  5. Réviseur    → Validation
```

### Audit de sécurité
```
"orchestre l'audit de sécurité"

Séquence :
  1. Auditeur    → Audit statique OWASP A01–A10
  2. Auditeur    → Audit dépendances (directes + transitives)
  3. Pentester   → Tests auth bypass + IDOR + injection
  4. Pentester   → Tests rate limiting (vérification des 429 effectifs)
  5. Réviseur    → Priorisation
  6. Rapport     → Document complet avec corrections
```

### Préparation de release
```
"orchestre la release [VERSION]"

Séquence :
  1. Testeur     → Tous les tests + vérification couverture
  2. Auditeur    → Audit dépendances
  3. DBA         → Vérification down() de toutes les migrations
  4. Fullstack   → Vérification performances
  5. Réviseur    → Revue des changements depuis la dernière release
  6. Documentation → CHANGELOG [Unreleased] → [VERSION]
  7. DevOps      → Pipeline CI vert + runbook de rollback
```

### Revue de Pull Request
```
"orchestre la revue de la MR [TITRE]"
(+ coller le diff git)

Séquence :
  1. Scout       → Cartographie des fichiers modifiés
  2. Réviseur    → Revue qualité et conventions
  3. Testeur     → Vérification couverture des changements
  4. Auditeur    → Sécurité ciblée sur les changements
  5. Verdict     → Approuvé / Changements requis
```

---

## Référence des fichiers de configuration

### `CLAUDE.md` / `GEMINI.md` / `AGENTS.md`

Ces fichiers sont lus par tous les agents au démarrage. Ils décrivent votre projet et permettent aux agents de s'adapter à votre stack.

**Champs critiques** (les agents ne peuvent pas fonctionner correctement sans eux) :

| Champ | Utilisé par |
|-------|-------------|
| Stack technique (backend, DB, auth) | Tous les agents |
| Commandes essentielles (test, migration) | Testeur, DBA, DevOps, Orchestrateur |
| Seuil de couverture minimum | Testeur, Réviseur, Orchestrateur |
| Pattern d'accès aux données | Codeur, Spécialiste Backend, DBA |
| Conventions de nommage | Codeur, Réviseur, Scout |
| Mécanisme de sécurité (rate limiting, auth) | Auditeur, Pentester, Réviseur |

### `settings.local.json`

> ⚠️ Ce fichier est **local à chaque développeur** et ne doit **jamais être commité**.

Il est déjà dans le `.gitignore` fourni. Chaque développeur crée le sien après clonage :

**Claude Code (`/.claude/settings.local.json`) :**
```json
{
  "permissions": {
    "allow": ["Bash(*)", "Read(*)", "Write(*)", "Edit(*)"],
    "deny": []
  }
}
```

**Gemini CLI (`/.gemini/settings.local.json`) :**
```json
{
  "permissions": {
    "allow": ["shell", "read_file", "write_file"]
  }
}
```

---

## Bonnes pratiques

### Briefer les agents correctement

Les agents ne voient pas la conversation en cours. Toujours inclure dans le prompt :
- **Les fichiers concernés** (chemins complets)
- **L'objectif précis** (pas juste "améliore le code")
- **Les contraintes** (deadline, rétrocompatibilité, etc.)

```
# ❌ Trop vague
Agent({ prompt: "Améliore le service utilisateur" })

# ✅ Précis et actionnable
Agent({
  prompt: "Ajoute la pagination à UserService.findAll().
           Fichier : src/users/users.service.ts
           Pattern à utiliser : findAndCount() TypeORM (voir CLAUDE.md section 'Pattern d'accès aux données').
           Retourner PaginatedResult<User> avec page, limit, total.
           Seuil de couverture : 80% (voir CLAUDE.md)."
})
```

### Toujours lire CLAUDE.md en premier

Chaque agent commence par lire `CLAUDE.md`. Si ce fichier est incomplet ou vide, les agents produiront du code générique non adapté à votre stack. Investir 10 minutes à le remplir correctement économise des heures de correction.

### Utiliser l'Orchestrateur pour les workflows complexes

Pour les features qui touchent plusieurs couches (DB + API + Frontend + Tests), déléguer à l'Orchestrateur plutôt que d'invoquer les agents un par un. L'Orchestrateur applique des règles de fail-fast : si la migration échoue, il s'arrête avant d'implémenter le service.

### Ne jamais ignorer un bloquant

Quand l'Orchestrateur affiche `⛔ BLOQUANT` ou `⛔ FAIL-FAST`, corriger le problème avant de reprendre. Continuer manuellement en ignorant un bloquant du Réviseur ou de l'Auditeur revient à contourner les garde-fous de qualité.

### Sécurité : traiter les CVE sans fix

L'Auditeur Sécurité produit un rapport listant les vulnérabilités des dépendances transitives sans correctif disponible. Pour chacune, prendre une décision explicite :
1. **Fix** : si `npm audit fix` / `pip-audit` peut le résoudre
2. **Override** : forcer une version dans `package.json#overrides`
3. **Wontfix documenté** : dans `docs/security/wontfix.md` avec justification et date de réévaluation

Ne jamais laisser une CVE sans décision documentée.

---

## FAQ

**Q : Dois-je remplir les trois fichiers (CLAUDE.md, GEMINI.md, AGENTS.md) ?**  
Non. Remplir uniquement le fichier correspondant à l'outil que vous utilisez. Les trois sont fournis pour les équipes qui utilisent plusieurs outils.

**Q : Puis-je modifier les agents ?**  
Oui. Les agents sont des fichiers Markdown — vous pouvez les adapter à votre stack, ajouter des règles spécifiques, ou créer de nouveaux agents. Pensez à propager vos modifications aux trois dossiers (`.claude/`, `.gemini/`, `.codex/`) si vous utilisez les trois outils.

**Q : Le Pentester peut-il tester la production ?**  
Non. Le Pentester est explicitement limité aux environnements de développement et staging locaux. Tester la production requiert une autorisation écrite explicite et sort du scope de ces agents.

**Q : Comment ajouter un agent personnalisé ?**  
Créer un fichier `mon-agent.md` dans `.claude/agents/` (et les équivalents dans `.gemini/agents/` et `.codex/agents/`). Suivre la structure des agents existants : section Identité, Responsabilités, Format de sortie, Comportement.

**Q : Quelle différence entre un agent et un skill ?**
Un **agent** est un expert spécialisé (Codeur, Testeur, DBA…) qui accomplit une tâche précise. Un **skill** est un raccourci qui orchestre plusieurs agents en séquence pour réaliser un workflow complet (feature, bug, release…). En pratique : les agents sont les briques, les skills sont les recettes.

**Q : Puis-je créer mes propres skills ?**
Oui. Créer un fichier `mon-skill.md` dans `.claude/skills/` (et les équivalents dans `.gemini/skills/<name>/SKILL.md` et `.agents/skills/<name>/SKILL.md`). La `description` du frontmatter YAML détermine quand Gemini et Codex activent la skill automatiquement — soyez précis et distinctif.

**Q : `settings.local.json` est commité dans le repo original, que faire ?**  
Supprimer le fichier du suivi Git sans le supprimer du disque :
```bash
git rm --cached .claude/settings.local.json
git rm --cached .gemini/settings.local.json
git commit -m "chore: untrack local settings files"
```
Le `.gitignore` fourni empêchera les commits futurs.
