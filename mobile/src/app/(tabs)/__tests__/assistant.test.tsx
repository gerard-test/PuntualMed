import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Assistant from "../assistant";
import { analyzeSymptoms } from "@/lib/ai-api";

jest.mock("@/lib/ai-api", () => ({ analyzeSymptoms: jest.fn().mockResolvedValue({ id: "a1", content: "Posible causa: deshidratación." }) }));
jest.mock("@/lib/symptoms-api", () => ({ listSymptoms: jest.fn().mockResolvedValue([{ id: "s1", description: "Mareo", severity: "leve", medication_id: null, occurred_at: "2026-06-20T10:00:00Z" }]) }));

describe("Assistant", () => {
  it("analyzes all symptoms and shows the response", async () => {
    render(<Assistant />);
    fireEvent.press(screen.getByText("Analizar todos"));
    await waitFor(() => expect(screen.getByText(/deshidratación/)).toBeOnTheScreen());
    expect(analyzeSymptoms).toHaveBeenCalled();
  });
});
