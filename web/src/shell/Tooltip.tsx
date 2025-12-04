import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

const PLACEMENT_PRIORITY: TooltipPlacement[] = ["bottom", "top", "right", "left"];
const TOOLTIP_SPACING = 8;
const VIEWPORT_MARGIN = 10;

interface TooltipBounds {
    width: number;
    height: number;
}

interface TooltipState {
    text: string;
    placement: TooltipPlacement;
    x: number;
    y: number;
    visible: boolean;
}

/**
 * Estimates tooltip dimensions based on text content
 */
function estimateTooltipSize(text: string): TooltipBounds {
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

    return "bottom";
}

/**
 * Calculate tooltip position based on placement
 */
function calculateTooltipPosition(
    element: HTMLElement,
    placement: TooltipPlacement
): { x: number; y: number } {
    const rect = element.getBoundingClientRect();

    switch (placement) {
        case "top":
            return {
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        case "bottom":
            return {
                x: rect.left + rect.width / 2,
                y: rect.bottom,
            };
        case "left":
            return {
                x: rect.left,
                y: rect.top + rect.height / 2,
            };
        case "right":
            return {
                x: rect.right,
                y: rect.top + rect.height / 2,
            };
    }
}

export function Tooltip() {
    const [tooltip, setTooltip] = useState<TooltipState>({
        text: "",
        placement: "bottom",
        x: 0,
        y: 0,
        visible: false,
    });

    const tooltipElementsRef = useRef<Set<HTMLElement>>(new Set());

    useEffect(() => {
        const handleMouseEnter = (event: Event) => {
            const element = event.currentTarget as HTMLElement;
            const tooltipText = element.getAttribute("data-tooltip");
            if (!tooltipText) return;

            const optimalPlacement = getOptimalPlacement(element, tooltipText);
            const { x, y } = calculateTooltipPosition(element, optimalPlacement);

            setTooltip({
                text: tooltipText,
                placement: optimalPlacement,
                x,
                y,
                visible: true,
            });
        };

        const handleMouseLeave = () => {
            setTooltip((prev) => ({ ...prev, visible: false }));
        };

        const observeTooltips = () => {
            // Find all elements with data-tooltip
            const elements = document.querySelectorAll<HTMLElement>("[data-tooltip]");

            elements.forEach((element) => {
                if (!tooltipElementsRef.current.has(element)) {
                    element.addEventListener("mouseenter", handleMouseEnter);
                    element.addEventListener("mouseleave", handleMouseLeave);
                    tooltipElementsRef.current.add(element);
                }
            });
        };

        // Initial observation
        observeTooltips();

        // Watch for dynamically added tooltip elements
        const observer = new MutationObserver(() => {
            observeTooltips();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            tooltipElementsRef.current.forEach((element) => {
                element.removeEventListener("mouseenter", handleMouseEnter);
                element.removeEventListener("mouseleave", handleMouseLeave);
            });
            tooltipElementsRef.current.clear();
        };
    }, []);

    if (!tooltip.visible) return null;

    // Calculate transform based on placement
    const getTransform = () => {
        switch (tooltip.placement) {
            case "top":
                return "translate(-50%, calc(-100% - 0.25rem))";
            case "bottom":
                return "translate(-50%, 0.25rem)";
            case "left":
                return "translate(calc(-100% - 0.25rem), -50%)";
            case "right":
                return "translate(0.25rem, -50%)";
        }
    };

    // Calculate caret transform based on placement
    const getCaretTransform = () => {
        switch (tooltip.placement) {
            case "top":
                return "translate(-50%, -0.3rem)";
            case "bottom":
                return "translate(-50%, -0.3rem)";
            case "left":
                return "translate(0.3rem, -50%)";
            case "right":
                return "translate(-0.3rem, -50%)";
        }
    };

    // Border styles for caret
    const getCaretBorderStyle = () => {
        const base = "0.3rem solid transparent";
        switch (tooltip.placement) {
            case "top":
                return {
                    borderTop: "0.3rem solid var(--tooltip-background-color)",
                    borderRight: base,
                    borderLeft: base,
                };
            case "bottom":
                return {
                    border: base,
                    borderBottom: "0.3rem solid var(--tooltip-background-color)",
                };
            case "left":
                return {
                    border: base,
                    borderLeft: "0.3rem solid var(--tooltip-background-color)",
                };
            case "right":
                return {
                    border: base,
                    borderRight: "0.3rem solid var(--tooltip-background-color)",
                };
        }
    };

    const tooltipStyle: React.CSSProperties = {
        position: "fixed",
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: getTransform(),
        zIndex: 10000,
        padding: "0.25rem 0.5rem",
        maxWidth: "300px",
        borderRadius: "var(--border-radius)",
        backgroundColor: "var(--tooltip-background-color)",
        color: "var(--tooltip-color)",
        fontSize: "0.875rem",
        fontWeight: "var(--font-weight)",
        pointerEvents: "none",
        whiteSpace: "normal",
        wordWrap: "break-word",
        animation: "tooltip-fade-in 0.2s ease",
    };

    const caretStyle: React.CSSProperties = {
        position: "fixed",
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: getCaretTransform(),
        zIndex: 10000,
        width: 0,
        height: 0,
        pointerEvents: "none",
        ...getCaretBorderStyle(),
    };

    return createPortal(
        <>
            <div style={tooltipStyle}>{tooltip.text}</div>
            <div style={caretStyle} />
            <style>
                {`
          @keyframes tooltip-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
            </style>
        </>,
        document.body
    );
}
