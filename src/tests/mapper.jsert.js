import { RedonMapper } from "../lib/redon-mapper.js";
import { Jsert } from "../js/jsert.js";
import { userTemplate } from "../templates/user.tmpl.js";
import { mockUser } from "../mock/mock-user.js";
import { mockUsers } from "../data/mock-users.js";
import { mockBankAccounts } from "../mock/mock-bank-account.js";
import { bankAccountTemplate } from "../templates/bank-account.tmpl.js";

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
    jsert.passWhenEquals(this, registeredDateCount, data.length);
  }
);

jsert.test(
  "After mapping, all mapped key value types must match template types",
  function () {
    const data = RedonMapper.map(mockUser, userTemplate);
    const result =
      typeof data.id === "string" &&
      typeof data.username === "string" &&
      typeof data.registeredDate === "object";
    jsert.passWhenTruthy(this, result);
  }
);

jsert.test(
  "After mapping, registeredDate default value must be found in at least one record",
  function () {
    const defaultValue = new Date(userTemplate.registeredDate.defaultValue);
    const data = RedonMapper.map(mockUsers, userTemplate);
    const registeredDateCount = data.filter(
      (x) => x.registeredDate.getTime() === defaultValue.getTime()
    ).length;
    jsert.passWhen(this, registeredDateCount > 0);
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

jsert.test(
  "After mapping, the mapped bank accounts have must have valid ownerInfo objects as specified in the template",
  function () {
    const data = RedonMapper.map(mockBankAccounts, bankAccountTemplate);
    const templateOwnerInfoKeysCount = Object.keys(bankAccountTemplate).filter(
      (x) => x.includes("ownerInfo")
    ).length;
    let hasMatch = false;

    for (const ba of data) {
      const ownerInfo = ba.ownerInfo;
      const ownerInfoKeysCount = Object.keys(ownerInfo).length;
      if (ownerInfoKeysCount === templateOwnerInfoKeysCount) {
        hasMatch = true;
        break;
      }
    }

    jsert.passWhenTruthy(this, hasMatch);
  }
);
export const mapperJsert = jsert;
