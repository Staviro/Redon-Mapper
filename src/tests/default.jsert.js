import { RedonMapper } from "../lib/redon-mapper.js";
import { Jsert } from "../js/jsert.js";
import { userTemplate } from "../templates/user.tmpl.js";
import { mockUsers } from "../data/mock-users.js";
import { mockBankAccounts } from "../mock/mock-bank-account.js";
import { bankAccountTemplate } from "../templates/bank-account.tmpl.js";

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

jsert.test(
  "currency should never be null if default value is set",
  function () {
    const data = RedonMapper.map(mockBankAccounts, bankAccountTemplate);
    const nullCurrencyCount = data.filter((x) => x.currency === null).length;
    jsert.passWhenEquals(this, nullCurrencyCount, 0);
  }
);

jsert.test("all user balances must be of type 'number'", function () {
  const data = RedonMapper.map(mockBankAccounts, bankAccountTemplate);
  const allNumbers = data.every((x) => typeof x.currentBalance === "number");
  jsert.passWhenTruthy(this, allNumbers);
});

export const defaultJsert = jsert;
