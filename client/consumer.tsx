import * as routes from "./routes";


routes.UpdateTrinket.withHooks(props => {
    console.log(props.params.widgetId, props.params.trinketId, 2)
});
