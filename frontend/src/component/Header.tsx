import React from 'react';
import logo from "../asset/image/logo.png";
import profile from "../asset/image/profile.png";
import { hasUserProps } from '../Router';
import styled from "styled-components";

const Header: React.FC<hasUserProps> = ({name})=>{
    return (
        <HeaderSection>
            <Logo src={logo}></Logo>
            <Profile src={profile} style={{visibility: name ? 'visible' : 'hidden'}}></Profile>
        </HeaderSection>
    )
}

const HeaderSection = styled.div`
    width: 100%;
    height: 60px;
    background-color: #282828;
`;

const Logo = styled.img`
    width: auto;
    height: 80%;
    margin: 6px 10px 6px 10px;
`;
const Profile = styled.img`
    margin: 6px 10px 6px 10px;
`;
export default Header;