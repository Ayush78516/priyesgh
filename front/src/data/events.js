export const EVENTS_CMS_KEY = "events_data";

export const DEFAULT_EVENTS = [
  {
    id: "evt_1001",
    slug: "annual-valuation-conference-2026",
    title: "Annual Valuation Conference 2026",
    type: "Conference",
    status: "upcoming",
    startDate: "2026-06-18",
    startTime: "10:00",
    endTime: "17:30",
    date: "18 Jun 2026",
    time: "10:00 AM - 05:30 PM",
    venue: "New Delhi Convention Center",
    mode: "In-person",
    speakerName: "Dr. Ananya Mehta",
    speakerTitle: "Keynote Speaker",
    speaker: "Dr. Ananya Mehta",
    speakerRole: "Keynote Speaker",
    speakerAvatar: "https://placehold.co/100x100/002b5b/ffffff?text=AM",
    summary: "A flagship conference covering valuation standards, practice updates, and market outlook for members and invited guests.",
    details: "Join senior practitioners, policy voices, and industry experts for a full-day program focused on valuation standards, emerging market trends, ethics, and continuing professional development. The event includes keynote talks, panel discussions, networking breaks, and a closing roundtable.",
    description: "Join senior practitioners, policy voices, and industry experts for a full-day program focused on valuation standards, emerging market trends, ethics, and continuing professional development. The event includes keynote talks, panel discussions, networking breaks, and a closing roundtable.",
    image: "https://placehold.co/800x450/002b5b/ffffff?text=COV+Annual+Conference",
    galleryImages: [
      "https://placehold.co/600x400/002b5b/ffffff?text=Panel+Discussion",
      "https://placehold.co/600x400/00a6a6/ffffff?text=Networking+Session",
      "https://placehold.co/600x400/38b6ff/ffffff?text=Audience"
    ],
    registrationOpen: true,
    featured: true,
    paymentRequired: true,
    registrationFee: "2500",
    fee: "Rs 2,500",
    tags: ["UPCOMING", "CONFERENCE", "FEATURED", "PAYMENT REQUIRED"],
    memberPayments: [
      {
        id: "pay_evt_1001_1",
        memberName: "Aman Verma",
        membershipNo: "COV-2048",
        amount: "2500",
        paymentStatus: "Received",
        receiptNo: "RCPT-10021",
        paidAt: "2026-06-02"
      },
      {
        id: "pay_evt_1001_2",
        memberName: "Neha Singh",
        membershipNo: "COV-2071",
        amount: "2500",
        paymentStatus: "Pending",
        receiptNo: "",
        paidAt: ""
      }
    ]
  },
  {
    id: "evt_1002",
    slug: "valuation-roundtable-meeting-june-2026",
    title: "Valuation Roundtable Meeting",
    type: "Meeting",
    status: "upcoming",
    startDate: "2026-06-25",
    startTime: "15:00",
    endTime: "17:00",
    date: "25 Jun 2026",
    time: "03:00 PM - 05:00 PM",
    venue: "COV Council Hall, New Delhi",
    mode: "Hybrid",
    speakerName: "Mr. Praveen Gupta",
    speakerTitle: "Guest Chair",
    speaker: "Mr. Praveen Gupta",
    speakerRole: "Guest Chair",
    speakerAvatar: "https://placehold.co/100x100/00a6a6/ffffff?text=PG",
    summary: "A member roundtable to discuss practice updates, policy changes, and future event planning.",
    details: "This roundtable gives members a practical forum to discuss current valuation challenges, operational updates, and suggestions for future COV initiatives. The session includes structured discussion, member feedback, and a closing action summary.",
    description: "This roundtable gives members a practical forum to discuss current valuation challenges, operational updates, and suggestions for future COV initiatives. The session includes structured discussion, member feedback, and a closing action summary.",
    image: "https://placehold.co/800x450/00a6a6/ffffff?text=Valuation+Roundtable",
    galleryImages: [
      "https://placehold.co/600x400/00a6a6/ffffff?text=Roundtable+1",
      "https://placehold.co/600x400/e8f4f8/012a4a?text=Roundtable+2"
    ],
    registrationOpen: true,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["UPCOMING", "MEETING", "HYBRID"],
    memberPayments: []
  },
  {
    id: "evt_1003",
    slug: "valuation-workshop-practice-updates-may-2026",
    title: "Valuation Workshop on Practice Updates",
    type: "Webinar",
    status: "completed",
    startDate: "2026-05-28",
    startTime: "11:00",
    endTime: "14:00",
    date: "28 May 2026",
    time: "11:00 AM - 02:00 PM",
    venue: "COV Training Room, New Delhi",
    mode: "In-person",
    speakerName: "Dr. Ananya Mehta",
    speakerTitle: "Resource Speaker",
    speaker: "Dr. Ananya Mehta",
    speakerRole: "Resource Speaker",
    speakerAvatar: "https://placehold.co/100x100/002b5b/ffffff?text=AM",
    summary: "A practical workshop for members focused on current valuation practice and applied examples.",
    details: "The workshop covered current market practice, documentation, valuation methods, and member queries. The session was designed for active professional learning and concluded with a practical Q&A session.",
    description: "The workshop covered current market practice, documentation, valuation methods, and member queries. The session was designed for active professional learning and concluded with a practical Q&A session.",
    image: "https://placehold.co/800x450/012a4a/ffffff?text=Valuation+Workshop",
    galleryImages: [
      "https://placehold.co/600x400/012a4a/ffffff?text=Workshop+1",
      "https://placehold.co/600x400/f2f9ff/002b5b?text=Workshop+2"
    ],
    registrationOpen: false,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["COMPLETED", "WEBINAR", "WORKSHOP"],
    memberPayments: [
      {
        id: "pay_evt_1003_1",
        memberName: "Rohit Jain",
        membershipNo: "COV-1988",
        amount: "0",
        paymentStatus: "Received",
        receiptNo: "N/A",
        paidAt: "2026-05-27"
      }
    ]
  },
  {
    id: "evt_1004",
    slug: "valuation-seminar-ethical-practice-may-2026",
    title: "Seminar on Ethical Practice",
    type: "Conference",
    status: "completed",
    startDate: "2026-05-22",
    startTime: "10:30",
    endTime: "13:00",
    date: "22 May 2026",
    time: "10:30 AM - 01:00 PM",
    venue: "New Delhi Convention Center",
    mode: "In-person",
    speakerName: "Mr. Rahul Sharma",
    speakerTitle: "Speaker",
    speaker: "Mr. Rahul Sharma",
    speakerRole: "Speaker",
    speakerAvatar: "https://placehold.co/100x100/38b6ff/ffffff?text=RS",
    summary: "A seminar focused on ethical practice, professional conduct, and member responsibilities.",
    details: "Members attended a focused seminar discussing professional ethics, communication standards, and the importance of consistency in valuation reporting. The session concluded with case-based discussion and takeaways.",
    description: "Members attended a focused seminar discussing professional ethics, communication standards, and the importance of consistency in valuation reporting. The session concluded with case-based discussion and takeaways.",
    image: "https://placehold.co/800x450/38b6ff/ffffff?text=Ethics+Seminar",
    galleryImages: [
      "https://placehold.co/600x400/38b6ff/ffffff?text=Seminar+1",
      "https://placehold.co/600x400/e8f4f8/00a6a6?text=Seminar+2"
    ],
    registrationOpen: false,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["COMPLETED", "CONFERENCE", "ETHICS"],
    memberPayments: [
      {
        id: "pay_evt_1004_1",
        memberName: "Neha Singh",
        membershipNo: "COV-2071",
        amount: "0",
        paymentStatus: "Received",
        receiptNo: "N/A",
        paidAt: "2026-05-21"
      }
    ]
  },
  {
    id: "evt_1005",
    slug: "networking-session-valuation-community-may-2026",
    title: "Networking Session for Valuation Community",
    type: "Meeting",
    status: "completed",
    startDate: "2026-05-15",
    startTime: "16:00",
    endTime: "18:00",
    date: "15 May 2026",
    time: "04:00 PM - 06:00 PM",
    venue: "COV Member Lounge",
    mode: "Hybrid",
    speakerName: "Mr. Sanchit Gupta",
    speakerTitle: "Moderator",
    speaker: "Mr. Sanchit Gupta",
    speakerRole: "Moderator",
    speakerAvatar: "https://placehold.co/100x100/002b5b/ffffff?text=SG",
    summary: "A networking session to connect members, share experience, and strengthen professional relationships.",
    details: "The session created space for members to connect informally, exchange ideas, and discuss opportunities for collaboration. It also included a brief update on upcoming COV activities and member engagement plans.",
    description: "The session created space for members to connect informally, exchange ideas, and discuss opportunities for collaboration. It also included a brief update on upcoming COV activities and member engagement plans.",
    image: "https://placehold.co/800x450/002b5b/ffffff?text=Networking+Session",
    galleryImages: [
      "https://placehold.co/600x400/002b5b/ffffff?text=Networking+1",
      "https://placehold.co/600x400/00a6a6/ffffff?text=Networking+2"
    ],
    registrationOpen: false,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["COMPLETED", "MEETING", "NETWORKING"],
    memberPayments: [
      {
        id: "pay_evt_1005_1",
        memberName: "Aman Verma",
        membershipNo: "COV-2048",
        amount: "0",
        paymentStatus: "Received",
        receiptNo: "N/A",
        paidAt: "2026-05-14"
      }
    ]
  },
  {
    id: "evt_1006",
    slug: "valuation-webinar-digital-tools-april-2026",
    title: "Webinar on Digital Tools for Valuation",
    type: "Webinar",
    status: "completed",
    startDate: "2026-04-30",
    startTime: "18:00",
    endTime: "19:30",
    date: "30 Apr 2026",
    time: "06:00 PM - 07:30 PM",
    venue: "Online",
    mode: "Online",
    speakerName: "Dr. Ananya Mehta",
    speakerTitle: "Webinar Speaker",
    speaker: "Dr. Ananya Mehta",
    speakerRole: "Webinar Speaker",
    speakerAvatar: "https://placehold.co/100x100/002b5b/ffffff?text=AM",
    summary: "An online webinar covering digital workflows, documentation, and professional productivity tools.",
    details: "This webinar introduced members to practical digital tools that support valuation work, reporting, collaboration, and record keeping. It included a live demonstration and a short member Q&A.",
    description: "This webinar introduced members to practical digital tools that support valuation work, reporting, collaboration, and record keeping. It included a live demonstration and a short member Q&A.",
    image: "https://placehold.co/800x450/00a6a6/ffffff?text=Digital+Tools+Webinar",
    galleryImages: [
      "https://placehold.co/600x400/00a6a6/ffffff?text=Webinar+1",
      "https://placehold.co/600x400/e8f4f8/012a4a?text=Webinar+2"
    ],
    registrationOpen: false,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["COMPLETED", "WEBINAR", "TECH"],
    memberPayments: [
      {
        id: "pay_evt_1006_1",
        memberName: "Rohit Jain",
        membershipNo: "COV-1988",
        amount: "0",
        paymentStatus: "Received",
        receiptNo: "N/A",
        paidAt: "2026-04-29"
      }
    ]
  },
  {
    id: "evt_1007",
    slug: "annual-member-orientation-april-2026",
    title: "Annual Member Orientation",
    type: "Conference",
    status: "completed",
    startDate: "2026-04-12",
    startTime: "10:00",
    endTime: "12:30",
    date: "12 Apr 2026",
    time: "10:00 AM - 12:30 PM",
    venue: "COV Conference Room",
    mode: "In-person",
    speakerName: "Mr. Praveen Gupta",
    speakerTitle: "Orientation Lead",
    speaker: "Mr. Praveen Gupta",
    speakerRole: "Orientation Lead",
    speakerAvatar: "https://placehold.co/100x100/e8f4f8/012a4a?text=PG",
    summary: "An orientation session for new and existing members covering processes, benefits, and upcoming programs.",
    details: "The orientation reviewed membership support, event participation, communication channels, and how members can make use of COV resources. It also introduced the schedule of upcoming activities for the quarter.",
    description: "The orientation reviewed membership support, event participation, communication channels, and how members can make use of COV resources. It also introduced the schedule of upcoming activities for the quarter.",
    image: "https://placehold.co/800x450/e8f4f8/012a4a?text=Orientation+Session",
    galleryImages: [
      "https://placehold.co/600x400/e8f4f8/012a4a?text=Orientation+1",
      "https://placehold.co/600x400/002b5b/ffffff?text=Orientation+2"
    ],
    registrationOpen: false,
    featured: false,
    paymentRequired: false,
    registrationFee: "0",
    fee: "Free",
    tags: ["COMPLETED", "CONFERENCE", "ORIENTATION"],
    memberPayments: [
      {
        id: "pay_evt_1007_1",
        memberName: "Neha Singh",
        membershipNo: "COV-2071",
        amount: "0",
        paymentStatus: "Received",
        receiptNo: "N/A",
        paidAt: "2026-04-11"
      }
    ]
  }
];

export function slugifyEventTitle(title = "") {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createBlankEvent() {
  return {
    id: "",
    slug: "",
    title: "",
    type: "Conference",
    status: "upcoming",
    targetAudience: "Both",
    startDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    mode: "In-person",
    speakerName: "",
    speakerTitle: "",
    summary: "",
    details: "",
    image: "",
    galleryImages: [],
    registrationOpen: true,
    featured: false,
    paymentRequired: true,
    registrationFee: "",
    memberPayments: [],
    nonMemberPayments: [],
    keyTakeaways: [],
    scheduleHighlights: [],
    speakers: []
  };
}

export function normalizeEvent(event) {
  return {
    ...createBlankEvent(),
    ...event,
    targetAudience: event?.targetAudience || "Both",
    slug: event?.slug || slugifyEventTitle(event?.title || ""),
    memberPayments: Array.isArray(event?.memberPayments) ? event.memberPayments : [],
    nonMemberPayments: Array.isArray(event?.nonMemberPayments) ? event.nonMemberPayments : [],
    galleryImages: Array.isArray(event?.galleryImages) ? event.galleryImages : [],
    keyTakeaways: Array.isArray(event?.keyTakeaways) ? event.keyTakeaways : [],
    scheduleHighlights: Array.isArray(event?.scheduleHighlights) ? event.scheduleHighlights : [],
    speakers: Array.isArray(event?.speakers) && event.speakers.length > 0
      ? event.speakers
      : event?.speaker
      ? [
          {
            id: `spk_${Math.random().toString(36).substr(2, 5)}`,
            name: event.speaker,
            role: event.speakerTitle || "",
            avatar: event.speakerAvatar || "",
          },
        ]
      : []
  };
}

export function parseEvents(rawValue) {
  if (!rawValue || rawValue === "__deleted__") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEvent);
  } catch {
    return [];
  }
}

export function eventDateValue(event) {
  const date = event?.startDate || "";
  const time = event?.startTime || "00:00";
  const stamp = `${date}T${time}`;
  const parsed = new Date(stamp);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

export function sortEvents(events = []) {
  return [...events].sort((a, b) => {
    const aValue = eventDateValue(a).getTime();
    const bValue = eventDateValue(b).getTime();
    if (a.status === b.status) return aValue - bValue;
    if (a.status === "upcoming") return -1;
    if (b.status === "upcoming") return 1;
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    return aValue - bValue;
  });
}

export function splitEvents(events = []) {
  const upcoming = [];
  const completed = [];
  const other = [];

  sortEvents(events).forEach((event) => {
    if (event.status === "completed") completed.push(event);
    else if (event.status === "upcoming") upcoming.push(event);
    else other.push(event);
  });

  return { upcoming, completed, other };
}
