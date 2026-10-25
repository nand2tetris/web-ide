// Registers the worker that vite-plugin-pwa emits at `${BASE_URL}service-worker.js`.
// Production only: the dev server does not build the worker.

export function registerServiceWorker(
  nav: Pick<Navigator, "serviceWorker"> | undefined = navigator,
  base: string = import.meta.env.BASE_URL,
  enabled: boolean = import.meta.env.PROD,
): Promise<ServiceWorkerRegistration | undefined> {
  if (!enabled || !nav || !("serviceWorker" in nav) || !nav.serviceWorker) {
    return Promise.resolve(undefined);
  }
  return nav.serviceWorker
    .register(`${base}service-worker.js`, { scope: base })
    .catch((error: unknown) => {
      console.error("Service worker registration failed", error);
      return undefined;
    });
}
