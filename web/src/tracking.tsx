import { useCallback, useState } from "react";
import "./tracking.scss";

const PATH = "/tracking/canTrack";
const YES = "yes";
const NO = "no";
const UNKNOWN = "";
const ASKED = [YES, NO];

export function startTracking() {
  return undefined;
}

export function stopTracking() {
  return undefined;
}

export function useTracking() {
  const stored = localStorage[PATH] ?? UNKNOWN;

  const [canTrack, setCanTrack] = useState<boolean>(stored === YES);
  const [haveAsked, setHaveAsked] = useState<boolean>(ASKED.includes(stored));

  const accept = useCallback(() => {
    localStorage[PATH] = YES;
    setCanTrack(true);
    setHaveAsked(true);
    startTracking();
  }, [setCanTrack, setHaveAsked]);

  const reject = useCallback(() => {
    localStorage[PATH] = NO;
    setCanTrack(false);
    setHaveAsked(true);
    stopTracking();
  }, [setCanTrack, setHaveAsked]);

  return { canTrack, haveAsked, accept, reject };
}

export function TrackingBanner() {
  const { accept, reject, haveAsked } = useTracking();

  const [show, setShow] = useState<boolean>(!haveAsked);

  const close = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const doAccept = useCallback(() => {
    accept();
    close();
  }, [accept, close]);

  const doReject = useCallback(() => {
    reject();
    close();
  }, [reject, close]);

  return (
    <>
      {show && (
        <div className="trackingBanner flex row">
          <div className="flex-1">
            <TrackingDisclosure />
          </div>
          <div>
            <a
              href="#reject"
              role="button"
              className="reject"
              onClick={doReject}
            >
              Reject
            </a>
            <a
              href="#accept"
              role="button"
              className="accept"
              onClick={doAccept}
            >
              Accept
            </a>
            <a href="#close" role="button" className="close" onClick={close}>
              𝖷
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export function TrackingDisclosure() {
  return (
    <p style={{ margin: 0 }}>
      This site uses Google Analytics to gather information that will improve
      the user experience. This only includes anonymous interaction data, and
      never shares your code.{" "}
      <a href="www.google.com/policies/privacy/partners/">
        How Google uses data.
      </a>
    </p>
  );
}
