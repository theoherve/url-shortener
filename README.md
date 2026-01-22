# URL Shortener

> Exercice technique pour Stoïk - Service de raccourcissement d'URLs

## Table des matières

- [Présentation](#présentation)
- [Installation](#installation)
- [Architecture](#architecture)
- [Choix techniques](#choix-techniques)
- [Choix produit](#choix-produit)
- [Sécurité](#sécurité)
- [Scalabilité](#scalabilité)
- [Limites](#limites)
- [Améliorations futures](#améliorations-futures)

---

## Présentation

Ce projet est un URL shortener minimaliste développé dans le cadre d'un exercice technique pour Stoïk, entreprise spécialisée en cybersécurité.

**Fonctionnalités :**
- Raccourcir une URL longue en URL courte
- Redirection automatique via l'URL courte
- Dashboard listant toutes les URLs créées

**Stack technique :**
- **Backend** : NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend** : React 19, TypeScript, Tailwind CSS v4
- **Tests** : Jest (backend), Vitest + React Testing Library (frontend)

---

## Installation

### Prérequis

- Node.js >= 20.0.0
- pnpm
- Docker & Docker Compose

### Étapes

1. **Cloner le repository**
```bash
git clone <repository-url>
cd UrlShortener
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Démarrer PostgreSQL**
```bash
docker compose up -d
```

4. **Configurer l'environnement**
```bash
# Le fichier .env est déjà présent dans backend/
# Vérifier que DATABASE_URL pointe vers PostgreSQL local
```

5. **Appliquer les migrations**
```bash
cd backend
pnpm prisma:migrate
```

6. **Lancer l'application**
```bash
# Depuis la racine
pnpm dev
```

L'application sera disponible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000

### Commandes utiles

```bash
# Tests
pnpm test              # Tous les tests
pnpm test:backend      # Tests backend uniquement
pnpm test:frontend     # Tests frontend uniquement

# Linting
pnpm lint

# Build production
pnpm build

# Prisma Studio (visualiser la DB)
cd backend && pnpm prisma:studio
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │   UrlForm       │  │           UrlList                   │  │
│  │   - Validation  │  │   - Affichage URLs                  │  │
│  │   - Submit      │  │   - Copy to clipboard               │  │
│  └────────┬────────┘  └──────────────────┬──────────────────┘  │
│           │                              │                      │
│           └──────────────┬───────────────┘                      │
│                          │                                      │
│                   API Service (fetch)                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    Vite Proxy /api
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    Backend (NestJS)                             │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                     UrlController                         │  │
│  │   POST /api/urls    → Créer URL courte                    │  │
│  │   GET /api/urls     → Lister toutes les URLs              │  │
│  │   GET /:shortCode   → Redirection 302                     │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                      UrlService                           │  │
│  │   - Génération shortCode (nanoid)                         │  │
│  │   - Validation URL                                        │  │
│  │   - CRUD operations                                       │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    PrismaService                          │  │
│  │   - Connection pool PostgreSQL                            │  │
│  │   - Type-safe queries                                     │  │
│  └───────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                     PostgreSQL                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  urls                                                   │   │
│   │  ├─ id (UUID, PK)                                       │   │
│   │  ├─ shortCode (VARCHAR, UNIQUE, INDEXED)                │   │
│   │  ├─ originalUrl (TEXT)                                  │   │
│   │  └─ createdAt (TIMESTAMP)                               │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Structure des fichiers

```
UrlShortener/
├── backend/
│   ├── src/
│   │   ├── prisma/           # Service Prisma (DB connection)
│   │   ├── url/              # Module URL (Controller, Service, DTOs)
│   │   ├── app.module.ts     # Module racine
│   │   └── main.ts           # Bootstrap
│   ├── prisma/
│   │   └── schema.prisma     # Schéma DB
│   └── test/                 # Tests e2e
├── frontend/
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── services/         # API client
│   │   ├── types/            # Types TypeScript
│   │   └── test/             # Setup tests
│   └── vite.config.ts
├── docker-compose.yml        # PostgreSQL
└── package.json              # Scripts racine
```

---

## Choix techniques

### Backend

| Choix | Justification |
|-------|---------------|
| **NestJS** | Framework structuré avec architecture modulaire, injection de dépendances native, excellent pour les APIs REST. Impose une structure claire et testable. |
| **Prisma 7** | ORM moderne avec type-safety, migrations simples, excellent DX. Le nouveau système d'adapters permet une meilleure gestion des connexions. |
| **PostgreSQL** | Base de données relationnelle robuste, performante, avec support UUID natif et indexation efficace. |
| **nanoid v3** | Génération de shortCodes URL-safe, collision-resistant. 6 caractères = 62^6 ≈ 56 milliards de combinaisons. Version 3 pour compatibilité CommonJS avec Jest. |
| **class-validator** | Validation déclarative des DTOs avec messages d'erreur personnalisables. |

### Frontend

| Choix | Justification |
|-------|---------------|
| **React 19** | Dernière version stable avec améliorations de performance et nouvelles hooks. |
| **Tailwind CSS v4** | Utility-first CSS, configuration simplifiée, thème personnalisable via CSS variables. |
| **Vite** | Build tool rapide, HMR instantané, configuration minimale. |
| **Fetch API** | API native suffisante pour le scope, pas besoin de React Query pour 2 endpoints. |

### Tests

| Choix | Justification |
|-------|---------------|
| **Jest** (backend) | Standard de facto pour NestJS, bonne intégration avec TypeScript. |
| **Vitest** (frontend) | Compatible Vite, API similaire à Jest, plus rapide. |
| **React Testing Library** | Tests centrés sur le comportement utilisateur, pas l'implémentation. |

---

## Choix produit

### Scope volontairement limité

Le projet se concentre sur les fonctionnalités essentielles d'un URL shortener :

1. **Création d'URL courte** - Le cœur du service
2. **Redirection** - La raison d'être d'un shortener
3. **Dashboard** - Visibilité sur les URLs créées

### Ce qui n'est PAS implémenté (et pourquoi)

| Fonctionnalité | Raison de l'exclusion |
|----------------|----------------------|
| **Authentification** | Complexifie l'architecture, hors scope exercice. Serait nécessaire en production. |
| **Statistiques** | Ajouterait un modèle Visit, des événements, du tracking. Évolution naturelle mais hors scope. |
| **Custom shortCode** | Risque de collision, validation supplémentaire. Possible mais non prioritaire. |
| **Expiration** | Ajouterait un champ + job de nettoyage. Feature future. |
| **Custom domain** | Complexité DNS/SSL. Feature enterprise. |

### Compromis acceptés

- **Pagination simple** : Limite de 100 URLs, pas de curseur. Suffisant pour une démo.
- **Pas de rate limiting** : Mentionné en sécurité mais non implémenté.
- **Pas de cache** : Le volume attendu ne le justifie pas.

---

## Sécurité

### Risques identifiés et mitigations

| Risque | Impact | Mitigation implémentée | Mitigation recommandée (prod) |
|--------|--------|------------------------|------------------------------|
| **URLs malveillantes (phishing)** | Élevé | Validation protocole (http/https uniquement) | Blacklist de domaines, intégration Google Safe Browsing API |
| **Open redirect** | Moyen | Validation stricte du format URL, pas de redirection vers URL relative | Headers de sécurité, Content-Security-Policy |
| **Énumération des shortCodes** | Faible | Codes aléatoires (nanoid), pas de pattern prédictible | Rate limiting par IP, CAPTCHA après N tentatives |
| **Injection SQL** | Critique | Prisma ORM (requêtes paramétrées) | ✅ Déjà mitigé |
| **DoS par création massive** | Élevé | ❌ Non implémenté | Rate limiting (express-rate-limit), quotas par IP |
| **XSS via URL** | Moyen | URLs non affichées en HTML brut | CSP headers, sanitization |

### Recommandations pour la production

```typescript
// Rate limiting (à ajouter dans main.ts)
import rateLimit from 'express-rate-limit';

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: 'Too many requests, please try again later.',
}));

// Headers de sécurité
import helmet from 'helmet';
app.use(helmet());
```

### Posture cybersécurité (Stoïk)

En tant que service manipulant des URLs, ce type d'application est une cible potentielle pour :

1. **Campagnes de phishing** : Les URL shorteners peuvent masquer des liens malveillants
2. **Distribution de malware** : Obscurcir des liens de téléchargement dangereux
3. **Tracking** : Collecte de données via redirections

**Recommandations :**
- Intégrer une API de réputation d'URL (VirusTotal, Google Safe Browsing)
- Logger les créations avec IP source (RGPD-compliant)
- Implémenter un système de signalement d'URLs
- Ajouter des warnings avant redirection vers des domaines suspects

---

## Scalabilité

### Architecture actuelle (monolithique)

Suffisante pour ~1000 URLs/jour, ~10K redirections/jour.

### Évolutions possibles

```
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (nginx)                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │ API #1  │    │ API #2  │    │ API #3  │
   └────┬────┘    └────┬────┘    └────┬────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         ┌────┴────┐        ┌────┴────┐
         │  Redis  │        │ PG Pool │
         │ (cache) │        │ (read)  │
         └─────────┘        └────┬────┘
                                 │
                          ┌──────┴──────┐
                          │ PostgreSQL  │
                          │   Primary   │
                          └─────────────┘
```

| Évolution | Quand | Complexité |
|-----------|-------|------------|
| **Redis cache** | >10K redirections/jour | Faible |
| **Read replicas** | >100K URLs | Moyenne |
| **Sharding** | >10M URLs | Élevée |
| **CDN** | Distribution géographique | Moyenne |

### Métriques à monitorer

- Latence P95 des redirections
- Taux d'erreur 404 (énumération?)
- Taux de création/heure (DoS?)
- Taille de la base de données

---

## Limites

### Limites techniques

1. **Pas de gestion des collisions nanoid** : Probabilité négligeable mais existante
2. **Pas de retry sur erreur DB** : Connection perdue = erreur utilisateur
3. **Pas de health check** : Monitoring externe nécessaire
4. **Pas de logs structurés** : Console.log basique

### Limites fonctionnelles

1. **Pas de modification/suppression** : Une URL créée est permanente
2. **Pas d'analytics** : Aucune visibilité sur l'utilisation
3. **Pas de gestion des URLs cassées** : Pas de vérification de disponibilité

### Limites UX

1. **Pas de partage direct** : Copier manuellement l'URL
2. **Pas de QR code** : Feature populaire non implémentée
3. **Pas de preview** : Impossible de voir où mène l'URL avant de cliquer

---

## Améliorations futures

### Court terme (prochaines itérations)

- [ ] Rate limiting
- [ ] Logs structurés (Winston/Pino)
- [ ] Health check endpoint
- [ ] Dockerfile pour déploiement

### Moyen terme

- [ ] Authentification (JWT/OAuth)
- [ ] Analytics (clicks, referers, devices)
- [ ] Custom shortCodes
- [ ] Expiration URLs
- [ ] API documentation (Swagger)

### Long terme

- [ ] Custom domains
- [ ] Teams/Organizations
- [ ] Intégration Safe Browsing
- [ ] QR codes
- [ ] Webhooks

---

## Conclusion

Ce projet démontre la capacité à :

1. **Structurer** une application fullstack avec des choix techniques justifiés
2. **Prioriser** les fonctionnalités essentielles dans un scope limité
3. **Anticiper** les enjeux de sécurité et de scalabilité
4. **Documenter** les décisions et compromis

Le code est volontairement simple et lisible, privilégiant la clarté à l'optimisation prématurée.

## 👤 Author

**Théo HERVÉ**
Fullstack JavaScript Engineer

*Ce projet est un simple URL Shortener développé pour un entretien technique Chez Stoïk.*
