import MemberAuthController from '@controllers/MemberAuthController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';
import Router from 'express';

const routes = Router();

routes.post('/authenticate', MemberAuthController.authenticate);
routes.post('/forgot-password', MemberAuthController.forgotPassword);
routes.put('/reset-password', MemberAuthController.resetPassword);

routes.get('/faw1efawe3f14aw8es3v6awer51xx3/check', ensureAuthenticated, (req,res) => res.status(200).send());

export default routes;
