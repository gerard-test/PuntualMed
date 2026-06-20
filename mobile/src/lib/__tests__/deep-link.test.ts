jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: jest.fn(),
    },
  },
}));

import { extractAuthCode } from "../deep-link";

describe("extractAuthCode", () => {
  it("extracts the code query param", () => {
    expect(extractAuthCode("puntualmed://auth-callback?code=abc123")).toBe("abc123");
  });
  it("returns null when there is no code", () => {
    expect(extractAuthCode("puntualmed://auth-callback")).toBeNull();
    expect(extractAuthCode("puntualmed://auth-callback?foo=bar")).toBeNull();
  });
});
