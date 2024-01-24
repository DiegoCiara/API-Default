import ProductController from '@controllers/ProductController'
import Router from 'express';

const routes = Router();

routes.get('/', ProductController.findAll);
routes.get('/:id', ProductController.findById);
routes.post('/', ProductController.create);
routes.put('/:id', ProductController.update);
routes.delete('/:id', ProductController.delete);

export default routes;
