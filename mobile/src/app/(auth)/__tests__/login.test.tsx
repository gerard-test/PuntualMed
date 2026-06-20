import { render, screen } from "@testing-library/react-native";
import Login from "../login";

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/lib/auth-actions", () => ({ signIn: jest.fn().mockResolvedValue({ error: null }) }));

describe("Login screen", () => {
  it("renders the brand name and the sign-in action", () => {
    render(<Login />);
    expect(screen.getByText("PuntualMed")).toBeOnTheScreen();
    expect(screen.getByText("Iniciar sesion")).toBeOnTheScreen();
  });

  it("renders email and password fields", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Correo electronico")).toBeOnTheScreen();
    expect(screen.getByPlaceholderText("Contrasena")).toBeOnTheScreen();
  });
});
