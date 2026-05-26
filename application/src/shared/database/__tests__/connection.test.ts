import { getMongoDb } from '../connection';
import { MongoClient, Db } from 'mongodb';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

jest.mock('mongodb');
jest.mock('@shared/powertools', () => ({
  logger: { info: jest.fn() },
}));
jest.mock('@aws-sdk/credential-providers', () => ({
  fromTemporaryCredentials: jest.fn(),
}));

const mockDb = {} as Db;
const mockConnect = jest.fn();
const mockDbMethod = jest.fn(() => mockDb);
const mockAwsProvider = { token: 'fake-token' };

beforeEach(() => {
  jest.clearAllMocks();

  (fromTemporaryCredentials as jest.Mock).mockReturnValue(mockAwsProvider);

  // @ts-ignore
  MongoClient.mockImplementation(function (this: any) {
    this.connect = mockConnect;
    this.db = mockDbMethod;
  });
});

describe('getMongoDb', () => {
  afterEach(() => {
    jest.resetModules(); // Reset cache between tests to avoid side-effects
  });

  it('should create a new client and db on first call (cold start)', async () => {
    const { logger } = require('@shared/powertools');
    // First call
    const db = await getMongoDb();

    expect(logger.info).toHaveBeenCalledWith(
      'No cached MongoDB client found. Creating new one',
    );
    expect(MongoClient).toHaveBeenCalledWith(
      'mongodb+srv://clusterHost/?authMechanism=MONGODB-AWS&authSource=%24external',
      {
        maxPoolSize: 10,
        minPoolSize: 1,
        waitQueueTimeoutMS: 1000,
        authMechanismProperties: {
          AWS_CREDENTIAL_PROVIDER: mockAwsProvider,
        },
      },
    );
    expect(mockConnect).toHaveBeenCalled();
    expect(mockDbMethod).toHaveBeenCalledWith('testDB');
    expect(db).toBe(mockDb);
  });

  it('should return the cached db on subsequent calls (warm start)', async () => {
    const { logger } = require('@shared/powertools');
    // First call - to cache values
    await getMongoDb();
    // Clear mocks to only track this call
    jest.clearAllMocks();
    // Second call
    const db = await getMongoDb();

    expect(logger.info).not.toHaveBeenCalled();
    expect(MongoClient).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockDbMethod).not.toHaveBeenCalled();
    expect(db).toBe(mockDb);
  });
});
