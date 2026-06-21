import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import SymptomDetail from "../symptom-detail";
import { deleteSymptom } from "@/lib/symptoms-api";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: () => mockBack() }), useLocalSearchParams: () => ({ id: "s1" }) }));
jest.mock("@/lib/symptoms-api", () => ({
  listSymptoms: jest.fn().mockResolvedValue([{ id: "s1", medication_id: null, description: "Nauseas", severity: "leve", occurred_at: "2026-06-20T10:00:00Z" }]),
  updateSymptom: jest.fn().mockResolvedValue({ id: "s1" }),
  deleteSymptom: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/meds-api", () => ({ listMedications: jest.fn().mockResolvedValue([]) }));

describe("SymptomDetail", () => {
  it("prefills and can delete", async () => {
    render(<SymptomDetail />);
    await waitFor(() => expect(screen.getByDisplayValue("Nauseas")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("Eliminar"));
    fireEvent.press(screen.getByText("Confirmar"));
    await waitFor(() => expect(deleteSymptom).toHaveBeenCalledWith("s1"));
  });
});
