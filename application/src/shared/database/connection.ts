import { MongoClient, Db } from 'mongodb';
import { logger } from '../powertools';
import { config } from '@config/config';

const uri = config.get('MONGO_URI');

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (cachedDb && cachedClient) return cachedDb;

  logger.info('Creating new MongoDB client');
  cachedClient = new MongoClient(uri, {
    // Lambda-friendly options
    maxPoolSize: 10,
    minPoolSize: 1,
    waitQueueTimeoutMS: 1000,
  });

  await cachedClient.connect();
  cachedDb = cachedClient.db(config.get('MONGO_DB_NAME'));

  return cachedDb;
}
