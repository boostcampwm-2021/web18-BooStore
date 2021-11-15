import styled from 'styled-components';

const Button = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
	text-align: center;
	font-size: 14px;
`;

export default Button;