// Silencia modulos nativos que no estan disponibles en el entorno Jest.
jest.mock("react-native-url-polyfill/auto", () => ({}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  }),
}));

import { nextRoute } from "../auth";

describe("nextRoute", () => {
  it("returns null while loading", () => {
    expect(nextRoute({ hasSession: false, loading: true, recovery: false, inAuth: false, inApp: false })).toBeNull();
  });

  it("sends a logged-out user outside the auth group to /login", () => {
    expect(nextRoute({ hasSession: false, loading: false, recovery: false, inAuth: false, inApp: true })).toBe("/login");
  });

  it("leaves a logged-out user already in the auth group alone", () => {
    expect(nextRoute({ hasSession: false, loading: false, recovery: false, inAuth: true, inApp: false })).toBeNull();
  });

  it("sends a logged-in user outside the app group to /home", () => {
    expect(nextRoute({ hasSession: true, loading: false, recovery: false, inAuth: true, inApp: false })).toBe("/home");
  });

  it("leaves a logged-in user already in the app group alone", () => {
    expect(nextRoute({ hasSession: true, loading: false, recovery: false, inAuth: false, inApp: true })).toBeNull();
  });

  it("routes to /update-password when recovery is true regardless of current group", () => {
    expect(nextRoute({ hasSession: true, loading: false, recovery: true, inAuth: false, inApp: true })).toBe("/update-password");
  });

  it("ignores recovery flag while loading", () => {
    expect(nextRoute({ hasSession: true, loading: true, recovery: true, inAuth: false, inApp: false })).toBeNull();
  });
});
