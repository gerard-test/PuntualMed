const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { createSymptom, deleteSymptom, listSymptoms, updateSymptom } from "../symptoms-api";

describe("listSymptoms", () => {
  it("requests /api/v1/symptoms with the token provider", async () => {
    mockApiRequest.mockResolvedValue([{ id: "s1", description: "mareo" }]);
    const out = await listSymptoms();
    expect(out).toEqual([{ id: "s1", description: "mareo" }]);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/symptoms",
      expect.objectContaining({ token: expect.any(Function) }),
    );
  });
});

describe("createSymptom", () => {
  it("POSTs the symptom input with the token provider", async () => {
    mockApiRequest.mockResolvedValue({ id: "s9", description: "mareo" });
    const input = { description: "mareo", severity: "leve", medication_id: null };
    await createSymptom(input);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/symptoms",
      expect.objectContaining({ method: "POST", body: input, token: expect.any(Function) }),
    );
  });
});

describe("updateSymptom", () => {
  it("PATCHes the symptom", async () => {
    mockApiRequest.mockResolvedValue({ id: "s1" });
    await updateSymptom("s1", { description: "x" });
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/symptoms/s1",
      expect.objectContaining({ method: "PATCH", body: { description: "x" }, token: expect.any(Function) }),
    );
  });
});

describe("deleteSymptom", () => {
  it("DELETEs the symptom", async () => {
    mockApiRequest.mockResolvedValue(null);
    await deleteSymptom("s1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/symptoms/s1",
      expect.objectContaining({ method: "DELETE", token: expect.any(Function) }),
    );
  });
});
