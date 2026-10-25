import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

function fakeNavigator(register: ReturnType<typeof vi.fn>) {
  return { serviceWorker: { register } } as unknown as Navigator;
}

describe("registerServiceWorker", () => {
  it("registers the worker under the base path in production", async () => {
    const registration = {} as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);

    const result = await registerServiceWorker(
      fakeNavigator(register),
      "/web-ide/",
      true,
    );

    expect(register).toHaveBeenCalledWith("/web-ide/service-worker.js", {
      scope: "/web-ide/",
    });
    expect(result).toBe(registration);
  });

  it("does nothing outside production", async () => {
    const register = vi.fn();

    const result = await registerServiceWorker(
      fakeNavigator(register),
      "/web-ide/",
      false,
    );

    expect(register).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("does nothing when service workers are unsupported", async () => {
    const result = await registerServiceWorker(
      {} as Navigator,
      "/web-ide/",
      true,
    );

    expect(result).toBeUndefined();
  });

  it("logs and resolves when registration fails", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const register = vi.fn().mockRejectedValue(new Error("404"));

    const result = await registerServiceWorker(
      fakeNavigator(register),
      "/web-ide/",
      true,
    );

    expect(result).toBeUndefined();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
