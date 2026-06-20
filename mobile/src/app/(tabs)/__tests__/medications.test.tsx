import { render, screen, waitFor } from "@testing-library/react-native";
import Medications from "../medications";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));
jest.mock("@/lib/meds-api", () => ({
  listMedications: jest.fn().mockResolvedValue([
    { id: "m1", name: "Losartan", dose: "50mg", schedules: [{ id: "s1", time_of_day: "09:00:00" }] },
  ]),
}));

describe("Medications list", () => {
  it("renders the user's medications once loaded", async () => {
    render(<Medications />);
    await waitFor(() => expect(screen.getByText(/Losartan/)).toBeOnTheScreen());
    expect(screen.getByText(/50mg/)).toBeOnTheScreen();
  });
});
