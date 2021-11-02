import React from "react";
import { Switch, Redirect, Route, RouteComponentProps } from "react-router-dom";
import Login from "./page/LoginPage";
import Main from "./page/MainPage";

export type hasUserProps = {
    name:string | null;
}
const Router: React.FC<hasUserProps> = ({name})=>{

    !{name}? <Redirect to="/Login"/> : <Redirect to="/"/>
    return (
        <div>
            <Switch>
                <Route path="/" exact component={Main} />
                <Route path="/Login" exact component={Login} />
                <Redirect path="*" to="/" />
            </Switch>
        </div>
    )
}
export default Router;