export const userTemplate = {
  id: {
    sourceKeys: ["id", "_id", "UserId", "_userId", "USER_ID", "ID"],
  },
  username: {
    sourceKeys: ["_username", "USERNAME", "username", "userName", "user"],
    defaultValue: null,
  },
  registeredDate: {
    sourceKeys: [
      "REGISTEREDDate",
      "REGISTEREDDATE",
      "registeredDate",
      "registereddate",
      "registered_date",
    ],
    defaultValue: "1800/01/01",
    transform: (value) => new Date(value),
  },
};
