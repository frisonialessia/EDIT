/** Branded types — identificadores de dominio con seguridad en tiempo de compilación. */
export type Brand<T, B extends string> = T & { readonly __brand: B };
