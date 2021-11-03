import React from "react";
import { Switch, Redirect, Route, RouteComponentProps } from "react-router-dom";
import Login from "./page/LoginPage";
import Signup from "./page/SignupPage";
import Main from "./page/MainPage";

export type hasUserProps = {
    name:string | null;
}
const Router: React.FC<hasUserProps> = ({name})=>{

    return (
        <div>
            <Switch>
                <Route path="/login" exact component={Login} />
                { name || <Redirect to="/login" /> }
                <Route path="/" exact component={Main} />
                <Route path="/signup" exact component={Signup}/>
                <Redirect path="*" to="/" />
            </Switch>
        </div>
    )
}
export default Router;