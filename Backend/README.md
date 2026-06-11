# FitAI Backend

Production-style FastAPI + MongoDB API for the [FitAI](../Fitness/) mobile app.

## Stack

- **FastAPI** — async REST API
- **MongoDB** — document storage via Motor + Beanie ODM
- **JWT** — bearer token authentication
- **Pydantic v2** — request/response validation with camelCase JSON for the React Native client

## Quick start

### 1. Start MongoDB

```bash
docker compose up mongodb -d
```

### 2. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Run the API (Uvicorn + Pydantic settings)

```bash
# Recommended — reads HOST/PORT/DEBUG from .env
python run.py

# Or directly with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API base: `http://localhost:8000/v1`
- Swagger docs: `http://localhost:8000/docs`
- Demo user: `demo@fitai.app` / `demo1234`

### Run with Docker (API + MongoDB)

```bash
docker compose up --build
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/health` | No | Health check |
| POST | `/v1/auth/register` | No | Create account |
| POST | `/v1/auth/login` | No | Login, returns JWT + profile |
| GET | `/v1/auth/me` | Yes | Current user profile |
| GET/PUT | `/v1/users/profile` | Yes | Profile CRUD |
| GET | `/v1/workouts/plans` | Yes | User workout plans |
| POST | `/v1/workouts/plans/generate` | Yes | Regenerate plans from profile |
| PATCH | `/v1/workouts/plans/{id}` | Yes | Update plan completion |
| GET/POST | `/v1/workouts/logs` | Yes | Workout history |
| GET | `/v1/exercises` | No | Exercise database |
| GET | `/v1/nutrition/foods` | No | Food database |
| GET/POST | `/v1/nutrition/logs` | Yes | Food diary |
| DELETE | `/v1/nutrition/logs/{id}` | Yes | Remove food entry |
| GET/POST | `/v1/progress/metrics` | Yes | Body metrics |
| GET/PATCH | `/v1/social/challenges` | Yes | Challenges + progress |

## Connect the mobile app

In `Fitness/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/v1
EXPO_PUBLIC_ENABLE_MOCK_API=false
```

Use your machine IP instead of `localhost` when testing on a physical device.

## Tests

```bash
docker compose up mongodb -d
pytest -v
```

## Project structure

```
app/
├── api/v1/endpoints/   # Route handlers
├── core/               # Config, DB, security, deps
├── models/             # Beanie documents
├── schemas/            # Pydantic DTOs (camelCase aliases)
├── services/           # Business logic & generators
├── seed/               # Reference data & demo user
└── main.py             # Application entry
```
