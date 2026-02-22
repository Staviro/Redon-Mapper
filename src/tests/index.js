import { transformJsert } from "./transform.jsert.js";
import { defaultJsert } from "./default.jsert.js";
import { mapperJsert } from "./mapper.jsert.js";
import { NeonTrace, NeonTraceTargets } from "../js/neon-trace.mjs";

const trace = new NeonTrace({
  prefix: "Test Runner |",
  level: "debug",
  target: NeonTraceTargets.terminal,
});

const summary = [];
[transformJsert, defaultJsert, mapperJsert].forEach((jsert) => {
  summary.push(jsert.run().getJSONReport());
});

trace.info("Test Summary");
trace.info("Total Groups: " + summary.length);
trace.info(
  "Total Tests: " +
    summary.map((x) => x.report.totalTests).reduce((a, b) => a + b, 0),
);
trace.info(
  "Total Passed: " +
    summary.map((x) => x.report.passed).reduce((a, b) => a + b, 0),
);
trace.info(
  "Total Failed: " +
    summary.map((x) => x.report.failed).reduce((a, b) => a + b, 0),
);
