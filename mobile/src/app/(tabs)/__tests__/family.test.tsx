import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Family from "../family";

jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn() }), useFocusEffect: jest.fn() }));
jest.mock("react-native-qrcode-svg", () => "QRCode");
jest.mock("@/lib/family-api", () => ({
  createFamilyLink: jest.fn().mockResolvedValue({ deep_link: "https://t.me/Bot?start=abc", expires_at: "2026-06-20T13:00:00Z" }),
  listFamilyContacts: jest.fn().mockResolvedValue([]),
  deleteFamilyContact: jest.fn(),
}));

describe("Family", () => {
  it("shows the deep link after generating one", async () => {
    render(<Family />);
    fireEvent.press(screen.getByText("Vincular familiar"));
    await waitFor(() => expect(screen.getByText(/t\.me\/Bot\?start=abc/)).toBeOnTheScreen());
  });
});
