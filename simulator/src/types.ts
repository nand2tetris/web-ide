export type Action<T> = (value: T) => void;
export type AsyncAction<T> = (value: T) => Promise<void>;
