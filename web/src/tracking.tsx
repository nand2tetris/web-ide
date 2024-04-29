import ReactGA from "react-ga4";

import { assertExists } from "@davidsouther/jiffies/lib/esm/assert";
import { useCallback, useState } from "react";
import "./tracking.scss";

const PATH = "/tracking/canTrack";
const YES = "yes";
const NO = "no";
const UNKNOWN = "";
const ASKED = [YES, NO];

let stop = false;

export const GA4_ID = process.env.GA4_ID ?? "G-0VTR5BJFQP";

export function startTracking() {
  ReactGA.initialize(GA4_ID);
  ReactGA.send("pageview");
}

export function stopTracking() {
  stop = true;
}

function trackPage(page: string) {
  ReactGA.send({ hitType: "pageview", page });
}

export type Category = string;
export type Action = string;
export interface Label {
  label: string;
  value?: number;
}

export interface TrackingEvent {
  category: Category;
  action: Action;
  label?: Label;
  interaction?: boolean;
}

function trackEvent(
  category: Category,
  action: Action,
  label?: string,
  value?: number
): void;
function trackEvent(event: TrackingEvent): void;
function trackEvent(
  ev: Category | TrackingEvent,
  action?: Action,
  label?: string,
  value?: number
) {
  if (stop) return;

  const event: TrackingEvent =
    typeof ev === "string"
      ? {
          category: ev as Category,
          action: assertExists(action),
          label:
            label && value
              ? {
                  label,
                  value,
                }
              : undefined,
        }
      : ev;

  ReactGA.event({
    category: event.category,
    action: event.action,
    nonInteraction: !event.interaction,
    label: event.label?.label,
    value: event.label?.value,
  });
}

export function useTracking() {
  const stored = localStorage[PATH] ?? UNKNOWN;

  const [canTrack, setCanTrack] = useState<boolean>(stored === YES);
  const [haveAsked, setHaveAsked] = useState<boolean>(
    ASKED.includes(stored) ||
      // Technically deprecated
      navigator.doNotTrack === "1"
  );

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

  return { canTrack, haveAsked, accept, reject, trackEvent, trackPage };
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
        <div id="trackingBanner" className="flex row">
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
            <a
              href="#close"
              role="button"
              className="close secondary"
              onClick={close}
            >
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
