import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Assistant from "../assistant";
import { analyzeSymptoms } from "@/lib/ai-api";

jest.mock("@/lib/ai-api", () => ({
  analyzeSymptoms: jest.fn().mockResolvedValue({ id: "a1", content: "Posible causa: deshidratacion." }),
}));

describe("Assistant", () => {
  it("analyzes and shows the AI response", async () => {
    render(<Assistant />);
    fireEvent.press(screen.getByText("Analizar mis sintomas"));
    await waitFor(() =>
      expect(screen.getByText(/deshidratacion/)).toBeOnTheScreen(),
    );
    expect(analyzeSymptoms).toHaveBeenCalled();
  });
});
