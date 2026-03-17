import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI environment variable is required');
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[db] MongoDB disconnected');
}
