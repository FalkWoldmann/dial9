// Test for diagnose_setup.mjs — verifies detection of common dial9
// misconfigurations against real generated traces.
//
// Migrated from test_diagnose_setup.js (T11). Requires the diagnostic traces
// produced by scripts/generate_diagnostic_traces.sh; the trace directory
// comes from the D9_DIAGNOSTIC_TRACES env var (the original's argv[2]),
// defaulting to /tmp/dial9-diagnostic-traces. The original exited 1 when the
// directory was missing (a usage guard for a manually-invoked script); under
// Vitest the whole suite is SKIPPED instead, so `npm run test` stays green on
// machines that have not generated the traces. Run
// scripts/generate_diagnostic_traces.sh first to exercise it.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const diagnoseSetupPath = fileURLToPath(
  new URL("../../../skills/dial9-toolkit/scripts/diagnose_setup.mjs", import.meta.url),
);

interface Finding {
  check: string;
  severity: string;
}

const { diagnoseSetup } = (await import(diagnoseSetupPath)) as {
  diagnoseSetup: (dir: string) => Promise<Finding[]>;
};

const traceDir =
  process.env["D9_DIAGNOSTIC_TRACES"] ?? "/tmp/dial9-diagnostic-traces";

// Suppress console.log output from diagnoseSetup during tests (as the
// original did around its whole run).
async function quietly<T>(fn: () => Promise<T>): Promise<T> {
  const origLog = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = origLog;
  }
}

const dirOf = (name: string): string => path.join(traceDir, name);

describe.skipIf(!fs.existsSync(traceDir))(
  "diagnoseSetup (generated diagnostic traces)",
  { timeout: 120_000 },
  () => {
    // Test 1: no-frame-pointers should detect missing frame pointers
    it.skipIf(!fs.existsSync(dirOf("no-frame-pointers")))(
      "no-frame-pointers detected as critical",
      async () => {
        const findings = await quietly(() => diagnoseSetup(dirOf("no-frame-pointers")));
        const fp = findings.find((f) => f.check === "missing-frame-pointers");
        expect(fp != null, "should detect missing frame pointers").toBe(true);
        expect(
          fp && fp.severity === "critical",
          "missing frame pointers should be critical",
        ).toBe(true);
      },
    );

    // Test 2: no-wake-events should detect missing wake events
    it.skipIf(!fs.existsSync(dirOf("no-wake-events")))(
      "no-wake-events detected as warning",
      async () => {
        const findings = await quietly(() => diagnoseSetup(dirOf("no-wake-events")));
        const we = findings.find((f) => f.check === "missing-wake-events");
        expect(we != null, "should detect missing wake events").toBe(true);
        expect(
          we && we.severity === "warning",
          "missing wake events should be warning",
        ).toBe(true);
      },
    );

    // Test 3: no-debug-symbols should detect missing debug symbols
    it.skipIf(!fs.existsSync(dirOf("no-debug-symbols")))(
      "no-debug-symbols detected as warning",
      async () => {
        const findings = await quietly(() => diagnoseSetup(dirOf("no-debug-symbols")));
        const ds = findings.find((f) => f.check === "missing-debug-symbols");
        expect(ds != null, "should detect missing debug symbols").toBe(true);
        expect(
          ds && ds.severity === "warning",
          "missing debug symbols should be warning",
        ).toBe(true);
      },
    );

    // Test 4: no-sched-events should detect no scheduling events
    it.skipIf(!fs.existsSync(dirOf("no-sched-events")))(
      "no-sched-events detected as info",
      async () => {
        const findings = await quietly(() => diagnoseSetup(dirOf("no-sched-events")));
        const se = findings.find((f) => f.check === "no-scheduling-events");
        expect(se != null, "should detect no scheduling events").toBe(true);
        expect(
          se && se.severity === "info",
          "no scheduling events should be info",
        ).toBe(true);
      },
    );

    // Test 5: good trace should NOT have critical/warning findings (only info)
    it.skipIf(!fs.existsSync(dirOf("good")))(
      "good reference trace has no critical/warning findings",
      async () => {
        const findings = await quietly(() => diagnoseSetup(dirOf("good")));
        const serious = findings.filter(
          (f) => f.severity === "critical" || f.severity === "warning",
        );
        expect(
          serious.map((f) => f.check),
          "good trace should have no critical/warning findings",
        ).toEqual([]);
      },
    );
  },
);
