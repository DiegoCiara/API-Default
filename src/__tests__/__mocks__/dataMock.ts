import Product from '@entities/Product';
import Contact from '@entities/Contact';
import Pipeline from '@entities/Pipeline';
import Deal from '@entities/Deal';
import User from '@entities/User';
import bcrypt from 'bcryptjs';

export const mocks = async (): Promise<any> => {
  // Users
  const pass = await bcrypt.hash('password', 10);
  const userSeller = await User.create({ name: 'seller', email: 'seller@seller.com', role: 'SELLER', passwordHash: pass }).save();

  const otherUserSeller = await User.create({
    name: 'seller',
    email: 'otherSeller@otherSeller.com',
    role: 'SELLER',
    passwordHash: pass,
  }).save();

  const userAdmin = await User.create({ name: 'admin', email: 'admin@admin.com', role: 'ADMIN', passwordHash: pass }).save();

  // Product
  const product = await Product.create({
    name: 'Geniv',
    description: 'Brasil',
    state: 'MG',
    city: 'Montes Claros',
    site: "www.geniv.com.br",
    picture: "https://cdn.pixabay.com/photo/2020/05/18/16/17/social-media-5187243_1280.png",
  }).save();

  // Pipelines
  const pipeline = await Pipeline.create({
    name: 'Pipeline',
  }).save();

  // Contacts
  const contact = await Contact.create({
    name: 'Adriano Silveira',
    email: 'adriano_silveira@gmail.com',
    phone: '12987979532',
    city: 'Rio de Janeiro',
    state: 'RJ',
    picture: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_960_720.jpg',
  }).save();


  return { userSeller, otherUserSeller, userAdmin, pipeline, contact, product };
};
