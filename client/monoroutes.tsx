import React from "react";


type ExtractRouteParams<T> = string extends T
    ? Record<string, string | number>
    : T extends `${infer _Start}<string:${infer Param}>/${infer Rest}`
    ? ExtractRouteParams<_Start> & {[k in Param]: string} & ExtractRouteParams<Rest>
    : T extends `${infer _Start}<number:${infer Param}>/${infer Rest}`
    ? ExtractRouteParams<_Start> & {[k in Param]: number} & ExtractRouteParams<Rest>
    : T extends `${infer _Start}<string:${infer Param}>`
    ? {[k in Param]: string}
    : T extends `${infer _Start}<number:${infer Param}>`
    ? {[k in Param]: number}
    : {};

export const route = 
<
    TName extends string,
    TPath extends string,
    TResolve,
    TTabs extends string[] = ["index"]
>(options: {
    name: TName;
    path: TPath;
    tabs?: [...TTabs];
    resolve?: (
        props: {
            params: ExtractRouteParams<TPath>;
            resolved: Record<never, never>;
        }
    ) => TResolve
}) => {
    const outerOptions = {
        ...options,
        resolve: options.resolve ?? (() => Promise.resolve({} as TResolve)),
        tabs: (options.tabs ?? ["index"]) as [...TTabs],
    };

    const innerRoute = <
        TInnerName extends string,
        TInnerPath extends string,
        TInnerResolve,
        TInnerTabs extends string[] = ["index"]
    >(options: {
        name: TInnerName;
        path: TInnerPath;
        tabs?: [...TInnerTabs];
        resolve?: (
            props: {
                params: ExtractRouteParams<`${TPath}${TInnerPath}`>;
                resolved: TResolve;
            }
        ) => TInnerResolve,
    }) => {
        type FullPath = `${TPath}${TInnerPath}`;
        const fullPath: FullPath = `${outerOptions.path}${options.path}`;

        // This is a wrapped resolve that will resolve the outside, then inject
        // the results into the inner resolve. Logic left out as it does not
        // affect the bug.
        const resolve = null as any;

        return route({
            name: options.name,
            path: fullPath,
            resolve,
        });
    };

    return {
        subroute: innerRoute,
    };
};
