import { transformJsert } from "./transform.jsert.js";
import { defaultJsert } from "./default.jsert.js";
import { mapperJsert } from "./mapper.jsert.js";

[transformJsert, defaultJsert, mapperJsert].forEach((jsert) => {
  jsert.run();
});
