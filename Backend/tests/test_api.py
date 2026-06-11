import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient) -> None:
    response = await client.get("/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


@pytest.mark.asyncio
async def test_login_demo_user(client: AsyncClient) -> None:
    response = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "demo1234"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "token" in payload
    assert payload["user"]["email"] == "demo@fitai.app"
    assert "calorieTarget" in payload["user"]
    assert payload["user"]["onboardingComplete"] is True


@pytest.mark.asyncio
async def test_register_and_fetch_workouts(client: AsyncClient) -> None:
    register = await client.post(
        "/v1/auth/register",
        json={"email": "testuser@fitai.app", "password": "secret12", "name": "Test User"},
    )
    assert register.status_code == 200
    register_payload = register.json()
    assert register_payload["user"]["onboardingComplete"] is False
    token = register_payload["token"]

    headers = {"Authorization": f"Bearer {token}"}
    plans = await client.get("/v1/workouts/plans", headers=headers)
    logs = await client.get("/v1/workouts/logs", headers=headers)
    foods = await client.get("/v1/nutrition/foods")
    food_logs = await client.get("/v1/nutrition/logs", headers=headers)
    metrics = await client.get("/v1/progress/metrics", headers=headers)
    challenges = await client.get("/v1/social/challenges", headers=headers)
    exercises = await client.get("/v1/exercises")

    assert plans.status_code == 200 and len(plans.json()) >= 3
    assert logs.status_code == 200 and len(logs.json()) > 0
    assert foods.status_code == 200 and len(foods.json()) == 20
    assert food_logs.status_code == 200 and len(food_logs.json()) > 0
    assert metrics.status_code == 200 and len(metrics.json()) > 0
    assert challenges.status_code == 200 and len(challenges.json()) == 4
    assert exercises.status_code == 200 and len(exercises.json()) == 24


@pytest.mark.asyncio
async def test_login_rejects_invalid_payload(client: AsyncClient) -> None:
    response = await client.post(
        "/v1/auth/login",
        json={"email": "not-an-email", "password": "123"},
    )
    assert response.status_code == 422
    payload = response.json()
    assert "message" in payload
    assert "valid email" in payload["message"].lower()
    assert "6 characters" in payload["message"].lower()


@pytest.mark.asyncio
async def test_login_rejects_invalid_credentials(client: AsyncClient) -> None:
    response = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "wrong-password"},
    )
    assert response.status_code == 401
    assert response.json()["message"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    response = await client.post(
        "/v1/auth/register",
        json={"email": "demo@fitai.app", "password": "secret12", "name": "Duplicate User"},
    )
    assert response.status_code == 400
    assert response.json()["message"] == "Email already registered"


@pytest.mark.asyncio
async def test_auth_me_requires_valid_jwt(client: AsyncClient) -> None:
    unauthenticated = await client.get("/v1/auth/me")
    assert unauthenticated.status_code == 401

    invalid = await client.get(
        "/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert invalid.status_code == 401

    login = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "demo1234"},
    )
    token = login.json()["token"]
    me = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "demo@fitai.app"
    assert me.json()["onboardingComplete"] is True


@pytest.mark.asyncio
async def test_forgot_and_reset_password(client: AsyncClient) -> None:
    forgot = await client.post(
        "/v1/auth/forgot-password",
        json={"email": "demo@fitai.app"},
    )
    assert forgot.status_code == 200
    payload = forgot.json()
    assert "message" in payload
    assert payload.get("resetCode")

    new_password = "newpass99"
    reset = await client.post(
        "/v1/auth/reset-password",
        json={
            "email": "demo@fitai.app",
            "code": payload["resetCode"],
            "newPassword": new_password,
        },
    )
    assert reset.status_code == 200
    assert "updated" in reset.json()["message"].lower()

    old_login = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "demo1234"},
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": new_password},
    )
    assert new_login.status_code == 200

    # Restore demo password for other tests / seed expectations
    restore = await client.post(
        "/v1/auth/forgot-password",
        json={"email": "demo@fitai.app"},
    )
    await client.post(
        "/v1/auth/reset-password",
        json={
            "email": "demo@fitai.app",
            "code": restore.json()["resetCode"],
            "newPassword": "demo1234",
        },
    )


@pytest.mark.asyncio
async def test_forgot_password_unknown_email(client: AsyncClient) -> None:
    response = await client.post(
        "/v1/auth/forgot-password",
        json={"email": "unknown@fitai.app"},
    )
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json().get("resetCode") is None


@pytest.mark.asyncio
async def test_create_food_log_with_fractional_macros(client: AsyncClient) -> None:
    login = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "demo1234"},
    )
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/v1/nutrition/logs",
        headers=headers,
        json={
            "name": "Chicken Breast",
            "calories": 165,
            "protein": 31,
            "carbs": 0,
            "fats": 3.6,
            "meal": "Lunch",
            "portion": 1,
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "Chicken Breast"
    assert payload["fats"] == 3.6


@pytest.mark.asyncio
async def test_create_workout_log(client: AsyncClient) -> None:
    login = await client.post(
        "/v1/auth/login",
        json={"email": "demo@fitai.app", "password": "demo1234"},
    )
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/v1/workouts/logs",
        headers=headers,
        json={
            "workoutName": "Push Day",
            "duration": 55,
            "volume": 4200,
            "calories": 320,
            "exercises": [
                {
                    "name": "Bench Press",
                    "sets": [{"reps": 8, "weight": 80}],
                }
            ],
            "prs": [],
        },
    )
    assert response.status_code == 201
    assert response.json()["workoutName"] == "Push Day"
