import {
  HdlLanguage,
  HdlSignatures,
  registerCustomChip,
  resetCustomChips,
} from "./hdl";

describe("HDL Custom Chip Registration", () => {
  beforeEach(() => {
    resetCustomChips();
  });

  it("should register a custom chip and store its signature", () => {
    const name = "SuperGate";
    const signature = "SuperGate(in= , out= );";

    const wasAdded = registerCustomChip(name, signature);

    expect(wasAdded).toBe(true);

    expect(HdlLanguage.chips as string[]).toContain(name);

    expect(HdlSignatures[name]).toBe(signature);
  });

  it("should not allow overwriting a built-in chip", () => {
    const originalAndSignature = HdlSignatures["And"];
    const fakeSignature = "And(wrong= );";

    const wasAdded = registerCustomChip("And", fakeSignature);

    expect(wasAdded).toBe(false);
    // Ensure the signature remained the original one
    expect(HdlSignatures["And"]).toBe(originalAndSignature);
  });

  it("should return false if the chip and signature are already registered", () => {
    const name = "MyMux";
    const sig = "MyMux(a=, b=, out=);";

    registerCustomChip(name, sig);
    const secondAttempt = registerCustomChip(name, sig);

    expect(secondAttempt).toBe(false);
  });

  it("should update the signature if the name exists but the signature changed", () => {
    const name = "FlexibleGate";
    const sig1 = "FlexibleGate(a= );";
    const sig2 = "FlexibleGate(a= , b= );";

    registerCustomChip(name, sig1);
    const wasUpdated = registerCustomChip(name, sig2);

    expect(wasUpdated).toBe(true);
    expect(HdlSignatures[name]).toBe(sig2);
  });

  it("should fully remove custom chips and restore defaults on reset", () => {
    const customName = "TemporaryChip";
    registerCustomChip(customName, "TemporaryChip(x= );");

    expect(HdlSignatures).toHaveProperty(customName);

    const wasReset = resetCustomChips();
    expect(wasReset).toBe(true);

    // Verify custom chip is gone from both places
    expect(HdlLanguage.chips as string[]).not.toContain(customName);
    expect(HdlSignatures).not.toHaveProperty(customName);

    // Verify built-ins still exist
    expect(HdlSignatures).toHaveProperty("Nand");
    expect(HdlLanguage.chips as string[]).toContain("Nand");
  });
});
