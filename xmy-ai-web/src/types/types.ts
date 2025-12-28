export type ValueType<A> = A extends { [s: string]: infer T } ? T : never
export type ArrayType<A> = A extends Array<infer T> ? T : never
