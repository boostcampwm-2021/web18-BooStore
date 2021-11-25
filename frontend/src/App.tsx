import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { User } from './model';

import './asset/css/font.css';

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
				
				console.error(err);
			});

			document.addEventListener('contextmenu',(e) => {
				e.preventDefault();
			})
	}, []);

	return (
		<>
			<BrowserRouter>
				<Router user={user} setUser={setUser} />
			</BrowserRouter>
		</>
	);
};

export default App;
