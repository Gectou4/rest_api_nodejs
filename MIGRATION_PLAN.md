# Plan de migration PHP → Node.js

## Structure cible

```
rest_api_nodejs/
├── src/
│   ├── config/
│   │   ├── db.js          # Connexion MySQL (mysql2 pool)
│   │   └── routes.js      # Express Router
│   ├── controllers/
│   │   ├── user.js        # GET /user/:id, GET /user/:id/task
│   │   └── task.js        # CRUD tasks + associations
│   ├── models/
│   │   ├── taskStatus.js  # Enum (1-5)
│   │   ├── user.js        # Entity User
│   │   ├── task.js        # Entity Task (CRUD)
│   │   └── userTask.js    # Pivot N:N
│   └── middleware/
│       ├── errorHandler.js
│       └── markdown.js    # Accept: text/markdown
├── tests/
│   ├── api.test.js        # Tests API (endpoints)
│   ├── lifecycle.test.js  # Tests cycle de vie CRUD
│   └── taskStatus.test.js # Tests unitaires enum
├── .github/workflows/
│   ├── ci.yml             # CI: lint + format + tests
│   └── auto-fix.yml       # Auto-fix Prettier sur PR
├── docker-compose.yml     # App + MySQL + tests
├── Dockerfile             # Image production
├── Dockerfile.test        # Image tests
├── .dockerignore          # Exclusions Docker
├── share/sql/rest_api.sql # Schema MySQL
├── openapi.yaml           # Spec OpenAPI 3.0
├── .env                   # DB config
├── .env.example           # Template env vars
├── .prettierrc            # Config Prettier
├── .prettierignore        # Ignore Prettier
├── eslint.config.js       # Config ESLint flat
├── package.json
└── README.md
```

## Stack technique

| PHP | Node.js |
|-----|---------|
| PDO | mysql2 (pool) |
| Routeur regex custom | Express.js Router |
| PHPUnit | Jest + Supertest |
| composer.json | package.json |
| `$_SERVER`/`$_REQUEST` | `req.headers`/`req.body`/`req.params` |
| Singleton/Multiton | Modules ES6 (import unique) |
| `$_POST`/`php://input` | `express.json()` + `express.urlencoded()` |

## Correspondance PHP → Node.js

### Models
- `ModelAbstract` → classes ES6 avec méthodes async/await
- `TaskStatus` (PHP enum) → objet JS avec constantes
- `User`, `Task`, `UserTask` → classes avec `load()`, `save()`, `delete()`, `toArray()`

### Controllers
- Méthodes `getXXXAction()` → fonctions Express `(req, res)`
- `setCode()` → `res.status()`
- `return $data` → `res.json(data)` ou `res.send()`

### Routes
| PHP Route | Express Route |
|-----------|---------------|
| `GET /user/(\d+)` | `GET /user/:id` |
| `GET /user/(\d+)/task` | `GET /user/:id/task` |
| `POST\|PUT /task` | `POST /task`, `PUT /task` |
| `POST\|PUT /task/(\d+)` | `POST /task/:id`, `PUT /task/:id` |
| `DELETE /task/(\d+)` | `DELETE /task/:id` |
| `POST\|PUT /user/(\d+)/task/(\d+)` | `POST /user/:userId/task/:taskId`, `PUT /user/:userId/task/:taskId` |
| `DELETE /user/(\d+)/task/(\d+)` | `DELETE /user/:userId/task/:taskId` |

## Endpoints

| Méthode | URI | Controller | Description |
|---------|-----|------------|-------------|
| `GET` | `/user/{id}` | User.index | Données utilisateur |
| `GET` | `/user/{id}/task` | User.userTask | Taches d'un utilisateur |
| `POST` | `/task` | Task.addTask | Créer une tache (201) |
| `POST/PUT` | `/task/{id}` | Task.editTask | Modifier une tache |
| `DELETE` | `/task/{id}` | Task.deleteTask | Supprimer une tache |
| `POST/PUT` | `/user/{id}/task/{taskId}` | Task.addTaskToUser | Associer tache → user |
| `DELETE` | `/user/{id}/task/{taskId}` | Task.deleteUserTask | Retirer association |

## Statuts Task

| Value | Label |
|-------|-------|
| 1 | Backlog |
| 2 | Todo |
| 3 | In Progress |
| 4 | Done |
| 5 | Closed |

## Codes HTTP

| Code | Usage |
|------|-------|
| 200 | Succès (lecture, update, delete) |
| 201 | Création de tache |
| 400 | Paramètre invalide / ressource inexistante |
| 404 | Utilisateur non trouvé |
| 500 | Erreur interne |

## Configuration DB (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rest_api
DB_PORT=3306
PORT=3000
```

## Outillage

| Outil | Rôle |
|-------|------|
| ESLint | Linting JS (flat config) |
| Prettier | Formatage automatique |
| Jest + Supertest | Tests unitaires et API |
| GitHub Actions | CI/CD (lint, format, tests, coverage) |

## Commandes

```bash
npm install           # Installer les dépendances
npm start             # Lancer le serveur
npm run dev           # Dev avec auto-reload
npm test              # Tests Jest
npm run test:coverage # Tests + rapport de couverture
npm run lint          # Vérifier le linting
npm run lint:fix      # Corriger le linting auto
npm run format        # Formater avec Prettier
npm run format:check  # Vérifier le formatage
npm run check         # lint + format:check
```

## GitHub Actions

### ci.yml
- **lint** : ESLint sur Ubuntu
- **format** : Prettier check
- **test** : Jest sur Node 18, 20, 22 avec MySQL 8.0
- **coverage** : Rapport de couverture (PR uniquement)
- **quality-gate** : Vérifie que tout est vert

### auto-fix.yml
- S'exécute sur PR si le repo source = repo cible
- Applique Prettier et commit les changements

## Docker

### Services

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| `app` | node:20-alpine | 3000 | API Express |
| `db` | mysql:8.0 | 3306 | Base de données |
| `test` | node:20-alpine | - | Tests (profile: test) |

### Commandes

```bash
docker compose up -d           # Lancer app + db
docker compose logs -f app     # Logs de l'API
docker compose down            # Arreter
docker compose --profile test up test  # Lancer les tests
```

### Volumes

- `mysql_data` : persistance des données MySQL

### Init DB

Le schema `share/sql/rest_api.sql` est automatiquement importé au premier lancement via `docker-entrypoint-initdb.d/`.

## Fichiers conservés du projet PHP

- `openapi.yaml` — Spec OpenAPI inchangée
- `share/sql/rest_api.sql` — Schema MySQL inchangé
