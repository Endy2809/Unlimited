import React from "react";
import logo_svg from '../../assets/logo2.svg';
import './styles.css';

const Logo = () => {
	return(
		<img className='logo' src={logo_svg} alt="Meu Ecoponto"/>
	)
}

export default Logo;