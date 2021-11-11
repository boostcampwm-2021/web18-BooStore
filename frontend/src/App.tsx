import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import Header from './component/Header';
import { User } from './model';

const App: React.FC = () => {
	const localStorageUser = localStorage.getItem('user');
	const parsedUser: User | null = localStorageUser == null ? null : JSON.parse(localStorageUser);
	const [user, setUser] = useState<User | null>(parsedUser);

	useEffect(() => {
		fetch(`/user`, {
			credentials: 'include',
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(response.status.toString());
				}
			})
			.then((data) => {
				if (!data) {
				}

				localStorage.setItem('user', JSON.stringify(data));
				setUser({ ...data });
			})
			.catch((err) => {
				setUser(null);
				localStorage.removeItem('user');
				
				console.log(err);
			});
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
