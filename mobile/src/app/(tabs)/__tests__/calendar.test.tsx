import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Calendar from "../calendar";

jest.mock("@/lib/intakes-api", () => ({
  listIntakes: jest.fn().mockResolvedValue([
    { id: "i1", medication_id: "m1", scheduled_at: "2026-06-15T13:00:00Z", status: "taken" },
  ]),
}));
jest.mock("@/lib/meds-api", () => ({
  listMedications: jest.fn().mockResolvedValue([{ id: "m1", name: "Losartan", dose: "50mg", schedules: [] }]),
}));
jest.mock("@/lib/symptoms-api", () => ({ listSymptoms: jest.fn().mockResolvedValue([]) }));

describe("Calendar", () => {
  it("renders the month grid once data loads", async () => {
    render(<Calendar />);
    // El titulo del mes y el numero de dia 15 deben aparecer.
    await waitFor(() => expect(screen.getByText("15")).toBeOnTheScreen());
  });
});
