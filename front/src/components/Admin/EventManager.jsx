import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Calendar, CheckCircle, Clock, MapPin, Users, Target, Activity, FileText } from "lucide-react";
import {
  DEFAULT_EVENTS,
  createBlankEvent,
  EVENTS_CMS_KEY,
  parseEvents,
  slugifyEventTitle,
  normalizeEvent
} from "../../data/events";
import { EVENT_MASTERS_CMS_KEY, parseEventMasters } from "../../data/eventMasters";
import { AllEventParticipants, EventParticipantsModal } from "./EventParticipantsView";

function getDrivePreview(url) {
  if (!url || !url.toString().includes("drive.google.com")) return url;
  const match = url.match(/\/d\/([^/]+)/);
  if (match?.[1]) return `https://drive.google.com/uc?id=${match[1]}`;
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch?.[1]) return `https://drive.google.com/uc?id=${idMatch[1]}`;
  return url;
}

function blankPaymentRow() {
  return {
    id: `pay_${Date.now()}`,
    memberName: "",
    membershipNo: "",
    amount: "",
    paymentStatus: "Pending",
    receiptNo: "",
    paidAt: ""
  };
}

export default function EventManager({ token, showToast, cms, onUpdate, filter: categoryFilter }) {
  const [events, setEvents] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(createBlankEvent());
  const [paymentRows, setPaymentRows] = useState([]);
  const [takeawayRows, setTakeawayRows] = useState([]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [speakerRows, setSpeakerRows] = useState([]);
  const [eventMasters, setEventMasters] = useState(parseEventMasters());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewParticipantsForEvent, setViewParticipantsForEvent] = useState(null);
  const [viewParticipantsType, setViewParticipantsType] = useState("members");
  const fileRef = useRef(null);
  const galleryFileRef = useRef(null);

  const createMasterBackedEvent = () => ({
    ...createBlankEvent(),
    type: eventMasters.types?.[0] || "Conference",
    status: eventMasters.statuses?.[0] || "upcoming",
    venue: eventMasters.venues?.[0] || "",
    mode: eventMasters.modes?.[0] || "In-person",
    speakerName: eventMasters.speakerNames?.[0] || "",
    speakerTitle: eventMasters.speakerTitles?.[0] || "",
    registrationFee: eventMasters.registrationFees?.[0] || "",
  });

  useEffect(() => {
    const cmsMap = {};
    cms.forEach(item => {
      if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
    });

    const parsed = parseEvents(cmsMap[EVENTS_CMS_KEY]);
    setEventMasters(parseEventMasters(cmsMap[EVENT_MASTERS_CMS_KEY]));
    if (parsed.length > 0) {
      setEvents(parsed);
    } else {
      setEvents(DEFAULT_EVENTS);
    }
  }, [cms]);

  const persist = async (nextEvents) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          key: EVENTS_CMS_KEY,
          value: JSON.stringify(nextEvents),
          type: "text"
        })
      });

      if (res.ok) {
        showToast("Events updated. Changes are live.");
        if (onUpdate) onUpdate();
      } else {
        showToast("Failed to save events", "error");
      }
    } catch {
      showToast("Failed to save events", "error");
    }
    setSaving(false);
  };

  const openNew = () => {
    setEditingEventId("new");
    setForm(createMasterBackedEvent());
    setPaymentRows([]);
    setTakeawayRows([]);
    setScheduleRows([]);
    setSpeakerRows([]);
  };

  const openEdit = (event) => {
    const next = normalizeEvent(event);
    setEditingEventId(next.id);
    setForm(next);
    setPaymentRows(Array.isArray(next.memberPayments) ? next.memberPayments : []);
    setTakeawayRows(Array.isArray(next.keyTakeaways) ? next.keyTakeaways : []);
    setScheduleRows(Array.isArray(next.scheduleHighlights) ? next.scheduleHighlights : []);
    setSpeakerRows(Array.isArray(next.speakers) ? next.speakers : []);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this event?")) return;
    const next = events.filter((event) => event.id !== id);
    setEvents(next);
    persist(next);
    if (editingEventId === id) {
      setEditingEventId(null);
      setForm(createBlankEvent());
      setPaymentRows([]);
      setTakeawayRows([]);
      setScheduleRows([]);
      setSpeakerRows([]);
    }
  };

  const handleToggleStatus = (id) => {
    const nextEvents = events.map(event => {
      if (event.id === id) {
        return {
          ...event,
          status: event.status === "upcoming" ? "completed" : "upcoming"
        };
      }
      return event;
    });
    setEvents(nextEvents);
    persist(nextEvents);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      showToast("Event title is required", "error");
      return;
    }
    if (!form.startDate) {
      showToast("Event date is required", "error");
      return;
    }

    const nextEvent = normalizeEvent({
      ...form,
      id: editingEventId === "new" || !editingEventId ? `evt_${Date.now()}` : form.id,
      slug: form.slug?.trim() || slugifyEventTitle(form.title),
      memberPayments: paymentRows.map((row) => ({ ...row })),
      keyTakeaways: takeawayRows.map((row) => ({ ...row })),
      scheduleHighlights: scheduleRows.map((row) => ({ ...row })),
      speakers: speakerRows.map((row) => ({ ...row }))
    });

    let nextEvents;
    if (editingEventId === "new" || !editingEventId) {
      nextEvents = [...events, nextEvent];
    } else {
      nextEvents = events.map((event) => (event.id === nextEvent.id ? nextEvent : event));
    }

    setEvents(nextEvents);
    persist(nextEvents);
    setEditingEventId(null);
    setForm(createBlankEvent());
    setPaymentRows([]);
    setTakeawayRows([]);
    setScheduleRows([]);
    setSpeakerRows([]);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadEventAsset(file);
      setForm((prev) => ({ ...prev, image: url }));
      showToast("Image uploaded. Save to publish.");
    } catch (error) {
      showToast(error.message || "Upload failed", "error");
    }
    setUploading(false);
    e.target.value = "";
  };

  const uploadEventAsset = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    let res = await fetch("/api/admin/cms/upload-drive", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    let data = await res.json();
    if (!res.ok) {
      const fallbackFd = new FormData();
      fallbackFd.append("file", file);
      res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fallbackFd
      });
      data = await res.json();
    }

    if (!res.ok || !data.url) {
      throw new Error(data.message || "Upload failed");
    }

    return data.url;
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadEventAsset(file));
      }
      setForm((prev) => ({
        ...prev,
        galleryImages: [...(Array.isArray(prev.galleryImages) ? prev.galleryImages : []), ...urls]
      }));
      showToast(`${urls.length} gallery image${urls.length > 1 ? "s" : ""} uploaded. Save to publish.`);
    } catch (error) {
      showToast(error.message || "Gallery upload failed", "error");
    }
    setUploadingGallery(false);
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const addPaymentRow = () => {
    setPaymentRows((prev) => [...prev, blankPaymentRow()]);
  };

  const updatePaymentRow = (rowId, key, value) => {
    setPaymentRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  };

  const removePaymentRow = (rowId) => {
    setPaymentRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const blankTakeawayRow = () => ({ id: `tk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, icon: "Target", title: "", description: "" });
  const blankScheduleRow = () => ({ id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, time: "", title: "", description: "" });
  const blankSpeakerRow = () => ({ id: `spk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name: "", role: "", avatar: "" });

  const addTakeawayRow = () => setTakeawayRows(prev => [...prev, blankTakeawayRow()]);
  const updateTakeawayRow = (rowId, key, value) => setTakeawayRows(prev => prev.map(r => r.id === rowId ? { ...r, [key]: value } : r));
  const removeTakeawayRow = (rowId) => setTakeawayRows(prev => prev.filter(r => r.id !== rowId));

  const addScheduleRow = () => setScheduleRows(prev => [...prev, blankScheduleRow()]);
  const updateScheduleRow = (rowId, key, value) => setScheduleRows(prev => prev.map(r => r.id === rowId ? { ...r, [key]: value } : r));
  const removeScheduleRow = (rowId) => setScheduleRows(prev => prev.filter(r => r.id !== rowId));

  const addSpeakerRow = () => setSpeakerRows(prev => [...prev, blankSpeakerRow()]);
  const updateSpeakerRow = (rowId, key, value) => setSpeakerRows(prev => prev.map(r => r.id === rowId ? { ...r, [key]: value } : r));
  const removeSpeakerRow = (rowId) => setSpeakerRows(prev => prev.filter(r => r.id !== rowId));

  if (events === null) {
    return <div style={{ color: "#64748b", padding: 20 }}>Loading events...</div>;
  }

  if (categoryFilter === "events_members" || categoryFilter === "events_non_members") {
    return <AllEventParticipants events={events} type={categoryFilter} />;
  }

  const upcomingCount = events.filter((event) => event.status === "upcoming").length;
  const completedCount = events.filter((event) => event.status === "completed").length;
  const masterOptions = (key, currentValue = "") => {
    const options = eventMasters[key] || [];
    return currentValue && !options.includes(currentValue) ? [...options, currentValue] : options;
  };

  const s = {
    card: {
      background: "#0d1424",
      border: "1px solid #1e293b",
      borderRadius: 16,
      padding: 24,
      marginBottom: 16
    },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 700,
      color: "#94a3b8",
      marginBottom: 6
    },
    input: {
      width: "100%",
      background: "#111827",
      color: "#e2e8f0",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box"
    },
    textArea: {
      width: "100%",
      minHeight: 96,
      resize: "vertical",
      background: "#111827",
      color: "#e2e8f0",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box"
    },
    button: {
      border: "none",
      borderRadius: 10,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Events Manager</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Create conferences, meetings, and other events. Upload an image, set speakers, manage member payments, and publish to the public events page.
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#002b5b] to-[#00a6a6] hover:from-[#003d82] hover:to-[#00c4c4] shadow-lg hover:shadow-[0_0_15px_rgba(0,166,166,0.4)] transition-all duration-300 border-none cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={16} strokeWidth={3} /> Add Event
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#111827] to-[#0b1220] border border-[#1e293b] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#38b6ff]/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Events</div>
              <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                <Calendar size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-white relative z-10">
              {events ? events.filter(e => {
                const matchesCategory = !categoryFilter || categoryFilter === "events" || 
                  (categoryFilter === "events_members" && (e.targetAudience === "Members" || e.targetAudience === "Both")) ||
                  (categoryFilter === "events_non_members" && (e.targetAudience === "Non Members" || e.targetAudience === "Both"));
                return matchesCategory;
              }).length : 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111827] to-[#0b1220] border border-[#1e293b] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#00a6a6]/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00a6a6]/10 rounded-full blur-2xl group-hover:bg-[#00a6a6]/20 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Upcoming</div>
              <div className="p-2 rounded-lg bg-[#00a6a6]/10 text-[#00a6a6] group-hover:bg-[#00a6a6]/20 transition-colors">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#00a6a6] relative z-10">
              {events ? events.filter(e => {
                const matchesCategory = !categoryFilter || categoryFilter === "events" || 
                  (categoryFilter === "events_members" && (e.targetAudience === "Members" || e.targetAudience === "Both")) ||
                  (categoryFilter === "events_non_members" && (e.targetAudience === "Non Members" || e.targetAudience === "Both"));
                return matchesCategory && e.status === "upcoming";
              }).length : 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111827] to-[#0b1220] border border-[#1e293b] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#60a5fa]/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#60a5fa]/10 rounded-full blur-2xl group-hover:bg-[#60a5fa]/20 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Completed</div>
              <div className="p-2 rounded-lg bg-[#60a5fa]/10 text-[#60a5fa] group-hover:bg-[#60a5fa]/20 transition-colors">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#60a5fa] relative z-10">
              {events ? events.filter(e => {
                const matchesCategory = !categoryFilter || categoryFilter === "events" || 
                  (categoryFilter === "events_members" && (e.targetAudience === "Members" || e.targetAudience === "Both")) ||
                  (categoryFilter === "events_non_members" && (e.targetAudience === "Non Members" || e.targetAudience === "Both"));
                return matchesCategory && e.status === "completed";
              }).length : 0}
            </div>
          </div>
        </div>

        {editingEventId && (
          <div style={{ background: "#111827", border: "1px solid rgba(0,166,166,0.3)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#00a6a6", marginBottom: 16 }}>
              {editingEventId === "new" ? "Add New Event" : `Editing: ${form.title || "Event"}`}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={s.label}>Event Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value, slug: prev.slug || slugifyEventTitle(e.target.value) }))}
                  placeholder="Annual Valuation Conference 2026"
                />
              </div>
              <div>
                <label style={s.label}>Slug</label>
                <input
                  style={s.input}
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="annual-valuation-conference-2026"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={s.label}>Type</label>
                <select style={s.input} value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                  {masterOptions("types", form.type).map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  {masterOptions("statuses", form.status).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Target Audience</label>
                <select style={s.input} value={form.targetAudience || "Both"} onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}>
                  <option value="Both">Both (Everyone)</option>
                  <option value="Members">Members Only</option>
                  <option value="Non Members">Non Members Only</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Start Date *</label>
                <input type="date" style={s.input} value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Start Time</label>
                <input type="time" style={s.input} value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={s.label}>End Time</label>
                <input type="time" style={s.input} value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Venue</label>
                <select style={s.input} value={form.venue} onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}>
                  {masterOptions("venues", form.venue).map((venue) => <option key={venue} value={venue}>{venue}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Mode</label>
                <select style={s.input} value={form.mode} onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}>
                  {masterOptions("modes", form.mode).map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Speaker Name</label>
                <select style={s.input} value={form.speakerName} onChange={(e) => setForm((prev) => ({ ...prev, speakerName: e.target.value }))}>
                  {masterOptions("speakerNames", form.speakerName).map((speakerName) => <option key={speakerName} value={speakerName}>{speakerName}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={s.label}>Speaker Title</label>
                <select style={s.input} value={form.speakerTitle} onChange={(e) => setForm((prev) => ({ ...prev, speakerTitle: e.target.value }))}>
                  {masterOptions("speakerTitles", form.speakerTitle).map((speakerTitle) => <option key={speakerTitle} value={speakerTitle}>{speakerTitle}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Registration Fee</label>
                <select style={s.input} value={form.registrationFee} onChange={(e) => setForm((prev) => ({ ...prev, registrationFee: e.target.value }))}>
                  {masterOptions("registrationFees", form.registrationFee).map((registrationFee) => <option key={registrationFee} value={registrationFee}>{registrationFee}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Registration Open</label>
                <select style={s.input} value={form.registrationOpen ? "yes" : "no"} onChange={(e) => setForm((prev) => ({ ...prev, registrationOpen: e.target.value === "yes" }))}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Featured</label>
                <select style={s.input} value={form.featured ? "yes" : "no"} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.value === "yes" }))}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Event Summary</label>
              <textarea
                style={s.textArea}
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Short summary shown on the event card"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Event Details</label>
              <textarea
                style={{ ...s.textArea, minHeight: 130 }}
                value={form.details}
                onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                placeholder="Full event description shown on the detail page"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={s.label}>Event Image URL</label>
                <input
                  style={s.input}
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="/uploads/..."
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{ ...s.button, background: "rgba(0,166,166,0.15)", color: "#00a6a6", border: "1px solid rgba(0,166,166,0.3)" }}
                  >
                    {uploading ? "Uploading..." : "Upload image"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleImageUpload} />
                  <div style={{ fontSize: 12, color: "#64748b" }}>Images and PDFs are supported by the existing CMS upload flow.</div>
                </div>
                {form.image && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={getDrivePreview(form.image)}
                      alt="Event preview"
                      style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12, border: "1px solid #1e293b" }}
                    />
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <label style={s.label}>Event Gallery Images</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => galleryFileRef.current?.click()}
                      style={{ ...s.button, background: "rgba(96,165,250,0.14)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.28)" }}
                      disabled={uploadingGallery}
                    >
                      {uploadingGallery ? "Uploading..." : "Upload gallery images"}
                    </button>
                    <input ref={galleryFileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleGalleryUpload} />
                    <div style={{ fontSize: 12, color: "#64748b" }}>Select one or more images. Save the event after upload.</div>
                  </div>
                  {(form.galleryImages || []).length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, marginTop: 12 }}>
                      {form.galleryImages.map((src, index) => (
                        <div key={`${src}-${index}`} style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 8 }}>
                          <img
                            src={getDrivePreview(src)}
                            alt={`Gallery ${index + 1}`}
                            style={{ width: "100%", height: 82, objectFit: "contain", borderRadius: 8, background: "#111827", display: "block" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            style={{ ...s.button, width: "100%", marginTop: 8, padding: "6px 8px", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", fontSize: 12 }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={s.label}>Admin Summary</label>
                <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 14, height: "100%" }}>
                  <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7 }}>
                    <div><strong>Payment required:</strong> {form.paymentRequired ? "Yes" : "No"}</div>
                    <div><strong>Member fee:</strong> {form.registrationFee || "0"}</div>
                    <div><strong>Payment rows:</strong> {paymentRows.length}</div>
                    <div style={{ marginTop: 10, color: "#94a3b8" }}>
                      Use the member payment tracker below to mark member receipts as received or pending.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Takeaways and Schedule Section */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Key Takeaways</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    Highlight the main benefits of attending this event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addTakeawayRow}
                  style={{ ...s.button, background: "rgba(0,166,166,0.15)", color: "#00a6a6", border: "1px solid rgba(0,166,166,0.3)" }}
                >
                  + Add Takeaway
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {takeawayRows.map((row) => (
                  <div key={row.id} style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 3fr auto", gap: 10, alignItems: "start" }}>
                      <div>
                        <label style={s.label}>Icon</label>
                        <select style={s.input} value={row.icon} onChange={(e) => updateTakeawayRow(row.id, "icon", e.target.value)}>
                          <option value="Target">Target</option>
                          <option value="Users">Users</option>
                          <option value="BookOpen">Book</option>
                          <option value="Award">Award</option>
                          <option value="CheckCircle">Check</option>
                          <option value="Sparkles">Sparkles</option>
                        </select>
                      </div>
                      <div>
                        <label style={s.label}>Title</label>
                        <input style={s.input} value={row.title} onChange={(e) => updateTakeawayRow(row.id, "title", e.target.value)} placeholder="e.g. Actionable Insights" />
                      </div>
                      <div>
                        <label style={s.label}>Description</label>
                        <textarea style={{...s.textArea, minHeight: 42, padding: "8px 12px"}} value={row.description} onChange={(e) => updateTakeawayRow(row.id, "description", e.target.value)} placeholder="Description..." />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTakeawayRow(row.id)}
                        style={{ ...s.button, marginTop: 22, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", height: 42 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {takeawayRows.length === 0 && (
                  <div style={{ padding: 16, borderRadius: 12, border: "1px dashed #334155", color: "#64748b", fontSize: 13 }}>
                    No key takeaways added yet. Default ones will be shown on the event page.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Schedule Highlights</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    Provide a high-level timeline of the event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addScheduleRow}
                  style={{ ...s.button, background: "rgba(0,166,166,0.15)", color: "#00a6a6", border: "1px solid rgba(0,166,166,0.3)" }}
                >
                  + Add Schedule Item
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scheduleRows.map((row) => (
                  <div key={row.id} style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 3fr auto", gap: 10, alignItems: "start" }}>
                      <div>
                        <label style={s.label}>Time</label>
                        <input style={s.input} value={row.time} onChange={(e) => updateScheduleRow(row.id, "time", e.target.value)} placeholder="e.g. 10:00 AM" />
                      </div>
                      <div>
                        <label style={s.label}>Title</label>
                        <input style={s.input} value={row.title} onChange={(e) => updateScheduleRow(row.id, "title", e.target.value)} placeholder="e.g. Keynote Address" />
                      </div>
                      <div>
                        <label style={s.label}>Description</label>
                        <textarea style={{...s.textArea, minHeight: 42, padding: "8px 12px"}} value={row.description} onChange={(e) => updateScheduleRow(row.id, "description", e.target.value)} placeholder="Description..." />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScheduleRow(row.id)}
                        style={{ ...s.button, marginTop: 22, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", height: 42 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {scheduleRows.length === 0 && (
                  <div style={{ padding: 16, borderRadius: 12, border: "1px dashed #334155", color: "#64748b", fontSize: 13 }}>
                    No schedule items added yet. Default ones will be shown on the event page.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Featured Speakers</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    Add multiple speakers to display on the event details page.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addSpeakerRow}
                  style={{ ...s.button, background: "rgba(0,166,166,0.15)", color: "#00a6a6", border: "1px solid rgba(0,166,166,0.3)" }}
                >
                  + Add Speaker
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {speakerRows.map((row) => (
                  <div key={row.id} style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "start" }}>
                      <div>
                        <label style={s.label}>Speaker Name</label>
                        <input style={s.input} value={row.name} onChange={(e) => updateSpeakerRow(row.id, "name", e.target.value)} placeholder="e.g. John Doe" />
                      </div>
                      <div>
                        <label style={s.label}>Title / Role</label>
                        <input style={s.input} value={row.role} onChange={(e) => updateSpeakerRow(row.id, "role", e.target.value)} placeholder="e.g. CEO, Example Corp" />
                      </div>
                      <div>
                        <label style={s.label}>Avatar URL</label>
                        <input style={s.input} value={row.avatar} onChange={(e) => updateSpeakerRow(row.id, "avatar", e.target.value)} placeholder="https://..." />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpeakerRow(row.id)}
                        style={{ ...s.button, marginTop: 22, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", height: 42 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {speakerRows.length === 0 && (
                  <div style={{ padding: 16, borderRadius: 12, border: "1px dashed #334155", color: "#64748b", fontSize: 13 }}>
                    No featured speakers added yet.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Member Payment Tracker</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    Keep a record of member-wise payment status under this event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addPaymentRow}
                  style={{ ...s.button, background: "rgba(0,166,166,0.15)", color: "#00a6a6", border: "1px solid rgba(0,166,166,0.3)" }}
                >
                  + Add Member
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paymentRows.map((row) => (
                  <div key={row.id} style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.8fr 0.6fr 0.7fr 0.8fr 0.8fr auto", gap: 10, alignItems: "end" }}>
                      <div>
                        <label style={s.label}>Member Name</label>
                        <input style={s.input} value={row.memberName} onChange={(e) => updatePaymentRow(row.id, "memberName", e.target.value)} />
                      </div>
                      <div>
                        <label style={s.label}>Membership No.</label>
                        <input style={s.input} value={row.membershipNo} onChange={(e) => updatePaymentRow(row.id, "membershipNo", e.target.value)} />
                      </div>
                      <div>
                        <label style={s.label}>Amount</label>
                        <input style={s.input} value={row.amount} onChange={(e) => updatePaymentRow(row.id, "amount", e.target.value)} />
                      </div>
                      <div>
                        <label style={s.label}>Status</label>
                        <select style={s.input} value={row.paymentStatus} onChange={(e) => updatePaymentRow(row.id, "paymentStatus", e.target.value)}>
                          {masterOptions("paymentStatuses", row.paymentStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={s.label}>Receipt No.</label>
                        <input style={s.input} value={row.receiptNo} onChange={(e) => updatePaymentRow(row.id, "receiptNo", e.target.value)} />
                      </div>
                      <div>
                        <label style={s.label}>Paid Date</label>
                        <input type="date" style={s.input} value={row.paidAt} onChange={(e) => updatePaymentRow(row.id, "paidAt", e.target.value)} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePaymentRow(row.id)}
                        style={{ ...s.button, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", height: 42 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {paymentRows.length === 0 && (
                  <div style={{ padding: 16, borderRadius: 12, border: "1px dashed #334155", color: "#64748b", fontSize: 13 }}>
                    No member payment rows added yet.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ ...s.button, background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving..." : "Save Event"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEventId(null);
                  setForm(createBlankEvent());
                  setPaymentRows([]);
                  setTakeawayRows([]);
                  setScheduleRows([]);
                  setSpeakerRows([]);
                }}
                style={{ ...s.button, background: "#374151", color: "#e2e8f0" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={s.card}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[15px] font-black text-white">Existing Events</div>
            <div className="text-xs text-slate-500 mt-1">Edit, delete, or review the latest event records.</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#111827] border border-[#1e293b] rounded-xl p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${statusFilter === "all" ? "bg-[#00a6a6] text-white shadow-md" : "bg-transparent text-slate-500 hover:text-slate-300"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("upcoming")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${statusFilter === "upcoming" ? "bg-[#00a6a6] text-white shadow-md" : "bg-transparent text-slate-500 hover:text-slate-300"}`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${statusFilter === "completed" ? "bg-[#00a6a6] text-white shadow-md" : "bg-transparent text-slate-500 hover:text-slate-300"}`}
              >
                Completed
              </button>
            </div>
            <div className="text-xs text-slate-500 bg-[#111827] px-3 py-1.5 rounded-xl border border-[#1e293b]">
              {(() => {
                const filtered = events.filter(e => {
                  const matchesStatus = statusFilter === "all" || e.status === statusFilter;
                  const matchesCategory = !categoryFilter || categoryFilter === "events" || 
                    (categoryFilter === "events_members" && (e.targetAudience === "Members" || e.targetAudience === "Both")) ||
                    (categoryFilter === "events_non_members" && (e.targetAudience === "Non Members" || e.targetAudience === "Both"));
                  return matchesStatus && matchesCategory;
                });
                return filtered.length === 0 ? "No events" : `${filtered.length} records`;
              })()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {events.filter(e => {
            const matchesStatus = statusFilter === "all" || e.status === statusFilter;
            const matchesCategory = !categoryFilter || categoryFilter === "events" || 
              (categoryFilter === "events_members" && (e.targetAudience === "Members" || e.targetAudience === "Both")) ||
              (categoryFilter === "events_non_members" && (e.targetAudience === "Non Members" || e.targetAudience === "Both"));
            return matchesStatus && matchesCategory;
          }).map((event) => {
            const received = (event.memberPayments || []).filter((row) => row.paymentStatus === "Received").length;
            const pending = (event.memberPayments || []).filter((row) => row.paymentStatus !== "Received").length;

            return (
              <div
                key={event.id}
                className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex gap-5 items-stretch hover:bg-[#151f32] hover:border-[#38b6ff]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 group"
              >
                <div className="w-32 shrink-0 relative overflow-hidden rounded-xl border border-[#1e293b] group-hover:border-[#00a6a6]/40 transition-colors">
                  <img
                    src={getDrivePreview(event.image) || "/assets/hero.png"}
                    alt={event.title}
                    className="w-full h-full object-cover min-h-[100px] group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/80 to-transparent pointer-events-none" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <div className="text-[15px] font-black text-white group-hover:text-[#00a6a6] transition-colors">{event.title}</div>
                    <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      event.status === "upcoming" ? "bg-[#00a6a6]/15 text-[#00a6a6] border border-[#00a6a6]/30" : 
                      event.status === "completed" ? "bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30" : 
                      "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                    }`}>
                      {event.status === "upcoming" && <span className="w-1.5 h-1.5 rounded-full bg-[#00a6a6] animate-pulse" />}
                      {event.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold bg-white/5 text-slate-300 border border-white/10">
                      {event.type}
                    </span>
                  </div>
                  <div className="text-[13px] text-slate-400 flex items-center gap-4 mb-2.5">
                    <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#60a5fa]" /> {event.startDate} {event.startTime || ""}</span>
                    {event.venue && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#00a6a6]" /> {event.venue}</span>}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1 leading-relaxed italic border-l-2 border-[#1e293b] pl-3 mb-2.5 group-hover:border-[#00a6a6]/50 transition-colors">
                    {event.summary || "No summary added yet."}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-auto">
                    <span className="px-2 py-1 rounded-md bg-white/5 flex items-center gap-1.5 border border-white/5"><Users size={12} className="text-slate-400"/> Payments:</span>
                    <span className="text-[#60a5fa] font-bold">{received} received</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{pending} pending</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2.5 shrink-0 ml-2 border-l border-[#1e293b] pl-4 group-hover:border-slate-700 transition-colors">
                  <div 
                    onClick={() => handleToggleStatus(event.id)}
                    className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-bold bg-[#0d1424] border border-[#1e293b] hover:border-[#38b6ff]/30 transition-all duration-300 cursor-pointer group/toggle shadow-inner"
                  >
                    <span className={event.status === "upcoming" ? "text-[#00a6a6]" : "text-slate-400"}>
                      {event.status === "upcoming" ? "Upcoming" : "Completed"}
                    </span>
                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out shadow-inner ${
                        event.status === "upcoming" ? "bg-[#00a6a6]" : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                          event.status === "upcoming" ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setViewParticipantsForEvent(event.id); setViewParticipantsType("members"); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-[13px] font-bold bg-[#00a6a6]/10 text-[#00a6a6] border border-[#00a6a6]/25 hover:bg-[#00a6a6] hover:text-[#0b1220] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(0,166,166,0.4)]"
                  >
                    <Users size={14} /> Members
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewParticipantsForEvent(event.id); setViewParticipantsType("non-members"); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-[13px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/25 hover:bg-purple-500 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  >
                    <Users size={14} /> Non-Members
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-[13px] font-bold bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/25 hover:bg-[#60a5fa] hover:text-[#0b1220] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(96,165,250,0.4)]"
                  >
                    <Edit2 size={14} /> Edit Event
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-[13px] font-bold bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div style={{ textAlign: "center", padding: 28, color: "#64748b", fontSize: 14 }}>
              No events saved yet. Click "Add Event" to create the first event.
            </div>
          )}
        </div>
      </div>
      
      <EventParticipantsModal 
        event={viewParticipantsForEvent ? events.find(e => e.id === viewParticipantsForEvent) : null} 
        type={viewParticipantsType} 
        onClose={() => setViewParticipantsForEvent(null)} 
      />
    </div>
  );
}
