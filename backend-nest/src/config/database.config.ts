import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri:
    process.env.MONGODB_URI ||
    'mongodb+srv://smartagencyyem_db_user:IazzxQxHifWrtv1p@cluster0.sma4e8a.mongodb.net/bthwani?appName=Cluster0',
  options: {
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  },
}));
