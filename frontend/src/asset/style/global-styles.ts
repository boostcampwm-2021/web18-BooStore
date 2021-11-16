import { createGlobalStyle } from "styled-components";
import GmarketSansTTFMedium from '../font/GmarketSansTTFMedium.ttf';
import GmarketSansTTFBold from '../font/GmarketSansTTFBold.ttf';

const GlobalStyle = createGlobalStyle`
	html, body {
		height: 100%;
		width: 100%;
		
		margin: 0;
		padding: 0;
	}
    
    @font-face {
        font-family: "Gmarket Sans Medium";
        src: local("Gmarket Sans Medium"), url(${GmarketSansTTFMedium}) format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    
    @font-face {
        font-family: "Gmarket Sans Bold";
        src: local("Gmarket Sans Bold"), url(${GmarketSansTTFBold}) format('truetype');
        font-weight: bold;
        font-style: normal;
    }
    
	* {
		box-sizing: border-box;
        font-family: "Gmarket Sans Medium";
	}
`;

export default GlobalStyle;