import React from "react";

export type WithConditionalSceneDefinition<TPropsSoFar> = (
    props: TPropsSoFar
) => number;

type IconType = "one" | "two" | "user";

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types */
export type ExtractRouteParams<T> = string extends T
    ? Record<string, string | number>
    : T extends `${infer _Start}<string:${infer Param}>/${infer Rest}`
    ? ExtractRouteParams<_Start> & {
          [k in Param]: string;
      } & ExtractRouteParams<Rest>
    : T extends `${infer _Start}<number:${infer Param}>/${infer Rest}`
    ? ExtractRouteParams<_Start> & {
          [k in Param]: number;
      } & ExtractRouteParams<Rest>
    : T extends `${infer _Start}<string:${infer Param}>`
    ? { [k in Param]: string }
    : T extends `${infer _Start}<number:${infer Param}>`
    ? { [k in Param]: number }
    : {};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const routeFactory =
    <TGlobalHooks, Unused>(
        hooks: (
            props: JoySpecificGlobalHooksUtilities<unknown>
        ) => TGlobalHooks | false
    ) =>
    <
        TName extends string,
        TPath extends string,
        TResolvePromise,
        TTabs extends string[] = ["index"]
    >(options: {
        name: TName;
        path: TPath;
        tabs?: [...TTabs];
        resolve?: (
            props: {
                params: ExtractRouteParams<TPath>;
                resolved: Record<never, never>;
            } & JoySpecificResolveUtilities<unknown>
        ) => TResolvePromise;
    }) => {
        type TResolve = TResolvePromise extends Promise<infer U>
            ? U extends Record<string, any>
                ? U
                : {} // eslint-disable-line @typescript-eslint/ban-types
            : TResolvePromise;

        type TComponentProps<TCurrentTabName extends string> = {
            currentTab: TCurrentTabName;
            resolved: TResolve;
            params: ExtractRouteParams<TPath>;
        } & TGlobalHooks;

        const outerOptions = {
            ...options,
            hooks,
            resolve: options.resolve ?? (() => Promise.resolve({} as TResolve)),
            tabs: (options.tabs ?? ["index"]) as [...TTabs],
        };

        const innerRoute = <
            TInnerName extends string,
            TInnerPath extends string,
            TInnerResolvePromise,
            TInnerTabs extends string[] = ["index"]
        >(options: {
            name: TInnerName;
            path: TInnerPath;
            tabs?: [...TInnerTabs];
            // TODO: There is a big here. See PR #437. Inner route resolved should
            // get *merged* with outer route resolve. Example of outer route has
            // {meal: 1} and inner route has {meal: null} then resolve should be
            // {meal: 1 | null} or even {meal: null} because the latter "wins".
            // But right now it's actually {meal: 1} only. This is dangerous as at
            // runtime, they *are* merged and meal will be null.
            resolve?: (props: {
                params: ExtractRouteParams<`${TPath}${TInnerPath}`>;
                resolved: TResolve;
            }) => TInnerResolvePromise;
        }) => {
            type TInnerResolve = TInnerResolvePromise extends Promise<infer U>
                ? U extends Record<string, any>
                    ? U
                    : {} // eslint-disable-line @typescript-eslint/ban-types
                : TInnerResolvePromise;
            type FullPath = `${TPath}${TInnerPath}`;
            const fullPath: FullPath = `${outerOptions.path}${options.path}`;

            const wrappedResolve = async (props: {
                params: ExtractRouteParams<`${TPath}${TInnerPath}`>;
                resolved: Record<never, never>;
            }) => {
                const outerParams = props.params as ExtractRouteParams<TPath>;
                const outerResolved = (await outerOptions.resolve({
                    ...props,
                    params: outerParams,
                })) as TResolve;
                const innerResolver =
                    options.resolve ??
                    (() => Promise.resolve({} as TInnerResolve));
                const innerResolved = await innerResolver({
                    params: props.params,
                    resolved: outerResolved,
                });
                return { ...outerResolved, ...innerResolved };
            };

            return routeFactory(hooks)({
                name: options.name,
                tabs: options.tabs,
                path: fullPath,
                resolve: wrappedResolve,
            });
        };

        const bindHooksGuardAndTabs =
            <TProps, TAllGuards>() =>
            <TAllTabNames extends string[], TAllTabDefinitions>(
                allTabNames: [...TAllTabNames],
                allTabDefinitions: TAllTabDefinitions,
                hooks: (props: any) => any
            ) => {
                const withTab = <
                    TTabName extends string,
                    TGuardedProps = TProps &
                        TComponentProps<TTabName> &
                        JoySpecificUtilities<
                            ExtractRouteParams<TPath>,
                            TTabs,
                            TResolve
                        >
                >(
                    options: {
                        name: TTabName;
                        guard?: (
                            props: TProps &
                                TComponentProps<TTabName> &
                                JoySpecificUtilities<
                                    ExtractRouteParams<TPath>,
                                    TTabs,
                                    TResolve
                                >
                        ) => TGuardedProps | false;
                    } & JoySpecificTab<TGuardedProps>,
                    component: React.ComponentType<TGuardedProps>
                ) => {
                    type TInclusiveGuardedProps =
                        | ({ currentTab: TTabName } & TGuardedProps)
                        | TAllGuards;

                    type TabDefinition = {
                        component: typeof component;
                        options: typeof options;
                    };

                    const tabNames: [...TAllTabNames, TTabName] = [
                        ...allTabNames,
                        options.name,
                    ];
                    const tabDefinition = {
                        [options.name]: {
                            options,
                            component,
                        },
                    } as Record<TTabName, TabDefinition>;

                    const tabDefinitions = {
                        ...allTabDefinitions,
                        ...tabDefinition,
                    };

                    return {
                        tabNames,
                        ...bindHooksGuardAndTabs<
                            TProps,
                            TInclusiveGuardedProps
                        >()(tabNames, tabDefinitions, hooks),
                    };
                };

                const defaultTabThisIsJoySpecific = {
                    title: "",
                    icon: "user",
                } as const;

                const withConditions = (
                    conditions: WithConditionalSceneDefinition<
                        TProps &
                            TComponentProps<"index"> &
                            JoySpecificUtilities<
                                ExtractRouteParams<TPath>,
                                TTabs,
                                TResolve
                            >
                    >
                ) => {
                    return {
                        hooks,
                        conditions,
                    };
                };

                const withIndex = (
                    component: React.ComponentType<
                        TProps &
                            TComponentProps<"index"> &
                            JoySpecificUtilities<
                                ExtractRouteParams<TPath>,
                                TTabs,
                                TResolve
                            >
                    >
                ) => {
                    const chainedWithTab = withTab(
                        { name: "index", ...defaultTabThisIsJoySpecific },
                        component
                    );
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { withTab: unused, ...everythingElse } =
                        chainedWithTab;
                    return everythingElse;
                };

                return { withTab, withIndex, withConditions };
            };

        function withHooks<THooks>(
            hooks: (
                props: {
                    currentTab: TTabs[number];
                    resolved: TResolve;
                    params: ExtractRouteParams<TPath>;
                } & JoySpecificUtilities<
                    TResolve,
                    TTabs,
                    ExtractRouteParams<TPath>
                > &
                    TGlobalHooks
            ) => THooks
        ) {
            const { withTab, withIndex, withConditions } =
                bindHooksGuardAndTabs<THooks, never>()([], {}, hooks);

            return {
                withTab,
                withIndex,
                withConditions,
                component: null as any as {
                    currentTab: TTabs[number];
                    resolved: TResolve;
                    params: ExtractRouteParams<TPath>;
                } & JoySpecificUtilities<
                    ExtractRouteParams<TPath>,
                    TTabs,
                    TResolve
                > &
                    THooks &
                    TGlobalHooks,
            };
        }

        return {
            name: options.name,
            options: outerOptions,
            processed: processRoutePath(options.path),
            subroute: innerRoute,
            withHooks,
        };
    };

type TabMap<TTabNames extends string[]> = {
    [K in TTabNames[number]]: {
        options: {
            name: string;
            guard?: (props: any) => any;
        };
        component: React.ComponentType<any>;
    };
};

type RouteDefinition<
    TName extends string,
    TPath extends string,
    TAllTabs extends string[]
> = {
    name: TName;
    options: {
        path: TPath;
        tabs: [...TAllTabs];
        resolve: (props: {
            params: any;
            resolved: any;
        }) => Promise<any> | unknown;
        hooks: (props: any) => any;
    };
    processed: {
        pattern: string;
        tokens: Array<readonly [string, "string" | "number"]>;
    };
};

interface BaseRouteImplementation<TTabs extends string[]> {
    hooks: (props: { resolved: any; params: any }) => any;
}

interface StaticRouteImplementation<TTabs extends string[]>
    extends BaseRouteImplementation<TTabs> {
    tabs: TabMap<TTabs>;
    actions: (props: any) => never[];
}

interface ConditionalRouteImplementation<TTabs extends string[]>
    extends BaseRouteImplementation<TTabs> {
    conditions: WithConditionalSceneDefinition<any>;
}

type RouteImplementation<TTabs extends string[]> =
    | StaticRouteImplementation<TTabs>
    | ConditionalRouteImplementation<TTabs>;

export const createRouter = <
    TRoutes extends Array<RouteDefinition<string, any, any>>
>(
    routes: [...TRoutes]
) => {
    type RouteNames = TRoutes[Extract<keyof TRoutes, number>]["name"];

    const reverse = <
        TName extends RouteNames,
        TParams extends ExtractRouteParams<
            DiscriminateUnion<TRoutes[number], "name", TName>["options"]["path"]
        >,
        TTab extends DiscriminateUnion<
            TRoutes[number],
            "name",
            TName
        >["options"]["tabs"][number]
    >(
        routeNameAndTab: `${TName}.${TTab}`,
        params: TParams
    ) => {
        const [routeName, tabName] = routeNameAndTab.split(".");
        const match = Object.values(routes).find(
            (route) => route.name == routeName
        )!;
        const url = "";
        if (tabName === match.options.tabs[0]) {
            return url;
        }
        return `${url}${tabName}/`;
    };
    const push = <
        TName extends RouteNames,
        TParams extends ExtractRouteParams<
            DiscriminateUnion<TRoutes[number], "name", TName>["options"]["path"]
        >,
        TTab extends DiscriminateUnion<
            TRoutes[number],
            "name",
            TName
        >["options"]["tabs"][number]
    >(
        routeNameAndTab: `${TName}.${TTab}`,
        params: TParams
    ) => {
        const url = reverse(routeNameAndTab, params);
    };
    const replace: typeof push = (routeNameAndTab, params) => {
        const url = reverse(routeNameAndTab, params);
    };
    const goBack = () => {};
    const pushByUrl = (url: string) => {};
    const replaceByUrl = (url: string) => {};

    const mount = (implementations: {
        [K in RouteNames]: RouteImplementation<
            DiscriminateUnion<TRoutes[number], "name", K>["options"]["tabs"]
        >;
    }) => {
        return routes.map((route) => {
            const implementation = implementations[route.name as RouteNames];
            return true;
        });
    };

    return {
        mount,
        history: {
            reverse,
            push,
            goBack,
            pushByUrl,
            replace,
            replaceByUrl,
        },
    };
};

// TODO: failure here if a param is missing, malformatted, etc. Should return an exception or something.
const castParams = (
    definition: RouteDefinition<string, any, any>,
    uncastedParams: Record<
        typeof definition["processed"]["tokens"][number][0],
        string
    >
) => {
    const params: Record<string, number | string> = Object.fromEntries(
        definition.processed.tokens.map(([tokenName, tokenType]) => {
            if (tokenType === "number") {
                return [tokenName, parseInt(uncastedParams[tokenName])];
            }
            return [tokenName, uncastedParams[tokenName]];
        })
    );
    return params;
};

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<
    K,
    V
>
    ? T
    : never;

type JoySpecificTab<TProps> = {
    icon: IconType;
    title: string;
    hasError?: (props: TProps) => boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type JoySpecificResolveUtilities<TProps> = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type JoySpecificGlobalHooksUtilities<TProps> = {};

const REGEX = /<(string|number):([\w]*)>/g;

const processRoutePath = <TPath extends string>(path: TPath) => {
    type Tokens = Record<
        Extract<keyof ExtractRouteParams<TPath>, string>,
        "string" | "number"
    >;
    const tokens = [...path.matchAll(REGEX)].map((token) => {
        return [
            token[2] as keyof Tokens,
            token[1] as "string" | "number",
        ] as const;
    });
    const pattern = path.replace(/<(string|number)/g, "").replace(/>/g, "");

    return {
        tokens,
        pattern,
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type JoySpecificUtilities<TParams, TTabs extends string[], TResolved> = {
    currentTab: TTabs[number];
    location: {
        pathname: string;
        query: URLSearchParams;
    };
    setResolved: (resolved: Partial<TResolved>) => void;
    reloadData: () => Promise<void>;
    switchTab: (tab: TTabs[number]) => void;
};
