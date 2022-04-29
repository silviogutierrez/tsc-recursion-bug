import {routeFactory} from "./monoroutes";

const isAuthenticated = () => {
    // This could check cookies, or localstorage, etc.
    //
    // Stub here to illustrate the logic.
    return true;
}

const anonymousRoute = routeFactory(() => ({}));

const route = routeFactory(() => {
    if (isAuthenticated() === false) {
        // redirect to login
    }
    return {
        profile: {
            name: "John Smith",
            age: 15,
        },
    };
});

export const Share = route({
    name: "share",
    path: "/share2/<string:uuid>/",
});

export const PasswordReset = route({
    name: "reset",
    path: "/reset/",
});

export const Registration = anonymousRoute({
    name: "register",
    path: "/register/",
});

export const Contact = route({
    name: "contact",
    path: "/contact/",
});

export const Dashboard = route({
    name: "dashboard",
    path: "/dashboard/<string:username>/",
    tabs: ["main", "info", "charts"],
    // resolve: () => Promise.resolve({resultOfApiCall: 1}),
});

/*
 *
 * The idea here is that the subroute extends the parent route and gets its
 * depedencies.
 *
 * The path is the concatenation of the inner route and the outer one, so
 *
 * "/dashboard/<string:username>/subroute/"
 */
export const SubRouteExample = Dashboard.subroute({
    name: "subroute",
    path: "subroute/",
});

export const WidgetList = route({
    name: "update_widget",
    path: "widgets/",
});

export const CreateWidget = route({
    name: "create_widget",
    path: "widgets/create/",
});

export const UpdateWidget = route({
    name: "update_widge",
    path: "widgets/<number:widgetId>/",
    tabs: ["main", "advanced"],
});

export const UpdateTrinket = UpdateWidget.subroute({
    name: "update_trinket2",
    path: "trinkets/<number:trinketId>/",
});

export const AdditionalRouteOne = route({
    name: "one",
    path: "one/",
});

export const AdditionalRouteTwo = route({
    name: "two",
    path: "two",
});

export const AdditionalRouteThree = route({
    name: "three",
    path: "/three/",
});

export const AdditionalRouteFour = route({
    name: "four",
    path: "four/",
});

export const AdditionalRouteFive = route({
    name: "five",
    path: "five/<number:id>/",
    tabs: ["foo", "bar"],
});

export const AdditionalRouteSix = route({
    name: "six",
    path: "six/<number:entryId>/",
});

export const AdditionalRouteSeven = route({
    name: "seven",
    path: "seven/",
});

export const AdditionalRouteEight = route({
    name: "eight",
    path: "eight/",
    tabs: ["snap", "spam"],
});

export const AdditionalRouteNine = route({
    name: "nine",
    path: "nine/",
});

export const AdditionalRouteTen = route({
    name: "ten",
    path: "ten/",
});

export const AdditionalRouteEleven = route({
    name: "eleven",
    path: "create/",
    tabs: ["first-tab", "second-tab"],
});

export const AdditionalRouteTwelve = route({
    name: "twelve",
    path: "<number:foodId>/",
});

export const RouteThirteen = route({
    name: "thirteen",
    path: "thirteen/",
});

export const Fourteen = route({
    name: "fourteen",
    path: "/fourteen/",
});

export const Fifteen = route({
    name: "fifteen",
    path: "/fifteen/",
    tabs: ["schedule", "targets"],
});

export const Seventeen = route({
    name: "seventeen",
    path: "/seventeen/",
});

export const Eighteen = route({
    name: "eighteen",
    path: "/eighteen/",
});

export const Nineteen = route({
    name: "nineteen",
    path: "/nineteen/",
});

export const Twenty = route({
    name: "twenty",
    path: "/twenty/",
});

export const TwentyOne = route({
    name: "twentyone",
    path: "/twentyone/",
});

export const TwentyTwo = route({
    name: "twentytwo",
    path: "/twentytwo/",
});

export const Login = route({
    name: "login",
    path: "/login/",
});

export const Logout = route({
    name: "logout",
    path: "/logout/",
});
