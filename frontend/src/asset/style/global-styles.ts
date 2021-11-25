import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
	html, body {
		height: 100%;
		width: 100%;
		
		margin: 0;
		padding: 0;
	}
 
	* {
		box-sizing: border-box;
	}
        
    a { text-decoration: none; }
    a:link { text-decoration: none; }
    a:visited { text-decoration: none; }
    a:hover { text-decoration: none; }
    a:focus { text-decoration: none; }

	button {
		cursor: pointer;
	}
`;

export default GlobalStyle;
