import { mocks } from '../__mocks__/dataMock';
import connection from '../__mocks__/mockConnection';
import request from 'supertest';
import app from '@src/app';
import { AuthMock } from '../__mocks__/mockAuth';
import { v4 } from 'uuid';
import Chance from 'chance';
import Contact from '@entities/Contact';
const chance = new Chance();

describe('Contact Controller', () => {
    let env;
    beforeAll(async () => {
      await connection.create();
      env = await mocks();
    });
  
    afterAll(async () => {
      await connection.clear();
      await connection.close();
    });

    describe('get contacts', () => {
        it('should be get 401', async () => {
          await request(app)
            .get('/contact')
            .then((res) => {
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('No Token provided');
            });
        });
    
        it('should be get contacts with Seller', async () => {
          await request(app)
            .get('/contact')
            .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body[0]).toHaveProperty('id');
              expect(res.body[0]).toHaveProperty('name');
              expect(res.body[0]).toHaveProperty('email');
              expect(res.body[0]).toHaveProperty('phone');
              expect(res.body[0]).toHaveProperty('city');
              expect(res.body[0]).toHaveProperty('state');
              expect(res.body[0]).toHaveProperty('picture');
            });
        });

        it('should be get contacts with Admin', async () => {
            await request(app)
              .get('/contact')
              .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
              .then((res) => {
                expect(res.status).toBe(200);
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('name');
                expect(res.body[0]).toHaveProperty('email');
                expect(res.body[0]).toHaveProperty('phone');
                expect(res.body[0]).toHaveProperty('city');
                expect(res.body[0]).toHaveProperty('state');
                expect(res.body[0]).toHaveProperty('picture')
              });
          });
        });
      
        describe('get contact by id', () => {
          it('should be get 401', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
            }).save();
      
            await request(app)
              .get(`/contact/${contact.id}`)
              .then((res) => {
                expect(res.status).toBe(401);
                expect(res.body.message).toBe('No Token provided');
              });
          });
      
          it('should be get contact ById with Seller', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
            }).save();

            await request(app)
             .get(`/contact/${contact.id}`)
             .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
             .then((res) => {
               expect(res.status).toBe(200);
               expect(res.body).toHaveProperty('id');
               expect(res.body).toHaveProperty('name');
               expect(res.body).toHaveProperty('email');
               expect(res.body).toHaveProperty('phone');
               expect(res.body).toHaveProperty('city');
               expect(res.body).toHaveProperty('state');
               expect(res.body).toHaveProperty('picture');
               expect(res.body).toHaveProperty('createdAt');
               expect(res.body).toHaveProperty('updatedAt');
               expect(res.body).toHaveProperty('deletedAt');

             });
    });

    it('should be get contactById with Admin', async () => {
        const contact = await Contact.create({
          name: chance.name(),
          email: chance.email(),
          phone: chance.phone(),
          city: chance.city(),
          state: chance.state(),
          picture: chance.avatar(),
        }).save();
  
        await request(app)
          .get(`/contact/${contact.id}`)
          .set('authorization', 'Bearer ' + AuthMock(env.userAdmin.email, env.userAdmin.id))
          .then((res) => {
            //console.log(res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('phone');
            expect(res.body).toHaveProperty('city');
            expect(res.body).toHaveProperty('state');
            expect(res.body).toHaveProperty('picture');
          });
      });
    });

    describe('create contact', () => {
        it('should be get 401', async () => {
          await request(app)
            .post('/contact')
            .send()
            .then((res) => {
              expect(res.status).toBe(401);
              expect(res.body.message).toBe('No Token provided');
            });
        });
    
        it('should not be create a contact', async () => {
          const contact = {
            email: chance.email(),
            phone: chance.phone(),
            city: chance.city(),
            state: chance.state(),
            picture: chance.avatar(),
            product: env.product,
          };
    
          await request(app)
            .post('/contact')
            .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
            .send(contact)
            .then((res) => {
              expect(res.status).toBe(400);
              expect(res.body.message).toBe('Invalid values for contacts');
            });
        });

        it('should be create a contact', async () => {
            const contact = {
              name: chance.name(),
              email: chance.email(),
              product: env.product,
            };
            await request(app)
              .post('/contact')
              .set('authorization', 'Bearer ' + AuthMock(env.userSeller.email, env.userSeller.id))
              .send(contact)
              .then((res) => {
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty('id');
              });
          });
        });
      
        describe('update contact', () => {
          it('should be get 401 - No Token provided', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            }).save();
      
            const contactUpdated = {
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            };
      
            await request(app)
              .put(`/product/${contact.id}`)
              .send(contactUpdated)
              .then((res) => {
                expect(res.status).toBe(401);
                expect(res.body.message).toBe('No Token provided');
              });
          });
      
          it('should be get 404 - Update failed, try again', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            }).save();
      
            const contactUpdated = {
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            };
      
            await request(app)
              .put(`/contact/${null}`)
              .send(contactUpdated)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(404);
                expect(res.body.error).toBe('Update failed, try again');
              });
          });
      
          it('should be get 404 - Contact does not exist', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            }).save();
      
            const contactUpdated = {
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            };
      
            await request(app)
              .put(`/contact/${v4()}`)
              .send(contactUpdated)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(404);
                expect(res.body.message).toBe('Cannot find contact');
              });
          });
      
          it('should be get 200 - Contact updated successfully', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            }).save();
      
            const contactUpdated = {
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
              product: env.product,
            };
      
            await request(app)
              .put(`/contact/${contact.id}`)
              .send(contactUpdated)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(200);
              });
      
            const contactFind = await Contact.findOne(contact.id);
      
            expect(contactFind.name).toBe(contactUpdated.name);
            expect(contactFind.email).toBe(contactUpdated.email);
            expect(contactFind.phone).toBe(contactUpdated.phone);
            expect(contactFind.city).toBe(contactUpdated.city);
            expect(contactFind.state).toBe(contactUpdated.state);
            expect(contactFind.picture).toBe(contactUpdated.picture);
          });
        });
      
        describe('delete contact', () => {
          it('should be get 401 - No Token provided', async () => {
            await request(app)
              .delete(`/contact/${env.userSeller.id}`)
              .then((res) => {
                expect(res.status).toBe(401);
                expect(res.body.message).toBe('No Token provided');
              });
          });
      
          it('should be get 404 - Update failed, try again', async () => {
            await request(app)
              .put(`/contact/${null}`)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(404);
                expect(res.body.error).toBe('Update failed, try again');
              });
          });
      
          it('should be get 404 - Cannot find contact', async () => {
            await request(app)
              .delete(`/contact/${v4()}`)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(404);
                expect(res.body.message).toBe('Contact does not exist');
              });
          });
      
          it('should be get 200 - Contact deleted successfully', async () => {
            const contact = await Contact.create({
              name: chance.name(),
              email: chance.email(),
              phone: chance.phone(),
              city: chance.city(),
              state: chance.state(),
              picture: chance.avatar(),
            }).save();
      
            await request(app)
              .delete(`/contact/${contact.id}`)
              .set('authorization', 'Bearer ' + AuthMock(env.otherUserSeller.email, env.otherUserSeller.id))
              .then((res) => {
                expect(res.status).toBe(200);
              });
      
            const userFind = await Contact.findOne(contact.id);
            expect(userFind).toBeUndefined();
      
            const contactFindWithDeleted = await Contact.findOne(contact.id, { withDeleted: true });
            expect(contactFindWithDeleted.id).toBe(contact.id);
            expect(contactFindWithDeleted).not.toBeUndefined();
            expect(contactFindWithDeleted.deletedAt).not.toBeNull();
          });
        });
      });
  