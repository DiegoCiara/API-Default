import User from '@entities/User';
import { BodyData, Client } from '@src/client';
import transport from '@src/modules/mailer';
import emailValidator from '@utils/emailValidator';
import generatePassword from '@utils/generatePassword';
import queryBuilder from '@utils/queryBuilder';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

interface UserInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email?: string;
  password?: string;
}

class UserController {
  public async findUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = (await User.find(queryBuilder(req.query))).reverse();

      users.map((user) => (user.passwordHash = undefined));

      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: 'Find users failed, try again' });
    }
  }

  public async findUserById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const user = await User.findOne(id, queryBuilder(req.query));
      
      if (!user) return res.status(404).json({ message: 'User not exist' });

      user.passwordHash = undefined;

      return res.status(200).json(user);
    } catch (error) {      
      return res.status(400).json({ error: 'Find user failed, try again' });
    }
  } 

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, role, picture }: UserInterface = req.body;

      if (!name || !email || !emailValidator(email)) return res.status(400).json({ message: 'Invalid values for new User!' });

      // User.findOne({ email }, { withDeleted: true });
      const findUser = await User.findOne({ email });

      if (findUser) return res.status(400).json({ message: 'User already exists' });

      const password = generatePassword();

      const client_access = Client.client_access;
      const logo = BodyData.logo;
      const dark = BodyData.colorPlate.dark;


      transport.sendMail({
        to: email,
        from: 'contato@figio.com.br',
        subject: 'Body Data' , // assunto do email
        template: 'newUser',

        context: { name, password , logo, email, client_access, dark },
      },
      (err) => {
        if (err) console.log('Email not sent')

        transport.close();
      });


      const passwordHash = await bcrypt.hash(password, 10);
      // const passwordHash = "password";

      const user = await User.create({ name, email, passwordHash, role, picture }).save();

      if (!user) return res.status(400).json({ message: 'Cannot create user' });

      user.passwordHash = undefined;

      return res.status(201).json(user.id);
    } catch (error) {
      return res.status(400).json({ error: 'Registration failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const requesterId = req.userId;
      const { name, email, role, picture }: UserInterface = req.body;

      if (email && !emailValidator(email)) return res.status(400).json({ message: 'Invalid email for User!' });

      const user = await User.findOne(id);

      if (!user) return res.status(404).json({ message: 'Cannot find user' });

      const isOwner = requesterId === user.id ? true : false;

      let valuesToUpdate: UserInterface;

      if (isOwner && user.role === 'ADMIN') {
        //case Owner and Admin
        valuesToUpdate = {
          name: name || user.name,
          role: role || user.role,
          email: email || user.email,
          picture: picture || user.picture,
        };
      } else if (isOwner) {
        // case Owner
        valuesToUpdate = {
          name: name || user.name,
          email: email || user.email,
          picture: picture || user.picture,
        };
      } else {
        // case Admin;
        valuesToUpdate = {
          role: role || user.role,
          email: email || user.email,
          picture: picture || user.picture,
        };
      }

      await User.update(id, { ...valuesToUpdate });

      return res.status(200).json();
    } catch (error) {
      console.log(error)
      return res.status(400).json({ error: 'Update failed, try again' });
    }
  }
0
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const user = await User.findOne(id);

      if (!user) return res.status(404).json({ message: 'Cannot find user' });

      await User.softRemove(user);

      return res.status(200).json();
    } catch (error) {
      return res.status(400).json({ error: 'Remove failed, try again' });     
    }
  }

  public async passwordUpdate(req: Request, res: Response): Promise<Response> {
    try {
      const { oldPassword, newPassword } = req.body;
      const id = req.params.id

      if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Invalid values for update password' });

      const user = await User.findOneOrFail(id);

      if (!(await bcrypt.compare(oldPassword, user.passwordHash))) return res.status(404).json({ message: 'Invalid password' });

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await User.update(id, { passwordHash });

      return res.status(200).json();
    } catch (error) {
      return res.status(400).json({ error: 'Update password failed, ckeck values and try again' });
    }
  }
}

export default new UserController();
