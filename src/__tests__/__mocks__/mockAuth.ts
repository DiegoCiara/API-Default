import jwt from 'jsonwebtoken';

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, { expiresIn: 84600 });
}

export const AuthMock =  (email: string, id: string): string => {
  return generateToken({ id });
}
