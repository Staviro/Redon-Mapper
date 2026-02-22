import {transformJsert} from "./transform.jsert.js"
import {defaultJsert} from "./default.jsert.js"
import {mapperJsert} from "./mapper.jsert.js"
import {NeonTrace, NeonTraceTargets} from "../js/neon-trace.mjs"

const trace = new NeonTrace({
	prefix: "Test Runner |",
	level: "debug",
	target: NeonTraceTargets.terminal
})

const summary = []

for (const js of [transformJsert, defaultJsert, mapperJsert]) {
	const result = await js.run()
	summary.push(result.getJSONReport())
}

trace.info("Test Summary")
trace.info("Total Groups: " + summary.length)
trace.info(
	"Total Tests: " +
		summary.map((x) => x.report.totalTests).reduce((a, b) => a + b, 0)
)
trace.info(
	"Total Passed: " +
		summary.map((x) => x.report.passed).reduce((a, b) => a + b, 0)
)
trace.info(
	"Total Failed: " +
		summary.map((x) => x.report.failed).reduce((a, b) => a + b, 0)
)
