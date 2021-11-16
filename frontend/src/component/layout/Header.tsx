import React, { useEffect, useRef, useState } from 'react';
import logo from '../../asset/image/logo.png';
import profile from '../../asset/image/profile.png';
import styled from 'styled-components';
import { User } from '../../model';
import Button from '../common/Button';
import { useHistory } from 'react-router';

import {ReactComponent as LogoSvg} from '../../asset/image/icons/logo.svg';

export type hasUserProps = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const Header: React.FC<hasUserProps> = ({ user, setUser }) => {
	const [isOpenModal, setOpenModal] = useState(false);
    const profileModal = useRef<HTMLDivElement>(null);
	const history = useHistory();

	const onClickProfile = () => {
		setOpenModal((prev) => !prev);
	};
    
	const handleCloseModal = (e: MouseEvent) => {
		if (isOpenModal && !profileModal.current?.contains(e.target as Node)) {
			setOpenModal(false);
		}
	}
	const onClickLogoutButton = () => {
		fetch('/logout', {
			method: 'POST',
			credentials: 'include'
		})
		.then((res) => {
			if (res.ok) {
				setUser(null);
				localStorage.removeItem('user');
				history.push('/login');
				return;
			}
			throw new Error(res.status.toString());
		})
		.catch((err) => {
			console.error(err);
		})
	}
    
	useEffect(() => {
		window.addEventListener('click', handleCloseModal);
		return () => {
			window.removeEventListener('click', handleCloseModal)
		}
	}, [isOpenModal]);

	return (
		<HeaderSection>
			<Logo>
                <LogoImage src={logo} />
            </Logo>
			<ProfileBox show={!!user}>
				<Profile src={profile} onClick={onClickProfile} />
				{isOpenModal && (
					<ProfileModal ref={profileModal}>
						<UserNameBox> 
							<ProfileLogo />
							<UserName> {user?.loginId}</UserName>
						</UserNameBox>
						<LogoutButton onClick={onClickLogoutButton}> 로그아웃 </LogoutButton>
					</ProfileModal>
				)}
			</ProfileBox>
		</HeaderSection>
	);
};

const HeaderSection = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: ${(props) => props.theme.HeaderHeight};
	background-color: #282828;
    padding: 10px 20px;
`;

const Logo = styled.div`
    display: flex;
    flex-direction: row;
`;
const LogoImage = styled.img``;

const ProfileBox = styled.div<{ show: boolean }>`
	visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
	position: relative;
    display: flex;
    flex-direction: row;
    padding: 5px;
`;
const Profile = styled.img`
    cursor: pointer;
`;
const ProfileModal = styled.div`
	position: absolute;
    top: 150%;
    right: 0;
    
    border: 1px solid ${(props) => props.theme.color.Line};
    border-radius: 8px;
    background-color: ${(props) => props.theme.color.PrimaryBG};
    box-shadow: 5px 3px 5px grey;
    
    padding: 20px 50px;
    text-align: center;
`;
const UserNameBox = styled.div`
	display: flex;
	margin-bottom: 5px;
`;
const ProfileLogo = styled(LogoSvg)`
	width: 40px;
	margin-right: 10px;
`;
const UserName = styled.p`
    font-size: ${props => props.theme.fontSize.Title};
`;
const LogoutButton = styled(Button)`
    background-color: ${(props) => props.theme.color.Primary};
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.3);
    color: white;
    padding: 10px;
    border: none;
    border-radius: 10px;
    box-shadow: 3px 1px 3px grey;
    
    font-size: 16px;
    font-weight: bold;
`;

export default Header;
