import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

interface Props {}

const LoginComponent: React.FC<Props> = () => {
	interface Inputs {
		id: string;
		password: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({ id: '', password: '' });

	const { id, password } = inputs;

	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value, name } = target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

	const onReset = () => {
		setInputs({
			id: '',
			password: '',
		});
	};

	const onClickLogin = () => {
		console.log(id, password);
		fetch("localhost:3001/login",{
			method:"POST",
			headers:{
				"Content-type": "application/json"
			},
			body: JSON.stringify(inputs)
		})
		.then((response) => {
			if(response.ok){
				history.push({
					pathname: "/",
					state : {userinfo: inputs}
				})
			}
			else{
				alert("로그인 안됨");
			}
		});
		onReset();
	};

	const onClickSignup = ()=>{
		history.push({
			pathname:"/signup"
		})
	} 

	return (
		<LoginBackground>
			<LoginContainer>
				<Input
					name="id"
					value={id}
					placeholder="아이디"
					onChange={onChange}
					autoComplete="off"
				/>
				<Input
					name="password"
					value={password}
					placeholder="비밀번호"
					onChange={onChange}
					type="password"
				/>
				<FlexDiv>
					<Button onClick={onClickLogin}>log in</Button>
					<Button onClick={onClickSignup}>sign up</Button>
				</FlexDiv>
			</LoginContainer>
		</LoginBackground>
	);
};

const LoginBackground = styled.div`
	background-color: ${(props) => props.theme.color.PrimaryBG};
	border-radius: 20px;
	width: 640px;
	height: 546px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const LoginContainer = styled.div`
	width: 465px;
	height: 269px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const Button = styled.button`
	width: 159px;
	height: 57px;
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 12px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 24px;
`;

const FlexDiv = styled.div`
	display: flex;
	justify-content: space-evenly;
`;

const Input = styled.input`
	width: 465px;
	height: 78px;
	border: solid 1px ${(props) => props.theme.color.Line};
	border-radius: 10px;
	font-size: 20px;
`;

export default LoginComponent;
