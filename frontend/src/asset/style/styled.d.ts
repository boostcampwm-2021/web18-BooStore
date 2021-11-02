import 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		color: {
			PrimaryBG: string;
			SecondaryBG: string;
			Primary: string;
			Line: string;
		};
		HeaderHeight: string;
	}
}
