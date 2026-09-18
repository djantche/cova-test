# Task Manager — Test technique

Application de gestion de tâches full-stack : API REST **Spring Boot**, interface web
**React + Vite + TypeScript**, application mobile **Flutter** (bonus) et déploiement
**Docker / CI-CD** (bonus).

## Sommaire

- [Architecture](#architecture)
- [Choix techniques](#choix-techniques)
- [Démarrage rapide (Docker Compose)](#démarrage-rapide-docker-compose)
- [Backend — Spring Boot](#backend--spring-boot)
- [Frontend — React + Vite + TSX](#frontend--react--vite--tsx)
- [Mobile — Flutter (bonus)](#mobile--flutter-bonus)
- [CI/CD & Déploiement (bonus)](#cicd--déploiement-bonus)
- [API — Endpoints](#api--endpoints)

## Architecture

```
cova-test/
├── backend/            API REST Spring Boot (Java 17, Spring Security, JPA, MySQL)
├── frontend/           SPA React + Vite + TypeScript + Tailwind CSS
├── mobile/             Application Flutter (Android) consommant la même API
├── docker-compose.yml  Stack complète (MySQL + backend + frontend) pour le local
└── .github/workflows/  Pipeline CI/CD (build, tests, images Docker, déploiement GCP)
```

Le frontend web et l'application mobile consomment la **même API** REST sécurisée par
JWT. Chaque utilisateur ne voit que ses propres tâches (isolation par `user_id` côté
backend).

## Choix techniques

- **Backend** : Spring Boot 4 (Java 17), Spring Data JPA + MySQL, Spring Security en
  mode stateless avec un filtre JWT maison (`jjwt`), BCrypt pour les mots de passe.
  Les erreurs métier (email déjà utilisé, tâche introuvable, validation...) sont
  centralisées dans un `@RestControllerAdvice` et renvoyées en JSON structuré.
- **Frontend** : React + Vite + TypeScript, Tailwind CSS v4 pour le style, React
  Router pour la navigation, Axios avec intercepteur pour injecter le token JWT et
  gérer les 401 (redirection automatique vers `/login`), système de toasts maison
  pour la gestion des erreurs API.
- **Mobile** : Flutter (Dart), package `http` pour consommer l'API, `shared_preferences`
  pour persister le token JWT sur l'appareil. Les écrans (login, inscription, liste de
  tâches avec filtre/recherche/CRUD) reproduisent le comportement du frontend web.
- **DevOps** : Dockerfiles multi-stage pour le backend (Maven → JRE alpine) et le
  frontend (build Vite → Nginx), `docker-compose.yml` pour lancer toute la stack en
  local, pipeline GitHub Actions (build/test backend+frontend, images Docker,
  déploiement Cloud Run).

## Démarrage rapide (Docker Compose)

Prérequis : Docker + Docker Compose.

```bash
docker compose up --build
```

- Frontend : http://localhost:5173
- Backend : http://localhost:8080
- MySQL : localhost:3306 (db `taskmanager`, user/password `taskmanager`)

Le backend attend que MySQL soit `healthy` avant de démarrer, et crée son schéma
automatiquement (`spring.jpa.hibernate.ddl-auto=update`).

## Backend — Spring Boot

```bash
cd backend
./mvnw spring-boot:run
```

Configuration par variables d'environnement (voir `src/main/resources/application.yml`) :

| Variable            | Défaut          | Description                     |
|---------------------|-----------------|----------------------------------|
| `DB_URL`            | (construite depuis les variables ci-dessous) | URL JDBC complète (prioritaire). Exemple Render : `jdbc:mysql://<host>:<port>/<db>?sslMode=REQUIRED` |
| `DB_HOST`           | `localhost`     | Hôte MySQL                       |
| `DB_PORT`           | `3306`          | Port MySQL                       |
| `DB_NAME`           | `taskmanager`   | Nom de la base                   |
| `DB_USER`           | `taskmanager`   | Utilisateur MySQL                 |
| `DB_PASSWORD`       | `taskmanager`   | Mot de passe MySQL                 |
| `DB_SSL_MODE`       | `DISABLED`      | Mode SSL MySQL (`DISABLED`, `REQUIRED`,...) — utilisez `REQUIRED` si l'hôte l'exige |
| `JWT_SECRET`        | (valeur par défaut fournie) | Clé secrète HMAC pour signer les JWT |
| `JWT_EXPIRATION_MS` | `86400000` (24h)| Durée de validité du token        |

**Tests** (utilisent une base H2 en mémoire, aucune dépendance externe) :

```bash
./mvnw test
```

## Frontend — React + Vite + TSX

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8080
npm run dev
```

Build de production :

```bash
npm run build
```

Fonctionnalités : inscription/connexion, liste des tâches avec recherche et filtre par
statut (déclenchés côté API), création/édition/suppression de tâches, gestion des
erreurs API via des toasts, stockage du JWT en `localStorage` avec redirection
automatique vers `/login` en cas de 401.

## Mobile — Flutter (bonus)

Outillage installé sans Android Studio : **fvm** (Flutter Version Management) +
**Android SDK command-line tools** (`sdkmanager`) uniquement.

```bash
cd mobile
flutter pub get

# Émulateur/AVD Android (10.0.2.2 = alias localhost côté hôte pour l'émulateur) :
flutter run --dart-define=API_URL=http://10.0.2.2:8080

# Appareil physique sur le même réseau que le backend :
flutter run --dart-define=API_URL=http://<ip-machine-backend>:8080
```

Build d'un APK debug :

```bash
flutter build apk --debug --dart-define=API_URL=http://10.0.2.2:8080
```

L'application reproduit le flux principal du web : connexion/inscription (même JWT
que l'API), liste des tâches avec recherche et filtre par statut, ajout/édition/
suppression via une feuille modale (`ListView`, `TextField`, `ElevatedButton`).

Tests :

```bash
flutter test
```

## CI/CD & Déploiement (bonus)

Le pipeline GitHub Actions (`.github/workflows/ci-cd.yml`) exécute, à chaque push /
pull request sur `main` :

1. **backend** : build + tests Maven (JDK 17).
2. **frontend** : `npm ci` + `npm run build`.
3. **docker** : build des images Docker backend/frontend (validation, sans push) sur
   chaque push.
4. **deploy** (uniquement sur `main`, push) : build + push des images vers Artifact
   Registry, puis déploiement sur **Cloud Run** via
   `google-github-actions/deploy-cloudrun`.

Secrets GitHub requis pour l'étape de déploiement : `GCP_SA_KEY` (clé JSON d'un
compte de service), `GCP_PROJECT_ID`, `GCP_REGION`.

## API — Endpoints

| Méthode | Route                | Description                              | Auth |
|---------|-----------------------|-------------------------------------------|------|
| POST    | `/api/auth/register`  | Inscription                                | non  |
| POST    | `/api/auth/login`     | Connexion, retourne un JWT                 | non  |
| GET     | `/api/tasks`          | Liste des tâches (query `status`, `search`)| oui  |
| POST    | `/api/tasks`          | Création d'une tâche                       | oui  |
| PUT     | `/api/tasks/{id}`     | Modification d'une tâche                   | oui  |
| DELETE  | `/api/tasks/{id}`     | Suppression d'une tâche                    | oui  |

Toutes les routes protégées attendent l'en-tête `Authorization: Bearer <token>`.
Statuts de tâche possibles : `TODO`, `IN_PROGRESS`, `DONE`.
