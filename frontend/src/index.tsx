import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from './asset/style/theme';
import GlobalStyle from './asset/style/global-styles';
import App from './App';
import 'dotenv/config';

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={defaultTheme}>
			<GlobalStyle />
			<App />
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
