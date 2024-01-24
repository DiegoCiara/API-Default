import Member from '@entities/Member';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import transport from '../../modules/mailer';
import { Client } from '@src/client';

interface MemberInterface {
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

class MemberAuthController {
  public async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: MemberInterface = req.body;

      if (!email || !password) return res.status(400).json({ message: 'Invalid values for Member' });

      const user = await Member.findOne({ email }, { select: ['id', 'email', 'name', 'passwordHash', 'picture'] });

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

      const user = await Member.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid values for forgot password' });

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.
      console.log(token)

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await Member.update(user.id, {
        passwordResetToken: token,
        passwordResetExpires: now,
      });

      const client = Client.client_access
      const logo = Client.logo;
      const client_name = Client.name;
      const mailDomain = Client.email;

      transport.sendMail(
        {
          to: email,
          from: mailDomain,
          subject: `${client_name}: Recuperação de senha`, // assunto do email
          // html: { path: './src/resources/mail/forgotPassword.html' },
          template: 'forgotPassword',
          context: { client: client, logo: logo, name: user.name, token, email: user.email },
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
      const { email, password, token }: MemberInterface = req.body;

      if (!email || !password || !token) return res.status(400).json({ message: 'Invalid values for Member reset password' });

      const user = await Member.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid values for Member reset password' });

      if (token !== user.passwordResetToken) return res.status(400).json({ message: 'Token is invalid' });

      const now = new Date();
      if (now > user.passwordResetExpires) return res.status(400).json({ message: 'Token expired' });

      const passwordHash = await bcrypt.hash(password, 10);

      await Member.update(user.id, { passwordHash, passwordResetToken: undefined });

      return res.json();
    } catch (error) {
      return res.status(400).json({ error: 'Cannot reset password, try again' });
    }
  }
}

export default new MemberAuthController();
