import { render, screen, waitFor } from "@testing-library/react-native";
import Symptoms from "../symptoms";

jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }), useFocusEffect: jest.fn() }));
jest.mock("@/lib/symptoms-api", () => ({
  listSymptoms: jest.fn().mockResolvedValue([
    { id: "s1", medication_id: "m1", description: "Nauseas", severity: "moderado", occurred_at: "2026-06-20T10:00:00Z" },
  ]),
}));
jest.mock("@/lib/meds-api", () => ({
  listMedications: jest.fn().mockResolvedValue([{ id: "m1", name: "Metformina", dose: "500mg" }]),
}));

describe("Symptoms list", () => {
  it("renders the user's symptoms once loaded", async () => {
    render(<Symptoms />);
    await waitFor(() => expect(screen.getByText(/Nauseas/)).toBeOnTheScreen());
    expect(screen.getByText(/moderado/)).toBeOnTheScreen();
  });
});
