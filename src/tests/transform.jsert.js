import { RedonMapper } from "../lib/redon-mapper.js";
import { Jsert } from "../js/jsert.js";
import { mockUser } from "../mock/mock-user.js";
import { userTemplate } from "../templates/user.tmpl.js";

const jsert = new Jsert("Transform Tests");

jsert.test(
  "registerdDate should be of type 'object' when transformed in template definition",
  function () {
    const data = RedonMapper.map(mockUser, userTemplate);
    jsert.passWhen(this, typeof data.registeredDate === "object");
  }
);

export const transformJsert = jsert;
