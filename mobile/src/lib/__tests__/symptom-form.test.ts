import { SEVERITIES, toSymptomInput, validateSymptomForm } from "../symptom-form";

const valid = { description: "Dolor de cabeza", severity: "moderado", medicationId: "m1" };

describe("SEVERITIES", () => {
  it("is the backend's three levels", () => {
    expect(SEVERITIES).toEqual(["leve", "moderado", "severo"]);
  });
});

describe("validateSymptomForm", () => {
  it("returns null for a valid form", () => {
    expect(validateSymptomForm(valid)).toBeNull();
  });
  it("rejects an empty description", () => {
    expect(validateSymptomForm({ ...valid, description: "  " })).toMatch(/descripcion/i);
  });
});

describe("toSymptomInput", () => {
  it("maps the form to the backend input", () => {
    expect(toSymptomInput(valid)).toEqual({
      description: "Dolor de cabeza",
      severity: "moderado",
      medication_id: "m1",
    });
  });
  it("maps an empty medicationId to null", () => {
    expect(toSymptomInput({ ...valid, medicationId: "" }).medication_id).toBeNull();
  });
});
