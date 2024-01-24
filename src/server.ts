import app from './app';
app.listen(process.env.CLIENT_PORT, () => console.log(`Server on in port ${process.env.CLIENT_PORT}`));
