/* eslint-disable @typescript-eslint/ban-types */
import {
  Key,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

export interface VirtualScrollSettings {
  /**Minimum offset into the adapter. Default is 0.  */
  minIndex: number;
  /** Maximum offset into the adapter. Default is Number.MAX_SAFE_INTEGER.  */
  maxIndex: number;
  /** Initial index to start rendering from. Default is minIndex.  */
  startIndex: number;
  /**
   * Number of items to render in visible area. Default is entire range from
   * minIndex to maxIndex.
   */
  count: number;
  /**
   * Maximum number of items to render on either side of the visible area.
   * Default is `count`.
   */
  tolerance: number;
  /** Height of each item, in pixels. Default is 20px. */
  itemHeight: number;
}

export interface VirtualScrollDataAdapter<T> {
  (offset: number, limit: number): Iterable<T>;
}

export function arrayAdapter<T>(data: T[]): VirtualScrollDataAdapter<T> {
  return (offset, limit) => data.slice(offset, offset + limit);
}

export interface VirtualScrollProps<T, U extends ReactNode> {
  settings?: Partial<VirtualScrollSettings>;
  get: VirtualScrollDataAdapter<T>;
  row: (t: T) => U;
  rowKey: (t: T) => Key;
}

export function fillVirtualScrollSettings(
  settings: Partial<VirtualScrollSettings>
): VirtualScrollSettings {
  const {
    minIndex = 0,
    maxIndex = Number.MAX_SAFE_INTEGER,
    startIndex = 0,
    itemHeight = 20,
    count = Math.max(maxIndex - minIndex, 1),
    tolerance = count,
  } = settings;

  return { minIndex, maxIndex, startIndex, itemHeight, count, tolerance };
}

export function initialState<T>(
  settings: VirtualScrollSettings,
  adapter: VirtualScrollDataAdapter<T>
): VirtualScrollState<T> {
  // From Denis Hilt, https://blog.logrocket.com/virtual-scrolling-core-principles-and-basic-implementation-in-react/
  const { minIndex, maxIndex, startIndex, itemHeight, count, tolerance } =
    settings;
  const bufferedItems = count + 2 * tolerance;
  const itemsAbove = Math.max(0, startIndex - tolerance - minIndex);

  const viewportHeight = count * itemHeight;
  const totalHeight = Math.max(maxIndex - minIndex, 1) * itemHeight;
  const toleranceHeight = tolerance * itemHeight;
  const bufferHeight = viewportHeight + 2 * toleranceHeight;
  const topPaddingHeight = itemsAbove * itemHeight;
  const bottomPaddingHeight = totalHeight - (topPaddingHeight + bufferHeight);

  const state: VirtualScrollState<T> = {
    scrollTop: 0,
    settings,
    viewportHeight,
    totalHeight,
    toleranceHeight,
    bufferedItems,
    topPaddingHeight,
    bottomPaddingHeight,
    data: [],
  };

  return {
    ...state,
    ...doScroll(topPaddingHeight + toleranceHeight, state, adapter),
  };
}

export function getData<T>(
  minIndex: number,
  maxIndex: number,
  offset: number,
  limit: number,
  get: VirtualScrollDataAdapter<T>
): T[] {
  const start = Math.max(0, minIndex, offset);
  const end = Math.min(maxIndex, offset + limit - 1);
  const data = get(start, end - start);
  return [...data];
}

interface ScrollUpdate<T> {
  scrollTop: number;
  topPaddingHeight: number;
  bottomPaddingHeight: number;
  data: T[];
}

export function doScroll<T>(
  scrollTop: number,
  state: VirtualScrollState<T>,
  get: VirtualScrollDataAdapter<T>
): ScrollUpdate<T> {
  const {
    totalHeight,
    toleranceHeight,
    bufferedItems,
    settings: { itemHeight, minIndex, maxIndex },
  } = state;
  const index =
    minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight);
  const data = getData(minIndex, maxIndex, index, bufferedItems, get);
  const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);
  const bottomPaddingHeight = Math.max(
    totalHeight - (topPaddingHeight + data.length * itemHeight),
    0
  );

  return { scrollTop, topPaddingHeight, bottomPaddingHeight, data };
}

interface VirtualScrollState<T> {
  settings: VirtualScrollSettings;
  scrollTop: number; // px
  bufferedItems: number; // count
  totalHeight: number; // px
  viewportHeight: number; // px
  topPaddingHeight: number; // px
  bottomPaddingHeight: number; // px
  toleranceHeight: number; // px
  data: T[];
}

const scrollReducer =
  <T extends {}>(get: VirtualScrollDataAdapter<T>) =>
  (state: VirtualScrollState<T>, scrollTop: number) => ({
    ...state,
    ...doScroll(scrollTop, state, get),
  });

export const VirtualScroll = <T extends {}, U extends ReactNode = ReactNode>(
  props: VirtualScrollProps<T, U> & { className?: string }
) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const { settings, startState, reducer } = useMemo(() => {
    const settings = fillVirtualScrollSettings(props.settings ?? {});
    const startState = initialState<T>(settings, props.get);
    const reducer = scrollReducer(props.get);
    return { settings, reducer, startState };
  }, [props.settings, props.get]);

  const [state, dispatchScroll] = useReducer(reducer, startState);

  useEffect(() => {
    if (viewportRef.current !== null) {
      dispatchScroll(viewportRef.current.scrollTop);
    }
  }, [settings, props.row]);

  const initialScroll = useCallback(
    (div: HTMLDivElement | null) => {
      if (div) {
        div.scrollTop = viewportRef.current
          ? viewportRef.current.scrollTop
          : settings.startIndex * settings.itemHeight;
      }
      viewportRef.current = div;
    },
    [viewportRef, settings.startIndex, settings.itemHeight]
  );

  const rows = state.data.map((d) => (
    <div key={props.rowKey(d)} style={{ height: `${settings.itemHeight}px` }}>
      {props.row(d)}
    </div>
  ));

  return (
    <div
      ref={initialScroll}
      style={{
        height: `${state.viewportHeight}px`,
        overflowY: "scroll",
        overflowAnchor: "none",
      }}
      className={props.className ?? ""}
      onScroll={(e) => dispatchScroll((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: `${state.topPaddingHeight}px` }} />
      {rows}
      <div style={{ height: `${state.bottomPaddingHeight}px` }} />
    </div>
  );
};

export default VirtualScroll;
