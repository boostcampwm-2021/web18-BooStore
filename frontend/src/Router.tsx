import React from 'react';
import { Switch, Redirect, Route, RouteComponentProps } from 'react-router-dom';
import Login from './page/LoginPage';
import Signup from './page/SignupPage';
import Main from './page/MainPage';
import { User } from './model';
import TrashPage from '@page/TrashPage';

export type hasUserProps = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
};
const Router: React.FC<hasUserProps> = ({ user, setUser }) => {
	if (user) {
		return (
			<Switch>
				<Route path="/" exact>
					<Main user={user} setUser={setUser} />
				</Route>
				<Route path="/trash" exact>
					<TrashPage user={user} setUser={setUser} />
				</Route>
				<Redirect to="/" />
			</Switch>
		);
	} else {
		return (
			<Switch>
				<Route path="/login" exact>
					<Login setUser={setUser} />
				</Route>
				<Route path="/signup" exact component={Signup} />
				<Redirect to="/login" />
			</Switch>
		);
	}
};
export default Router;
