import { Trans } from "@lingui/react/macro";
import { Component, PropsWithChildren, ReactElement } from "react";

type ErrorBoundaryProps = PropsWithChildren & {
  fallback: (_: { error?: Error }) => ReactElement;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  override render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback({
        error: this.state.error,
      });
    }

    return this.props.children;
  }
}

export const RenderError = ({ error }: { error?: Error }) =>
  error ? (
    <div>
      <p>
        <b>{error.name ?? "Error"}:</b> {error.message}
      </p>
      {error.stack && (
        <pre>
          <code>{error.stack}</code>
        </pre>
      )}
      {error.cause ? (
        <>
          <div>
            <em>
              <Trans>Caused by</Trans>
            </em>
          </div>
          <RenderError error={error.cause as Error} />
        </>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <p>
      <Trans>Unknown Error</Trans>
    </p>
  );
