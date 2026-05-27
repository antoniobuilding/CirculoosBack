/**
 * CSV Generation Controller
 * Generates NGSI-LD compatible CSVs from form data for Orion-LD ingestion.
 */

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvString(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

export async function generatePlasnovoCsv(req, res, next) {
  try {
    const entries = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be a non-empty array of recycling batch entries.',
      });
    }

    const headers = [
      'id',
      'type',
      'observedat',
      'rpid',
      'inputWasteBatchId',
      'materialType',
      'polymerGrade',
      'quantity',
      'quantity_unitCode',
      'recycledContent',
      'virginContent',
      'entryDate',
      'recyclingDate',
      'supplierId',
      'supplierName',
      'province',
      'country',
      'lerCode',
      'nimaCode',
      'wasteOrigin',
      'processLine',
      'operatorId',
      'shiftCode',
      'moistureLevel',
      'contaminationLevel',
      'bulkDensity',
      'bulkDensity_unitCode',
      'meltFlowIndex',
      'meltFlowIndex_unitCode',
      'batchStatus',
      'qualityGrade',
      'storageWarehouse',
      'observations',
    ];

    const rows = entries.map((entry) => ({
      id: `urn:ngsi-ld:circuloos:plasnovo:${entry.rpid}`,
      type: 'plasnovo_recycling',
      observedat: entry.recyclingDate
        ? new Date(entry.recyclingDate).toISOString()
        : '0',
      rpid: entry.rpid,
      inputWasteBatchId: entry.inputWasteBatchId,
      materialType: entry.materialType,
      polymerGrade: entry.polymerGrade,
      quantity: entry.quantity,
      quantity_unitCode: 'KGM',
      recycledContent: entry.recycledContent,
      virginContent: entry.virginContent,
      entryDate: entry.entryDate,
      recyclingDate: entry.recyclingDate,
      supplierId: entry.supplierId,
      supplierName: entry.supplierName,
      province: entry.province,
      country: entry.country || 'ES',
      lerCode: entry.lerCode,
      nimaCode: entry.nimaCode,
      wasteOrigin: entry.wasteOrigin,
      processLine: entry.processLine,
      operatorId: entry.operatorId,
      shiftCode: entry.shiftCode,
      moistureLevel: entry.moistureLevel,
      contaminationLevel: entry.contaminationLevel,
      bulkDensity: entry.bulkDensity,
      bulkDensity_unitCode: 'KMQ',
      meltFlowIndex: entry.meltFlowIndex,
      meltFlowIndex_unitCode: 'G2',
      batchStatus: entry.batchStatus,
      qualityGrade: entry.qualityGrade,
      storageWarehouse: entry.storageWarehouse,
      observations: entry.observations || '',
    }));

    const csv = buildCsvString(headers, rows);
    const filename = `plasnovo_recycling_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function generateMoltoCsv(req, res, next) {
  try {
    const entries = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be a non-empty array of production entries.',
      });
    }

    const headers = [
      'id',
      'type',
      'observedat',
      'productionOrderId',
      'productReference',
      'productFamily',
      'machineId',
      'machineTonnage',
      'machineTonnage_unitCode',
      'mouldId',
      'mouldCavities',
      'materialType',
      'materialBatchId',
      'recycledContent',
      'colorBatchId',
      'colorName',
      'injectedQuantity',
      'injectedQuantity_unitCode',
      'plannedQuantity',
      'plannedQuantity_unitCode',
      'scrapQuantity',
      'scrapQuantity_unitCode',
      'defectiveQuantity',
      'defectiveQuantity_unitCode',
      'okQuantity',
      'okQuantity_unitCode',
      'cycleTime',
      'cycleTime_unitCode',
      'injectionPressure',
      'injectionPressure_unitCode',
      'meltTemperature',
      'meltTemperature_unitCode',
      'unitWeight',
      'unitWeight_unitCode',
      'energyConsumption',
      'energyConsumption_unitCode',
      'operatorId',
      'shiftCode',
      'productionDate',
      'startTime',
      'endTime',
      'qualityStatus',
      'defectType',
      'correctiveAction',
      'observations',
    ];

    const rows = entries.map((entry) => ({
      id: `urn:ngsi-ld:circuloos:molto:${entry.productionOrderId}`,
      type: 'molto_production',
      observedat: entry.productionDate
        ? new Date(entry.productionDate).toISOString()
        : '0',
      productionOrderId: entry.productionOrderId,
      productReference: entry.productReference,
      productFamily: entry.productFamily,
      machineId: entry.machineId,
      machineTonnage: entry.machineTonnage,
      machineTonnage_unitCode: 'TNE',
      mouldId: entry.mouldId,
      mouldCavities: entry.mouldCavities,
      materialType: entry.materialType,
      materialBatchId: entry.materialBatchId,
      recycledContent: entry.recycledContent,
      colorBatchId: entry.colorBatchId,
      colorName: entry.colorName,
      injectedQuantity: entry.injectedQuantity,
      injectedQuantity_unitCode: 'C62',
      plannedQuantity: entry.plannedQuantity,
      plannedQuantity_unitCode: 'C62',
      scrapQuantity: entry.scrapQuantity,
      scrapQuantity_unitCode: 'C62',
      defectiveQuantity: entry.defectiveQuantity,
      defectiveQuantity_unitCode: 'C62',
      okQuantity: entry.okQuantity,
      okQuantity_unitCode: 'C62',
      cycleTime: entry.cycleTime,
      cycleTime_unitCode: 'SEC',
      injectionPressure: entry.injectionPressure,
      injectionPressure_unitCode: 'BAR',
      meltTemperature: entry.meltTemperature,
      meltTemperature_unitCode: 'CEL',
      unitWeight: entry.unitWeight,
      unitWeight_unitCode: 'GRM',
      energyConsumption: entry.energyConsumption,
      energyConsumption_unitCode: 'KWH',
      operatorId: entry.operatorId,
      shiftCode: entry.shiftCode,
      productionDate: entry.productionDate,
      startTime: entry.startTime,
      endTime: entry.endTime,
      qualityStatus: entry.qualityStatus,
      defectType: entry.defectType,
      correctiveAction: entry.correctiveAction,
      observations: entry.observations || '',
    }));

    const csv = buildCsvString(headers, rows);
    const filename = `molto_production_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function getCsvTemplates(_req, res, next) {
  try {
    const templates = {
      plasnovo: {
        label: 'Plasnovo Recycling',
        fields: [
          { name: 'rpid', type: 'string', required: true, example: 'RPID-2026-00001', description: 'Recycled Plastic ID' },
          { name: 'inputWasteBatchId', type: 'string', required: true, example: 'IWB-2026-0001', description: 'Input waste batch identifier' },
          { name: 'materialType', type: 'string', required: true, example: 'PP', description: 'Material type (PP, PE, ABS, etc.)' },
          { name: 'polymerGrade', type: 'string', required: true, example: 'PP-H-035', description: 'Polymer grade specification' },
          { name: 'quantity', type: 'number', required: true, example: 1250.5, description: 'Quantity in KG' },
          { name: 'recycledContent', type: 'number', required: true, example: 98.5, description: 'Recycled content percentage' },
          { name: 'virginContent', type: 'number', required: true, example: 1.5, description: 'Virgin content percentage' },
          { name: 'entryDate', type: 'date', required: true, example: '2026-01-14', description: 'Date waste entered the facility' },
          { name: 'recyclingDate', type: 'date', required: true, example: '2026-01-15', description: 'Date recycling was completed' },
          { name: 'supplierId', type: 'string', required: true, example: 'B12345678', description: 'Supplier tax ID' },
          { name: 'supplierName', type: 'string', required: true, example: 'EcoPlastics SL', description: 'Supplier name' },
          { name: 'province', type: 'string', required: true, example: 'Alicante', description: 'Province of origin' },
          { name: 'lerCode', type: 'string', required: true, example: '150102', description: 'European Waste Catalogue code' },
          { name: 'nimaCode', type: 'string', required: true, example: '4603000123', description: 'NIMA registration code' },
          { name: 'wasteOrigin', type: 'string', required: true, example: 'post-industrial', description: 'Waste origin type' },
          { name: 'processLine', type: 'string', required: true, example: 'LINE-A', description: 'Processing line identifier' },
          { name: 'operatorId', type: 'string', required: true, example: 'OP-014', description: 'Operator identifier' },
          { name: 'shiftCode', type: 'string', required: true, example: 'M', description: 'Shift code (M=Morning, T=Afternoon, N=Night)' },
          { name: 'moistureLevel', type: 'number', required: true, example: 0.42, description: 'Moisture level percentage' },
          { name: 'contaminationLevel', type: 'string', required: true, example: 'low', description: 'Contamination level (low, medium, high)' },
          { name: 'bulkDensity', type: 'number', required: true, example: 0.55, description: 'Bulk density in kg/m3' },
          { name: 'meltFlowIndex', type: 'number', required: true, example: 12.5, description: 'Melt flow index in g/10min' },
          { name: 'batchStatus', type: 'string', required: true, example: 'APPROVED', description: 'Batch status (APPROVED, PENDING, REJECTED)' },
          { name: 'qualityGrade', type: 'string', required: true, example: 'A', description: 'Quality grade (A, B, C)' },
          { name: 'storageWarehouse', type: 'string', required: true, example: 'WH-01', description: 'Storage warehouse code' },
          { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
        ],
      },
      molto: {
        label: 'Molto Production',
        fields: [
          { name: 'productionOrderId', type: 'string', required: true, example: 'PO-2026-0001', description: 'Production order identifier' },
          { name: 'productReference', type: 'string', required: true, example: 'WHEEL-RED-120MM', description: 'Product reference code' },
          { name: 'productFamily', type: 'string', required: true, example: 'wheels', description: 'Product family category' },
          { name: 'machineId', type: 'string', required: true, example: 'MCH-007', description: 'Machine identifier' },
          { name: 'machineTonnage', type: 'number', required: true, example: 180, description: 'Machine tonnage' },
          { name: 'mouldId', type: 'string', required: true, example: 'MLD-WH120', description: 'Mould identifier' },
          { name: 'mouldCavities', type: 'number', required: true, example: 4, description: 'Number of mould cavities' },
          { name: 'materialType', type: 'string', required: true, example: 'PP', description: 'Material type' },
          { name: 'materialBatchId', type: 'string', required: true, example: 'RPID-2026-00001', description: 'Material batch ID (from Plasnovo)' },
          { name: 'recycledContent', type: 'number', required: true, example: 98.5, description: 'Recycled content percentage' },
          { name: 'colorBatchId', type: 'string', required: true, example: 'COL-RED-001', description: 'Color batch identifier' },
          { name: 'colorName', type: 'string', required: true, example: 'Ferrari Red', description: 'Color name' },
          { name: 'injectedQuantity', type: 'number', required: true, example: 4850, description: 'Total injected quantity' },
          { name: 'plannedQuantity', type: 'number', required: true, example: 5000, description: 'Planned production quantity' },
          { name: 'scrapQuantity', type: 'number', required: true, example: 40, description: 'Scrap quantity' },
          { name: 'defectiveQuantity', type: 'number', required: true, example: 110, description: 'Defective units quantity' },
          { name: 'okQuantity', type: 'number', required: true, example: 4850, description: 'OK units quantity' },
          { name: 'cycleTime', type: 'number', required: true, example: 18.5, description: 'Cycle time in seconds' },
          { name: 'injectionPressure', type: 'number', required: true, example: 850, description: 'Injection pressure in BAR' },
          { name: 'meltTemperature', type: 'number', required: true, example: 225, description: 'Melt temperature in Celsius' },
          { name: 'unitWeight', type: 'number', required: true, example: 42.3, description: 'Unit weight in grams' },
          { name: 'energyConsumption', type: 'number', required: true, example: 148.7, description: 'Energy consumption in kWh' },
          { name: 'operatorId', type: 'string', required: true, example: 'OP-101', description: 'Operator identifier' },
          { name: 'shiftCode', type: 'string', required: true, example: 'M', description: 'Shift code (M=Morning, T=Afternoon, N=Night)' },
          { name: 'productionDate', type: 'date', required: true, example: '2026-02-01', description: 'Production date' },
          { name: 'startTime', type: 'datetime', required: true, example: '2026-02-01T07:00:00Z', description: 'Production start time' },
          { name: 'endTime', type: 'datetime', required: true, example: '2026-02-01T15:00:00Z', description: 'Production end time' },
          { name: 'qualityStatus', type: 'string', required: true, example: 'OK', description: 'Quality status (OK, NOK, PARTIAL)' },
          { name: 'defectType', type: 'string', required: true, example: 'none', description: 'Type of defect found' },
          { name: 'correctiveAction', type: 'string', required: true, example: 'none', description: 'Corrective action taken' },
          { name: 'observations', type: 'string', required: false, example: '', description: 'Additional observations' },
        ],
      },
    };

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (err) {
    next(err);
  }
}
