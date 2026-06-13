export const MEMBERSHIP_FEES_CMS_KEY = "membership_fee_table";

export const DEFAULT_MEMBERSHIP_FEES = [
  {
    id: "fee_enrollment",
    category: "Enrollment Fees One time For All Categories",
    billingType: "One Time",
    amount: "2000",
    plusGst: true,
    gstTaxId: "",
    active: true
  },
  {
    id: "fee_student",
    category: "Student Member",
    billingType: "Yearly",
    amount: "1000",
    plusGst: true,
    gstTaxId: "",
    active: true
  },
  {
    id: "fee_affiliate",
    category: "Affiliate Member",
    billingType: "Yearly",
    amount: "2500",
    plusGst: true,
    gstTaxId: "",
    active: true
  },
  {
    id: "fee_chartered",
    category: "Chartered Member",
    billingType: "Yearly",
    amount: "5000",
    plusGst: true,
    gstTaxId: "",
    active: true
  },
  {
    id: "fee_fellow",
    category: "Fellow Members",
    billingType: "Yearly",
    amount: "10000",
    plusGst: true,
    gstTaxId: "",
    active: true
  },
  {
    id: "fee_guest",
    category: "Non-Member",
    billingType: "One Time",
    amount: "0",
    plusGst: true,
    gstTaxId: "",
    active: true
  }
];

const CATEGORY_ALIASES = {
  student: ["student", "student member"],
  affiliate: ["affiliate", "affiliate member"],
  chartered: ["chartered", "chartered member"],
  fellow: ["fellow", "fellow member", "fellow members"],
  guest: ["guest"],
  institutional: ["institutional", "institutional member", "corporate", "corporate membership"],
  enrollment: ["enrollment", "enrolment", "enrollment fees", "enrolment fees"]
};

export function normalizeFeeRow(row = {}, index = 0) {
  const amount = row.amount ?? row.yearlyFees ?? row.feeAmount ?? "";
  const billingType = typeof row.billingType === "string"
    ? row.billingType
    : (row.oneTime ? "One Time" : "Yearly");
  return {
    id: row.id || `fee_${Date.now()}_${index}`,
    category: row.category || "",
    billingType,
    amount: amount === null || amount === undefined ? "" : String(amount),
    plusGst: row.plusGst !== undefined ? !!row.plusGst : true,
    gstTaxId: row.gstTaxId || row.taxRateId || "",
    active: row.active !== undefined ? !!row.active : true
  };
}

export function createBlankMembershipFee(index = 0) {
  return normalizeFeeRow({
    id: `fee_${Date.now()}_${index}`,
    category: "",
    billingType: "Yearly",
    amount: "",
    plusGst: true,
    gstTaxId: "",
    active: true
  }, index);
}

export function parseMembershipFees(rawValue) {
  if (!rawValue || rawValue === "__deleted__") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeFeeRow).filter(row => row.category.trim());
  } catch {
    return [];
  }
}

export function serializeMembershipFees(rows = []) {
  return rows.map(normalizeFeeRow);
}

function normalizeText(value = "") {
  return value.toString().trim().toLowerCase();
}

function matchesAlias(category = "", aliasList = []) {
  const normalized = normalizeText(category);
  return aliasList.some(alias => normalized.includes(alias));
}

export function findMembershipFeeRow(rows = [], memberClass = "") {
  const normalizedType = normalizeText(memberClass);
  if (!normalizedType) return null;

  return rows.find(row => {
    const category = row.category || "";
    const aliases = CATEGORY_ALIASES[normalizedType] || [normalizedType];
    return matchesAlias(category, aliases);
  }) || null;
}

export function calculateMembershipFeeAmount(baseAmount, plusGst = true, gstRate = 18) {
  const value = Number.parseFloat(baseAmount);
  if (Number.isNaN(value)) return 0;
  const total = plusGst ? value * (1 + (Number(gstRate || 0) / 100)) : value;
  return Math.round(total * 100) / 100;
}

export function resolveMembershipFeePreview({
  rows = [],
  memberClass = "",
  gstTaxes = [],
} = {}) {
  const normalizedRows = rows.map(normalizeFeeRow).filter(row => row.active !== false);
  const selectedRow = findMembershipFeeRow(normalizedRows, memberClass);
  const fallbackRow = !memberClass ? (normalizedRows[0] || null) : null;
  const feeRow = selectedRow || fallbackRow;
  const activeTax = gstTaxes.find((tax) => tax.isActive !== false) || gstTaxes[0] || null;
  const taxById = {};
  gstTaxes.forEach((tax) => {
    if (tax && tax._id) taxById[tax._id] = tax;
  });
  const selectedTax = feeRow?.gstTaxId ? taxById[feeRow.gstTaxId] : activeTax;
  const gstRate = Number(selectedTax?.gstPercentage);
  const rate = Number.isFinite(gstRate) ? gstRate : 18;

  return {
    feeRow,
    gstTaxId: selectedTax?._id || "",
    gstName: selectedTax?.name || "",
    gstRate: rate,
    amount: feeRow ? calculateMembershipFeeAmount(feeRow.amount, feeRow.plusGst, rate) : 0,
    baseAmount: Number.parseFloat(feeRow?.amount || 0) || 0,
    hasGst: !!feeRow?.plusGst,
  };
}
