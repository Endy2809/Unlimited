import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select'
import { Map, Marker, TileLayer } from 'react-leaflet';
import Header from '../../components/Header';
import './styles.css';
import api from '../../services/api';
import pin_svg from '../../assets/pin.svg';
import { FiChevronDown } from 'react-icons/fi';
import HorizontalScroll from 'react-scroll-horizontal';

interface Point {
	id: number;
	image: string;
	image_url: string;
	name: string;
	latitude: number;
	longitude: number;
}

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUF {
	sigla: string;
	nome: string;
}

interface IBGECity {
	nome: string;
}

interface Item {
	id: number;
	title: string;
	image_url: string;
}

const ViewPoint = () => {
	const [filters, setFilters] = useState<boolean>(false);
	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [points, setPoints] = useState<Point[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<IBGEUF[]>([]);
	const [cities, setCities] = useState<IBGECity[]>([]);
	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState();
	const [selectedPoint, setSelectedPoint] = useState<Point>();
	const [selectedPointItems, setSelectedPointItems] = useState<number[]>();

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		});
	}, []);

	useEffect(()=>{
		axios.get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			setCities(response.data);
		})
	}, [selectedUf]);

	useEffect(()=>{
		axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			setUfs(response.data.sort((a, b) => a.nome.localeCompare(b.nome)));
		});
	}, []);
	
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const {latitude, longitude} = position.coords;
			setInitialPosition([latitude, longitude]);
		})
	}, []);

	function handleSelectedUfChange(opt: any) {
		setSelectedUf(opt.value);
	}

	function handleSelectedCityChange(opt: any) {
		setSelectedCity(opt.value);
	}
	
	function handleFilterClick() {
		setFilters(!filters);
	}

	useEffect(()=>{
		api.get('points', {
			params: {
				city: selectedCity,
				uf: selectedUf,
				items: [...selectedItems]
			}
		}).then(response => {
			setPoints(response.data);
		});
	}, [selectedItems, selectedUf, selectedCity]);

	function handleSelectItem(id: number) {
		if(selectedItems.includes(id))
		{
			setSelectedItems(() => selectedItems.filter(item => item !== id))
		} else {
			setSelectedItems([...selectedItems, id])
		}
	}

	function handlePointSelection(point: Point) {
		setSelectedPoint(point)
		api.get(`items/${point.id}`).then(response => {
			setSelectedPointItems(Array.from(response.data.map((id: {item_id: number}) => id.item_id)));
			console.log(selectedPointItems)
		});
	}

	return(
		<div>
			<Header/>
			<div className='map-overlay'>
				<div className="div-selects">
					<Select 
					className='select'
					onChange={handleSelectedUfChange}
					options={[] = ufs.map(uf => ({label: `${uf.nome} - ${uf.sigla}`, value: uf.sigla}))}
					placeholder="Selecione um estado..."
					/>
					<Select 
					className='select'
					onChange={handleSelectedCityChange}
					options={[] = cities.map(city => ({label: city.nome, value: city.nome}))}
					placeholder="Selecione uma cidade..."
					noOptionsMessage={() => "Selecione um estado antes..."}
					/>
				</div>
				{(points.length !== 0 && selectedPoint === undefined) && 
					<div className='points'>
					{
						points.map(point => (
							<div 
							key={point.id}
							onClick={() => handlePointSelection(points.find(aux => aux.id === point.id) as Point)}
							className='points-item'>
								<img src={pin_svg} />
								<span>{point.name}</span>
								<span className='points-distance'>0,0 Km</span>
							</div>
						))
					}
					</div>
				}
				{(selectedPoint !== undefined) &&
					<div className='points'>
						<div style={{margin: 15, display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center'}}>
							<img className="point-img" src={selectedPoint.image_url} alt="Imagem do Ecoponto" />
							<div className='point-selected'>
								<div className="points-item">
									<img src={pin_svg} />
									<span>{selectedPoint.name}</span>
									<span className='points-distance'>0,0 Km</span>
								</div>
								<div className="point-filters">
									{selectedPointItems?.map(item => (
										<img src={`${items[item-1].image_url}`}/>
									))}
								</div>
							</div>
						</div>
					</div>
				}
				<button className="filter-button" onClick={handleFilterClick}><span>Filtros</span><FiChevronDown/></button>
				{filters && <HorizontalScroll>
						<ul className="items-filter">
							{items.map(item => (
							<li
							key={item.id}
							onClick={() => handleSelectItem(item.id)}
							className={selectedItems.includes(item.id) ? 'selected' : ''}>
									<img src={item.image_url} alt={item.title}/>
									<span>{item.title}</span>
							</li>
					))}	</ul>
				</HorizontalScroll>}
			</div>
			<Map center={initialPosition} zoomControl={false} zoom={15} >
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
				{points.map(point => (
					<Marker
						key={String(point.id)}
						onclick={() => handlePointSelection(points.find(aux => aux.id === point.id) as Point)}
						position={[point.latitude, point.longitude,]}
					/>
					))}
			</Map>
		</div>
	)
}

export default ViewPoint;