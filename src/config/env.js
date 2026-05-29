import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  ORION_URL: process.env.ORION_URL || 'https://circuloos.buildingblocks.es/keycloak-orion',
  ORION_TENANT: process.env.ORION_TENANT || 'circuloos_demo',
  ORION_CONTEXT: process.env.ORION_CONTEXT || 'http://circuloos-ld-context/circuloos-context.jsonld',
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'https://circuloos.buildingblocks.es:8443',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'fiware-server',
  KEYCLOAK_USER: process.env.KEYCLOAK_USER || 'admin-user',
  KEYCLOAK_PASSWORD: process.env.KEYCLOAK_PASSWORD || 'admin-user',
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'orion-pep',
  KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET || 'yWv2aRCm3KKMGrj9lMXQcEXY4v80tcFk',
};

const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of requiredVars) {
  if (!env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export default env;
