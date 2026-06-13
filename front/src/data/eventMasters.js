export const EVENT_MASTERS_CMS_KEY = "event_master_data";

export const EVENT_MASTER_FIELDS = [
  { key: "types", label: "Event Type", placeholder: "Conference" },
  { key: "statuses", label: "Event Status", placeholder: "upcoming" },
  { key: "modes", label: "Event Mode", placeholder: "In-person" },
  { key: "venues", label: "Venue", placeholder: "COV Council Hall" },
  { key: "speakerNames", label: "Speaker Name", placeholder: "Dr. Ananya Mehta" },
  { key: "speakerTitles", label: "Speaker Title", placeholder: "Keynote Speaker" },
  { key: "registrationFees", label: "Registration Fee", placeholder: "2500" },
  { key: "paymentStatuses", label: "Payment Status", placeholder: "Received" },
];

export const DEFAULT_EVENT_MASTERS = {
  types: ["Conference", "Meeting", "Seminar", "Workshop", "Webinar", "Other"],
  statuses: ["upcoming", "completed", "cancelled", "draft"],
  modes: ["In-person", "Online", "Hybrid"],
  venues: ["COV Council Hall", "New Delhi Convention Center", "Online"],
  speakerNames: ["Dr. Ananya Mehta", "Mr. Praveen Gupta", "Mr. Rahul Sharma"],
  speakerTitles: ["Keynote Speaker", "Guest Chair", "Resource Speaker", "Moderator", "Speaker"],
  registrationFees: ["0", "2500", "3000"],
  paymentStatuses: ["Received", "Pending"],
};

function cleanList(list, fallback) {
  if (!Array.isArray(list)) return fallback;
  const cleaned = list
    .map((item) => (typeof item === "string" ? item : item?.name))
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return cleaned.length ? [...new Set(cleaned)] : fallback;
}

export function parseEventMasters(raw) {
  if (!raw || raw === "__deleted__") return DEFAULT_EVENT_MASTERS;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_EVENT_MASTERS;
    return EVENT_MASTER_FIELDS.reduce((acc, field) => {
      acc[field.key] = cleanList(parsed[field.key], DEFAULT_EVENT_MASTERS[field.key]);
      return acc;
    }, {});
  } catch {
    return DEFAULT_EVENT_MASTERS;
  }
}

export function serializeEventMasters(masters) {
  return EVENT_MASTER_FIELDS.reduce((acc, field) => {
    acc[field.key] = cleanList(masters?.[field.key], DEFAULT_EVENT_MASTERS[field.key]);
    return acc;
  }, {});
}
