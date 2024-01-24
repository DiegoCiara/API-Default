import User from '@entities/User';
import Chance from 'chance';
import request from 'supertest';
import { v4 } from 'uuid';
import app from '../../app';
import { mocks } from '../__mocks__/dataMock';
import { AuthMock } from '../__mocks__/mockAuth';
import connection from '../__mocks__/mockConnection';
const chance = new Chance();

describe('User Controller', () => {
  let env;
  beforeAll(async () => {
    await connection.create();
    env = await mocks();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe('get user', () => {
    it('Should be get 401', async () => {
      await request(app)
        .get('/user')
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('Should be get 403', async () => {
      await request(app)
        .get('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.message).toBe('You are not authorized');
        });
    });

    it('Should be get users', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(201);
        });

      await request(app)
        .get('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('role');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('picture');
          expect(res.body[0]).not.toHaveProperty('passwordHash');
        });
    });
  });

  describe('get user by id', () => {
    it('Should be get 401', async () => {
      await request(app)
        .get(`/user/${env.userSeller.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('Should be get userById with Admin', async () => {
      await request(app)
        .get(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toEqual(env.userSeller.id);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('Should be get userById with owner and admin', async () => {
      await request(app)
        .get(`/user/${env.userAdmin.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toEqual(env.userAdmin.id);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('Should be get userById with owner', async () => {
      await request(app)
        .get(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toEqual(env.userSeller.id);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('Should not be get userById', async () => {
      await request(app)
        .get(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body).not.toHaveProperty('id');
          expect(res.body.message).toBe('You are not authorized');
        });
    });
  });

  describe('create user', () => {
    it('Should be get 401', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .send(user)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('Should be get 403', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .send(user)
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.message).toBe('You are not authorized');
        });
    });

    it('Should be create user with role SELLER', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'SELLER',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(201);
        });
    });
    it('Should be create user with role ADMIN', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(201);
        });
    });

    it('Should not be create user - without name', async () => {
      const user = {
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for new User!');
        });
    });

    it('Should not be create user - without email', async () => {
      const user = {
        name: 'foo',
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid values for new User!');
        });
    });

    it('Should not be create user - user exists', async () => {
      const user = {
        name: 'foo',
        email: `${v4()}@foo.com`,
        role: 'ADMIN',
      };

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user);

      await request(app)
        .post('/user')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .send(user)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('User already exists');
        });
    });
  });

  describe('update user', () => {
    it('Should be get 401', async () => {
      await request(app)
        .put(`/user/${env.userSeller.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('Should be get 403', async () => {
      await request(app)
        .put(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.message).toBe('You are not authorized');
        });
    });

    it('Should be update user with admin', async () => {
      const user = await User.create({
        name: chance.name(),
        email: chance.email(),
        picture: chance.avatar(),
        passwordHash: chance.hash(),
      }).save();
      
      const userUpdated = {
        role: 'ADMIN',
        name: chance.name(),
        email: chance.email(),
        picture: v4(),
      };

      await request(app)
        .put(`/user/${user.id}`)
        .send(userUpdated)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
        });

      const userFind = await User.findOne(user.id);

      expect(userFind.role).toBe(userUpdated.role);
      expect(userFind.email).toBe(userUpdated.email);
      expect(userFind.name).not.toBe(userUpdated.name);
      expect(userFind.picture).not.toBe(userUpdated.picture);
    });

    it('Should be update user with Owner', async () => {
      const user = await User.create({
        name: chance.name(),
        email: chance.email(),
        picture: chance.avatar(),
        passwordHash: chance.hash(),
      }).save();
      
      const userUpdated = {
        role: 'ADMIN',
        name: chance.name(),
        email: chance.email(),
        picture: v4(),
      };

      await request(app)
        .put(`/user/${user.id}`)
        .send(userUpdated)
        .set('authorization', 'Bearer ' + AuthMock(user.email, user.id))
        .then((res) => {
          expect(res.status).toBe(200);
        });

      const userFind = await User.findOne(user.id);

      expect(userFind.name).toBe(userUpdated.name);
      expect(userFind.email).toBe(userUpdated.email);
      expect(userFind.role).not.toBe(userUpdated.role);
      expect(userFind.picture).toBe(userUpdated.picture);
    });

    it('Should be update user with Owner and Admin', async () => {
      const user = await User.create({
        role: 'ADMIN',
        name: chance.name(),
        email: chance.email(),
        picture: chance.avatar(),
        passwordHash: chance.hash(),
      }).save();
      
      const userUpdated = {
        role: 'SELLER',
        name: chance.name(),
        email: chance.email(),
        picture: v4(),
      };

      await request(app)
        .put(`/user/${user.id}`)
        .send(userUpdated)
        .set('authorization', 'Bearer ' + AuthMock(user.email, user.id))
        .then((res) => {
          expect(res.status).toBe(200);
        });

      const userFind = await User.findOne(user.id);

      expect(userFind.role).toBe(userUpdated.role);
      expect(userFind.name).toBe(userUpdated.name);
      expect(userFind.email).toBe(userUpdated.email);
      expect(userFind.picture).toBe(userUpdated.picture);
    });
  });

  describe('delete user', () => {
    it('Should be get 401', async () => {
      await request(app)
        .delete(`/user/${env.userSeller.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('Should be get 403 with owner', async () => {
      await request(app)
        .delete(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.message).toBe('You are not authorized');
        });
    });

    it('Should be get 403 with other user', async () => {
      await request(app)
        .delete(`/user/${env.userSeller.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.message).toBe('You are not authorized');
        });
    });

    it('Should not be delete user withoud a valid id', async () => {
      await request(app)
        .delete(`/user/${v4()}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Cannot find user');
        });
    });

    it('Should be delete user', async () => {
      const user = await User.create({
        email: chance.email(),
        passwordHash: chance.hash(),
        name: chance.name(),
        picture: chance.avatar(),
      }).save();

      await request(app)
        .delete(`/user/${user.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
        });

      // buscando usuário deletado nos usuário ativos;
      const userFind = await User.findOne(user.id);
      expect(userFind).toBeUndefined();

      // buscando usuário deletado nos usuários deletados;
      const userFindWithDeleted = await User.findOne(user.id, {withDeleted: true});
      expect(userFindWithDeleted.id).toBe(user.id);
      expect(userFindWithDeleted).not.toBeUndefined();
      expect(userFindWithDeleted.deletedAt).not.toBeNull();
    });
  });
});
