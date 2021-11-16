import 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		color: {
			PrimaryBG: string;
			SecondaryBG: string;
			HeaderBG: string;
			ModalBG: string;
			Primary: string;
			Line: string;
			MetaData: string;
			Content: string;
			Point: string;
		};
		HeaderHeight: string;
		fontSize: {
			Hint: string;
			Content: string;
			ContentSmall: string;
			Title: string;
		};
		FontFamily: {
			Light: string;
			Medium: string;
			Bold: string;
		};
		padding: {
			Header: string;
			Content: string;
			Modal: string;
		};
	}
}
