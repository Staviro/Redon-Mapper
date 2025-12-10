import { RedonMapper } from "../lib/redon-mapper.js";
import { Jsert } from "../js/jsert.js";
import { userTemplate } from "../templates/user.tmpl.js";
import { mockUsers } from "../data/mock-users.js";

const jsert = new Jsert("Default Tests");

jsert.test(
  "registeredDate should return default value if not specified",
  function () {
    const defaultDate = new Date(userTemplate.registeredDate.defaultValue);
    const data = RedonMapper.map(mockUsers, userTemplate);
    jsert.passWhen(
      this,
      data.filter((x) => x.registeredDate.getTime() === defaultDate.getTime())
        .length > 0
    );
  }
);

export const defaultJsert = jsert;
