const mockSignInWithPassword = jest.fn();
jest.mock("@/lib/supabase", () => ({
  supabase: { auth: { signInWithPassword: (...a: unknown[]) => mockSignInWithPassword(...a) } },
}));

import { signIn } from "../auth-actions";

describe("signIn", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns no error on success", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    await expect(signIn("a@b.com", "pw")).resolves.toEqual({ error: null });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: "a@b.com", password: "pw" });
  });

  it("returns the error message on failure", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: { message: "Invalid login credentials" } });
    await expect(signIn("a@b.com", "bad")).resolves.toEqual({ error: "Invalid login credentials" });
  });
});
