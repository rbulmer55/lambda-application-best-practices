const convict = require('convict');

export const config = convict({
  // shared config
  stage: {
    doc: 'The stage being deployed',
    format: String,
    default: '',
    env: 'STAGE',
  },
  serviceName: {
    doc: 'The service being deployed',
    format: String,
    default: '',
    env: 'SERVICE',
  },
  domainName: {
    doc: 'The domain of the service being deployed',
    format: String,
    default: '',
    env: 'DOMAIN',
  },
  accessRoleArn: {
    doc: 'The arn of the iam role',
    format: String,
    default: 'accessRoleArn',
    env: 'DB_ACCESS_ROLE_ARN',
  },
  clusterHost: {
    doc: 'The hostname of the cluster for connection string including srv',
    format: String,
    default: 'clusterHost',
    env: 'DB_CLUSTER_HOST_SRV',
  },
  databaseName: {
    doc: 'The name of the database',
    format: String,
    default: 'test',
    env: 'DB_NAME',
  },
}).validate({ allowed: 'strict' });
