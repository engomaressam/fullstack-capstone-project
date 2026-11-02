# GiftLink

GiftLink connects people who want to give away household items they no longer need with people who would rather reuse than buy new. Users browse and search the listed gifts, open a gift's details and comments, register, log in and edit their profile.

Built for the capstone of the IBM Full-Stack JavaScript Developer Professional Certificate (Coursera), starting from IBM's skeleton template.

| Part | Stack |
|---|---|
| `giftlink-backend` | Node.js, Express, MongoDB driver, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, Pino logging |
| `giftlink-frontend` | React 18, React Router 6, Bootstrap 5, plus a static landing page (`public/home.html`) |
| `sentiment` | Express service that scores a sentence with the `natural` package (AFINN lexicon) |
| `giftwebsite` | Small Express server that serves the React production build |
| DevOps | Dockerfiles, `docker-compose.yml`, Kubernetes manifests, GitHub Actions CI (JSHint + client build) |

## Project board

User stories are GitHub issues written with the template in `.github/ISSUE_TEMPLATE/user-story.md` and triaged with the labels `new`, `backlog`, `icebox` and `technical debt`.

## API

| Method | Route | What it does |
|---|---|---|
| GET | `/api/gifts` | all gifts |
| GET | `/api/gifts/:id` | one gift by its `id` |
| GET | `/api/search?name=&category=&condition=&age_years=` | gifts matching the filters (name is a case-insensitive partial match, `age_years` is an upper bound) |
| POST | `/api/auth/register` | create a user (password hashed with bcrypt), returns a JWT |
| POST | `/api/auth/login` | check the credentials, returns a JWT and the user's first name |
| PUT | `/api/auth/update` | change the user's name; needs `Authorization: Bearer <token>` and an `Email` header |
| POST | `/sentiment?sentence=...` | (sentiment service, port 3000) returns `sentimentScore` and `positive` / `neutral` / `negative` |

## Run it locally

Requirements: Node.js 18+ and a MongoDB 6 instance.

```bash
# 1. MongoDB (here in Docker)
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=<password> mongo:6.0

# 2. Load the 16 sample gifts
cd giftlink-backend/util/import-mongo
cp .env.sample .env        # set the password in MONGO_URL
npm install && npm start   # prints "Inserted documents: 16"

# 3. Back end on port 3060
cd ../..
cp .env.sample .env        # MONGO_URL and JWT_SECRET
npm install && npm start

# 4. Front end
cd ../giftlink-frontend
cp .env.sample .env        # REACT_APP_BACKEND_URL=http://localhost:3060
npm install && npm start   # development server on port 3000
```

`npm run build` in `giftlink-frontend` also copies the build into `giftwebsite/build`, which `giftwebsite` serves on port 9000 (`/home.html` is the landing page, `/app` the gift list).

## Containers

```bash
cp .env.sample .env          # MONGO_PASSWORD and JWT_SECRET
# build the client first so giftwebsite/build exists
(cd giftlink-frontend && npm install && npm run build)
docker compose up --build -d
```

This starts MongoDB, the API on port 3060 and the website on port 9000. The back end seeds the `gifts` collection on start when it is empty. `deploy/kubernetes/` holds the manifests used for the course's Kubernetes deployment (MongoDB and the back end); the website image was deployed to IBM Code Engine in the course lab.

## CI

`.github/workflows/main.yml` runs on every push and pull request to `main`: JSHint on the server files, then an install and production build of the React client.
