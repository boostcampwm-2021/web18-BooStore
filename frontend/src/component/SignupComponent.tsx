import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import IconLeftArrow from '../asset/image/IconLeftArrow.svg';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';

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

	const [isWarning,setIsWarning] = useState(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalText, setModalText] = useState("유효하지 않은 아이디 또는 비밀번호 입니다.");

	const { id, password, passwordCheck } = inputs;

	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value, name } = target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

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
	
	const onClickBack = () => {
		history.goBack();
	}

	const onClickSignup = ()=>{
		if(isRightIdRex() && isRightPasswordRex() && isEqualPassword()){
			fetch(`/signup`,{
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
					setModalText("유효하지 않은 아이디 또는 비밀번호 입니다.");
					setModalIsOpen(true);				
				}
				else if (response.status === 409) {
					setModalText("중복된 아이디 입니다.");
					setModalIsOpen(true);	
				}
				else {
					setModalText("회원가입 안됨");
					setModalIsOpen(true);
				}
			});
		}
		else{
			setModalText("유효하지 않은 아이디 또는 비밀번호 입니다.");
			setModalIsOpen(true);
		}
	}

	useEffect(()=>{
		if(isEqualPassword()){
			setIsWarning(false);
		}
		else{
			setIsWarning(true);
		}
	}	
	,[isEqualPassword]);
	return (
		<SignupBackground>
			<div style={{ width: '90%' }}>
				<PreviousPageButtonContainer onClick={onClickBack}>
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
				{ isWarning? <Warning>비밀번호가 일치하지 않습니다.</Warning> :""}
				<FlexDiv>
					<Button onClick={onClickSignup} style={{ float: 'right' }}>sign up</Button>
				</FlexDiv>
				<Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} ariaHideApp={false}>
					{modalText}
					<FlexMiddleDiv>
						<ModalButton onClick={()=> setModalIsOpen(false)}>Modal Close</ModalButton>
					</FlexMiddleDiv>
				</Modal>
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
const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;
	
	margin-top: 30px;
`;

const Input = styled.input`
	width: 465px;
	height: 78px;
	border: solid 1px ${(props) => props.theme.color.Line};
	border-radius: 10px;
	font-size: 20px;
`;

const Warning = styled.div`
	color: #FF0000;
	font-size: 12px;
`;

Modal.defaultStyles={
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.75)'
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		position: 'absolute',
		width: '400px',
		height: '200px',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '30px'
	}
}

export const ModalButton = styled.div`
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 6px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 12px;
	padding: 10px;
`;
export default SignupComponent;
