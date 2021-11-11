import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { User } from '../model';
import Modal from 'react-modal';
import { ModalButton } from './SignupComponent';

interface Props {
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const LoginComponent: React.FC<Props> = ({ setUser }) => {
	interface Inputs {
		id: string;
		password: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({ id: '', password: '' });
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalText, setModalText] = useState('유효하지 않은 아이디 또는 비밀번호 입니다.');

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
		fetch(`/login`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify(inputs),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(response.status.toString());
				}
			})
			.then((data) => {
				localStorage.setItem('user', JSON.stringify(data));
				setUser({ ...data });
				history.push({
					pathname: '/',
					state: { userinfo: data },
				});
			})
			.catch((err) => {
				setModalIsOpen(true);
			});
		onReset();
	};

	const onClickSignup = () => {
		history.push({
			pathname: '/signup',
		});
	};

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
				<Modal
					isOpen={modalIsOpen}
					onRequestClose={() => setModalIsOpen(false)}
					ariaHideApp={false}
				>
					{modalText}
					<FlexMiddleDiv>
						<ModalButton onClick={() => setModalIsOpen(false)}>Modal Close</ModalButton>
					</FlexMiddleDiv>
				</Modal>
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

export default LoginComponent;
