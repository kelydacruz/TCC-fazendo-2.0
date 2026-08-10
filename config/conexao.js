import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function conectarBanco() {
  const url = process.env.MONGODB_URI;
  if (!url) {
    console.warn('MONGODB_URI não definida. Configure o .env antes de usar as áreas persistentes.');
    return null;
  }
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(url);
  console.log('MongoDB conectado.');
  return mongoose;
}

export function bancoDisponivel() {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
