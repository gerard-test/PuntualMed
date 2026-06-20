const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { listMedications, getMedication, createMedication, deleteMedication } from "../meds-api";

describe("listMedications", () => {
  it("requests /api/v1/medications with the token provider", async () => {
    mockApiRequest.mockResolvedValue([{ id: "m1", name: "Losartan", dose: "50mg" }]);
    const meds = await listMedications();
    expect(meds).toEqual([{ id: "m1", name: "Losartan", dose: "50mg" }]);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/medications",
      expect.objectContaining({ token: expect.any(Function) }),
    );
  });
});

describe("getMedication", () => {
  it("requests the medication by id with the token provider", async () => {
    mockApiRequest.mockResolvedValue({ id: "m1", name: "Losartan" });
    await getMedication("m1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/medications/m1",
      expect.objectContaining({ token: expect.any(Function) }),
    );
  });
});

describe("createMedication", () => {
  it("POSTs the medication input", async () => {
    mockApiRequest.mockResolvedValue({ id: "m2", name: "Metformina" });
    const input = {
      name: "Metformina",
      dose: "500mg",
      start_date: "2026-06-20",
      duration_days: 30,
      schedules: [{ time_of_day: "08:00" }],
    };
    await createMedication(input);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/medications",
      expect.objectContaining({ method: "POST", body: input, token: expect.any(Function) }),
    );
  });
});

describe("deleteMedication", () => {
  it("DELETEs the medication by id", async () => {
    mockApiRequest.mockResolvedValue(null);
    await deleteMedication("m1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/medications/m1",
      expect.objectContaining({ method: "DELETE", token: expect.any(Function) }),
    );
  });
});
