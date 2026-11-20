# 📚 API Livres — Node.js + Express + MongoDB + Docker

API REST qui gère une collection de livres, avec les opérations CRUD : créer, lire, modifier, supprimer.
Elle est conteneurisée avec **Docker** et orchestrée avec **Docker Compose** : un conteneur pour Node.js, un conteneur pour MongoDB.

---

## Sommaire

1. [Technologies](#-technologies)
2. [Structure du projet](#-structure-du-projet)
3. [Modèle de données](#-modèle-de-données)
4. [Prérequis](#-prérequis)
5. [Installation et démarrage rapide](#-installation-et-démarrage-rapide)
6. [Configuration (variables d'environnement)](#-configuration-variables-denvironnement)
7. [Les endpoints de l'API](#-les-endpoints-de-lapi)
8. [Tester l'API](#-tester-lapi)
9. [Docker en détail](#-docker-en-détail)
10. [Commandes Docker Compose](#-commandes-docker-compose)
11. [Commandes Docker (images, conteneurs, réseau, volume)](#-commandes-docker-images-conteneurs-réseau-volume)
12. [Lancer sans Docker Compose](#-lancer-sans-docker-compose-docker-run)
13. [Lancer sans Docker (en local)](#-lancer-sans-docker-en-local)
14. [Dépannage](#-dépannage)
15. [Publier sur GitHub](#-publier-sur-github)

---

## 🛠 Technologies

| Outil | Version | Rôle |
|---|---|---|
| Node.js | 22 (image `node:22.12.0-alpine3.21`) | Environnement d'exécution JavaScript |
| Express | 4.x | Framework web, gère les routes HTTP |
| Mongoose | 8.x | Accès à MongoDB (schémas, validation) |
| MongoDB | 8.0.4 (image `mongo:8.0.4`) | Base de données NoSQL |
| Docker | 20+ | Conteneurisation |
| Docker Compose | v2+ | Lancement de plusieurs conteneurs ensemble |

---

## 📁 Structure du projet

```
api-livres/
├── src/
│   ├── config/
│   │   └── db.js                 # Connexion à MongoDB
│   ├── controllers/
│   │   └── bookController.js     # Logique métier (CRUD)
│   ├── models/
│   │   └── book.js               # Schéma Mongoose du livre
│   ├── routes/
│   │   └── bookRoutes.js         # Routes /api/books
│   ├── app.js                    # Application Express (middlewares, routes, erreurs)
│   └── server.js                 # Point d'entrée : connexion à la base + démarrage du serveur
├── .dockerignore                 # Fichiers exclus de l'image Docker
├── .env.example                  # Modèle de configuration (à copier en .env)
├── .gitignore                    # Fichiers exclus de Git
├── compose.yml                   # Orchestration Node + Mongo
├── Dockerfile                    # Construction de l'image Node
├── package.json                  # Dépendances et scripts npm
└── README.md
```

Rôle de chaque couche :
- **routes** : associe une URL et une méthode HTTP à une fonction du contrôleur.
- **controllers** : lit la requête, appelle le modèle, renvoie la réponse.
- **models** : définit la structure et les règles de validation d'un livre.

---

## 📖 Modèle de données

Un livre a la structure suivante :

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| `id` | string | généré automatiquement | identifiant unique (ObjectId MongoDB) |
| `title` | string | ✅ | titre du livre, espaces retirés en début et fin |
| `author` | string | ✅ | auteur, espaces retirés en début et fin |
| `page` | number | ✅ | nombre de pages, au moins 1 |

Exemple :

```json
{
  "id": "6b005e1143acc6f29c5edaf4",
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "page": 96
}
```

> MongoDB stocke l'identifiant sous le nom `_id`. L'API le renvoie sous le nom `id` pour avoir une réponse plus lisible.

---

## ✅ Prérequis

Le seul outil à installer est **Docker** : Node.js et MongoDB tournent dans des conteneurs.

- **Docker Desktop** (macOS / Windows) : https://www.docker.com/products/docker-desktop/
- **Docker Engine + plugin Compose** (Linux) : https://docs.docker.com/engine/install/
- **Git**, pour cloner le projet : https://git-scm.com/

Vérifier l'installation :

```bash
docker --version
docker compose version
git --version
```

> Docker Desktop doit être **lancé** (icône de la baleine active) avant de taper les commandes.

---

## 🚀 Installation et démarrage rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/boss-last/atelier_docker.git
cd atelier_docker
```

### 2. Créer le fichier de configuration

```bash
cp .env.example .env
```

Les valeurs par défaut conviennent, vous pouvez les modifier si besoin (voir [Configuration](#-configuration-variables-denvironnement)).

### 3. Construire et lancer les conteneurs

```bash
docker compose up -d --build
```

- `up` : crée et démarre les services.
- `-d` (*detached*) : lance en arrière-plan et rend la main au terminal.
- `--build` : construit (ou reconstruit) l'image Node à partir du `Dockerfile`.

Au premier lancement, Docker télécharge les images `node` et `mongo`, ce qui peut prendre quelques minutes.

### 4. Vérifier que tout fonctionne

```bash
docker compose ps
```

Résultat attendu :

```
NAME               IMAGE                   SERVICE   STATUS                    PORTS
api-livres-mongo   mongo:8.0.4             mongo     Up (healthy)              27017/tcp
api-livres-node    api-livres-node:1.0.0   api       Up (healthy)              0.0.0.0:3000->3000/tcp
```

Puis :

```bash
curl http://localhost:3000/health
```

```json
{"status":"ok","db":"up"}
```

L'API est disponible sur **http://localhost:3000** 🎉

### 5. Arrêter

```bash
docker compose down
```

---

## ⚙ Configuration (variables d'environnement)

Le fichier `.env`, à la racine, est lu automatiquement par Docker Compose.

| Variable | Défaut | Description |
|---|---|---|
| `APP_PORT` | `3000` | Port de **votre machine** sur lequel l'API est accessible |
| `MONGO_DB` | `livres` | Nom de la base de données MongoDB |

Variables lues par l'application Node, déjà renseignées dans `compose.yml` :

| Variable | Valeur dans Docker | Description |
|---|---|---|
| `PORT` | `3000` | Port d'écoute d'Express **dans** le conteneur |
| `MONGO_URI` | `mongodb://mongo:27017/livres` | Adresse de MongoDB (`mongo` = nom du service sur le réseau Docker) |
| `NODE_ENV` | `production` | Mode d'exécution (défini dans le Dockerfile) |

Exemple : pour exposer l'API sur le port 8080, mettez `APP_PORT=8080` dans `.env` puis relancez `docker compose up -d`.

> Le fichier `.env` est exclu de Git (`.gitignore`). Seul `.env.example` est publié.

---

## 🌐 Les endpoints de l'API

URL de base : `http://localhost:3000`

| Méthode | URL | Description | Corps (JSON) | Réponse OK |
|---|---|---|---|---|
| `GET` | `/health` | État de l'API et de la base | — | `200` |
| `GET` | `/api/books` | Liste de tous les livres | — | `200` + tableau |
| `GET` | `/api/books/:id` | Un livre par son id | — | `200` + livre |
| `POST` | `/api/books` | Créer un livre | `{ title, author, page }` | `201` + livre créé |
| `PUT` | `/api/books/:id` | Modifier un livre (tout ou partie des champs) | `{ title?, author?, page? }` | `200` + livre modifié |
| `DELETE` | `/api/books/:id` | Supprimer un livre | — | `204` (pas de contenu) |

### Codes d'erreur

| Code | Cas | Exemple de réponse |
|---|---|---|
| `400` | Données invalides ou champ manquant | `{"message":"Données invalides","errors":["L'auteur est obligatoire"]}` |
| `400` | Id mal formé | `{"message":"Id invalide"}` |
| `400` | JSON mal formé | `{"message":"JSON invalide"}` |
| `404` | Livre introuvable | `{"message":"Livre introuvable"}` |
| `404` | Route inexistante | `{"message":"Route introuvable"}` |
| `500` | Erreur serveur | `{"message":"Erreur serveur"}` |
| `503` | `/health` quand MongoDB n'est pas joignable | `{"status":"ok","db":"down"}` |

---

## 🧪 Tester l'API

### Avec curl

**Créer un livre**

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Le Petit Prince","author":"Antoine de Saint-Exupéry","page":96}'
```

**Lister les livres**

```bash
curl http://localhost:3000/api/books
```

**Récupérer un livre** (remplacer `<ID>` par un id renvoyé à la création)

```bash
curl http://localhost:3000/api/books/<ID>
```

**Modifier un livre**

```bash
curl -X PUT http://localhost:3000/api/books/<ID> \
  -H "Content-Type: application/json" \
  -d '{"page":100}'
```

**Supprimer un livre**

```bash
curl -X DELETE http://localhost:3000/api/books/<ID> -i
```

> Sous Windows PowerShell, utilisez `curl.exe` au lieu de `curl`, ou un outil graphique.

### Avec Postman, Insomnia ou Thunder Client (VS Code)

1. Créez une requête vers `http://localhost:3000/api/books`.
2. Pour `POST` et `PUT` : onglet **Body** → **raw** → **JSON**.
3. Collez par exemple `{"title":"1984","author":"George Orwell","page":328}`.

---

## 🐳 Docker en détail

### Le Dockerfile (image Node)

```dockerfile
FROM node:22.12.0-alpine3.21          # Image de base : version précise et légère (Alpine)
LABEL org.opencontainers.image.title="api-livres" ...   # Métadonnées de l'image
ENV NODE_ENV=production PORT=3000     # Variables d'environnement par défaut
WORKDIR /usr/src/app                  # Dossier de travail dans le conteneur
COPY package*.json ./                 # 1) Copie des fichiers de dépendances seuls...
RUN npm install --omit=dev && npm cache clean --force   # ...puis installation (couche mise en cache)
COPY src ./src                        # 2) Copie du code source
USER node                             # Exécution avec un utilisateur non-root (sécurité)
EXPOSE 3000                           # Port utilisé par l'application
HEALTHCHECK ... wget -qO- http://localhost:3000/health   # Vérification de santé automatique
CMD ["node", "src/server.js"]         # Commande lancée au démarrage
```

Choix techniques :
- **Version figée** (`22.12.0-alpine3.21` plutôt que `latest`) : le build donne le même résultat à chaque fois.
- **Copier `package.json` avant le code** : tant que les dépendances ne changent pas, Docker réutilise la couche `npm install` en cache et le rebuild est beaucoup plus rapide.
- **`--omit=dev`** : seules les dépendances de production sont installées.
- **`USER node`** : l'application ne tourne pas en root.
- **`HEALTHCHECK`** : Docker indique si l'API répond (`healthy` / `unhealthy`).

### Le fichier `.dockerignore`

Il exclut de l'image les fichiers inutiles ou sensibles : `node_modules`, `.env`, `.git`, `README.md`… L'image est plus légère et ne contient aucun secret.

### Le fichier compose.yml

```yaml
name: api-livres                     # Nom du projet Compose

services:
  api:                               # Service Node.js
    build: .                         # Construit l'image à partir du Dockerfile
    image: api-livres-node:1.0.0     # Nom:tag donné à l'image construite
    container_name: api-livres-node  # Nom fixe du conteneur
    restart: unless-stopped          # Redémarre automatiquement sauf arrêt manuel
    environment:
      MONGO_URI: mongodb://mongo:27017/livres
    ports:
      - "3000:3000"                  # port_machine:port_conteneur
    depends_on:
      mongo:
        condition: service_healthy   # Attend que Mongo soit prêt avant de démarrer
    networks: [livres-network]

  mongo:                             # Service MongoDB
    image: mongo:8.0.4               # Image officielle, version figée
    container_name: api-livres-mongo
    volumes:
      - livres-mongo-data:/data/db   # Données persistantes
    healthcheck:                     # Vérifie que Mongo répond (ping)
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
    networks: [livres-network]

networks:
  livres-network:                    # Réseau privé entre les deux conteneurs
    name: livres-network

volumes:
  livres-mongo-data:                 # Volume nommé : les données survivent aux redémarrages
    name: livres-mongo-data
```

### Nommage et tags des éléments Docker

| Élément | Nom / tag | Pourquoi |
|---|---|---|
| Projet Compose | `api-livres` | Regroupe tous les éléments du projet |
| Image API | `api-livres-node:1.0.0` | Nom explicite + version (même version que `package.json`) |
| Image base de données | `mongo:8.0.4` | Version précise, pas `latest` |
| Conteneur API | `api-livres-node` | Facile à cibler avec `docker logs`, `docker exec`… |
| Conteneur Mongo | `api-livres-mongo` | Idem |
| Réseau | `livres-network` | Réseau dédié et isolé |
| Volume | `livres-mongo-data` | On sait ce qu'il contient |
| Labels | `com.atelier-docker.project`, `com.atelier-docker.role` | Filtrer les conteneurs du projet |

Exemple de filtrage par label :

```bash
docker ps --filter "label=com.atelier-docker.project=api-livres"
```

### Communication entre les conteneurs

```
  Votre machine                  Réseau Docker « livres-network »
 ┌─────────────┐   port 3000   ┌──────────────────┐   mongo:27017   ┌──────────────────┐
 │ navigateur  │ ────────────▶ │ api-livres-node  │ ──────────────▶ │ api-livres-mongo │
 │ curl/Postman│               │  (Express)       │                 │  (MongoDB)       │
 └─────────────┘               └──────────────────┘                 └────────┬─────────┘
                                                                             │
                                                                   volume livres-mongo-data
```

- L'API est **exposée** sur le port 3000 de votre machine.
- MongoDB n'est **pas exposé** à l'extérieur : seule l'API peut le joindre, par le réseau interne.
- Dans le réseau Docker, un conteneur en joint un autre par son **nom de service** (`mongo`), d'où l'adresse `mongodb://mongo:27017`.

---

## 🧰 Commandes Docker Compose

À lancer depuis le dossier du projet (là où se trouve `compose.yml`).

| Commande | Effet |
|---|---|
| `docker compose up -d --build` | Construit l'image et démarre tous les services en arrière-plan |
| `docker compose up -d` | Démarre sans reconstruire |
| `docker compose up -d --build api` | Reconstruit et redémarre **seulement** l'API (après une modification du code) |
| `docker compose ps` | État des services |
| `docker compose logs` | Logs de tous les services |
| `docker compose logs -f api` | Logs de l'API en temps réel (`Ctrl+C` pour quitter) |
| `docker compose stop` | Arrête les conteneurs sans les supprimer |
| `docker compose start` | Redémarre des conteneurs arrêtés |
| `docker compose restart api` | Redémarre l'API |
| `docker compose exec api sh` | Ouvre un shell dans le conteneur API |
| `docker compose exec mongo mongosh livres` | Ouvre la console MongoDB sur la base `livres` |
| `docker compose build` | Construit l'image sans démarrer |
| `docker compose config` | Affiche la configuration finale, avec les variables `.env` remplacées |
| `docker compose down` | Arrête et supprime les conteneurs et le réseau (**les données sont conservées**) |
| `docker compose down -v` | Supprime aussi le volume : **⚠️ toutes les données sont effacées** |
| `docker compose down --rmi local` | Supprime aussi l'image construite localement |

---

## 🔧 Commandes Docker (images, conteneurs, réseau, volume)

### Images

| Commande | Effet |
|---|---|
| `docker build -t api-livres-node:1.0.0 .` | Construit l'image avec un nom et un tag |
| `docker tag api-livres-node:1.0.0 api-livres-node:latest` | Ajoute un autre tag à la même image |
| `docker images` | Liste les images locales |
| `docker image inspect api-livres-node:1.0.0` | Détails de l'image (labels, ports, variables…) |
| `docker history api-livres-node:1.0.0` | Couches de l'image et leur taille |
| `docker pull mongo:8.0.4` | Télécharge une image depuis Docker Hub |
| `docker rmi api-livres-node:1.0.0` | Supprime une image |
| `docker image prune` | Supprime les images inutilisées (sans tag) |

### Conteneurs

| Commande | Effet |
|---|---|
| `docker ps` | Conteneurs en cours d'exécution |
| `docker ps -a` | Tous les conteneurs, y compris arrêtés |
| `docker logs -f api-livres-node` | Logs en temps réel |
| `docker exec -it api-livres-node sh` | Shell dans le conteneur |
| `docker exec -it api-livres-mongo mongosh livres` | Console MongoDB |
| `docker inspect api-livres-node` | Détails complets du conteneur |
| `docker stats` | Utilisation CPU et mémoire en direct |
| `docker stop api-livres-node` | Arrête le conteneur |
| `docker start api-livres-node` | Redémarre le conteneur |
| `docker rm -f api-livres-node` | Supprime le conteneur, même s'il tourne |

### Réseau et volume

| Commande | Effet |
|---|---|
| `docker network ls` | Liste les réseaux |
| `docker network inspect livres-network` | Conteneurs connectés et adresses IP |
| `docker volume ls` | Liste les volumes |
| `docker volume inspect livres-mongo-data` | Emplacement et détails du volume |
| `docker volume rm livres-mongo-data` | Supprime le volume (**⚠️ données perdues**) |

### Exemples de requêtes dans la console MongoDB

```bash
docker exec -it api-livres-mongo mongosh livres
```

```js
db.books.find()                       // tous les livres
db.books.countDocuments()             // nombre de livres
db.books.find({ author: /Orwell/ })   // recherche par auteur
db.books.deleteMany({})               // ⚠️ vide la collection
exit
```

### Nettoyage général

```bash
docker system df          # espace disque utilisé par Docker
docker system prune       # supprime conteneurs arrêtés, réseaux et images inutilisés
```

---

## 🧱 Lancer sans Docker Compose (docker run)

Pour comprendre ce que fait Compose, voici les mêmes étapes à la main :

```bash
# 1. Créer le réseau
docker network create livres-network

# 2. Créer le volume
docker volume create livres-mongo-data

# 3. Lancer MongoDB
docker run -d \
  --name api-livres-mongo \
  --network livres-network \
  -v livres-mongo-data:/data/db \
  mongo:8.0.4

# 4. Construire l'image de l'API
docker build -t api-livres-node:1.0.0 .

# 5. Lancer l'API
docker run -d \
  --name api-livres-node \
  --network livres-network \
  -p 3000:3000 \
  -e MONGO_URI=mongodb://api-livres-mongo:27017/livres \
  api-livres-node:1.0.0
```

Nettoyage :

```bash
docker rm -f api-livres-node api-livres-mongo
docker network rm livres-network
```

---

## 💻 Lancer sans Docker (en local)

Il faut **Node.js 22+** et un MongoDB disponible sur `localhost:27017`.

```bash
npm install
MONGO_URI=mongodb://localhost:27017/livres npm start
```

Mode développement, avec redémarrage automatique à chaque modification :

```bash
npm run dev
```

Pour lancer seulement MongoDB avec Docker et exposer son port en local :

```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:8.0.4
```

---

## 🩺 Dépannage

| Problème | Solution |
|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop n'est pas lancé : démarrez-le. |
| `port is already allocated` (port 3000) | Le port est déjà utilisé : changez `APP_PORT` dans `.env` (ex. `3001`), ou trouvez le programme avec `lsof -i :3000`. |
| `Conflict. The container name "/api-livres-node" is already in use` | Un ancien conteneur existe : `docker rm -f api-livres-node`, puis relancez. |
| L'API reste en `health: starting` | Patientez quelques secondes, puis lisez les logs : `docker compose logs api`. |
| `Connexion MongoDB impossible` dans les logs | Vérifiez que `api-livres-mongo` est `healthy` : `docker compose ps`. |
| Les modifications du code ne s'appliquent pas | Reconstruisez l'image : `docker compose up -d --build api`. |
| Repartir de zéro | `docker compose down -v --rmi local`, puis `docker compose up -d --build`. |

---

## 🐙 Publier sur GitHub

### 1. Créer un dépôt vide sur GitHub

Sur https://github.com/new, nommez-le `atelier_docker` et **ne cochez pas** l'ajout d'un README, d'un .gitignore ou d'une licence (ils existent déjà).

### 2. Initialiser Git et pousser le projet

Depuis le dossier `api-livres/` :

```bash
git init
git add .
git commit -m "Initial commit : API livres Node.js + Express + MongoDB + Docker"
git branch -M main
git remote add origin https://github.com/boss-last/atelier_docker.git
git push -u origin main
```

### 3. Vérifier ce qui sera envoyé

```bash
git status
```

Grâce au `.gitignore`, **`node_modules/` et `.env` ne sont pas envoyés**. Seul `.env.example` est publié.

### Mises à jour suivantes

```bash
git add .
git commit -m "Description de la modification"
git push
```

---

## 📄 Licence

Projet sous licence MIT, libre d'utilisation à des fins d'apprentissage.
