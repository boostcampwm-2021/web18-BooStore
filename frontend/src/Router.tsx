import React from "react";
import { Switch, Redirect, Route, RouteComponentProps } from "react-router-dom";
import Login from "./page/LoginPage";
import Signup from "./page/SignupPage";
import Main from "./page/MainPage";
import { User } from "./model";

export type hasUserProps = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
const Router: React.FC<hasUserProps> = ({ user, setUser })=>{
    
    return (
        <div>
            <Switch>
                <Route path="/login" exact render={() => <Login setUser={setUser} />} />
                <Route path="/signup" exact component={Signup}/>
                { user !== null || <Redirect to="/login" /> }
                <Route path="/" exact component={Main} />
                <Redirect path="*" to="/" />
            </Switch>
        </div>
    )
}
export default Router;