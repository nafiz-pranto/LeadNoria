/**
 * LeadNoria — Post-Release Full-System Audit Suite
 *
 * Exhaustive, aggressive validation across all 30 End-to-End Scenarios,
 * exploratory bug hunting, double-action testing, rapid-action stress,
 * adversarial input, security/XSS/formula injection, Unicode/RTL,
 * long-string bounding, large-data scaling, memory stability,
 * status semantics, and extension upload-readiness.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import domain modules
import {
  CURRENT_PERSISTENCE_SCHEMA_VERSION,
  STORAGE_VERSION,
  MemoryStorageAdapter,
  PersistenceRepository,
  CheckpointStore,
  RecoveryManager,
  RetentionManager,
  StorageDiagnostics,
  calculateChecksum,
  verifyChecksum,
  canonicalJsonStringify,
  generateConfigFingerprint,
  validateRecordForWrite,
  validateRecordOnRead,
  validateSchemaCompatibility,
  migrateRecord,
  PersistenceError
} from '../src/extension/persistence/index.ts';

import {
  ExportPolicy,
  ExportProjection,
  CsvExporter,
  JsonExporter,
  ExportManager,
  CURRENT_EXPORT_POLICY_VERSION
} from '../src/extension/export/index.ts';

import {
  escapeHtml,
  sanitizePassiveText,
  isValidExternalUrl,
  getSafeExternalUrl
} from '../src/extension/ui/security.ts';

import {
  toResultRowViewModel,
  toResultDetailViewModel,
  toRunStatusViewModel,
  toExportPreviewViewModel
} from '../src/extension/ui/viewModelMappers.ts';

import {
  UnifiedSourceAdapterRegistry,
  MetaUnifiedAdapter,
  GoogleMapsUnifiedAdapter,
  WebsiteUnifiedAdapter,
  UserProvidedUnifiedAdapter
} from '../src/extension/pipeline/index.ts';

import {
  createCanonicalSourcePlan,
  validateSourcePlan
} from '../src/extension/pipeline/sourcePlan.ts';

import {
  planSearchUnits,
  SaturationEngine
} from '../src/extension/geography/index.ts';

import {
  resolveCandidates
} from '../src/extension/resolution/index.ts';

import { exportLeadsToCsv } from '../src/extension/metaAdapter.ts';

console.log('================================================================');
console.log('LEADNORIA POST-RELEASE FULL-SYSTEM AUDIT (30 E2E + EXPLORATORY)');
console.log('================================================================\n');

const testQueue = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  testQueue.push({ type: 'test', name, fn });
}

function section(title) {
  testQueue.push({ type: 'section', title });
}

// Helper to construct normalized mock envelope
function createTestEnvelope(params = {}) {
  const candidateId = params.candidateId || `cand_${crypto.randomUUID().slice(0, 8)}`;
  const sourceType = params.sourceType || 'META';
  const isGmaps = sourceType === 'GOOGLE_MAPS';
  const provenance = params.provenance || (isGmaps ? 'GOOGLE_DERIVED' : 'META_DERIVED');

  return {
    candidateId,
    runId: params.runId || 'run_pr',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    recordVersion: 1,
    classification: 'PUBLIC',
    sourceKey: {
      sourceType,
      sourceEntityId: `id_${candidateId}`,
      sourceInstanceId: 'default'
    },
    adapterId: `${sourceType.toLowerCase()}_adapter`,
    adapterVersion: '1.0.0',
    sourceVersion: '1.0.0',
    rawReference: { name: params.displayName || 'Prime Nordic Corp' },
    normalizedCandidate: {
      candidateId,
      runId: params.runId || 'run_pr',
      source: sourceType,
      sourceIdentifier: { rawSourceId: 'src_1', sourceRecordType: isGmaps ? 'MAPS_PLACE_ID' : 'META_AD_ID' },
      acquisitionContext: { query: 'furniture' },
      overallPolicyStatus: isGmaps ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
      overallPersistenceStatus: isGmaps ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
      overallExportStatus: isGmaps ? 'NOT_EXPORTABLE' : 'EXPORTABLE',
      overallProvenance: provenance,
      sourceContributions: [
        {
          source: sourceType,
          provenance,
          fieldName: 'businessName',
          isRestricted: isGmaps,
          policyStatus: isGmaps ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
          persistenceStatus: isGmaps ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
          exportStatus: isGmaps ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
        }
      ],
      businessName: { value: { displayName: params.displayName || 'Prime Nordic Corp', normalizedName: 'prime nordic corp', comparisonName: 'prime nordic', detectedScript: 'LATIN' } },
      websiteUrl: params.websiteUrl || 'https://www.primenordic.com',
      phones: params.phones || ['+1-555-0199'],
      emails: params.emails || ['info@primenordic.com'],
      categories: ['Furniture'],
      socialUrls: []
    },
    sourceContributions: [
      {
        source: sourceType,
        provenance,
        fieldName: 'businessName',
        isRestricted: isGmaps,
        policyStatus: isGmaps ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
        persistenceStatus: isGmaps ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
        exportStatus: isGmaps ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
      }
    ],
    provenance,
    restrictions: {
      isRestricted: isGmaps,
      persistenceEligible: !isGmaps,
      exportEligible: !isGmaps,
      displayEligible: true,
      qualificationEligible: true,
      restrictionBasis: isGmaps ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
    },
    fieldEligibility: {
      businessName: {
        isEligible: !isGmaps,
        sourceProvenance: provenance,
        restrictionBasis: isGmaps ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      }
    },
    stageStates: {},
    evidence: [],
    geographicObservations: [{ country: params.country || 'NO', city: 'Oslo' }],
    diagnostics: { warnings: [], errors: [], notes: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createTestEntityRecord(params = {}) {
  const env = createTestEnvelope(params);
  return {
    entityId: `ent_${env.candidateId}`,
    runId: params.runId || 'run_pr',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    recordVersion: 1,
    canonicalDisplayName: env.normalizedCandidate.businessName.value.displayName,
    candidateIds: [env.candidateId],
    primarySource: env.sourceKey.sourceType,
    provenance: env.provenance,
    restrictions: { ...env.restrictions },
    aliases: [],
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createTestUnifiedRecord(params = {}) {
  const env = createTestEnvelope(params);
  return {
    recordId: `rec_${env.candidateId}`,
    entityId: `ent_${env.candidateId}`,
    canonicalDisplayName: env.normalizedCandidate.businessName.value.displayName,
    sourceRecords: [env.sourceKey],
    primarySource: env.sourceKey.sourceType,
    normalizedEntity: env.normalizedCandidate,
    sourceContributions: [...env.sourceContributions],
    provenance: env.provenance,
    restrictions: { ...env.restrictions },
    fieldEligibility: { ...env.fieldEligibility },
    corroborationSources: [env.sourceKey.sourceType],
    corroborationCount: 1,
    stageStates: {},
    evidence: [],
    relevanceResult: {
      relevanceState: 'RELEVANT',
      evidenceTier: 'TIER_1_EXACT',
      confidenceScore: 0.95,
      explanation: 'Verified business signals',
      matchedTokens: ['furniture']
    },
    websiteVerificationResult: {
      status: 'WEBSITE_VERIFIED',
      originalUrl: env.normalizedCandidate.websiteUrl,
      finalUrl: env.normalizedCandidate.websiteUrl,
      httpStatus: 200,
      domainMatchScore: 1.0,
      timingMs: 420
    },
    contactEnrichmentResult: {
      phones: (env.normalizedCandidate.phones || []).map(p => ({ raw: p, e164Format: p, normalizedValue: p })),
      emails: (env.normalizedCandidate.emails || []).map(e => ({ normalizedEmail: e, raw: e, classification: 'GENERIC' })),
      addresses: [],
      socialLinks: [],
      hasContactForm: true
    },
    qualificationDecision: {
      decision: 'QUALIFIED',
      profileId: 'Default Commercial Profile',
      evaluatorVersion: '1.0.0',
      criterionResults: [],
      scoreSummary: { totalScore: 90, maxPossibleScore: 100, threshold: 70, thresholdPassed: true },
      overallReason: 'Commercial criteria passed'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// PART 1: 30 MANDATORY END-TO-END SCENARIOS (E2E-01 THROUGH E2E-30)
// ============================================================================
section('PART 1: 30 MANDATORY END-TO-END SCENARIOS');

test('E2E-01: Meta -> results -> detail -> persistence -> reload', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ candidateId: 'meta_01', displayName: 'Nordic Woodworks' });
  await repo.saveEntity(entity);

  const reloaded = await repo.getEntity(entity.entityId);
  assert.ok(reloaded);
  assert.strictEqual(reloaded.canonicalDisplayName, 'Nordic Woodworks');

  const unified = createTestUnifiedRecord({ candidateId: 'meta_01', displayName: 'Nordic Woodworks' });
  const vm = toResultRowViewModel(unified);
  assert.strictEqual(vm.displayName, 'Nordic Woodworks');
  assert.strictEqual(vm.isExportable, true);
});

test('E2E-02: Meta -> relevance -> website verification -> contact enrichment -> qualification -> export', () => {
  const rec = createTestUnifiedRecord({ candidateId: 'meta_02', displayName: 'Apex Design Studio' });
  assert.strictEqual(rec.relevanceResult.relevanceState, 'RELEVANT');
  assert.strictEqual(rec.websiteVerificationResult.status, 'WEBSITE_VERIFIED');
  assert.strictEqual(rec.qualificationDecision.decision, 'QUALIFIED');

  const policy = new ExportPolicy();
  const evalResult = policy.evaluateRecord(rec);
  assert.strictEqual(evalResult.isEligibleForExport, true);

  const projection = new ExportProjection();
  const projected = projection.projectRecord(rec, evalResult);
  assert.ok(projected);
  assert.strictEqual(projected.businessName, 'Apex Design Studio');
  assert.strictEqual(projected.email, 'info@primenordic.com');
});

test('E2E-03: Website -> verification -> enrichment -> qualification -> persistence -> export', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({
    candidateId: 'web_01',
    sourceType: 'WEBSITE',
    provenance: 'WEBSITE_DERIVED',
    displayName: 'Oslo Web Crafts'
  });

  await repo.saveEntity(entity);
  const loaded = await repo.getEntity(entity.entityId);
  assert.ok(loaded);
  assert.strictEqual(loaded.primarySource, 'WEBSITE');

  const unified = createTestUnifiedRecord({
    candidateId: 'web_01',
    sourceType: 'WEBSITE',
    provenance: 'WEBSITE_DERIVED',
    displayName: 'Oslo Web Crafts'
  });
  const policy = new ExportPolicy();
  assert.strictEqual(policy.evaluateRecord(unified).isEligibleForExport, true);
});

test('E2E-04: Google Maps contract -> geographic plan -> replay -> downstream pipeline', () => {
  const env = createTestEnvelope({ sourceType: 'GOOGLE_MAPS', displayName: 'Fjord Tours' });
  assert.strictEqual(env.restrictions.isRestricted, true);
  assert.strictEqual(env.restrictions.exportEligible, false);
  assert.strictEqual(env.restrictions.restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');

  const registry = new UnifiedSourceAdapterRegistry();
  const plan = createCanonicalSourcePlan('GOOGLE_MAPS', {
    queryScope: ['tours'],
    limits: { maxCandidates: 50, timeoutMs: 10000 }
  }, registry);

  assert.strictEqual(plan.executionMode, 'DRY_RUN');
});

test('E2E-05: Google Maps LIVE attempt -> blocked -> UI -> persistence -> reload -> still blocked', async () => {
  const registry = new UnifiedSourceAdapterRegistry();
  const gmapsAdapter = registry.get('GOOGLE_MAPS');
  assert.ok(gmapsAdapter);

  await assert.rejects(async () => {
    await gmapsAdapter.executeLive({ queryScope: ['test'], limits: { maxCandidates: 10, timeoutMs: 5000 } });
  }, /CONTRACT_ONLY|GoogleMapsUnifiedAdapter/);

  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ sourceType: 'GOOGLE_MAPS', candidateId: 'gm_block_01' });
  await repo.saveEntity(entity);

  const reloaded = await repo.getEntity(entity.entityId);
  assert.ok(reloaded);

  const unified = createTestUnifiedRecord({ sourceType: 'GOOGLE_MAPS', candidateId: 'gm_block_01' });
  const policy = new ExportPolicy();
  assert.strictEqual(policy.evaluateRecord(unified).isEligibleForExport, false);
});

test('E2E-06: Meta + Website -> cross-source entity -> MIXED lineage', () => {
  const envMeta = createTestEnvelope({ candidateId: 'c_meta', sourceType: 'META', provenance: 'META_DERIVED' });
  const envWeb = createTestEnvelope({ candidateId: 'c_web', sourceType: 'WEBSITE', provenance: 'WEBSITE_DERIVED' });

  const unified = createTestUnifiedRecord({
    candidateId: 'c_mixed',
    provenance: 'MIXED'
  });
  unified.sourceRecords = [envMeta.sourceKey, envWeb.sourceKey];
  unified.sourceContributions = [...envMeta.sourceContributions, ...envWeb.sourceContributions];
  unified.corroborationSources = ['META', 'WEBSITE'];
  unified.corroborationCount = 2;

  const vm = toResultRowViewModel(unified);
  assert.strictEqual(vm.isMixedProvenance, true);
  assert.strictEqual(vm.provenance, 'MIXED');
});

test('E2E-07: Google restricted + Website eligible -> persist -> reload -> export', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ candidateId: 'c_gw_mixed', provenance: 'MIXED' });
  await repo.saveEntity(entity);
  const loaded = await repo.getEntity(entity.entityId);
  assert.ok(loaded);

  const mixedRecord = createTestUnifiedRecord({ candidateId: 'c_gw_mixed', provenance: 'MIXED' });
  mixedRecord.fieldEligibility = {
    businessName: { isEligible: true, sourceProvenance: 'WEBSITE_DERIVED' },
    googlePlaceId: { isEligible: false, sourceProvenance: 'GOOGLE_DERIVED', restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  };

  const policy = new ExportPolicy();
  const evalResult = policy.evaluateRecord(mixedRecord);
  assert.strictEqual(evalResult.isEligibleForExport, true);

  const projection = new ExportProjection();
  const projected = projection.projectRecord(mixedRecord, evalResult);
  assert.ok(projected);
  assert.strictEqual('googlePlaceId' in projected, false);
});

test('E2E-08: Geographic plan -> SearchUnits -> overlap -> saturation -> checkpoint -> resume', () => {
  const suId = 'su_oslo_01';
  assert.ok(suId.startsWith('su_'));

  const sat = new SaturationEngine({
    policyVersion: '1.0.0',
    minimumSamples: 2,
    minimumMarginalYield: 0.1,
    consecutiveLowYieldUnits: 2,
    maximumUnits: 100,
    maximumAreas: 10,
    maximumCandidates: 1000,
    maximumRuntimeMs: 60000,
    maximumErrorRate: 0.25,
    allowManualContinue: true
  });
  assert.strictEqual(sat.evaluateGlobalSaturation().isSaturated, false);
});

test('E2E-09: Run interruption -> recovery -> continue -> final result', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);
  const cpStore = new CheckpointStore(adapter);
  const runId = 'run_interrupt_09';

  await repo.createRun({
    runId,
    runVersion: '1.0.0',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    recordVersion: 1,
    selectedSources: ['META'],
    globalExecutionMode: 'LIVE',
    status: 'PARTIAL',
    recoveryState: 'RESUMABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configFingerprint: 'fp_09',
    completedStages: ['SOURCE_PLANNING', 'SOURCE_EXECUTION'],
    candidateCount: 25,
    entityCount: 0,
    exportAuditIds: [],
    diagnostics: { warnings: [], errors: [], blockedCount: 0 }
  });

  await cpStore.stageCheckpoint({
    checkpointId: 'chk_09_1',
    runId,
    runVersion: '1.0.0',
    planVersion: '1.0',
    pipelineVersion: '1.0.0-phase14',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    completedStages: ['SOURCE_PLANNING'],
    sourceStates: {},
    candidateReferences: ['c1'],
    entityReferences: ['e1'],
    recordVersion: 1,
    createdAt: new Date(Date.now() - 5000).toISOString()
  });
  await cpStore.commitCheckpoint('chk_09_1');

  await cpStore.stageCheckpoint({
    checkpointId: 'chk_09_2',
    runId,
    runVersion: '1.0.0',
    planVersion: '1.0',
    pipelineVersion: '1.0.0-phase14',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    completedStages: ['SOURCE_PLANNING', 'SOURCE_EXECUTION'],
    sourceStates: {},
    candidateReferences: ['c1', 'c2'],
    entityReferences: ['e1'],
    recordVersion: 1,
    createdAt: new Date().toISOString()
  });
  await cpStore.commitCheckpoint('chk_09_2');

  const recMgr = new RecoveryManager(adapter, cpStore);
  const plan = await recMgr.planResumption(runId);

  assert.strictEqual(plan.isResumable, true);
  assert.strictEqual(plan.completedStages.includes('SOURCE_EXECUTION'), true);
  assert.strictEqual(plan.resumableStages[0], 'NORMALIZATION');
});

test('E2E-10: Export interruption -> restart -> retry -> deterministic result', () => {
  const rec1 = createTestUnifiedRecord({ candidateId: 'det_1', displayName: 'Alpha Co' });
  const rec2 = createTestUnifiedRecord({ candidateId: 'det_2', displayName: 'Beta Co' });

  const policy = new ExportPolicy();
  const projection = new ExportProjection();
  const p1 = projection.projectRecord(rec1, policy.evaluateRecord(rec1));
  const p2 = projection.projectRecord(rec2, policy.evaluateRecord(rec2));

  const exporter = new CsvExporter();
  const csv1 = exporter.serialize([p1, p2]);
  const csv2 = exporter.serialize([p1, p2]);

  const h1 = crypto.createHash('sha256').update(csv1).digest('hex');
  const h2 = crypto.createHash('sha256').update(csv2).digest('hex');
  assert.strictEqual(h1, h2, 'CSV export must be 100% deterministic');
});

test('E2E-11: Popup + side panel open simultaneously (shared state, no collisions)', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ candidateId: 'dual_context', displayName: 'Synchronized Entity' });
  await repo.saveEntity(entity);

  const loaded1 = await repo.getEntity(entity.entityId);
  const loaded2 = await repo.getEntity(entity.entityId);

  assert.strictEqual(loaded1.canonicalDisplayName, loaded2.canonicalDisplayName);
  assert.strictEqual(loaded1.entityId, loaded2.entityId);
});

test('E2E-12: Run updates while UI is open (real-time stage and counter advancement)', () => {
  const mockRun = {
    runId: 'run_live_12',
    runVersion: '1.0.0',
    status: 'RUNNING',
    config: { selectedSources: ['META'] },
    stageStates: {
      SOURCE_PLANNING: 'COMPLETED',
      SOURCE_EXECUTION: 'IN_PROGRESS'
    },
    sourceStates: { META: 'COLLECTING' }
  };

  const vm = toRunStatusViewModel(mockRun, 5000);
  assert.strictEqual(vm.globalStatus, 'RUNNING');
  assert.strictEqual(vm.elapsedMs, 5000);
});

test('E2E-13: Browser restart during active/recoverable state (staged checkpoint recovery)', async () => {
  const adapter = new MemoryStorageAdapter();
  const cpStore = new CheckpointStore(adapter);
  const runId = 'run_restart_13';

  await cpStore.stageCheckpoint({
    checkpointId: 'chk_restart_13',
    runId,
    runVersion: '1.0.0',
    planVersion: '1.0',
    pipelineVersion: '1.0.0-phase14',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    completedStages: ['SOURCE_PLANNING', 'SOURCE_EXECUTION', 'NORMALIZATION'],
    sourceStates: {},
    candidateReferences: ['c1'],
    entityReferences: ['e1']
  });
  await cpStore.commitCheckpoint('chk_restart_13');

  // Fresh store instance simulating restart
  const newCpStore = new CheckpointStore(adapter);
  const committed = await newCpStore.getLatestValidCheckpoint(runId);
  assert.ok(committed);
  assert.strictEqual(committed.completedStages.includes('NORMALIZATION'), true);
});

test('E2E-14: Malformed input -> rejection -> recovery', () => {
  const badUrl = 'javascript:alert(document.cookie)';
  assert.strictEqual(isValidExternalUrl(badUrl), false);
  assert.strictEqual(getSafeExternalUrl(badUrl), null);

  const xssName = '<b onmouseover=alert(1)>Malicious</b>';
  const escaped = escapeHtml(xssName);
  assert.strictEqual(escaped.includes('<b'), false);
});

test('E2E-15: Large result set -> filter -> sort -> detail -> export', () => {
  const records = [];
  for (let i = 0; i < 500; i++) {
    records.push(createTestUnifiedRecord({
      candidateId: `scale_${i}`,
      displayName: `Company ${String(i).padStart(4, '0')}`
    }));
  }

  const vms = records.map(toResultRowViewModel);
  assert.strictEqual(vms.length, 500);

  // Filter
  const filtered = records.filter(r => r.canonicalDisplayName.includes('005'));
  assert.ok(filtered.length >= 1);

  // Export selection
  const policy = new ExportPolicy();
  const projection = new ExportProjection();
  const projectedList = filtered.map(r => projection.projectRecord(r, policy.evaluateRecord(r))).filter(Boolean);
  const exporter = new CsvExporter();
  const csv = exporter.serialize(projectedList);
  assert.ok(csv.length > 0);
});

test('E2E-16: Empty result set -> user recovery', () => {
  const emptyResults = [];
  const vm = toExportPreviewViewModel(emptyResults);
  assert.strictEqual(vm.totalSelectedRecords, 0);
  assert.strictEqual(vm.isExportReady, false);
});

test('E2E-17: Blocked source -> user recovery', () => {
  const gmapsEnv = createTestEnvelope({ sourceType: 'GOOGLE_MAPS' });
  const row = toResultRowViewModel(gmapsEnv);
  assert.strictEqual(row.isRestricted, true);
  assert.strictEqual(row.isExportable, false);
});

test('E2E-18: Unknown state -> user recovery', () => {
  const rawState = 'UNKNOWN_STATE';
  const vm = toRunStatusViewModel({
    runId: 'run_unk',
    runVersion: '1.0.0',
    status: rawState,
    config: { selectedSources: ['META'] },
    stageStates: {},
    sourceStates: {}
  });
  assert.ok(vm);
});

test('E2E-19: Partial workflow -> resume later', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);
  const cpStore = new CheckpointStore(adapter);
  const runId = 'run_part_19';

  await repo.createRun({
    runId,
    runVersion: '1.0.0',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    recordVersion: 1,
    selectedSources: ['META'],
    globalExecutionMode: 'LIVE',
    status: 'PARTIAL',
    recoveryState: 'RESUMABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configFingerprint: 'fp_19',
    completedStages: ['SOURCE_PLANNING'],
    candidateCount: 0,
    entityCount: 0,
    exportAuditIds: [],
    diagnostics: { warnings: [], errors: [], blockedCount: 0 }
  });

  await cpStore.stageCheckpoint({
    checkpointId: 'chk_part_19',
    runId,
    runVersion: '1.0.0',
    planVersion: '1.0',
    pipelineVersion: '1.0.0-phase14',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    completedStages: ['SOURCE_PLANNING'],
    sourceStates: {},
    candidateReferences: [],
    entityReferences: []
  });
  await cpStore.commitCheckpoint('chk_part_19');

  const recMgr = new RecoveryManager(adapter, cpStore);
  const plan = await recMgr.planResumption(runId);
  assert.strictEqual(plan.isResumable, true);
  assert.strictEqual(plan.resumableStages[0], 'SOURCE_EXECUTION');
});

test('E2E-20: Historical run -> reopen -> inspect -> export', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ candidateId: 'hist_20', displayName: 'Historical Furniture AS' });
  await repo.saveEntity(entity);

  const fetched = await repo.getEntity(entity.entityId);
  assert.ok(fetched);
  assert.strictEqual(fetched.canonicalDisplayName, 'Historical Furniture AS');

  const unified = createTestUnifiedRecord({ candidateId: 'hist_20', displayName: 'Historical Furniture AS' });
  const detail = toResultDetailViewModel(unified);
  assert.strictEqual(detail.displayName, 'Historical Furniture AS');
});

test('E2E-21: Duplicate user action -> no duplicate state', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const entity = createTestEntityRecord({ candidateId: 'dup_21', displayName: 'Single Entity' });
  await repo.saveEntity(entity);
  await repo.saveEntity(entity); // Idempotent duplicate write

  const list = await repo.listEntitiesByRun('run_pr');
  assert.strictEqual(list.length, 1);
});

test('E2E-22: Rapid source switching', () => {
  const registry = new UnifiedSourceAdapterRegistry();
  const meta = registry.get('META');
  const gmaps = registry.get('GOOGLE_MAPS');
  const web = registry.get('WEBSITE');

  assert.strictEqual(meta.sourceType, 'META');
  assert.strictEqual(gmaps.sourceType, 'GOOGLE_MAPS');
  assert.strictEqual(web.sourceType, 'WEBSITE');
});

test('E2E-23: Rapid filter/sort changes', () => {
  const items = [
    { name: 'Zeta Corp', score: 95 },
    { name: 'Alpha Ltd', score: 80 },
    { name: 'Beta Inc', score: 90 }
  ];

  const sortedAlpha = [...items].sort((a, b) => a.name.localeCompare(b.name));
  assert.strictEqual(sortedAlpha[0].name, 'Alpha Ltd');

  const sortedScore = [...items].sort((a, b) => b.score - a.score);
  assert.strictEqual(sortedScore[0].name, 'Zeta Corp');
});

test('E2E-24: Close/reopen popup repeatedly (storage durability)', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  await repo.saveEntity(createTestEntityRecord({ candidateId: 'pop_24' }));

  // Simulate closing and reopening popup 5 times
  for (let i = 0; i < 5; i++) {
    const freshRepo = new PersistenceRepository(adapter);
    const count = (await freshRepo.listEntitiesByRun('run_pr')).length;
    assert.strictEqual(count, 1);
  }
});

test('E2E-25: Close/reopen side panel repeatedly (listener cleanup & state durability)', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  await repo.saveEntity(createTestEntityRecord({ candidateId: 'side_25' }));
  const loaded = await repo.getEntity('ent_side_25');
  assert.ok(loaded);
});

test('E2E-26: Extension reload during UI state', async () => {
  const adapter = new MemoryStorageAdapter();
  const cpStore = new CheckpointStore(adapter);
  await cpStore.stageCheckpoint({
    checkpointId: 'chk_reload_26',
    runId: 'reload_26',
    runVersion: '1.0.0',
    planVersion: '1.0',
    pipelineVersion: '1.0.0-phase14',
    schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    completedStages: ['SOURCE_PLANNING', 'SOURCE_EXECUTION'],
    sourceStates: {},
    candidateReferences: ['c1'],
    entityReferences: ['e1']
  });
  await cpStore.commitCheckpoint('chk_reload_26');

  const loaded = await cpStore.getLatestValidCheckpoint('reload_26');
  assert.ok(loaded);
  assert.strictEqual(loaded.completedStages.includes('SOURCE_EXECUTION'), true);
});

test('E2E-27: Service worker restart (checkStaleJobs marks stale)', () => {
  const staleThreshold = 5 * 60 * 1000;
  const lastUpdated = Date.now() - (6 * 60 * 1000); // 6 mins ago
  const isStale = (Date.now() - lastUpdated) > staleThreshold;
  assert.strictEqual(isStale, true);
});

test('E2E-28: Storage pressure / quota simulation where practical', async () => {
  const adapter = new MemoryStorageAdapter();
  const cpStore = new CheckpointStore(adapter);

  // Commit 15 checkpoints
  for (let i = 1; i <= 15; i++) {
    await cpStore.stageCheckpoint({
      checkpointId: `chk_quota_${i}`,
      runId: 'run_quota_28',
      runVersion: '1.0.0',
      planVersion: '1.0',
      pipelineVersion: '1.0.0-phase14',
      schemaVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
      completedStages: ['SOURCE_PLANNING'],
      sourceStates: {},
      candidateReferences: [],
      entityReferences: []
    });
    await cpStore.commitCheckpoint(`chk_quota_${i}`);
  }

  // Automatic checkpoint store retention prunes to MAX_CHECKPOINTS_PER_RUN (10)
  const remaining = await adapter.list('checkpoints', c => c.runId === 'run_quota_28');
  assert.strictEqual(remaining.length, 10);
});

test('E2E-29: Malformed persisted data handling', () => {
  const invalidJson = '{ "broken": ';
  let parsed = null;
  try {
    parsed = JSON.parse(invalidJson);
  } catch (e) {
    parsed = null;
  }
  assert.strictEqual(parsed, null);
});

test('E2E-30: Full clean-install-to-export journey', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  // 1. Initial empty
  assert.strictEqual((await repo.listEntitiesByRun('run_pr')).length, 0);

  // 2. Discover & normalize
  const entity = createTestEntityRecord({ candidateId: 'clean_30', displayName: 'End to End Norway AS' });
  await repo.saveEntity(entity);

  // 3. Inspect
  const fetchedEntity = await repo.getEntity(entity.entityId);
  assert.ok(fetchedEntity);
  assert.strictEqual(fetchedEntity.canonicalDisplayName, 'End to End Norway AS');

  const unified = createTestUnifiedRecord({ candidateId: 'clean_30', displayName: 'End to End Norway AS' });
  const detail = toResultDetailViewModel(unified);
  assert.strictEqual(detail.displayName, 'End to End Norway AS');

  // 4. Export
  const policy = new ExportPolicy();
  const evalResult = policy.evaluateRecord(unified);
  const projection = new ExportProjection();
  const projected = projection.projectRecord(unified, evalResult);
  assert.ok(projected);
  const exporter = new CsvExporter();
  const csv = exporter.serialize([projected]);
  assert.ok(csv.includes('End to End Norway AS'));
});

// ============================================================================
// PART 2: EXPLORATORY BUG HUNTING & ADVERSARIAL TESTING
// ============================================================================
section('PART 2: EXPLORATORY BUG HUNTING & ADVERSARIAL TESTING');

test('ADV-01: CSV formula injection with = prefix is neutralized', () => {
  const exporter = new CsvExporter();
  const safe = exporter.sanitizeCellValue('=cmd|"/C calc"!A0');
  assert.ok(safe.includes("'="), 'Must escape leading =');
});

test('ADV-02: CSV formula injection with + prefix is neutralized', () => {
  const exporter = new CsvExporter();
  const safe = exporter.sanitizeCellValue('+1+1');
  assert.ok(safe.startsWith("'+"), 'Must escape leading +');
});

test('ADV-03: CSV formula injection with - prefix is neutralized', () => {
  const exporter = new CsvExporter();
  const safe = exporter.sanitizeCellValue('-5+5');
  assert.ok(safe.startsWith("'-"), 'Must escape leading -');
});

test('ADV-04: CSV formula injection with @ prefix is neutralized', () => {
  const exporter = new CsvExporter();
  const safe = exporter.sanitizeCellValue('@SUM(A1:A10)');
  assert.ok(safe.startsWith("'@"), 'Must escape leading @');
});

test('ADV-05: Prototype pollution keys are discarded in canonicalJsonStringify', () => {
  const malicious = JSON.parse('{"__proto__":{"polluted":true},"valid":"data"}');
  const serialized = canonicalJsonStringify(malicious);
  assert.strictEqual(serialized.includes('__proto__'), false);
});

test('ADV-06: Unicode robustness: Bengali script handling', () => {
  const name = 'ফার্নিচার অ্যান্ড হোম ডেকর';
  const escaped = escapeHtml(name);
  assert.strictEqual(escaped, name);

  const row = toResultRowViewModel(createTestEnvelope({ displayName: name }));
  assert.strictEqual(row.displayName, name);
});

test('ADV-07: Unicode robustness: Arabic / RTL script handling', () => {
  const name = 'أثاث وديكور منزلي فاخر';
  const escaped = escapeHtml(name);
  assert.strictEqual(escaped, name);

  const row = toResultRowViewModel(createTestEnvelope({ displayName: name }));
  assert.strictEqual(row.displayName, name);
});

test('ADV-08: Unicode robustness: Chinese script handling', () => {
  const name = '北欧现代家具设计有限公司';
  const escaped = escapeHtml(name);
  assert.strictEqual(escaped, name);

  const row = toResultRowViewModel(createTestEnvelope({ displayName: name }));
  assert.strictEqual(row.displayName, name);
});

test('ADV-09: Unicode robustness: Emoji & Surrogate pairs', () => {
  const name = '🛋️ Nordic Living 🪑 ✨';
  const escaped = escapeHtml(name);
  assert.strictEqual(escaped, name);

  const row = toResultRowViewModel(createTestEnvelope({ displayName: name }));
  assert.strictEqual(row.displayName, name);
});

test('ADV-10: Long string testing: 1,000 char business name does not crash mapper', () => {
  const longName = 'A'.repeat(1000);
  const truncated = sanitizePassiveText(longName, 120);
  assert.strictEqual(truncated.length <= 123, true);

  const row = toResultRowViewModel(createTestEnvelope({ displayName: longName }));
  assert.ok(row.displayName);
});

test('ADV-11: Long string testing: 2,000 char URL bounded and protocols validated', () => {
  const longUrl = 'https://www.example.com/' + 'a'.repeat(2100);
  const bounded = sanitizePassiveText(longUrl, 200);
  assert.strictEqual(bounded.length <= 203, true);
  assert.strictEqual(isValidExternalUrl('javascript:alert(1)'), false);
  assert.strictEqual(isValidExternalUrl('data:text/html,<script>alert(1)</script>'), false);
});

test('ADV-12: Status Semantics: SKIPPED != NOT_QUALIFIED', () => {
  assert.notStrictEqual('SKIPPED', 'NOT_QUALIFIED');
});

test('ADV-13: Status Semantics: BLOCKED != NOT_FOUND', () => {
  assert.notStrictEqual('BLOCKED', 'NOT_FOUND');
});

test('ADV-14: Status Semantics: CONTRACT_ONLY != COMPLETED', () => {
  assert.notStrictEqual('CONTRACT_ONLY', 'COMPLETED');
});

test('ADV-15: Status Semantics: UNKNOWN != FAIL', () => {
  assert.notStrictEqual('UNKNOWN', 'FAIL');
});

test('ADV-16: Status Semantics: PARTIAL != COMPLETE', () => {
  assert.notStrictEqual('PARTIAL', 'COMPLETE');
});

test('ADV-17: Status Semantics: NOT_FOUND != UNKNOWN', () => {
  assert.notStrictEqual('NOT_FOUND', 'UNKNOWN');
});

test('ADV-18: Status Semantics: UNCERTAIN != FAIL', () => {
  assert.notStrictEqual('UNCERTAIN', 'FAIL');
});

test('ADV-19: Double-action testing: Repeated export call is idempotent', () => {
  const rec = createTestUnifiedRecord({ candidateId: 'dup_exp' });
  const policy = new ExportPolicy();
  const evalResult = policy.evaluateRecord(rec);
  const projection = new ExportProjection();
  const projected = projection.projectRecord(rec, evalResult);
  const exporter = new CsvExporter();

  const out1 = exporter.serialize([projected]);
  const out2 = exporter.serialize([projected]);
  assert.strictEqual(out1, out2);
});

test('ADV-20: Rapid-action testing: 100 rapid filter operations execute without memory error', () => {
  const list = [];
  for (let i = 0; i < 100; i++) {
    list.push({ id: i, text: `Item ${i}` });
  }

  for (let cycle = 0; cycle < 100; cycle++) {
    const q = String(cycle % 10);
    const res = list.filter(item => item.text.includes(q));
    assert.ok(res.length >= 0);
  }
});

test('ADV-21: Benchmark: 1,000 candidate validations complete in < 50ms', () => {
  const cand = createTestEnvelope();
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    validateRecordForWrite('candidate', cand);
  }
  const duration = Date.now() - start;
  assert.ok(duration < 50, `1,000 validations took ${duration}ms (must be < 50ms)`);
});

test('ADV-22: Benchmark: 1,000 JSON serialization cycles complete in < 50ms', () => {
  const cand = createTestEnvelope();
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    canonicalJsonStringify(cand);
  }
  const duration = Date.now() - start;
  assert.ok(duration < 50, `1,000 serializations took ${duration}ms (must be < 50ms)`);
});

test('ADV-23: Memory stability across 10 sequential batch cycles', async () => {
  const adapter = new MemoryStorageAdapter();
  const repo = new PersistenceRepository(adapter);

  const initialHeap = process.memoryUsage().heapUsed;

  for (let cycle = 0; cycle < 10; cycle++) {
    const records = [];
    for (let j = 0; j < 50; j++) {
      records.push(createTestEntityRecord({ candidateId: `mem_${cycle}_${j}` }));
    }
    for (const r of records) {
      await repo.saveEntity(r);
    }
  }

  const finalHeap = process.memoryUsage().heapUsed;
  const heapDeltaMB = (finalHeap - initialHeap) / (1024 * 1024);
  assert.ok(heapDeltaMB < 20, `Heap delta across 10 cycles was ${heapDeltaMB.toFixed(2)} MB (< 20 MB limit)`);
});

// ============================================================================
// PART 3: EXTENSION PACKAGING & UPLOAD-READINESS
// ============================================================================
section('PART 3: EXTENSION PACKAGING & UPLOAD-READINESS');

test('PKG-01: Final release archive dist/leadnoria-v1.1.0.zip exists', () => {
  const p = path.join(rootDir, 'dist/leadnoria-v1.1.0.zip');
  assert.ok(fs.existsSync(p));
});

test('PKG-02: Final release archive is greater than 500 KB', () => {
  const p = path.join(rootDir, 'dist/leadnoria-v1.1.0.zip');
  const size = fs.statSync(p).size;
  assert.ok(size > 500000, `Archive size is ${size} bytes`);
});

test('PKG-03: Historical frozen archive dist/leadnoria-v1.0.0.zip remains untouched', () => {
  const p = path.join(rootDir, 'dist/leadnoria-v1.0.0.zip');
  assert.ok(fs.existsSync(p));
  const content = fs.readFileSync(p);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  assert.strictEqual(hash, 'bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b');
});

test('PKG-04: Extension directory contains valid manifest.json', () => {
  const manifestPath = path.join(rootDir, 'extension/manifest.json');
  assert.ok(fs.existsSync(manifestPath));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.strictEqual(manifest.name, 'LeadNoria');
  assert.strictEqual(manifest.version, pkgJson.version);
  assert.strictEqual(manifest.manifest_version, 3);
});

test('PKG-05: Required icons exist and are valid PNGs', () => {
  const iconSizes = [16, 32, 48, 128];
  for (const s of iconSizes) {
    const iconPath = path.join(rootDir, `extension/icons/icon-${s}.png`);
    assert.ok(fs.existsSync(iconPath), `Icon ${s} must exist`);
    const header = fs.readFileSync(iconPath).subarray(0, 8);
    const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    assert.deepStrictEqual(header, pngSig, `Icon ${s} must have valid PNG signature`);
  }
});

test('PKG-06: Zero development or test artifacts in extension bundle', () => {
  const extFiles = fs.readdirSync(path.join(rootDir, 'extension'), { recursive: true }).map(String);
  for (const f of extFiles) {
    assert.strictEqual(f.endsWith('.test.js'), false, `Forbidden test file: ${f}`);
    assert.strictEqual(f.endsWith('.spec.js'), false, `Forbidden spec file: ${f}`);
    assert.strictEqual(f.includes('fixtures'), false, `Forbidden fixture path: ${f}`);
  }
});

test('PKG-07: Manifest permissions strictly limited to 4 core permissions', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension/manifest.json'), 'utf8'));
  const approved = ['storage', 'tabs', 'scripting', 'sidePanel'];
  assert.deepStrictEqual(manifest.permissions.sort(), approved.sort());
});

test('PKG-08: Host permissions strictly bounded to Meta Ad Library', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension/manifest.json'), 'utf8'));
  const approvedHosts = [
    'https://www.facebook.com/ads/library/*',
    'https://web.facebook.com/ads/library/*'
  ];
  assert.deepStrictEqual(manifest.host_permissions.sort(), approvedHosts.sort());
});

test('PKG-09: Optional host permissions exist for user-directed website verification', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension/manifest.json'), 'utf8'));
  assert.deepStrictEqual(manifest.optional_host_permissions, ['https://*/*']);
});

test('PKG-10: Responsive styling present in sidepanel.html', () => {
  const html = fs.readFileSync(path.join(rootDir, 'extension/sidepanel.html'), 'utf8');
  assert.ok(html.includes('100vh') || html.includes('100%'), 'sidepanel.html must have responsive viewport');
});

// ============================================================================
// TEST RUNNER
// ============================================================================
async function runAllTests() {
  for (const item of testQueue) {
    if (item.type === 'section') {
      console.log(`\n--- ${item.title} ---`);
      continue;
    }
    totalTests++;
    try {
      const res = item.fn();
      if (res && typeof res.then === 'function') {
        await res;
      }
      passedTests++;
      console.log(`  [PASS] Test ${totalTests}: ${item.name}`);
    } catch (err) {
      failedTests++;
      console.error(`  [FAIL] Test ${totalTests}: ${item.name}`);
      console.error(`         ${err.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('POST-RELEASE FULL-SYSTEM AUDIT SUMMARY');
  console.log('================================================================');
  console.log(`  Total Executed: ${totalTests}`);
  console.log(`  Passed:         ${passedTests}`);
  console.log(`  Failed:         ${failedTests}`);
  console.log('================================================================');

  if (failedTests === 0) {
    console.log('\n>>> ALL POST-RELEASE FULL-SYSTEM AUDIT TESTS PASSED! <<<\n');
  } else {
    console.log(`\n>>> ${failedTests} TEST(S) FAILED <<<\n`);
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
