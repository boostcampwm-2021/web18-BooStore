import React from "react";
import { Switch, Redirect, Route, RouteComponentProps } from "react-router-dom";
import Login from "./page/LoginPage";
import Main from "./page/MainPage";

export type hasUserProps = {
    name:string | null;
}
const Router: React.FC<hasUserProps> = ({name})=>{

    return (
        <div>
            <Switch>
                <Route path="/Login" exact component={Login} />
                { name || <Redirect to="/Login" /> }
                <Route path="/" exact component={Main} />
                <Redirect path="*" to="/" />
            </Switch>
        </div>
    )
}
export default Router;