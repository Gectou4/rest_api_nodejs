# G4Api - Mini API REST (Node.js)

API REST légère en Node.js/Express, avec sortie JSON (ou Markdown via `Accept: text/markdown`).

[![CI](https://github.com/Gectou4/rest_api_nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/Gectou4/rest_api_nodejs/actions/workflows/ci.yml)

> **Part of the G4Api series.** The same small API (users, tasks and their N:N link) built in several stacks, to compare ecosystems: language, tooling, tests, static analysis and CI. Learning project, built in May 2026 with the help of an AI coding assistant. The PHP version is the reference.
>
> | Stack                | Repository                                                                |
> | -------------------- | ------------------------------------------------------------------------- |
> | PHP 8 (no framework) | [rest_api_php](https://github.com/Gectou4/rest_api_php)                   |
> | Go                   | [rest_api_go](https://github.com/Gectou4/rest_api_go)                     |
> | Rust (axum, sqlx)    | [rest_api_rs](https://github.com/Gectou4/rest_api_rs)                     |
> | Java 21 (Jersey)     | [rest_api_java](https://github.com/Gectou4/rest_api_java)                 |
> | .NET 8 (Dapper)      | [rest_api_netcsharp](https://github.com/Gectou4/rest_api_netcsharp)       |
> | Python (Flask)       | [rest_api_python](https://github.com/Gectou4/rest_api_python)             |
> | Node.js (Express)    | [rest_api_nodejs](https://github.com/Gectou4/rest_api_nodejs) (this repo) |
> | React front-end      | [rest_api_front_react](https://github.com/Gectou4/rest_api_front_react)   |

Portage du projet PHP original vers Node.js.

Elle gère deux types d'objets et leurs relations :

| Objet  | Champs                                                       |
| ------ | ------------------------------------------------------------ |
| `User` | `user_id`, `name`, `email`                                   |
| `Task` | `task_id`, `title`, `description`, `creation_date`, `status` |

Les statuts de tâche (`status`) sont des entiers : `1` Backlog - `2` Todo - `3` In Progress - `4` Done - `5` Closed.

### Endpoints

| Méthode        | URI                        | Description                                 |
| -------------- | -------------------------- | ------------------------------------------- |
| `GET`          | `/task`                    | Liste de toutes les tâches                  |
| `GET`          | `/user/{id}`               | Données d'un utilisateur                    |
| `GET`          | `/user/{id}/task`          | Liste des tâches d'un utilisateur           |
| `POST`         | `/task`                    | Créer une nouvelle tâche                    |
| `POST` / `PUT` | `/user/{id}/task/{taskId}` | Associer une tâche à un utilisateur         |
| `DELETE`       | `/task/{id}`               | Supprimer une tâche                         |
| `DELETE`       | `/user/{id}/task/{taskId}` | Retirer l'association tâche-utilisateur     |
| `POST` / `PUT` | `/task/{id}`               | Modifier une tâche existante                |

---

## Configuration

### Base de données

Créer une base MySQL et importer le schéma disponible dans `share/sql/rest_api.sql`.

Configurer ensuite la connexion via le fichier `.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rest_api
DB_PORT=3306
PORT=3000
```

---

## Développement

### Prérequis

- Node.js 18+ **ou** Docker
- MySQL 5.7+ / MariaDB 10.4+ **ou** Docker Compose
- npm

### Installation locale

```bash
npm install
```

### Lancement local

```bash
npm start
# ou en mode dev avec auto-reload
npm run dev
```

### Avec Docker (recommandé)

```bash
# Lancer l'API + MySQL
docker compose up -d

# Voir les logs
docker compose logs -f app

# Arrêter
docker compose down
```

L'API est accessible sur `http://localhost:3000`.

### Tests

**Local** (nécessite une base MySQL locale) :

```bash
npm test
```

**Avec Docker** (isolé, pas besoin de MySQL local) :

```bash
docker compose --profile test up test
```

### Format de réponse

Par défaut, l'API répond en JSON. Pour obtenir une réponse Markdown :

```
Accept: text/markdown
```
