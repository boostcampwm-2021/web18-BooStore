import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import Header from './component/Header';
import { User } from './model';

const App: React.FC = () => {
	const [user, setUser] = useState<User | null>(null);
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
