import Router from 'express';
import MemberController from '@controllers/MemberController';
import { ensureAdmin } from '@middlewares/ensureAdmin';
import { ensureOwner } from '@middlewares/ensureOwner';
import { ensureAdminOrOwner } from '@middlewares/ensureAdminOrOwner';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/', ensureAuthenticated, ensureAdmin, MemberController.findMembers);
routes.get('/:id', ensureAuthenticated, ensureAdminOrOwner, MemberController.findMemberById);
routes.put('/:id', ensureAuthenticated, ensureAdminOrOwner, MemberController.update);
routes.put('/update-password/:id', ensureAuthenticated, ensureOwner, MemberController.passwordUpdate);
routes.post('/', ensureAuthenticated, ensureAdmin, MemberController.create);
routes.delete('/:id', ensureAuthenticated, ensureAdmin, MemberController.delete);

export default routes;
