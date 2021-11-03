import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import IconLeftArrow from '../asset/image/IconLeftArrow.svg';
import { useHistory } from 'react-router-dom';

interface Props {}

const SignupComponent: React.FC<Props> = () => {
	interface Inputs {
		id: string;
		password: string;
		passwordCheck: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({
		id: '',
		password: '',
		passwordCheck: '',
	});

	const { id, password, passwordCheck } = inputs;

	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value, name } = target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

	useEffect(() => {
		console.log('ID REX', isRightIdRex());
		console.log('PW REX', isRightPasswordRex());
		console.log('EQUAL PW', isEqualPassword());
	}, [id, password, passwordCheck]);

	const isRightIdRex = () => {
		const pattern = /^([a-zA-Z0-9]){4,13}$/;
		return pattern.test(id);
	};

	const isRightPasswordRex = () => {
		const pattern = /^([a-zA-Z0-9!@#$%^&*]){4,13}$/;
		return pattern.test(password);
	};

	const isEqualPassword = () => {
		if (password === '') return false;
		return password === passwordCheck;
	};

	const onClickSignup = ()=>{
		fetch(`${process.env.REACT_APP_SERVER}/signup`,{
			method:"POST",
			headers:{
				"Content-type": "application/json"
			},
			body: JSON.stringify(inputs)
		})
		.then((response) => {
			if(response.ok){
				history.push({
					pathname: "/login",
				})
			}
			else if (response.status === 400) {
				alert('유효하지않은 아이디 & 비밀번호');
			}
			else if (response.status === 409) {
				alert('중복된 아이디');
			}
			else {
				alert('회원가입 안됨')
			}
		});
	}

	return (
		<SignupBackground>
			<div style={{ width: '90%' }}>
				<PreviousPageButtonContainer>
					<img alt="leftArrow" src={IconLeftArrow} />
				</PreviousPageButtonContainer>
			</div>
			<SignupContainer>
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
				<Input
					name="passwordCheck"
					value={passwordCheck}
					placeholder="비밀번호 확인"
					onChange={onChange}
					type="password"
				/>
				<FlexDiv>
					<Button onClick={onClickSignup} style={{ float: 'right' }}>sign up</Button>
				</FlexDiv>
			</SignupContainer>
		</SignupBackground>
	);
};

const SignupBackground = styled.div`
	background-color: ${(props) => props.theme.color.PrimaryBG};
	border-radius: 20px;
	width: 640px;
	height: 546px;
	display: flex;
	flex-flow: column;
	justify-content: space-evenly;
	align-items: center;
`;

const PreviousPageButtonContainer = styled.div`
	height: 57px;
	width: 57px;
	border: solid 1px ${(props) => props.theme.color.Line};
	border-radius: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SignupContainer = styled.div`
	width: 465px;
	height: 371px;
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
	display: grid;
	justify-items: end;
`;

const Input = styled.input`
	width: 465px;
	height: 78px;
	border: solid 1px ${(props) => props.theme.color.Line};
	border-radius: 10px;
	font-size: 20px;
`;

export default SignupComponent;
