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

export function findFeeRow(rows = [], type = "") {
  const normalizedType = normalizeText(type);
  if (!normalizedType) return null;

  return rows.find(row => {
    const category = row.category || "";
    const normalizedCategory = normalizeText(category);
    if (!normalizedCategory) return false;
    const aliases = CATEGORY_ALIASES[normalizedType] || [normalizedType];
    return matchesAlias(category, aliases);
  }) || null;
}

export function calculateInclusiveAmount(baseAmount, plusGst = true, gstRate = 18) {
  const value = Number.parseFloat(baseAmount);
  if (Number.isNaN(value)) return 0;
  const total = plusGst ? value * (1 + (Number(gstRate || 0) / 100)) : value;
  return Math.round(total * 100) / 100;
}

function resolveTaxForRow(row = {}, taxRatesById = {}, fallbackGstRate = 18) {
  const tax = row.gstTaxId ? taxRatesById[row.gstTaxId] : null;
  const gstRate = Number(tax?.gstPercentage);
  return {
    gstTaxId: tax?._id || row.gstTaxId || "",
    gstRate: Number.isFinite(gstRate) ? gstRate : Number(fallbackGstRate || 0),
    taxName: tax?.name || "",
    cgstRate: Number.isFinite(Number(tax?.cgstPercentage)) ? Number(tax.cgstPercentage) : null,
    sgstRate: Number.isFinite(Number(tax?.sgstPercentage)) ? Number(tax.sgstPercentage) : null,
    igstRate: Number.isFinite(Number(tax?.igstPercentage)) ? Number(tax.igstPercentage) : null
  };
}

export function resolveMembershipPaymentAmount({
  rows = [],
  memberClass = "",
  memberType = "",
  hasCompletedPayment = false,
  gstRate = 18,
  taxRatesById = {}
} = {}) {
  const normalizedRows = rows.map(normalizeFeeRow).filter(row => row.active !== false);
  const enrollmentRow = normalizedRows.find(row => matchesAlias(row.category, CATEGORY_ALIASES.enrollment));
  const classRow = findFeeRow(normalizedRows, memberClass || memberType);
  const fallbackRow = findFeeRow(normalizedRows, memberType);

  const selectedRow = classRow || fallbackRow || null;
  const components = [];
  let selectedTaxRateId = "";
  let selectedTaxRate = gstRate;

  if (!hasCompletedPayment && enrollmentRow) {
    const taxInfo = resolveTaxForRow(enrollmentRow, taxRatesById, gstRate);
    components.push({
      category: enrollmentRow.category,
      amount: calculateInclusiveAmount(enrollmentRow.amount, enrollmentRow.plusGst, taxInfo.gstRate),
      gstTaxId: taxInfo.gstTaxId,
      gstRate: taxInfo.gstRate,
      taxName: taxInfo.taxName
    });
    if (!selectedTaxRateId) {
      selectedTaxRateId = taxInfo.gstTaxId;
      selectedTaxRate = taxInfo.gstRate;
    }
  }

  if (selectedRow) {
    const taxInfo = resolveTaxForRow(selectedRow, taxRatesById, gstRate);
    selectedTaxRateId = taxInfo.gstTaxId || selectedTaxRateId;
    selectedTaxRate = taxInfo.gstRate;
    components.push({
      category: selectedRow.category,
      amount: calculateInclusiveAmount(selectedRow.amount, selectedRow.plusGst, taxInfo.gstRate),
      gstTaxId: taxInfo.gstTaxId,
      gstRate: taxInfo.gstRate,
      taxName: taxInfo.taxName
    });
  }

  const total = components.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  return {
    amount: Math.round(total * 100) / 100,
    selectedCategory: selectedRow?.category || "",
    selectedTaxRateId,
    selectedTaxRate,
    components
  };
}
