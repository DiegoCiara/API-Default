import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';
import Router from 'express';
import MemberAuthRoutes from './memberauth.routes';
import AuthRoutes from './auth.routes';
import ProductRoutes from './product.routes';
import MemberRoutes from './member.routes';
import UserRoutes from './user.routes';

const routes = Router();

routes.get('/', (req, res) => {
  res.json({ API: 'Terceiro Semetre' });
});

// prefix
routes.use('/member-auth', MemberAuthRoutes);
routes.use('/auth', AuthRoutes);
routes.use('/user', UserRoutes);
routes.use('/member', MemberRoutes);
routes.use('/product', ProductRoutes); 

export default routes;
