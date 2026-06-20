import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import RegisterSymptom from "../register-symptom";
import { createSymptom } from "@/lib/symptoms-api";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: () => mockBack() }) }));
jest.mock("@/lib/meds-api", () => ({ listMedications: jest.fn().mockResolvedValue([]) }));
jest.mock("@/lib/symptoms-api", () => ({ createSymptom: jest.fn().mockResolvedValue({ id: "s1" }) }));

describe("RegisterSymptom", () => {
  it("does not submit and shows an error when description is empty", async () => {
    render(<RegisterSymptom />);
    await waitFor(() => expect(screen.getByText("Guardar")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("Guardar"));
    expect(createSymptom).not.toHaveBeenCalled();
    expect(screen.getByText(/obligatoria/i)).toBeOnTheScreen();
  });
});
