import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { logger } from '../powertools';
import { config } from '@config/config';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const accessRoleArn = config.get('accessRoleArn');
const clusterHost = config.get('clusterHost');

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const defaultConnOptions: MongoClientOptions = {
  // eg: maxPoolSize: 10, ssl: true, etc.
  maxPoolSize: 10,
  minPoolSize: 1,
  waitQueueTimeoutMS: 1000,
};

export async function getMongoDb(options?: MongoClientOptions): Promise<Db> {
  if (cachedDb && cachedClient) return cachedDb;

  logger.info('No cached MongoDB client found. Creating new one');

  const awsCredentialProvider = fromTemporaryCredentials({
    params: {
      RoleArn: accessRoleArn,
      RoleSessionName: 'HealthCheckServiceConnection',
    },
  });

  /**
   Cluster host is the full host i.e. {cluster_name}-{private_link_id}-{internal_project_id}.mongodb.net
   private_link_id is only set if using a private endpoint
   internal_project_id is an Atlas internal 5 character unique string
   for example {myatlascluster-pl-0.a0bc0}.mongodb.net
  */
  const mongodbUrl = new URL(
    `mongodb+srv://${clusterHost}/?authMechanism=MONGODB-AWS&authSource=%24external`,
  );

  cachedClient = new MongoClient(mongodbUrl.toString(), {
    ...defaultConnOptions,
    ...options,
    authMechanismProperties: {
      AWS_CREDENTIAL_PROVIDER: awsCredentialProvider,
    },
  });

  await cachedClient.connect();
  cachedDb = cachedClient.db(
    config.get('databaseName') || cachedClient.options.dbName,
  );

  logger.info('MongoDB client connected and cached');

  return cachedDb;
}
