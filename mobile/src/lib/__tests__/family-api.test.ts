const mockApiRequest = jest.fn();
jest.mock("@/lib/api", () => ({ apiRequest: (...a: unknown[]) => mockApiRequest(...a) }));
jest.mock("@/lib/supabase", () => ({ getAccessToken: jest.fn() }));

import { createFamilyLink, deleteFamilyContact, listFamilyContacts } from "../family-api";

describe("createFamilyLink", () => {
  it("POSTs to /api/v1/family/link with the token provider", async () => {
    mockApiRequest.mockResolvedValue({ deep_link: "https://link", expires_at: "2026-06-21T00:00:00Z" });
    const out = await createFamilyLink();
    expect(out).toEqual({ deep_link: "https://link", expires_at: "2026-06-21T00:00:00Z" });
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/family/link",
      expect.objectContaining({ method: "POST", token: expect.any(Function) }),
    );
  });
});

describe("listFamilyContacts", () => {
  it("GETs /api/v1/family/contacts with the token provider", async () => {
    mockApiRequest.mockResolvedValue([{ id: "c1", display_name: "John", created_at: "2026-06-20T00:00:00Z" }]);
    const out = await listFamilyContacts();
    expect(out).toEqual([{ id: "c1", display_name: "John", created_at: "2026-06-20T00:00:00Z" }]);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/family/contacts",
      expect.objectContaining({ token: expect.any(Function) }),
    );
  });
});

describe("deleteFamilyContact", () => {
  it("DELETEs /api/v1/family/contacts/{id} with the token provider", async () => {
    mockApiRequest.mockResolvedValue(null);
    await deleteFamilyContact("c1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/api/v1/family/contacts/c1",
      expect.objectContaining({ method: "DELETE", token: expect.any(Function) }),
    );
  });
});
