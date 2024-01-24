import User from '@entities/User';
import bcrypt from 'bcryptjs';
import Chance from 'chance';
import request from 'supertest';
import app from '../../app';
import { mocks } from '../__mocks__/dataMock';
import connection from '../__mocks__/mockConnection';
const chance = new Chance();

describe('Auth Controller', () => {
  let env;
  beforeAll(async () => {
    await connection.create();
    env = await mocks();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe('authenticate', () => {
    it('Should be get 400 - without credentials', async () => {
      await request(app)
        .post('/auth/authenticate')
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User');
        });
    });

    it('Should be get 400 - without email', async () => {
      await request(app)
        .post('/auth/authenticate')
        .send({ email: chance.email() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User');
        });
    });

    it('Should be get 400 - without password', async () => {
      await request(app)
        .post('/auth/authenticate')
        .send({ password: chance.hash() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User');
        });
    });

    it('Should be get 400 - Invalid email', async () => {
      await request(app)
        .post('/auth/authenticate')
        .send({ password: chance.hash(), email: chance.email() })
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Invalid email or password');
        });
    });

    it('Should be authenticate', async () => {
      await request(app)
        .post('/auth/authenticate')
        .send({ password: 'password', email: env.userSeller.email })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });
  });

  describe('forgotPassword', () => {
    it('Should be get 400 - without email', async () => {
      await request(app)
        .post('/auth/forgot-password')
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for forgot password');
        });
    });

    it('Should be get 400 - without valid email', async () => {
      await request(app)
        .post('/auth/forgot-password')
        .send({ email: chance.email() })
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Invalid values for forgot password');
        });
    });

    it('Should be send mail and update user', async () => {
      const user = await User.create({
        name: chance.name(),
        email: chance.email(),
        passwordHash: chance.hash(),
      }).save();

      const userFindBefore = await User.findOne(user.id);
      expect(userFindBefore.passwordResetToken).toBeNull();
      expect(userFindBefore.passwordResetExpires).toBeNull();

      await request(app)
        .post('/auth/forgot-password')
        .send({ email: user.email })
        .then((res) => {
          expect(res.status).not.toBe(400);
          expect(res.body.message).not.toBe('Cannot send forgot password email');
        });

      const userFindAfter = await User.findOne(user.id);
      expect(userFindAfter.passwordResetToken).not.toBeNull();
      expect(userFindAfter.passwordResetExpires).not.toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('Should be get 400 - without email', async () => {
      await request(app)
        .put('/auth/reset-password')
        .send({ password: chance.hash(), token: chance.hash() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User reset password');
        });
    });

    it('Should be get 400 - without password', async () => {
      await request(app)
        .put('/auth/reset-password')
        .send({ email: chance.email(), token: chance.hash() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User reset password');
        });
    });

    it('Should be get 400 - without token', async () => {
      await request(app)
        .put('/auth/reset-password')
        .send({ email: chance.email(), password: chance.hash() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for User reset password');
        });
    });

    it('Should be get 400 - token invalid', async () => {
      await request(app)
        .put('/auth/reset-password')
        .send({ email: env.userSeller.email, password: chance.hash(), token: chance.hash() })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Token is invalid');
        });
    });

    it('Should be get 400 - token expired', async () => {
      const date = new Date().setDate(new Date().getDate() - 1);
      const user = await User.create({
        name: chance.name(),
        email: chance.email(),
        passwordHash: chance.hash(),
        passwordResetToken: chance.hash(),
        passwordResetExpires: new Date(date),
      }).save();

      await request(app)
        .put('/auth/reset-password')
        .send({ email: user.email, password: chance.hash(), token: user.passwordResetToken })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Token expired');
        });
    });

    it('Should be reset password', async () => {
      const password = chance.hash();
      const date = new Date().setDate(new Date().getDate() + 1);

      const user = await User.create({
        name: chance.name(),
        email: chance.email(),
        passwordHash: chance.hash(),
        passwordResetToken: chance.hash(),
        passwordResetExpires: new Date(date),
      }).save();

      const userFindBefore = await User.findOne(user.id);
      expect(userFindBefore.passwordHash).toBe(user.passwordHash);
      expect(userFindBefore.passwordResetToken).toBe(user.passwordResetToken);
      expect(userFindBefore.passwordResetExpires).toStrictEqual(user.passwordResetExpires);

      await request(app)
        .put('/auth/reset-password')
        .send({ email: user.email, password: password, token: user.passwordResetToken })
        .then((res) => {
          expect(res.status).toBe(200);
        });

      const userFindAfter = await User.findOne(user.id);
      expect(userFindAfter.passwordResetToken).toBeNull();
      expect(await bcrypt.compare(password, userFindAfter.passwordHash)).toEqual(true);
    });
  });
});
