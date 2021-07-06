import knex from '../database/connection';
import {Request, Response} from 'express';

class ItemsController {
	async index (request: Request, response: Response) {
		const items = await knex('items').select('*');
	
		const serializedItems = items.map(item => {
			return {
				id: item.id,
				title: item.title,
				image_url: `http://localhost:3333/uploads/${item.image}`
			};
		});

		return response.json(serializedItems);
	}

	async getItemFromPoint(request: Request, response: Response) {
		const {id} = request.params;
		const items = await knex('point_items').where('point_id', id).select('item_id');
		return response.json(items);
	}
}

export default ItemsController;