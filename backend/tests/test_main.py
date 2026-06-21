from unittest.mock import AsyncMock

import app.main as main


async def test_run_missed_job_runs_service_and_commits(monkeypatch) -> None:
    committed = {"value": False}

    class _FakeSession:
        async def __aenter__(self) -> "_FakeSession":
            return self

        async def __aexit__(self, *args) -> bool:
            return False

        async def commit(self) -> None:
            committed["value"] = True

    monkeypatch.setattr(main, "get_session_factory", lambda: (lambda: _FakeSession()))
    service = AsyncMock(return_value=3)
    monkeypatch.setattr(main, "mark_missed_intakes", service)

    await main.run_missed_job()

    assert committed["value"] is True
    service.assert_awaited_once()
