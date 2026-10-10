// The toolkit's ES module entry point: everything a custom analysis script
// needs, in one import.
//
//   import { analyzeTraces, parseTrace, buildWorkerSpans } from './toolkit.mjs';
//
// trace_parser.js and trace_analysis.js are CommonJS files shared with the
// viewer, and Node cannot see trace_analysis.js's exports as named imports, so
// they are re-exported here by name. A test checks this list stays complete.

import parser from './trace_parser.js';
import analysis from './trace_analysis.js';

export { analyzeTraces } from './analyze.mjs';
export { diagnoseSetup } from './diagnose_setup.mjs';

export const {
  EVENT_TYPES, OFF_WORKER_WORKER_ID,
  parseTrace, parseTraceStream, parseOne,
  fetchTraces, fetchTraceStream, fetchTracesStream, canStreamDecode,
  formatFrame, docsRsUrl, symbolizeChain, deduplicateSamples,
  deriveBlockInPlaceGaps, deriveCapabilities,
  decodeLegacyActiveTaskSample, decodeRuntimeMetricsSample,
  compileSingleEventSpanSchema, resolveSpanTiming,
} = parser;

export const {
  buildWorkerSpans, activeTaskSeries, globalQueueSeries,
  sumActiveTasksByCycle, sumGlobalQueueByCycle,
  computeRuntimeGroups, buildRuntimeFilterData,
  attachCpuSamples, buildActiveTaskTimeline, computeSchedulingDelays, computePollWakes,
  filterPointsOfInterest, DEFAULT_SPAWN_DELAY_THRESHOLD_US, POI_DEFAULT_WORST_N,
  flamegraphColor, buildFlamegraphTreeFromApi, buildFlamegraphTree, flattenFlamegraph, buildFgData,
  getTraceTimeRange, hasCpuProfileSamples, buildProcessCpuUsageSeries,
  buildSpanData, indexPollsByTask, resolveSpanTask, reconstructSpanSegments,
  collectDescendants, selectSpanRenderSet, enclosingSpans, computeSpanLayout,
  analyzeAllocations,
  pollHeatmapColor, pollHeatmapColorQuantized, makeBarCoalescer, pixelDownsampleSpans, pixelCoverage,
} = analysis;
