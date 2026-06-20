const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { listIntakes, confirmIntake } from "../intakes-api";

describe("listIntakes", () => {
  it("builds the date-filtered path", async () => {
    mockApiRequest.mockResolvedValue([]);
    await listIntakes({ from: "2026-06-14", to: "2026-06-28" });
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/intakes?from_date=2026-06-14&to_date=2026-06-28",
      expect.objectContaining({ token: expect.any(Function) }),
    );
  });
});

describe("confirmIntake", () => {
  it("POSTs the confirm endpoint with a body and token", async () => {
    mockApiRequest.mockResolvedValue({ id: "i1", status: "taken" });
    await confirmIntake("i1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/intakes/i1/confirm",
      expect.objectContaining({ method: "POST", body: { photo_url: null }, token: expect.any(Function) }),
    );
  });
});
