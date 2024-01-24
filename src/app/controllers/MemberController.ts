import Companies from '@entities/Product';
import Member from '@entities/Member';
import { BodyData, Client } from '@src/client';
import transport from '@src/modules/mailer';
import emailValidator from '@utils/emailValidator';
import generatePassword from '@utils/generatePassword';
import queryBuilder from '@utils/queryBuilder';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

interface MemberInterface {
  name?: string;
  email?: string;
  status?: string;
	theme?: string;
  token?: string;
  picture?: string;
  password?: string;
  product?: Companies;
}

class MemberController {
  public async findMembers(req: Request, res: Response): Promise<Response> {
    try {
      const members = (await Member.find(queryBuilder(req.query))).reverse();

      members.map((member) => (member.passwordHash = undefined));

      return res.status(200).json(members);
    } catch (error) {
      return res.status(400).json({ error: 'Find members failed, try again' });
    }
  }

  public async findMemberById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const member = await Member.findOne(id, queryBuilder(req.query));
      
      if (!member) return res.status(404).json({ message: 'Member not exist' });

      member.passwordHash = undefined;

      return res.status(200).json(member);
    } catch (error) {      
      return res.status(400).json({ error: 'Find member failed, try again' });
    }
  } 

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, product, status, picture }: MemberInterface = req.body;

      if (!name || !email || !emailValidator(email)) return res.status(400).json({ message: 'Invalid values for new Member!' });

      // Member.findOne({ email }, { withDeleted: true });
      const findMember = await Member.findOne({ email });

      if (findMember) return res.status(400).json({ message: 'Member already exists' });

      const password = generatePassword();
      const client = Client.name


      const passwordHash = await bcrypt.hash(password, 10);
      // const passwordHash = "password";

      const member = await Member.create({ name, product, email, passwordHash, status, picture }).save();

      if (!member) return res.status(400).json({ message: 'Cannot create member' });

      member.passwordHash = undefined;

      const client_access = Client.client_access;
      const logo = Client.logo;
      const client_name = Client.name;
      const dark = Client.colorPlate.dark;
      const mailDomain = Client.email;

      transport.sendMail({
        to: email,
        from: mailDomain,
        subject: `${client_name}: Acesso ao aplicativo` , // assunto do email
        template: 'newMember',
        context: { name, password , logo, email, client_access, dark },
      },
      (err) => {
        if (err) console.log('Email not sent')
        transport.close();
      });


      return res.status(201).json(member.id);
    } catch (error) {
      return res.status(400).json({ error: 'Registration failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, theme, email,product, status, picture }: MemberInterface = req.body;

      if (email && !emailValidator(email)) return res.status(400).json({ message: 'Invalid email for Member!' });

      const member = await Member.findOne(id);

      if (!member) return res.status(404).json({ message: 'Cannot find member' });


      let valuesToUpdate: MemberInterface;

        //case Owner and Admin
        valuesToUpdate = {
          name: name || member.name,
          status: status || member.status,
          theme: theme || member.theme,
          email: email || member.email,
          picture: picture || member.picture,
          product: product || member.product,
        };
      await Member.update(id, { ...valuesToUpdate  });

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

      const member = await Member.findOne(id);

      if (!member) return res.status(404).json({ message: 'Cannot find member' });

      await Member.softRemove(member);

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

      const member = await Member.findOneOrFail(id);

      if (!(await bcrypt.compare(oldPassword, member.passwordHash))) return res.status(404).json({ message: 'Invalid password' });

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await Member.update(id, { passwordHash });

      return res.status(200).json();
    } catch (error) {
      return res.status(400).json({ error: 'Update password failed, ckeck values and try again' });
    }
  }
}

export default new MemberController();
