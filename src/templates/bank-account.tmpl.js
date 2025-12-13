export const bankAccountTemplate = {
  accountId: {
    sourceKeys: [
      "account_details.account_number",
      "account_id",
      "source.id",
      "id",
    ],
  },
  accountType: {
    sourceKeys: ["product_type_code", "type", "account_category"],
    defaultValue: "UNKNOWN",
  },
  bankCode: {
    sourceKeys: ["institution.routing_swift_id", "bank_code", "swift_bic"],
    defaultValue: null,
  },
  currency: {
    sourceKeys: ["financial_data.currency.iso_code", "currency_code", "ccy"],
    defaultValue: "ZAR",
  },
  status: {
    sourceKeys: ["life_cycle.account_status_flag", "status_text", "state"],
    defaultValue: "PENDING",
  },
  currentBalance: {
    sourceKeys: [
      "financial_data.available_balance",
      "balance",
      "CurrentBalance",
    ],
    defaultValue: 0.0,
    transform: (value) => parseFloat(value),
  },
  "ownerInfo.isJointAccount": {
    sourceKeys: ["owners.is_multi_party", "joint_status", "isJoint"],
    defaultValue: false,
  },
  "ownerInfo.ownerId": {
    sourceKeys: [
      "owners.primary.id",
      "primary_user_id",
      "owners.primary_user_id",
    ],
  },
  "ownerInfo.firstName": {
    sourceKeys: [
      "owners.primary.first_name",
      "PrimaryOwnerName",
      "owners.PrimaryOwnerName",
    ],
    defaultValue: "N/A",
  },
  "ownerInfo.lastName": {
    sourceKeys: [
      "owners.primary.last_name",
      "PrimaryOwnerSurname",
      "owners.owners.primary.last_name",
    ],
    defaultValue: "N/A",
  },
  "ownerInfo.contactEmail": {
    sourceKeys: [
      "owners.primary.email",
      "email_address",
      "owners.owners.primary.email_address",
    ],
    defaultValue: "",
  },
  lastActivityDate: {
    sourceKeys: [
      "life_cycle.last_transaction_timestamp",
      "last_active_date",
      "modified_at",
    ],
    defaultValue: null,
    transform: (value) => new Date(value).toISOString(),
  },
};
