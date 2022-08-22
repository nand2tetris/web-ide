import {
  MutableRefObject,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";

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
  settings?: Partial<VirtualScrollSettings>;
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

export function initialState<T>(
  settings: VirtualScrollSettings,
  adapter: VirtualScrollDataAdapter<T>,
  ref: MutableRefObject<HTMLDivElement | null>
): VirtualScrollState<T> {
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

  const state: VirtualScrollState<T> = {
    scrollTop: ref.current?.scrollTop ?? 0,
    settings,
    viewportHeight,
    totalHeight,
    toleranceHeight,
    bufferedItems,
    topPaddingHeight,
    bottomPaddingHeight,
    data: [],
  };

  return { ...state, ...doScroll(0, state, adapter) };
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scrollReducer =
  <T extends {}>(get: VirtualScrollDataAdapter<T>) =>
  (state: VirtualScrollState<T>, { scrollTop }: { scrollTop: number }) => ({
    ...state,
    ...doScroll(scrollTop, state, get),
  });

export const VirtualScroll = <T extends {}, U extends ReactNode = ReactNode>(
  props: VirtualScrollProps<T, U> & { className?: string }
) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const settings = useMemo(() => {
    return fillVirtualScrollSettings(props.settings ?? {});
  }, [props.settings]);

  const reducer = useMemo(() => scrollReducer(props.get), [props.get]);

  const startState = useMemo(() => {
    return initialState<T>(settings, props.get, viewportRef);
  }, [settings, props.get, viewportRef]);

  const [state, dispatchScroll] = useReducer(reducer, startState);

  const doOnScroll = useCallback(
    ({ target }: { target: { scrollTop: number } }) => {
      dispatchScroll({ scrollTop: target?.scrollTop ?? 0 });
    },
    [dispatchScroll]
  );

  return (
    <div
      ref={viewportRef}
      style={{
        height: `${state.viewportHeight}px`,
        overflowY: "scroll",
        overflowAnchor: "none",
      }}
      className={props.className ?? ""}
      // @ts-ignore
      onScroll={doOnScroll}
    >
      <div style={{ height: `${state.topPaddingHeight}px` }} />
      {state.data.map((d, i) => (
        <div key={i} style={{ height: `${settings.itemHeight}px` }}>
          {props.row(d)}
        </div>
      ))}
      <div style={{ height: `${state.bottomPaddingHeight}px` }} />
    </div>
  );
};

export default VirtualScroll;
