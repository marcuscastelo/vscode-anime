import LineContext from "../list-parser/line-context";

interface PrimitivesMap {
    string: string,
    boolean: boolean,
    number: number,
}

type Constructor<T> = { new(...args: any[]): T };
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
    & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };

export type PredefinedArray<T extends any[]> =
    T
    & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };


// /// Option
// export type Some<T> = { value: T };
// export type None = { value: undefined };
// type IOption<T> = { value?: T };
// export class Option<T> implements IOption<T> {
//     constructor(readonly value?: T) { }

//     public isSome(): this is Some<T>{
//         return this.value !== undefined;
//     }

//     public isNone(): this is None {
//         return !this.isSome();
//     }

//     public unwrap(): T {
//         if (this.isNone()) {
//             throw new Error('Cannot unwrap None');
//         } 

//         return this.value!;

//     }

//     public unwrapOr(defaultValue: T): T {
//         return this.isSome() ? this.value : defaultValue;
//     }

//     public unwrapOrElse(defaultValue: () => T): T {
//         return this.isSome() ? this.value : defaultValue();
//     }

//     public map<U>(mapper: (value: T) => U): Option<U> {
//         return this.isSome() ? new Option(mapper(this.value)) : new Option();
//     }

//     public mapOr<U>(defaultValue: U, mapper: (value: T) => U): U {
//         return this.isSome() ? mapper(this.value) : defaultValue;
//     }

//     public mapOrElse<U>(defaultValue: () => U, mapper: (value: T) => U): U {
//         return this.isSome() ? mapper(this.value) : defaultValue();
//     }

//     public and<U>(other: Option<U>): Option<U> {
//         return this.isSome() ? other : new Option();
//     }

//     public andThen<U>(mapper: (value: T) => Option<U>): Option<U> {
//         return this.isSome() ? mapper(this.value) : new Option();
//     }

//     public or(other: Option<T>): Option<T> {
//         return this.isSome() ? this : other;
//     }

//     public orElse(mapper: () => Option<T>): Option<T> {
//         return this.isSome() ? this : mapper();
//     }

//     public okOr<E>(error: E): Result<T, E> {
//         return this.isSome() ? ok(this.value) : err(error);
//     }

//     public okOrElse<E>(error: () => E): Result<T, E> {
//         return this.isSome() ? ok(this.value) : err(error());
//     }
// }

// export function some<T>(value: T): Option<T> {
//     return new Option(value);
// }

// export function none<T>(): Option<T> {
//     return new Option();
// }

// export type Ok<T> = { ok: Some<T>, err: None };
// export type Err<E> = { err: Some<E>, ok: None };
// type IResult<T, E> = { ok: IOption<T>, err: IOption<E> };
// export class Result<T, E> implements IResult<T, E> {
//     private constructor(
//         public readonly ok: Option<T> = new Option(),
//         public readonly err: Option<E> = new Option(),
//     ) { }

//     public static makeOk<T, E>(value: T): Result<T, E> {
//         return new Result(new Option(value), new Option());
//     }

//     public static makeErr<T, E>(error: E): Result<T, E> {
//         return new Result(new Option(), new Option(error));
//     }

//     public isOk(): this is ((Ok<T> | Err<E>) & Ok<T>) {
//         return this.ok.isSome();
//     }

//     public isErr(): this is ((Ok<T> | Err<E>) & Err<E>) {
//         return !this.isOk();
//     }

//     public unwrap(): T {
//         return this.ok.unwrap();
//     }

//     public unwrapErr(): E {
//         return this.err.unwrap();
//     }

//     public unwrapOr(defaultValue: T): T {
//         return this.ok.unwrapOr(defaultValue);
//     }

//     public unwrapOrElse(defaultValue: () => T): T {
//         return this.ok.unwrapOrElse(defaultValue);
//     }

//     public map<U>(mapper: (value: T) => U): Result<U, E> {
//         if (this.isOk()) {
//             return ok(mapper(this.ok.value));
//         } else if (this.isErr()) {
//             return err(this.err.value);
//         } else {
//             throw new Error('Impossible');
//         }
//     }
// }

// export function ok<T, E>(value: T): Result<T, E> {
//     return Result.makeOk(value);
// }

// export function err<T, E>(error: E): Result<T, E> {
//     return Result.makeErr(error);
// }

// // export type Err<E> = { ok: false, error: E };
// // export type Result<T, E> = Ok<T> | Err<E>;

// // export function ok<T>(result: T): Ok<T> {
// //     return { ok: true, result };
// // }

// // export function err<E>(error: E): Err<E> {
// //     return { ok: false, error };
// // }

// // export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
// //     return result.ok;
// // }

// // export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
// //     return !result.ok;
// // }

// // export function mapOk<T, E, U>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> {
// //     if (isOk(result)) {
// //         return ok(mapper(result.result));
// //     }
// //     else {
// //         return result;
// //     }
// // }

// // export function mapErr<T, E, F>(result: Result<T, E>, mapper: (error: E) => F): Result<T, F> {
// //     if (isErr(result)) {
// //         return err(mapper(result.error));
// //     }
// //     else {
// //         return result;
// //     }
// // }

// // export function mapResult<T, E, U, F>(result: Result<T, E>, okMapper: (value: T) => U, errMapper: (error: E) => F): Result<U, F> {
// //     if (isOk(result)) {
// //         return ok(okMapper(result.result));
// //     }
// //     else {
// //         return err(errMapper(result.error));
// //     }
// // }

// // export function unwrapOk<T, E>(result: Result<T, E>): T {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         throw new Error(`Expected Ok, got Err: ${result.error}`);
// //     }
// // }

// // export function unwrapErr<T, E>(result: Result<T, E>): E {
// //     if (isErr(result)) {
// //         return result.error;
// //     }
// //     else {
// //         throw new Error(`Expected Err, got Ok: ${result.result}`);
// //     }
// // }

// // export function unwrapResult<T, E>(result: Result<T, E>): T | E {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         return result.error;
// //     }
// // }

// // export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         return defaultValue;
// //     }
// // }

// // export function unwrapOrElse<T, E>(result: Result<T, E>, defaultValue: (error: E) => T): T {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         return defaultValue(result.error);
// //     }
// // }

// // export function unwrapOrThrow<T, E>(result: Result<T, E>, error: E): T {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         throw error;
// //     }
// // }

// // export function unwrap<T, E>(result: Result<T, E>): T {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         throw result.error;
// //     }
// // }

// // export function flattenOk<T, E>(result: Result<Result<T, E>, E>): Result<T, E> {
// //     if (isOk(result)) {
// //         return result.result;
// //     }
// //     else {
// //         return result;
// //     }
// // }

// // export function flattenErr<T, E>(result: Result<T, Result<T, E>>): Result<T, E> {
// //     if (isOk(result)) {
// //         return result;
// //     }
// //     else {
// //         return result.error;
// //     }
// // }

// // /// Option

// // export type Some<T> = { some: true, value: T };
// // export type None = { some: false };
// // export type Option<T> = Some<T> | None;

// // export function some<T>(value: T): Some<T> {
// //     return { some: true, value };
// // }

// // export function none<T>(): None {
// //     return { some: false };
// // }

// // export function isSome<T>(option: Option<T>): option is Some<T> {
// //     return option.some;
// // }

// // export function isNone<T>(option: Option<T>): option is None {
// //     return !option.some;
// // }

// // export function mapSome<T, U>(option: Option<T>, mapper: (value: T) => U): Option<U> {
// //     if (isSome(option)) {
// //         return some(mapper(option.value));
// //     }
// //     else {
// //         return option;
// //     }
// // }

// // export function mapNone<T>(option: Option<T>, mapper: () => T): Option<T> {
// //     if (isSome(option)) {
// //         return option;
// //     }
// //     else {
// //         return some(mapper());
// //     }
// // }

// // // export function mapOption<T, U>(option: Option<T>, someMapper: (value: T) => U, noneMapper: () => U): Option<U> {
// // //     if (isSome(option)) {
// // //         return some(someMapper(option.value));
// // //     }
// // //     else {
// // //         return some(noneMapper());
// // //     }
// // // }

// // export function unwrapSome<T>(option: Option<T>): T {
// //     if (isSome(option)) {
// //         return option.value;
// //     }
// //     else {
// //         throw new Error(`Expected Some, got None`);
// //     }
// // }

// // export function unwrapOption<T>(option: Option<T>): T | undefined {
// //     if (isSome(option)) {
// //         return option.value;
// //     }
// //     else {
// //         return undefined;
// //     }
// // }

// // export function unwrapSomeOr<T>(option: Option<T>, defaultValue: T): T {
// //     if (isSome(option)) {
// //         return option.value;
// //     }
// //     else {
// //         return defaultValue;
// //     }
// // }

// // export function unwrapSomeOrElse<T>(option: Option<T>, defaultValue: () => T): T {
// //     if (isSome(option)) {
// //         return option.value;
// //     }
// //     else {
// //         return defaultValue();
// //     }
// // }

// // export function mapResultToOption<T, E>(result: Result<T, E>): Option<T> {
// //     if (isOk(result)) {
// //         return some(result.result);
// //     }
// //     else {
// //         return none();
// //     }
// // }

/// Get type of a property of an object

export type PropertyType<T, K extends keyof T> = T[K];