/**
 * Recycling flow controller — sends NGSI-LD entities directly to Orion-LD.
 *
 * 4-step circular recycling flow:
 *   1. Molto OUTPUT — defective/waste toys go OUT from Molto to Plasnovo
 *   2. Plasnovo RECEPTION — Plasnovo receives waste from Molto
 *   3. Plasnovo OUTPUT — Plasnovo sends recycled material back to Molto
 *   4. Molto RECEPTION — Molto receives recycled material from Plasnovo
 */

import prisma from '../config/prisma.js';
import orionService from '../services/orion.service.js';

function toIsoOrZero(value) {
  if (!value) return '0';
  try {
    return new Date(value).toISOString();
  } catch {
    return '0';
  }
}

function validateEntries(entries, res) {
  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Request body must contain a non-empty "entries" array.',
    });
    return false;
  }
  return true;
}

function handleOrionError(err, res, next) {
  if (err && err.orionStatus !== undefined) {
    return res.status(502).json({
      success: false,
      error: err.message,
      orionStatus: err.orionStatus,
      orionBody: err.orionBody,
    });
  }
  return next(err);
}

// ── 1. Molto OUTPUT ────────────────────────────────────────────────

export async function sendMoltoOutput(req, res, next) {
  try {
    const { entries } = req.body;
    if (!validateEntries(entries, res)) return;

    const entities = entries.map((entry) =>
      orionService.buildEntity({
        idPrefix: 'molto_output',
        uniqueId: entry.batchId,
        type: 'molto_waste_output',
        observedAt: toIsoOrZero(entry.date),
        properties: {
          productionOrderId: entry.productionOrderId,
          productReference: entry.productReference,
          machineId: entry.machineId,
          mouldId: entry.mouldId,
          materialType: entry.materialType,
          materialBatchId: entry.materialBatchId,
          colorBatchId: entry.colorBatchId,
          injectedQuantity: entry.injectedQuantity,
          plannedQuantity: entry.plannedQuantity,
          batchId: entry.batchId,
          reason: entry.reason,
          date: entry.date,
          operatorId: entry.operatorId,
          shiftCode: entry.shiftCode,
          destination: entry.destination || 'Plasnovo S.L',
          observations: entry.observations,
          quantity: { value: entry.quantity, unitCode: 'KGM' },
        },
      })
    );

    try {
      const result = await orionService.upsertEntities(entities);
      return res.json({
        success: true,
        data: {
          sent: entries.length,
          orionStatus: result.orionStatus,
          type: 'molto_waste_output',
        },
      });
    } catch (orionErr) {
      return handleOrionError(orionErr, res, next);
    }
  } catch (err) {
    next(err);
  }
}

// ── 2. Plasnovo RECEPTION ──────────────────────────────────────────

export async function sendPlasnovoReception(req, res, next) {
  try {
    const { entries } = req.body;
    if (!validateEntries(entries, res)) return;

    const entities = entries.map((entry) =>
      orionService.buildEntity({
        idPrefix: 'plasnovo_reception',
        uniqueId: entry.receptionId,
        type: 'plasnovo_waste_reception',
        observedAt: toIsoOrZero(entry.receptionDate),
        properties: {
          receptionId: entry.receptionId,
          rpid: entry.rpid,
          receivedFrom: entry.receivedFrom || 'Molto',
          supplierNif: entry.supplierNif,
          province: entry.province,
          lerCode: entry.lerCode,
          nimaCode: entry.nimaCode,
          materialType: entry.materialType,
          receptionDate: entry.receptionDate,
          batchId: entry.batchId,
          conditionAssessment: entry.conditionAssessment,
          moistureLevel: entry.moistureLevel,
          contaminationLevel: entry.contaminationLevel,
          operatorId: entry.operatorId,
          shiftCode: entry.shiftCode,
          storageLocation: entry.storageLocation,
          observations: entry.observations,
          quantityReceived: { value: entry.quantityReceived, unitCode: 'KGM' },
        },
      })
    );

    try {
      const result = await orionService.upsertEntities(entities);
      return res.json({
        success: true,
        data: {
          sent: entries.length,
          orionStatus: result.orionStatus,
          type: 'plasnovo_waste_reception',
        },
      });
    } catch (orionErr) {
      return handleOrionError(orionErr, res, next);
    }
  } catch (err) {
    next(err);
  }
}

// ── 3. Plasnovo OUTPUT ─────────────────────────────────────────────

export async function sendPlasnovoOutput(req, res, next) {
  try {
    const { entries } = req.body;
    if (!validateEntries(entries, res)) return;

    const entities = entries.map((entry) =>
      orionService.buildEntity({
        idPrefix: 'plasnovo_output',
        uniqueId: entry.rpid,
        type: 'plasnovo_recycled_output',
        observedAt: toIsoOrZero(entry.outputDate),
        properties: {
          rpid: entry.rpid,
          materialType: entry.materialType,
          recycledContent: entry.recycledContent,
          colorant: entry.colorant,
          polymerGrade: entry.polymerGrade,
          meltFlowIndex: entry.meltFlowIndex,
          qualityGrade: entry.qualityGrade,
          batchStatus: entry.batchStatus,
          processLine: entry.processLine,
          outputDate: entry.outputDate,
          destination: entry.destination || 'Molto',
          operatorId: entry.operatorId,
          shiftCode: entry.shiftCode,
          observations: entry.observations,
          quantityOutput: { value: entry.quantityOutput, unitCode: 'KGM' },
          colorantQuantity: { value: entry.colorantQuantity, unitCode: 'KGM' },
        },
      })
    );

    try {
      const result = await orionService.upsertEntities(entities);
      return res.json({
        success: true,
        data: {
          sent: entries.length,
          orionStatus: result.orionStatus,
          type: 'plasnovo_recycled_output',
        },
      });
    } catch (orionErr) {
      return handleOrionError(orionErr, res, next);
    }
  } catch (err) {
    next(err);
  }
}

// ── 4. Molto RECEPTION ────────────────────────────────────────────

export async function sendMoltoReception(req, res, next) {
  try {
    const { entries } = req.body;
    if (!validateEntries(entries, res)) return;

    const entities = entries.map((entry) =>
      orionService.buildEntity({
        idPrefix: 'molto_reception',
        uniqueId: entry.receptionId,
        type: 'molto_recycled_reception',
        observedAt: toIsoOrZero(entry.receptionDate),
        properties: {
          receptionId: entry.receptionId,
          receivedFrom: entry.receivedFrom || 'Plasnovo S.L',
          materialType: entry.materialType,
          rpid: entry.rpid,
          receptionDate: entry.receptionDate,
          colorVerification: entry.colorVerification,
          qualityCheck: entry.qualityCheck,
          operatorId: entry.operatorId,
          shiftCode: entry.shiftCode,
          storageLocation: entry.storageLocation,
          observations: entry.observations,
          quantityReceived: { value: entry.quantityReceived, unitCode: 'KGM' },
        },
      })
    );

    try {
      const result = await orionService.upsertEntities(entities);
      return res.json({
        success: true,
        data: {
          sent: entries.length,
          orionStatus: result.orionStatus,
          type: 'molto_recycled_reception',
        },
      });
    } catch (orionErr) {
      return handleOrionError(orionErr, res, next);
    }
  } catch (err) {
    next(err);
  }
}

// ── Templates ──────────────────────────────────────────────────────

export async function getCsvTemplates(_req, res, next) {
  try {
    const templates = {
      moltoOutput: {
        label: 'Molto Waste Output',
        description: 'Defective/deformed toys sent from Molto to Plasnovo as plastic waste',
        fields: [
          { name: 'productReference', type: 'string', required: true, example: 'WHEEL-RED-120MM', description: 'Product name/reference' },
          { name: 'materialType', type: 'string', required: true, options: ['PP', 'PS', 'ASA'], description: 'Material type' },
          { name: 'quantity', type: 'number', required: true, example: 250.5, description: 'Weight in KG' },
          { name: 'batchId', type: 'string', required: true, example: 'WB-2026-0001', description: 'Waste batch identifier' },
          { name: 'reason', type: 'string', required: true, options: ['defective', 'deformed', 'end_of_life', 'production_scrap', 'quality_rejected'], description: 'Reason for waste' },
          { name: 'date', type: 'date', required: true, example: '2026-03-15', description: 'Output date' },
          { name: 'operatorId', type: 'string', required: true, example: 'OP-101', description: 'Operator identifier' },
          { name: 'shiftCode', type: 'string', required: true, options: ['M', 'T', 'N'], description: 'Shift (M=Morning, T=Afternoon, N=Night)' },
          { name: 'destination', type: 'string', required: false, example: 'Plasnovo S.L', description: 'Destination (default: Plasnovo S.L)' },
          { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
        ],
      },
      plasnovoReception: {
        label: 'Plasnovo Waste Reception',
        description: 'Plasnovo receives waste from Molto and logs it',
        fields: [
          { name: 'receptionId', type: 'string', required: true, example: 'REC-2026-0001', description: 'Unique reception identifier' },
          { name: 'receivedFrom', type: 'string', required: false, example: 'Molto', description: 'Source (default: Molto)' },
          { name: 'materialType', type: 'string', required: true, options: ['PP', 'PS', 'ASA'], description: 'Material type' },
          { name: 'quantityReceived', type: 'number', required: true, example: 250.5, description: 'Received weight in KG' },
          { name: 'receptionDate', type: 'date', required: true, example: '2026-03-16', description: 'Reception date' },
          { name: 'batchId', type: 'string', required: true, example: 'WB-2026-0001', description: "Molto's original batch ID for traceability" },
          { name: 'conditionAssessment', type: 'string', required: true, options: ['good', 'contaminated', 'mixed', 'damaged'], description: 'Condition assessment' },
          { name: 'moistureLevel', type: 'number', required: true, example: 0.42, description: 'Moisture level percentage' },
          { name: 'contaminationLevel', type: 'string', required: true, options: ['low', 'medium', 'high'], description: 'Contamination level' },
          { name: 'operatorId', type: 'string', required: true, example: 'OP-014', description: 'Operator identifier' },
          { name: 'shiftCode', type: 'string', required: true, options: ['M', 'T', 'N'], description: 'Shift (M=Morning, T=Afternoon, N=Night)' },
          { name: 'storageLocation', type: 'string', required: true, example: 'WH-01', description: 'Storage location' },
          { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
        ],
      },
      plasnovoOutput: {
        label: 'Plasnovo Recycled Output',
        description: 'Plasnovo sends recycled material (with colorant) back to Molto',
        fields: [
          { name: 'rpid', type: 'string', required: true, example: 'RPID-2026-00001', description: 'Recycled Product ID' },
          { name: 'materialType', type: 'string', required: true, options: ['PP', 'PS', 'ASA'], description: 'Material type' },
          { name: 'quantityOutput', type: 'number', required: true, example: 245.2, description: 'Output weight in KG' },
          { name: 'recycledContent', type: 'number', required: true, example: 95, description: 'Recycled content percentage (typically 90-99%)' },
          { name: 'colorant', type: 'string', required: true, example: 'Ferrari Red', description: 'Color name added' },
          { name: 'colorantQuantity', type: 'number', required: true, example: 5.3, description: 'Colorant weight in KG' },
          { name: 'polymerGrade', type: 'string', required: true, example: 'PP-H-035', description: 'Polymer grade specification' },
          { name: 'meltFlowIndex', type: 'number', required: true, example: 12.5, description: 'Melt flow index in g/10min' },
          { name: 'qualityGrade', type: 'string', required: true, options: ['A', 'B', 'C'], description: 'Quality grade' },
          { name: 'batchStatus', type: 'string', required: true, options: ['APPROVED', 'QUARANTINE', 'REJECTED'], description: 'Batch status' },
          { name: 'processLine', type: 'string', required: true, options: ['LINE-A', 'LINE-B', 'LINE-C'], description: 'Processing line' },
          { name: 'outputDate', type: 'date', required: true, example: '2026-03-18', description: 'Output date' },
          { name: 'destination', type: 'string', required: false, example: 'Molto', description: 'Destination (default: Molto)' },
          { name: 'operatorId', type: 'string', required: true, example: 'OP-014', description: 'Operator identifier' },
          { name: 'shiftCode', type: 'string', required: true, options: ['M', 'T', 'N'], description: 'Shift (M=Morning, T=Afternoon, N=Night)' },
          { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
        ],
      },
    };

    templates.moltoReception = {
      label: 'Molto Recycled Material Reception',
      description: 'Molto receives recycled material from Plasnovo and logs it',
      fields: [
        { name: 'receptionId', type: 'string', required: true, example: 'MR-2026-0001', description: 'Unique reception identifier' },
        { name: 'receivedFrom', type: 'string', required: false, example: 'Plasnovo S.L', description: 'Source (default: Plasnovo S.L)' },
        { name: 'materialType', type: 'string', required: true, options: ['PP', 'PS', 'ASA'], description: 'Material type' },
        { name: 'quantityReceived', type: 'number', required: true, example: 245.2, description: 'Received weight in KG' },
        { name: 'rpid', type: 'string', required: true, example: 'RPID-2026-00001', description: "Plasnovo's RPID for traceability" },
        { name: 'receptionDate', type: 'date', required: true, example: '2026-03-20', description: 'Reception date' },
        { name: 'colorVerification', type: 'string', required: true, options: ['correct', 'incorrect', 'pending'], description: 'Color matches order' },
        { name: 'qualityCheck', type: 'string', required: true, options: ['passed', 'pending', 'failed'], description: 'Quality check result' },
        { name: 'operatorId', type: 'string', required: true, example: 'OP-101', description: 'Operator identifier' },
        { name: 'shiftCode', type: 'string', required: true, options: ['M', 'T', 'N'], description: 'Shift' },
        { name: 'storageLocation', type: 'string', required: true, example: 'WH-MOLTO-01', description: 'Storage location' },
        { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
      ],
    };

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (err) {
    next(err);
  }
}

// ── Product References ─────────────────────────────────────────────

export async function getProductReferences(_req, res, next) {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        material: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
}
