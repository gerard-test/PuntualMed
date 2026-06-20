async def test_cors_header_present_for_browser_origin(client):
    # Un fetch del navegador (con Origin) debe recibir el header CORS,
    # incluso en respuestas de error como el 401 sin token.
    response = await client.get(
        "/api/v1/users/me",
        headers={"Origin": "http://192.168.0.104:8082"},
    )
    assert response.headers.get("access-control-allow-origin") == "*"


async def test_cors_preflight_allows_authorization_header(client):
    # El preflight OPTIONS debe permitir el header Authorization (Bearer token).
    response = await client.options(
        "/api/v1/users/me",
        headers={
            "Origin": "http://192.168.0.104:8082",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert response.status_code == 200
    assert "authorization" in response.headers.get(
        "access-control-allow-headers", ""
    ).lower()
