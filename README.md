# G4Api - Mini API REST (Node.js)

API REST legere en Node.js/Express, avec sortie JSON (ou Markdown via `Accept: text/markdown`).

Portage du projet PHP original vers Node.js.

Elle gere deux types d'objets et leurs relations :

| Objet  | Champs                                                       |
| ------ | ------------------------------------------------------------ |
| `User` | `user_id`, `name`, `email`                                   |
| `Task` | `task_id`, `title`, `description`, `creation_date`, `status` |

Les statuts de tache (`status`) sont des entiers : `1` Backlog - `2` Todo - `3` In Progress - `4` Done - `5` Closed.

### Endpoints

| Methode        | URI                        | Description                                 |
| -------------- | -------------------------- | ------------------------------------------- |
| `GET`          | `/user/{id}`               | Donnees d'un utilisateur                    |
| `GET`          | `/user/{id}/task`          | Liste des taches d'un utilisateur           |
| `POST`         | `/task`                    | Creer une nouvelle tache                    |
| `POST` / `PUT` | `/user/{id}/task/{taskId}` | Associer une tache a un utilisateur         |
| `DELETE`       | `/task/{id}`               | Supprimer une tache                         |
| `DELETE`       | `/user/{id}/task/{taskId}` | Retirer l'association tache <-> utilisateur |
| `POST` / `PUT` | `/task/{id}`               | Modifier une tache existante                |

---

## Configuration

### Base de donnees

Creer une base MySQL et importer le schema disponible dans `share/sql/rest_api.sql`.

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

## Developpement

### Prerequis

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

### Avec Docker (recommande)

```bash
# Lancer l'API + MySQL
docker compose up -d

# Voir les logs
docker compose logs -f app

# Arreter
docker compose down
```

L'API est accessible sur `http://localhost:3000`.

### Tests

**Local** (neecessite une DB MySQL locale) :

```bash
npm test
```

**Avec Docker** (isole, pas besoin de MySQL local) :

```bash
docker compose --profile test up test
```

### Format de reponse

Par defaut l'API repond en JSON. Pour obtenir une reponse Markdown :

```
Accept: text/markdown
```
