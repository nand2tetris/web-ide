import { debounce } from "@davidsouther/jiffies/lib/esm/debounce";
import { ReactNode, useRef, useState } from "react";

export interface VirtualScrollSettings {
  minIndex: number;
  maxIndex: number;
  startIndex: number;
  itemHeight: number; // In pixels
  count: number;
  tolerance: number;
}

export interface VirtualScrollDataAdapter<T> {
  (offset: number, limit: number): Iterable<T>;
}

export function arrayAdapter<T>(data: T[]): VirtualScrollDataAdapter<T> {
  return (offset, limit) => data.slice(offset, offset + limit);
}

export interface VirtualScrollProps<T, U extends ReactNode> {
  settings: Partial<VirtualScrollSettings>;
  get: VirtualScrollDataAdapter<T>;
  row: (t: T) => U;
}

export function fillVirtualScrollSettings(
  settings: Partial<VirtualScrollSettings>
): VirtualScrollSettings {
  const {
    minIndex = 0,
    maxIndex = Number.MAX_SAFE_INTEGER,
    startIndex = 0,
    itemHeight = 20,
    count = maxIndex - minIndex + 1,
    tolerance = count,
  } = settings;

  return { minIndex, maxIndex, startIndex, itemHeight, count, tolerance };
}

export function initialState<T, U extends ReactNode>(
  settings: VirtualScrollSettings
): VirtualScrollState<T, U> {
  // From Denis Hilt, https://blog.logrocket.com/virtual-scrolling-core-principles-and-basic-implementation-in-react/
  const { minIndex, maxIndex, startIndex, itemHeight, count, tolerance } =
    settings;
  const bufferedItems = count + 2 * tolerance;
  const itemsAbove = Math.max(0, startIndex - tolerance - minIndex);

  const viewportHeight = count * itemHeight;
  const totalHeight = (maxIndex - minIndex + 1) * itemHeight;
  const toleranceHeight = tolerance * itemHeight;
  const bufferHeight = viewportHeight + 2 * toleranceHeight;
  const topPaddingHeight = itemsAbove * itemHeight;
  const bottomPaddingHeight = totalHeight - (topPaddingHeight + bufferHeight);

  return {
    scrollTop: 0,
    settings,
    viewportHeight,
    totalHeight,
    toleranceHeight,
    bufferedItems,
    topPaddingHeight,
    bottomPaddingHeight,
    data: [],
    rows: [],
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

interface VirtualScrollState<T, U extends ReactNode = ReactNode> {
  settings: VirtualScrollSettings;
  scrollTop: number; // px
  bufferedItems: number; // count
  totalHeight: number; // px
  viewportHeight: number; // px
  topPaddingHeight: number; // px
  bottomPaddingHeight: number; // px
  toleranceHeight: number; // px
  data: T[];
  rows: U[];
}

// export interface VirtualScroll<T, U extends HTMLElement> {
//   state: VirtualScrollState<T>;
//   rows: UHTMLElement<U>[];
// }

export const VirtualScroll = <T extends {}, U extends ReactNode>(
  props: VirtualScrollProps<T, U>
) => {
  const settings = fillVirtualScrollSettings(props.settings);

  const scrollReducer = (
    state: VirtualScrollState<T, U>,
    newState: ScrollUpdate<T>
  ) => {
    state.scrollTop = newState.scrollTop;
    state.topPaddingHeight = newState.topPaddingHeight;
    state.bottomPaddingHeight = newState.bottomPaddingHeight;
    state.data = newState.data;
    state.rows = state.data.map(props.row);
    return state;
  };

  const [state, setState] = useState(initialState<T, U>(settings));

  const scrollTo = () => {
    const scrollTop = viewportRef.current?.scrollTop ?? state.topPaddingHeight;
    const scrollAction = doScroll(scrollTop, state, props.get);
    setState(scrollReducer(state, scrollAction));
  };

  const viewportRef = useRef<HTMLDivElement>();
  const viewportElement = (
    <div
      ref={(ref) => (viewportRef.current = ref ?? undefined)}
      style={{ height: `${state.viewportHeight}px`, overflowY: "scroll" }}
      onScroll={debounce(scrollTo, 0)}
    >
      <div
        className="VirtualScroll__topPadding"
        style={{ height: `${state.topPaddingHeight}px` }}
      />
      {(state.rows ?? []).map((row, i) => (
        <div key={i} style={{ height: `${settings.itemHeight}px` }}>
          {row}
        </div>
      ))}
      <div
        className="VirtualScroll__bottomPadding"
        style={{ height: `${state.bottomPaddingHeight}px` }}
      />
    </div>
  );

  setTimeout(() => {
    viewportRef.current?.scroll({ top: state.scrollTop });
  });

  scrollTo();

  return viewportElement;
};

export default VirtualScroll;
