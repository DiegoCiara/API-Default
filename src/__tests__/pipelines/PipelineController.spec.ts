import { mocks } from '../__mocks__/dataMock';
import connection from '../__mocks__/mockConnection';
import request from 'supertest';
import app from '@src/app';
import { AuthMock } from '../__mocks__/mockAuth';
import { v4 } from 'uuid';
import Pipeline from '@entities/Pipeline';
import Chance from 'chance';
const chance = new Chance();

describe('Pipeline Controller', () => {
  let env;
  beforeAll(async () => {
    await connection.create();
    env = await mocks();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe('get pipelines', () => {
    it('should be get 401', async () => {
      await request(app)
        .get('/pipeline')
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get pipelines with Seller', async () => {
      await request(app)
        .get('/pipeline')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should be get pipelines with Admin', async () => {
      await request(app)
        .get('/pipeline')
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });
  });

  describe('get pipeline by id', () => {
    it('should be get 401', async () => {
      const pipeline = await Pipeline.create({
        name: chance.name(),
      }).save();

      await request(app)
        .get(`/pipeline/${pipeline.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get pipeline ById with Seller', async () => {
      const pipeline = await Pipeline.create({
        name: chance.name(),
      }).save();

      await request(app)
        .get(`/pipeline/${pipeline.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toBe(pipeline.id);
          expect(res.body.name).toBe(pipeline.name);
        });
    });

    it('should be get pipelineById with Admin', async () => {
      const pipeline = await Pipeline.create({
        name: chance.name(),
      }).save();

      await request(app)
        .get(`/pipeline/${pipeline.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toBe(pipeline.id);
          expect(res.body.name).toBe(pipeline.name);
        });
    });
  });

  describe('create pipeline', () => {
    it('should be get 401', async () => {
      await request(app)
        .post('/pipeline')
        .send()
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should not be create a pipeline', async () => {
      const pipeline = null;

      await request(app)
        .post('/pipeline')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .send(pipeline)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Invalid value for pipeline');
        });
    });

    it('should be create a pipeline', async () => {
      const pipeline = {
        name: chance.name(),
      };

      await request(app)
        .post('/pipeline')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .send(pipeline)
        .then((res) => {
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should not be create a pipeline with duplicate credentials', async () => {
      
      await request(app)
        .post('/pipeline')
        .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
        .send({ name: env.pipeline.name })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBe('Pipeline already exists');
        });
    });
  });

  describe('update pipeline', () => {
    it('should be get 401 - No Token provided', async () => {
      await request(app)
        .put(`/pipeline/${null}`)
        .send()
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get 404 - Update failed, try again', async () => {
      await request(app)
        .put(`/pipeline/${null}`)
        .send()
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.error).toBe('Update failed, try again');
        });
    });

    it('should be get 404 - Pipeline does not exist', async () => {
      await request(app)
        .put(`/pipeline/${v4()}`)
        .send()
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Pipeline does not exist');
        });
    });

    it('should be get 200 - Pipeline updated successfully', async () => {
      const pipeline = await Pipeline.create({
        name: chance.name(),
      }).save();

      const pipelineUpdated = {
        name: chance.name(),
      };

      await request(app)
        .put(`/pipeline/${pipeline.id}`)
        .send(pipelineUpdated)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Pipeline updated successfully');
        });

      const pipelineFind = await Pipeline.findOne(pipeline.id);
      expect(pipelineFind.name).toBe(pipelineUpdated.name);
    });
  });

  describe('delete pipeline', () => {
    it('should be get 401 - No Token provided', async () => {
      await request(app)
        .delete(`/pipeline/${env.pipeline.id}`)
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe('No Token provided');
        });
    });

    it('should be get 404 - Remove failed, try again', async () => {
      await request(app)
        .delete(`/pipeline/${null}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.error).toBe('Remove failed, try again');
        });
    });

    it('should be get 404 - Pipeline does not exist', async () => {
      await request(app)
        .delete(`/pipeline/${v4()}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toBe('Pipeline does not exist');
        });
    });

    it('should be get 200 - Pipeline deleted successfully', async () => {
      const pipeline = await Pipeline.create({
        name: chance.name(),
      }).save();

      await request(app)
        .delete(`/pipeline/${pipeline.id}`)
        .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Pipeline deleted successfully');
        });

      const userFind = await Pipeline.findOne(pipeline.id);
      expect(userFind).toBeUndefined();

      const pipelineFindWithDeleted = await Pipeline.findOne(pipeline.id, { withDeleted: true });
      expect(pipelineFindWithDeleted.id).toBe(pipeline.id);
      expect(pipelineFindWithDeleted).not.toBeUndefined();
      expect(pipelineFindWithDeleted.deletedAt).not.toBeNull();
    });
  });
});
