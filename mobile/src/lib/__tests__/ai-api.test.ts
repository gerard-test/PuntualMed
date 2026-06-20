const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { analyzeSymptoms } from "../ai-api";

describe("analyzeSymptoms", () => {
  it("POSTs the analyze endpoint with the token provider and no body", async () => {
    mockApiRequest.mockResolvedValue({ id: "a1", content: "Analisis..." });
    const out = await analyzeSymptoms();
    expect(out).toEqual({ id: "a1", content: "Analisis..." });
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/ai/symptoms/analyze",
      expect.objectContaining({ method: "POST", token: expect.any(Function) }),
    );
  });
});
