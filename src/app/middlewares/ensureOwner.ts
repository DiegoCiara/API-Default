import { NextFunction, Request, Response } from 'express';
import User from '@entities/User';

export async function ensureOwner(req: Request, res: Response, next: NextFunction): Promise<Response | any> {
  try {
    const tokenId = req.userId;
    const paramsId = req.params.id;

    const user = await User.findOneOrFail(tokenId);

    if (user.id !== paramsId ) {
      return res.status(403).json({ message: 'You are not authorized' })
    } else {
      if (next) return next();
    }
    
    if (next) return next();
  } catch (error) {
    return res.status(404).json({ message: 'Bad request' })
  }
}
