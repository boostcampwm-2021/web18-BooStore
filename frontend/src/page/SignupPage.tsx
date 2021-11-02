import React, { Children } from 'react';
import styled from 'styled-components';

type Props = {
	children: JSX.Element;
};

function SignupPage({ children }: Props) {
	return <SignupPageBackground>{children}</SignupPageBackground>;
}

const SignupPageBackground = styled.div`
	width: 100%;
	height: 100vh;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default SignupPage;
