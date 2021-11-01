import React from 'react';
import logo from "../asset/image/logo.png";

const Header: React.FC = ()=>{
    return (
        <>
            <div className="logo"><img src={logo}/></div>
            <div className="profile"></div>
        </>
    )
}

export default Header;