/**
 * Tooltip positioning utility with automatic collision detection
 * 
 * Automatically adjusts tooltip placement to prevent clipping by viewport
 * or parent containers. Monitors all elements with [data-tooltip] attribute
 * and dynamically sets optimal placement on hover.
 */

type TooltipPlacement = "top" | "bottom" | "left" | "right";

const PLACEMENT_PRIORITY: TooltipPlacement[] = ["bottom", "top", "right", "left"];
const TOOLTIP_SPACING = 8; // pixels of spacing from element
const VIEWPORT_MARGIN = 10; // minimum pixels from viewport edge

interface TooltipBounds {
  width: number;
  height: number;
}

/**
 * Estimates tooltip dimensions based on text content
 */
function estimateTooltipSize(text: string): TooltipBounds {
  // Create temporary invisible element to measure
  const temp = document.createElement("div");
  temp.style.cssText = `
    position: absolute;
    visibility: hidden;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    max-width: 300px;
    white-space: normal;
    word-wrap: break-word;
  `;
  temp.textContent = text;
  document.body.appendChild(temp);

  const bounds = {
    width: temp.offsetWidth,
    height: temp.offsetHeight,
  };

  document.body.removeChild(temp);
  return bounds;
}

/**
 * Checks if a tooltip would be clipped with given placement
 */
function wouldBeClipped(
  element: HTMLElement,
  placement: TooltipPlacement,
  tooltipSize: TooltipBounds
): boolean {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let tooltipRect: DOMRect;

  switch (placement) {
    case "top":
      tooltipRect = new DOMRect(
        rect.left + rect.width / 2 - tooltipSize.width / 2,
        rect.top - tooltipSize.height - TOOLTIP_SPACING,
        tooltipSize.width,
        tooltipSize.height
      );
      break;

    case "bottom":
      tooltipRect = new DOMRect(
        rect.left + rect.width / 2 - tooltipSize.width / 2,
        rect.bottom + TOOLTIP_SPACING,
        tooltipSize.width,
        tooltipSize.height
      );
      break;

    case "left":
      tooltipRect = new DOMRect(
        rect.left - tooltipSize.width - TOOLTIP_SPACING,
        rect.top + rect.height / 2 - tooltipSize.height / 2,
        tooltipSize.width,
        tooltipSize.height
      );
      break;

    case "right":
      tooltipRect = new DOMRect(
        rect.right + TOOLTIP_SPACING,
        rect.top + rect.height / 2 - tooltipSize.height / 2,
        tooltipSize.width,
        tooltipSize.height
      );
      break;
  }

  // Check viewport boundaries
  const clippedLeft = tooltipRect.left < VIEWPORT_MARGIN;
  const clippedRight = tooltipRect.right > viewportWidth - VIEWPORT_MARGIN;
  const clippedTop = tooltipRect.top < VIEWPORT_MARGIN;
  const clippedBottom = tooltipRect.bottom > viewportHeight - VIEWPORT_MARGIN;

  return clippedLeft || clippedRight || clippedTop || clippedBottom;
}

/**
 * Determines the optimal placement for a tooltip
 */
function getOptimalPlacement(element: HTMLElement, tooltipText: string): TooltipPlacement {
  const tooltipSize = estimateTooltipSize(tooltipText);

  // Check if element has a fixed placement preference
  const fixed = element.getAttribute("data-tooltip-fixed");
  if (fixed === "true") {
    const currentPlacement = element.getAttribute("data-placement") as TooltipPlacement;
    return currentPlacement || "bottom";
  }

  // Try placements in priority order
  for (const placement of PLACEMENT_PRIORITY) {
    if (!wouldBeClipped(element, placement, tooltipSize)) {
      return placement;
    }
  }

  // Fallback to bottom if all would be clipped (choose least bad option)
  return "bottom";
}

/**
 * Updates tooltip placement for an element
 */
function updateTooltipPlacement(element: HTMLElement): void {
  const tooltipText = element.getAttribute("data-tooltip");
  if (!tooltipText) return;

  const optimalPlacement = getOptimalPlacement(element, tooltipText);
  element.setAttribute("data-placement", optimalPlacement);
}

/**
 * Handles mouse enter event on tooltip elements
 */
function handleTooltipHover(event: MouseEvent): void {
  const element = event.currentTarget as HTMLElement;
  const tooltipText = element.getAttribute("data-tooltip");
  if (!tooltipText) return;

  // Calculate optimal placement
  const optimalPlacement = getOptimalPlacement(element, tooltipText);
  element.setAttribute("data-placement", optimalPlacement);

  // Calculate fixed position coordinates to escape parent overflow
  const rect = element.getBoundingClientRect();
  const tooltipSize = estimateTooltipSize(tooltipText);

  let tooltipX = 0;
  let tooltipY = 0;

  switch (optimalPlacement) {
    case "top":
      tooltipX = rect.left + rect.width / 2;
      tooltipY = rect.top;
      break;
    case "bottom":
      tooltipX = rect.left + rect.width / 2;
      tooltipY = rect.bottom;
      break;
    case "left":
      tooltipX = rect.left;
      tooltipY = rect.top + rect.height / 2;
      break;
    case "right":
      tooltipX = rect.right;
      tooltipY = rect.top + rect.height / 2;
      break;
  }

  // Set CSS custom properties for fixed positioning
  element.style.setProperty("--tooltip-x", `${tooltipX}px`);
  element.style.setProperty("--tooltip-y", `${tooltipY}px`);
}

/**
 * Initializes tooltip system for all elements with data-tooltip
 */
function initializeTooltips(): void {
  const tooltipElements = document.querySelectorAll<HTMLElement>("[data-tooltip]");

  tooltipElements.forEach((element) => {
    // Set default placement if not specified
    if (!element.getAttribute("data-placement")) {
      element.setAttribute("data-placement", "bottom");
    }

    // Add hover listener to dynamically adjust placement
    element.addEventListener("mouseenter", handleTooltipHover);
  });
}

/**
 * Observes DOM for dynamically added tooltip elements
 */
function observeTooltipElements(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Check if the added element has data-tooltip
          if (element.hasAttribute("data-tooltip")) {
            if (!element.getAttribute("data-placement")) {
              element.setAttribute("data-placement", "bottom");
            }
            element.addEventListener("mouseenter", handleTooltipHover);
          }

          // Check descendants
          const tooltipChildren = element.querySelectorAll<HTMLElement>("[data-tooltip]");
          tooltipChildren.forEach((child) => {
            if (!child.getAttribute("data-placement")) {
              child.setAttribute("data-placement", "bottom");
            }
            child.addEventListener("mouseenter", handleTooltipHover);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Main initialization function
 * Call this once when the app loads
 */
export function initTooltips(): void {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeTooltips();
      observeTooltipElements();
    });
  } else {
    initializeTooltips();
    observeTooltipElements();
  }
}
