import { mocks } from '../__mocks__/dataMock';
import connection from '../__mocks__/mockConnection';
import request from 'supertest';
import app from '@src/app';
import { AuthMock } from '../__mocks__/mockAuth';
import { v4 } from 'uuid';
import Product from '@entities/Product';
import Chance from 'chance';
const chance = new Chance();

describe('Product Controller', () => {
  let env;
  beforeAll(async () => {
    await connection.create();
    env = await mocks();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe('get companies', () => {
    it('should be get 401', async () => {
      await request(app)
        .get('/product')
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get companies with Seller', async () => {
      await request(app)
        .get('/product')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('country');
          expect(res.body[0]).toHaveProperty('state');
          expect(res.body[0]).toHaveProperty('city');
          expect(res.body[0]).toHaveProperty('site');
          expect(res.body[0]).toHaveProperty('picture');
        });
    });

    it('should be get companies with Admin', async () => {
      await request(app)
        .get('/product')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('country');
          expect(res.body[0]).toHaveProperty('state');
          expect(res.body[0]).toHaveProperty('city');
          expect(res.body[0]).toHaveProperty('site');
          expect(res.body[0]).toHaveProperty('picture');
        });
    });
  });

  describe('get product by id', () => {
    it('should be get 401', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      await request(app)
        .get(`/product/${product.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get productById with Seller', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      await request(app)
        .get(`/product/${product.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('country');
          expect(res.body).toHaveProperty('state');
          expect(res.body).toHaveProperty('city');
          expect(res.body).toHaveProperty('site');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          expect(res.body).toHaveProperty('deletedAt');
        });
    });

    it('should be get productById with Admin', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      await request(app)
        .get(`/product/${product.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('country');
          expect(res.body).toHaveProperty('state');
          expect(res.body).toHaveProperty('city');
          expect(res.body).toHaveProperty('site');
          expect(res.body).toHaveProperty('picture');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          expect(res.body).toHaveProperty('deletedAt');
        });
    });
  });

  describe('create product', () => {
    it('should be get 401', async () => {
      await request(app)
        .post('/product')
        .send()
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should not be create a product', async () => {
      const product = {
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      };

      await request(app)
        .post('/product')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .send(product)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid product name');
        });
    });

    it('should be create a product', async () => {
      const product = {
        name: chance.name(),
      };
      await request(app)
        .post('/product')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .send(product)
        .then((res) => {
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('id');
        });
    });
  });

  describe('update product', () => {
    it('should be get 401 - No Token provided', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      const productUpdated = {
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      };

      await request(app)
        .put(`/product/${product.id}`)
        .send(productUpdated)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get 404 - Update failed, try again', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      const productUpdated = {
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      };

      await request(app)
        .put(`/product/${null}`)
        .send(productUpdated)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.error).toBe('Update failed, try again');
        });
    });

    it('should be get 404 - Product does not exist', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      const productUpdated = {
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      };

      await request(app)
        .put(`/product/${v4()}`)
        .send(productUpdated)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Product does not exist');
        });
    });

    it('should be get 200 - Product updated successfully', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      const productUpdated = {
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      };

      await request(app)
        .put(`/product/${product.id}`)
        .send(productUpdated)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Product updated successfully');
        });

      const productFind = await Product.findOne(product.id);

      expect(productFind.name).toBe(productUpdated.name);
      expect(productFind.country).toBe(productUpdated.country);
      expect(productFind.state).toBe(productUpdated.state);
      expect(productFind.city).toBe(productUpdated.city);
      expect(productFind.site).toBe(productUpdated.site);
      expect(productFind.picture).toBe(productUpdated.picture);
    });
  });

  describe('delete product', () => {
    it('should be get 401 - No Token provided', async () => {
      await request(app)
        .delete(`/product/${env.userSeller.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get 404 - Update failed, try again', async () => {
      await request(app)
        .put(`/product/${null}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.error).toBe('Update failed, try again');
        });
    });

    it('should be get 404 - Cannot find product', async () => {
      await request(app)
        .delete(`/product/${v4()}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Cannot find product');
        });
    });

    it('should be get 200 - Product deleted successfully', async () => {
      const product = await Product.create({
        name: chance.name(),
        country: chance.country(),
        state: chance.state(),
        city: chance.city(),
        site: chance.string(),
        picture: chance.avatar(),
      }).save();

      await request(app)
        .delete(`/product/${product.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Product deleted successfully');
        });

      const userFind = await Product.findOne(product.id);
      expect(userFind).toBeUndefined();

      const productFindWithDeleted = await Product.findOne(product.id, { withDeleted: true });
      expect(productFindWithDeleted.id).toBe(product.id);
      expect(productFindWithDeleted).not.toBeUndefined();
      expect(productFindWithDeleted.deletedAt).not.toBeNull();
    });
  });
});
