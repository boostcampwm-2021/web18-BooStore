import { DefaultTheme } from 'styled-components';

const themeValue = {
	color: {
		PrimaryBG: '#FFFFFF',
		SecondaryBG: '#F6F6F6',
		Primary: '#084A83',
		Line: '#D7D7D7',
		HeaderBG: '#E4EBF1',
		ModalBG: 'rgba(196, 196, 196, 0.5)',
		Content: '#282828',
		Point: '#F3AA18',
		MetaData: '#888888',
	},
	HeaderHeight: '60px',
	FontFamily: {
		Light: 'Gmarket Sans Light',
		Medium: 'Gmarket Sans Medium',
		Bold: 'Gmarket Sans Bold',
	},
	fontSize: {
		Hint: '14px',
		Content: '16px',
		ContentSmall: '14px',
		Title: '18px',
	},
	padding: {
		Header: '20px 40px',
		Content: '20px',
		Modal: '20px',
	},
};

const defaultTheme: DefaultTheme = {
	...themeValue,
};

export { defaultTheme, themeValue };
