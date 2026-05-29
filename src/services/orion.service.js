import env from '../config/env.js';

/**
 * Builds an NGSI-LD entity from raw field data.
 * Fields with numeric values get a Property type with optional unitCode.
 * Fields with string values become simple Properties.
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
      // Already a property descriptor with value/unitCode
      entity[key] = { type: 'Property', ...descriptor };
    } else {
      // Plain value
      entity[key] = { type: 'Property', value: descriptor };
    }
  }

  return entity;
}

/**
 * POSTs a batch of NGSI-LD entities to Orion-LD upsert endpoint.
 * Returns { success, count, orionStatus, orionBody }.
 */
async function upsertEntities(entities) {
  const url = `${env.ORION_URL}/ngsi-ld/v1/entityOperations/upsert`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'NGSILD-Tenant': env.ORION_TENANT,
    },
    body: JSON.stringify(entities),
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
