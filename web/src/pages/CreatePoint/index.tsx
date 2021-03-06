import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { LeafletMouseEvent } from 'leaflet'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';
import Header from '../../components/Header';

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUFResponse {
	sigla: string;
	nome: string;
}

interface IBGEUFCityResponse {
	nome: string
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
	const [selectedUf, setSelectedUf] = useState('0');
	const [cities, setCities] = useState<string[]>([]);
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [selectedFile, setSelectedFile] = useState<File>();
	const [inputData, setInputData] = useState({
		name: '',
		email:'',
		whatsapp: '',
	});

	const history = useHistory()

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		});
	}, []);

	useEffect(() => {
		axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			setUfs(response.data);
		});
	}, []);
	
	useEffect(() => {
		if(selectedUf === '0') {
			return;
		}
		
		axios.get<IBGEUFCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cityNames = response.data.map(city => city.nome);
			setCities(cityNames);
		});
	}, [selectedUf]);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const {latitude, longitude} = position.coords;
			setInitialPosition([latitude, longitude]);
			setSelectedPosition([latitude, longitude]);
		})
	}, []);

	function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
		setSelectedUf(event.target.value);
	}
	
	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		setSelectedCity(event.target.value);
	}

	function handleMapClick(event: LeafletMouseEvent) {
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng
		])
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const {name, value} = event.target;

		setInputData({...inputData, [name]: value});
	}

	function handleSelectItem(id: number) {
		if(selectedItems.includes(id))
		{
			setSelectedItems(() => selectedItems.filter(item => item !== id))
		} else {
			setSelectedItems([...selectedItems, id])
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const { name, email, whatsapp } = inputData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;

		const data = new FormData();
		data.append('name', name);
		data.append('email', email);
		data.append('phone', whatsapp);
		data.append('uf', uf);
		data.append('city', city);
		data.append('latitude', String(latitude));
		data.append('longitude', String(longitude));
		data.append('items', items.join(','));

		if(selectedFile) {
			data.append('image', selectedFile);
		}

		await api.post('points', data);
		
		alert('Ponto de coleta criado.');

		history.push('/');
	}

	return (
		<>
		<Header/>
		<div id="page-create-point">
			{/* <header>
				<img src={logo} alt="Ecoleta"/>
				<Link to="/">
				<FiArrowLeft/>
				Voltar para Home
				</Link>
			</header> */}

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br/> ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input
							type="text"
							name="name"
							id="name"
							onChange={handleInputChange}
							/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="email">E-mail</label>
							<input
								type="email"
								name="email"
								id="email"
								onChange={handleInputChange}
								/>
						</div>

						<div className="field">
							<label htmlFor="whatsapp">Whatsapp</label>
							<input
								type="text"
								name="whatsapp"
								id="whatsapp"
								onChange={handleInputChange}
								/>
						</div>
					</div>
				</fieldset>

				<Dropzone onFileUploaded={setSelectedFile}/>

				<fieldset>
					<legend>
						<h2>Endere??o</h2>
						<span>Selecione o endere??o no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={15} onClick={handleMapClick}>
						<TileLayer
							attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
						<Marker position={selectedPosition}/>
					</Map>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select 
								value={selectedUf}
								onChange={handleSelectUf}
								name="uf"
								id="uf">
									<option hidden disabled value="0">Selecione um estado</option>
									{ufs.map(uf => (
										<option key={uf.sigla} value={uf.sigla}>{`${uf.sigla} - ${uf.nome}`}</option>
									))}
							</select>
						</div>

						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select
								value={selectedCity}
								onChange={handleSelectCity}
								name="city"
								id="city">
									<option disabled hidden value="0">Selecione uma cidade</option>
									{cities.map(city => (
										<option key={city} value={city}>{city}</option>
										))}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>

					<ul className="items-grid">
						{items.map(item => (
							<li
							key={item.id}
							onClick={() => handleSelectItem(item.id)}
							className={selectedItems.includes(item.id) ? 'selected' : ''}>
									<img src={item.image_url} alt={item.title}/>
									<span>{item.title}</span>
							</li>
						))}
					</ul>
				</fieldset>

				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
		</>
	);
}

export default CreatePoint;