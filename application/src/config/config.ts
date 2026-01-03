const convict = require('convict');

export const config = convict({
  // shared config
  stage: {
    doc: 'The stage being deployed',
    format: String,
    default: '',
    env: 'STAGE',
  },
  accessRoleArn: {
    doc: 'The arn of the iam role',
    format: String,
    default: 'accessRoleArn',
    env: 'MDB_ACCESS_ROLE_ARN',
  },
  clusterHost: {
    doc: 'The hostname of the cluster for connection string',
    format: String,
    default: 'clusterHost',
    env: 'MDB_CLUSTER_HOSTNAME',
  },
  databaseName: {
    doc: 'The name of the database',
    format: String,
    default: 'test',
    env: 'DB_NAME',
  },
}).validate({ allowed: 'strict' });
