import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import Logo from '../Logo'
import './styles.css';

const Header = () => {
	return(
		<nav>
			<div className='div-header'>
				<div className='div-svg'>
					<Logo/>
				</div>
				<div className='div-links'>
					<Link to='/'>
						Marketplace
					</Link>
					<Link to='/'>
						EcoPontos
					</Link>
					<Link to='/'>
						Pontuação
					</Link>
					<Link to='/'>
						Ajuda
					</Link>
				</div>
				<div className='div-return'>
					<Link to="/">
						<FiArrowLeft/>
						Voltar para Home
					</Link>
				</div>
			</div>
		</nav>
	)
}

export default Header;