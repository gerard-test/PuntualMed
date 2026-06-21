const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { analyzeSymptoms } from "../ai-api";

describe("analyzeSymptoms", () => {
  it("POSTs with no symptom_id (analyze all)", async () => {
    mockApiRequest.mockResolvedValue({ id: "a1", content: "..." });
    await analyzeSymptoms();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/ai/symptoms/analyze",
      expect.objectContaining({ method: "POST", body: { symptom_id: null }, token: expect.any(Function) }),
    );
  });

  it("POSTs the chosen symptom_id", async () => {
    mockApiRequest.mockResolvedValue({ id: "a2", content: "..." });
    await analyzeSymptoms("s1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/ai/symptoms/analyze",
      expect.objectContaining({ body: { symptom_id: "s1" } }),
    );
  });
});
