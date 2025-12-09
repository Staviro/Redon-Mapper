import { RedonMapper } from "../lib/redon-mapper.js";
import { Jsert } from "../js/jsert.js";
import { userTemplate } from "../templates/user.tmpl.js";
import { mockUsers } from "../data/mock-users.js";

const jsert = new Jsert("Mapper Tests");

jsert.test(
  "After mapping, filters must return the same number of records when checking for the template keys",
  function () {
    const data = RedonMapper.map(mockUsers, userTemplate);
    const idCount = data.filter((x) => x.id).length;
    const usernameCount = data.filter((x) => x.username).length;
    const registeredDateCount = data.filter((x) => x.registeredDate).length;
    jsert.passWhen(
      this,
      idCount === usernameCount && idCount === registeredDateCount
    );
  }
);

jsert.test(
  "After mapping, registeredDate must available for all records",
  function () {
    const data = RedonMapper.map(mockUsers, userTemplate);
    const registeredDateCount = data.filter(
      (x) => x.registeredDate != undefined
    ).length;
    jsert.passWhen(this, registeredDateCount === data.length);
  }
);

jsert.test(
  "After mapping, the mapped user must match the expected response user",
  function () {
    const mockUser = {
      _username: "mike_code",
      UserId: "e5f6g7h8i9",
      registereddate: "2024-02-29T11:15:00Z",
    };
    const response = RedonMapper.map(mockUser, userTemplate);
    const expected = {
      username: "mike_code",
      id: "e5f6g7h8i9",
      registeredDate: new Date("2024-02-29T11:15:00Z"),
    };
    jsert.passWhenMatch(this, response, expected);
  }
);

export const mapperJsert = jsert;
