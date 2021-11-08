import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import Header from './component/Header';
import { User } from './model';

const App: React.FC = () => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		fetch(`/user`, {
			credentials: 'include'
		})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else if (response.status === 401) {
				return null;
			} else {
				throw new Error(response.status.toString());
			}
		})
		.then((data) => {
			setUser(data);
		})
		.catch((err) => console.log(err));
	}, []);

	return (
		<>
			<BrowserRouter>
				<Header user={user} />

				<Router user={user} setUser={setUser} />
			</BrowserRouter>
		</>
	);
};

export default App;
