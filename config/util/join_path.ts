import path from "path";

type PlaceholderType = string | number | boolean | bigint;

type Join<T extends readonly PlaceholderType[], S extends string> = T extends readonly [
    infer P,
    ...infer R
]
    ? P extends PlaceholderType
        ? [] extends R
            ? P
            : R extends PlaceholderType[]
            ? `${P}${S}${Join<R, S>}`
            : never
        : ""
    : [] extends T
    ? ""
    : string;

export const joinPath = <T extends string[]>(...args_: T): Join<T, "/"> =>
    path.join(...args_) as Join<T, "/">;

export type RelativeToAbs<T extends Record<string, string>, R extends readonly string[]> = {
    [P in keyof T]: Join<[Join<R, "/">, T[P]], "/">;
};
export const relativeToAbs = <T extends Record<string, string>, R extends readonly string[]>(
    relativeRecord_: T,
    ...paths_: R
): RelativeToAbs<T, R> => {
    const pathsToTarget = joinPath(...paths_);
    return (Object.fromEntries(
        Object.entries(relativeRecord_).map(([key_, value_]) => [
            key_,
            joinPath(pathsToTarget, value_),
        ])
    ) as unknown) as RelativeToAbs<T, R>;
};
