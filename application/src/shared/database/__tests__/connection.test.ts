// __tests__/mongoDb.test.ts

import { getMongoDb } from '../connection'; // adjust path as needed
import { MongoClient, Db } from 'mongodb';

jest.mock('mongodb');
jest.mock('@shared/powertools', () => ({
  logger: { info: jest.fn() },
}));

const mockDb = {} as Db;
const mockConnect = jest.fn();
const mockDbMethod = jest.fn(() => mockDb);

beforeEach(() => {
  jest.clearAllMocks();

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

    expect(logger.info).toHaveBeenCalledWith('Creating new MongoDB client');
    expect(MongoClient).toHaveBeenCalledWith('mongodb://vehicle-db:27017', {
      maxPoolSize: 10,
      minPoolSize: 1,
      waitQueueTimeoutMS: 1000,
    });
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
