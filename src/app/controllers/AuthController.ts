import User from '@entities/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import transport from '../../modules/mailer';
import { Client } from '@src/client';

interface UserInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email: string;
  password: string;
  client: string;
}

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, { expiresIn: 84600 });
}

class AuthController {
  public async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: UserInterface = req.body;

      if (!email || !password) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne({ email }, { select: ['id', 'email', 'name', 'passwordHash', 'role', 'picture'] });

      if (!user) return res.status(404).json({ message: 'Invalid email or password' });

      if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(404).json({ message: 'Invalid email or password' });

      user.passwordHash = undefined;

      return res.json({ ...user, token: generateToken({ id: user.id }) });
    } catch (error) {
      return res.status(400).json({ error: 'Authenticate failed, try again' });
    }
  }
 
  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: 'Invalid values for forgot password' });

      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid values for forgot password' });

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.
      console.log(token)

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        passwordResetToken: token,
        passwordResetExpires: now,
      });

      const client = Client.name
      transport.sendMail(
        {
          to: email,
          from: 'contato@figio.com.br',
          subject: 'Recuperação de senha', // assunto do email
          // html: { path: './src/resources/mail/forgotPassword.html' },
          template: 'forgotPassword',
          context: { client, name: user.name, token, email: user.email },
        },
        (err) => {
          if (err) return res.status(400).json({ message: 'Cannot send forgot password email' });

          transport.close();

          return res.json();
        }
      );
    } catch (error) {
      return res.status(400).json({ error: 'Forgot password failed, try again' });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, token }: UserInterface = req.body;

      if (!email || !password || !token) return res.status(400).json({ message: 'Invalid values for User reset password' });

      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid values for User reset password' });

      if (token !== user.passwordResetToken) return res.status(400).json({ message: 'Token is invalid' });

      const now = new Date();
      if (now > user.passwordResetExpires) return res.status(400).json({ message: 'Token expired' });

      const passwordHash = await bcrypt.hash(password, 10);

      await User.update(user.id, { passwordHash, passwordResetToken: undefined });

      return res.json();
    } catch (error) {
      return res.status(400).json({ error: 'Cannot reset password, try again' });
    }
  }
}

export default new AuthController();
