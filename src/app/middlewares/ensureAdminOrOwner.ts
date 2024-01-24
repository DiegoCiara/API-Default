import { NextFunction, Request, Response } from 'express';
import User from '@entities/User';

export async function ensureAdminOrOwner(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const tokenId = req.userId;
    const paramsId = req.params.id;
  
    const user = await User.findOne(tokenId);
  
    if (!user) return res.status(404).json({ message: 'User not found'})
  
    if (user.role !== 'ADMIN') {
      if (paramsId !== tokenId ) {
        return res.status(403).json({ message: 'You are not authorized' })
      } else {
        if (next) return next();
      }
    }
  
    if (next) return next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal error, try again'})
  }
}
