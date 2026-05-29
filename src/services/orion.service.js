import { fetch, Agent } from 'undici';
import env from '../config/env.js';

/**
 * Custom dispatcher to skip TLS cert validation (Circuloos uses self-signed certs).
 */
const insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } });

/**
 * Token cache. Keycloak tokens expire in ~300s. We refresh 30s before expiry.
 */
let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function fetchToken() {
  const url = `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    grant_type: 'password',
    username: env.KEYCLOAK_USER,
    password: env.KEYCLOAK_PASSWORD,
    client_id: env.KEYCLOAK_CLIENT_ID,
    client_secret: env.KEYCLOAK_CLIENT_SECRET,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    dispatcher: insecureDispatcher,
  });

  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!response.ok) {
    const err = new Error(`Keycloak token fetch failed: ${response.status} ${response.statusText}`);
    err.orionStatus = response.status;
    err.orionBody = body;
    throw err;
  }

  return {
    accessToken: body.access_token,
    expiresIn: body.expires_in || 300,
  };
}

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }
  const { accessToken, expiresIn } = await fetchToken();
  cachedToken = accessToken;
  cachedTokenExpiresAt = now + (expiresIn - 30) * 1000;
  return cachedToken;
}

/**
 * Builds an NGSI-LD entity from raw field data.
 */
function buildEntity({ idPrefix, uniqueId, type, observedAt, properties }) {
  const entity = {
    '@context': env.ORION_CONTEXT,
    id: `urn:ngsi-ld:circuloos:${idPrefix}:${uniqueId}`,
    type,
    observedat: observedAt || '0',
  };

  for (const [key, descriptor] of Object.entries(properties)) {
    if (descriptor === null || descriptor === undefined || descriptor === '') continue;

    if (typeof descriptor === 'object' && descriptor.value !== undefined) {
      entity[key] = { type: 'Property', ...descriptor };
    } else {
      entity[key] = { type: 'Property', value: descriptor };
    }
  }

  return entity;
}

/**
 * POSTs a batch of NGSI-LD entities to Orion-LD via Kong (with Keycloak Bearer token).
 */
async function upsertEntities(entities) {
  const token = await getToken();
  const url = `${env.ORION_URL}/ngsi-ld/v1/entityOperations/upsert`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'Accept': 'application/json',
      'NGSILD-Tenant': env.ORION_TENANT,
      'NGSILD-Path': '/',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(entities),
    dispatcher: insecureDispatcher,
  });

  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!response.ok) {
    const err = new Error(`Orion-LD upsert failed: ${response.status} ${response.statusText}`);
    err.orionStatus = response.status;
    err.orionBody = body;
    throw err;
  }

  return {
    success: true,
    count: entities.length,
    orionStatus: response.status,
    orionBody: body,
  };
}

export default {
  buildEntity,
  upsertEntities,
};
