interface PrimitivesMap {
  string: string;
  boolean: boolean;
  number: number;
}

type Constructor<T> = { new (...args: unknown[]): T };
type PrimitiveOrConstructor = Constructor<unknown> | keyof PrimitivesMap;

export function typeGuard<T extends PrimitiveOrConstructor>(
  arg: unknown,
  type: PrimitiveOrConstructor,
): arg is T {
  if (typeof type === "string") {
    return typeof arg === type;
  }

  return arg instanceof type;
}

/// Arrays

type ArrayLengthMutationKeys =
  | "splice"
  | "push"
  | "pop"
  | "shift"
  | "unshift"
  | number;
export type ArrayItems<T extends Array<unknown>> =
  T extends Array<infer TItems> ? TItems : never;

export type FixedLengthArray<T extends unknown[]> = Pick<
  T,
  Exclude<keyof T, ArrayLengthMutationKeys>
> & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };

export type PredefinedArray<T extends unknown[]> = T & {
  [Symbol.iterator]: () => IterableIterator<ArrayItems<T>>;
};

export type PropertyType<T, K extends keyof T> = T[K];

/// Interfaces

///

export type Supplier<T> = () => T;
