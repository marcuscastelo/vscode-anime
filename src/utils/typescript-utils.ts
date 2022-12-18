interface PrimitivesMap {
    string: string,
    boolean: boolean,
    number: number,    
}

type Constructor<T> = { new (...args: any[] ): T };
type PrimitiveOrConstructor = 
    | Constructor<any>
    | keyof PrimitivesMap;

type GuardedType<T extends PrimitiveOrConstructor> =
    T extends Constructor<infer U> ? U :
    T extends keyof PrimitivesMap ? PrimitivesMap[T] :
    never;

export function typeGuard<T extends PrimitiveOrConstructor>(arg: any, type: PrimitiveOrConstructor): arg is T {
    if (typeof type === 'string') {
        return typeof arg === type;
    }

    return arg instanceof type;
}

/// Arrays

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number;
export type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never;

export type FixedLengthArray<T extends any[]> =
    Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
    & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > };

export type PredefinedArray<T extends any[]> =
    T
    & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > };