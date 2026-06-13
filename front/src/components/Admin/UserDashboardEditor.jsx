// ══════════════════════════════════════════════════════════
// UserDashboardEditor.jsx — Fixed version
// Place at: src/components/Admin/UserDashboardEditor.jsx
//
// BUGS FIXED:
// 1. Schema keys now match exactly between save and load
//    (dash_schema_personal, dash_schema_uploads, etc.)
// 2. Full column array saved (not just custom) so reorder persists
// 3. Load-after-save bug fixed: state updated optimistically,
//    no re-fetch that would overwrite the new data
// ══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { adminFetch } from "../../utils/adminFetch";

// ── CMS KEY CONSTANTS — must match exactly in Dashboard.jsx ──
const CMS_KEYS = {
    personal: "dash_schema_personal",
    uploads: "dash_schema_uploads",
    address: "dash_schema_address",
    edu_cols: "dash_schema_edu_cols",
    pro_cols: "dash_schema_pro_cols",
    exp_cols: "dash_schema_exp_cols",
    member_details: "dash_schema_member_details",
    custom_sections: "dash_schema_custom_sections",
    page_visibility: "dash_page_visibility", // which tabs are active/deactivated
};

// ── DEFAULT SCHEMAS — mirrors Dashboard.jsx hardcoded structure ──
const DEFAULTS = {
    personal: [
        { id: "title", label: "Title", type: "select", options: ["Mr.", "Ms.", "Dr.", "Prof."], builtin: true },
        { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], builtin: true },
        { id: "firstName", label: "First Name (as per PAN)", type: "text", builtin: true },
        { id: "lastName", label: "Last Name (as per PAN)", type: "text", builtin: true },
        { id: "fatherName", label: "Father / Husband Name", type: "text", builtin: true },
        { id: "dob", label: "Date of Birth (as per PAN)", type: "date", builtin: true },
        { id: "email", label: "Email Address", type: "email", builtin: true },
        { id: "mobile", label: "Mobile Number", type: "tel", builtin: true },
    ],
    uploads: [
        { id: "picture", label: "Profile Picture", hint: "JPG/PNG, max 2MB", accept: "image/*", builtin: true },
        { id: "signature", label: "Signature", hint: "JPG/PNG, max 1MB", accept: "image/*", builtin: true },
        { id: "pan", label: "PAN Card", hint: "PDF/JPG, max 2MB", accept: ".pdf,.jpg,.jpeg,.png", builtin: true },
        { id: "aadhar", label: "Aadhar Card", hint: "PDF/JPG, max 2MB", accept: ".pdf,.jpg,.jpeg,.png", builtin: true },
    ],
    address: [
        { id: "perm_line1", label: "Permanent: Address Line 1", type: "text", builtin: true },
        { id: "perm_line2", label: "Permanent: Address Line 2", type: "text", builtin: true },
        { id: "perm_city", label: "Permanent: City", type: "text", builtin: true },
        { id: "perm_state", label: "Permanent: State", type: "select", options: ["Select State", "Delhi", "Maharashtra", "Karnataka"], builtin: true },
        { id: "perm_district", label: "Permanent: District", type: "text", builtin: true },
        { id: "perm_pincode", label: "Permanent: Pincode", type: "text", builtin: true },
    ],
    edu_cols: [
        { id: "qualification", label: "Qualification", type: "select", builtin: true },
        { id: "year", label: "Year", type: "text", builtin: true },
        { id: "marks", label: "% Marks", type: "text", builtin: true },
        { id: "board", label: "Board/Univ", type: "text", builtin: true },
        { id: "college", label: "College", type: "text", builtin: true },
        { id: "upload", label: "Upload", type: "file", builtin: true },
    ],
    pro_cols: [
        { id: "qualification", label: "Qualification", type: "text", builtin: true },
        { id: "institute", label: "Institute", type: "text", builtin: true },
        { id: "membershipNo", label: "Membership No.", type: "text", builtin: true },
        { id: "year", label: "Year", type: "text", builtin: true },
        { id: "validity", label: "Validity", type: "text", builtin: true },
        { id: "upload", label: "Upload", type: "file", builtin: true },
    ],
    exp_cols: [
        { id: "status", label: "Status", type: "select", builtin: true },
        { id: "years", label: "Total Years", type: "text", builtin: true },
        { id: "from", label: "From", type: "text", builtin: true },
        { id: "to", label: "To", type: "text", builtin: true },
        { id: "employer", label: "Employer", type: "text", builtin: true },
        { id: "designation", label: "Designation", type: "text", builtin: true },
        { id: "area", label: "Area", type: "text", builtin: true },
        { id: "upload", label: "Upload", type: "file", builtin: true },
    ],
    member_details: [
        { id: "membershipNo", label: "Membership Number", type: "text", readonly: true, builtin: true },
        { id: "memberClass", label: "Member Class", type: "select", options: ["Student", "Affiliate", "Chartered", "Fellow", "Non-Member", "Institutional"], builtin: true },
        { id: "assetClass", label: "Assets Class", type: "select", options: [], builtin: true, note: "Options change based on Member Class" },
        { id: "validTill", label: "Valid Till (Auto-calculated)", type: "text", readonly: true, builtin: true },
    ],
    custom_sections: [],
};

const SECTION_TABS = [
    { key: "page_visibility", label: "Page Visibility", icon: "👁" },
    { key: "personal", label: "Personal Details", icon: "👤" },
    { key: "address", label: "Address Details", icon: "📍" },
    { key: "edu_cols", label: "Educational Qualification", icon: "🎓" },
    { key: "pro_cols", label: "Professional Qualification", icon: "📋" },
    { key: "exp_cols", label: "Experience Table", icon: "💼" },
    { key: "member_details", label: "Member Details", icon: "🪪" },
    { key: "custom_sections", label: "Custom Sections", icon: "➕" },
];

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
export default function UserDashboardEditor({ token, showToast, onUpdate }) {
    const [activeSection, setActiveSection] = useState("personal");
    const [schemas, setSchemas] = useState(null);
    const [saving, setSaving] = useState(false);
    // page_visibility: which dashboard tabs are visible to users
    // Default: all active. { personal: true, address: true, education: true, work: true, membership: true, payment: true, scrutiny: true }
    const [pageVisibility, setPageVisibility] = useState({
        personal: true, address: true, education: true,
        work: true, membership: true, payment: true, scrutiny: true,
    });

    // Human-friendly labels for each visibility key
    const PAGE_LABELS = {
        personal: { label: "Personal Details", icon: "👤" },
        address: { label: "Address Details", icon: "📍" },
        education: { label: "Qualification Details", icon: "🎓" },
        work: { label: "Experience Details", icon: "💼" },
        membership: { label: "Member Details", icon: "🪪" },
        payment: { label: "Payment History", icon: "💳" },
        scrutiny: { label: "Scrutiny Status", icon: "🔍" },
    };

    const savePageVisibility = async (newVis) => {
        try {
            const res = await adminFetch("/api/admin/cms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: CMS_KEYS.page_visibility, value: JSON.stringify(newVis), type: "text" }),
            });
            if (res.ok) {
                showToast("Page visibility updated! Users will see changes immediately.");
                if (onUpdate) onUpdate();
            }
            else showToast("Failed to save", "error");
        } catch { showToast("Failed to save", "error"); }
    };

    const togglePage = (key) => {
        const updated = { ...pageVisibility, [key]: !pageVisibility[key] };
        setPageVisibility(updated);
        savePageVisibility(updated);
    };

    // ── Load schemas from CMS on mount ──
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/public/cms?t=" + Date.now());
                const data = await res.json();
                const cmsMap = {};
                if (data.success) {
                    data.data.forEach(item => {
                        if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
                    });
                }

                // BUG FIX: For tables, save/load the FULL array (with builtins)
                // so column order is preserved. For fields, merge defaults + custom.
                const merged = {};

                // Personal & Address & Uploads: CMS stores only CUSTOM items;
                // we prepend the builtins at display time
                ["personal", "uploads", "address"].forEach(k => {
                    const raw = cmsMap[CMS_KEYS[k]];
                    const custom = raw ? tryParse(raw, []).filter(f => !f.builtin) : [];
                    merged[k] = [...DEFAULTS[k], ...custom];
                });

                // Tables: CMS stores the FULL column array (builtins + custom + order)
                ["edu_cols", "pro_cols", "exp_cols"].forEach(k => {
                    const raw = cmsMap[CMS_KEYS[k]];
                    merged[k] = raw ? tryParse(raw, DEFAULTS[k]) : [...DEFAULTS[k]];
                });

                // Member details fields: merge defaults + custom
                const mdRaw = cmsMap[CMS_KEYS.member_details];
                const mdCustom = mdRaw ? tryParse(mdRaw, []).filter(f => !f.builtin) : [];
                merged.member_details = [...DEFAULTS.member_details, ...mdCustom];

                // Custom sections: full array
                const csRaw = cmsMap[CMS_KEYS.custom_sections];
                merged.custom_sections = csRaw ? tryParse(csRaw, []) : [];

                // Page visibility
                const pvRaw = cmsMap[CMS_KEYS.page_visibility];
                if (pvRaw) {
                    const parsed = tryParse(pvRaw, null);
                    if (parsed) setPageVisibility(prev => ({ ...prev, ...parsed }));
                }

                setSchemas(merged);
            } catch (e) {
                console.error("schema load error:", e);
                setSchemas({
                    personal: [...DEFAULTS.personal],
                    uploads: [...DEFAULTS.uploads],
                    address: [...DEFAULTS.address],
                    edu_cols: [...DEFAULTS.edu_cols],
                    pro_cols: [...DEFAULTS.pro_cols],
                    exp_cols: [...DEFAULTS.exp_cols],
                    member_details: [...DEFAULTS.member_details],
                    custom_sections: [],
                });
            }
        };
        load();
    }, []);

    // ── Save to CMS ──
    // BUG FIX: For tables save full array; for fields save only custom
    const saveSchema = async (key, fullArray) => {
        setSaving(true);
        let toSave;
        if (key === "edu_cols" || key === "pro_cols" || key === "exp_cols") {
            // Save full array so order persists
            toSave = fullArray;
        } else if (key === "custom_sections" || key === "member_details") {
            toSave = fullArray;
        } else {
            // personal/uploads/address: save only custom items
            toSave = fullArray.filter(f => !f.builtin);
        }

        try {
            const res = await adminFetch("/api/admin/cms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: CMS_KEYS[key],
                    value: JSON.stringify(toSave),
                    type: "text",
                }),
            });
            if (res.ok) {
                showToast("Dashboard updated! Users will see changes immediately.");
                if (onUpdate) onUpdate();
            } else {
                showToast("Failed to save", "error");
            }
        } catch {
            showToast("Failed to save", "error");
        }
        setSaving(false);
    };

    // ── Update schema state + save ──
    const updateSchema = (key, newArray) => {
        // BUG FIX: Update state first (optimistic), then save.
        // Never re-fetch after save — that was causing old data to overwrite.
        setSchemas(prev => ({ ...prev, [key]: newArray }));
        saveSchema(key, newArray);
    };

    if (!schemas) {
        return (
            <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
                Loading dashboard schema...
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>

            {/* ── Section Tabs ── */}
            <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
                <div style={sty.sectionLabel}>Dashboard Sections</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {SECTION_TABS.map(tab => {
                        const active = activeSection === tab.key;
                        return (
                            <button key={tab.key}
                                style={{ ...sty.tabBtn, ...(active ? sty.tabBtnActive : {}) }}
                                onClick={() => setActiveSection(tab.key)}>
                                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: active ? "#00a6a6" : "#e2e8f0" }}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div style={sty.tipBox}>
                    💡 Changes here instantly update what users see in their dashboard
                </div>
            </div>

            {/* ── Editor Panel ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

                {/* PAGE VISIBILITY PANEL */}
                {activeSection === "page_visibility" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={sty.card}>
                            <div style={sty.cardHeader}>
                                <div>
                                    <div style={sty.cardTitle}>👁 Page Visibility Controls</div>
                                    <div style={sty.cardDesc}>
                                        Activate or deactivate tabs in the user dashboard. Deactivated pages are completely hidden from users — they won't see the tab at all.
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {Object.entries(PAGE_LABELS).map(([key, { label, icon }]) => {
                                    const isActive = pageVisibility[key] !== false;
                                    return (
                                        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#111827", borderRadius: 12, border: `1px solid ${isActive ? "#1e3a2a" : "#3a1a1a"}`, transition: "all 0.2s" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <span style={{ fontSize: 20 }}>{icon}</span>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#e2e8f0" : "#64748b" }}>{label}</div>
                                                    <div style={{ fontSize: 11, color: isActive ? "#34d399" : "#ef4444", fontWeight: 600, marginTop: 2 }}>
                                                        {isActive ? "✓ Active — users can see this tab" : "✕ Deactivated — hidden from users"}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => togglePage(key)}
                                                style={{
                                                    padding: "8px 20px", borderRadius: 8, border: "none",
                                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                                    background: isActive ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)",
                                                    color: isActive ? "#ef4444" : "#34d399",
                                                    border: `1px solid ${isActive ? "rgba(239,68,68,0.25)" : "rgba(52,211,153,0.25)"}`,
                                                    transition: "all 0.2s",
                                                }}>
                                                {isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 12, color: "#92610a" }}>
                                ⚠️ Note: Deactivating <strong>Personal Details</strong> or <strong>Member Details</strong> will prevent users from filling required information for membership. Use with caution.
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "personal" && (
                    <PersonalEditor
                        fields={schemas.personal}
                        uploads={schemas.uploads}
                        onSaveFields={arr => updateSchema("personal", arr)}
                        onSaveUploads={arr => updateSchema("uploads", arr)}
                        saving={saving}
                    />
                )}

                {activeSection === "address" && (
                    <AddressEditor
                        fields={schemas.address}
                        onSave={arr => updateSchema("address", arr)}
                        saving={saving}
                    />
                )}

                {activeSection === "edu_cols" && (
                    <TableEditor
                        title="Educational Qualification Columns"
                        desc="Columns in the Educational Qualification table. Drag to reorder, click + to insert after a column."
                        columns={schemas.edu_cols}
                        onSave={arr => updateSchema("edu_cols", arr)}
                        saving={saving}
                        showToast={showToast}
                    />
                )}

                {activeSection === "pro_cols" && (
                    <TableEditor
                        title="Professional Qualification Columns"
                        desc="Columns in the Professional Qualification table. Drag to reorder, click + to insert after a column."
                        columns={schemas.pro_cols}
                        onSave={arr => updateSchema("pro_cols", arr)}
                        saving={saving}
                        showToast={showToast}
                    />
                )}

                {activeSection === "exp_cols" && (
                    <TableEditor
                        title="Experience Table Columns"
                        desc="These are the columns in the Work Experience table. Drag to reorder, click + to insert after a column."
                        columns={schemas.exp_cols}
                        onSave={arr => updateSchema("exp_cols", arr)}
                        saving={saving}
                        showToast={showToast}
                    />
                )}

                {activeSection === "member_details" && (
                    <MemberDetailsEditor
                        fields={schemas.member_details}
                        onSave={arr => updateSchema("member_details", arr)}
                        saving={saving}
                    />
                )}

                {activeSection === "custom_sections" && (
                    <CustomSectionsEditor
                        sections={schemas.custom_sections}
                        onSave={arr => updateSchema("custom_sections", arr)}
                        saving={saving}
                        showToast={showToast}
                    />
                )}

            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// PERSONAL EDITOR
// ══════════════════════════════════════════
function PersonalEditor({ fields, uploads, onSaveFields, onSaveUploads, saving }) {
    const [newField, setNewField] = useState({ label: "", type: "text", options: "", section: "personal" });
    const [newUpload, setNewUpload] = useState({ label: "", hint: "PDF/JPG, max 2MB", accept: ".pdf,.jpg,.jpeg,.png" });
    const [showAddField, setShowAddField] = useState(false);
    const [showAddUpload, setShowAddUpload] = useState(false);

    const handleAddField = () => {
        if (!newField.label.trim()) return;
        const id = `custom_${Date.now()}`;
        const opts = newField.type === "select"
            ? newField.options.split(",").map(o => o.trim()).filter(Boolean)
            : undefined;
        const added = [...fields, { id, label: newField.label.trim(), type: newField.type, ...(opts ? { options: opts } : {}), builtin: false }];
        onSaveFields(added);
        setNewField({ label: "", type: "text", options: "", section: "personal" });
        setShowAddField(false);
    };

    const handleAddUpload = () => {
        if (!newUpload.label.trim()) return;
        const id = `upload_${Date.now()}`;
        const added = [...uploads, { id, label: newUpload.label.trim(), hint: newUpload.hint, accept: newUpload.accept, builtin: false }];
        onSaveUploads(added);
        setNewUpload({ label: "", hint: "PDF/JPG, max 2MB", accept: ".pdf,.jpg,.jpeg,.png" });
        setShowAddUpload(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Personal Fields */}
            <div style={sty.card}>
                <div style={sty.cardHeader}>
                    <div>
                        <div style={sty.cardTitle}>Personal Details</div>
                        <div style={sty.cardDesc}>Exactly what users see in the Personal Details tab</div>
                    </div>
                    <button style={sty.addBtn} onClick={() => setShowAddField(!showAddField)}>
                        {showAddField ? "✕ Cancel" : "+ Add Field"}
                    </button>
                </div>

                {showAddField && (
                    <div style={sty.addForm}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                            <div>
                                <label style={sty.fLabel}>Field Label *</label>
                                <input style={sty.input} value={newField.label} placeholder="e.g. Driving License No"
                                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && handleAddField()} autoFocus />
                            </div>
                            <div>
                                <label style={sty.fLabel}>Field Type</label>
                                <select style={sty.input} value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}>
                                    <option value="text">Text Input</option>
                                    <option value="tel">Phone Number</option>
                                    <option value="email">Email</option>
                                    <option value="date">Date Picker</option>
                                    <option value="number">Number</option>
                                    <option value="url">URL / Link</option>
                                    <option value="select">Dropdown</option>
                                    <option value="textarea">Long Text</option>
                                </select>
                            </div>
                            <button style={sty.saveBtn} onClick={handleAddField}>Add Field</button>
                        </div>
                        {newField.type === "select" && (
                            <div style={{ marginTop: 10 }}>
                                <label style={sty.fLabel}>Dropdown Options (comma-separated)</label>
                                <input style={sty.input} value={newField.options} placeholder="Option A, Option B, Option C"
                                    onChange={e => setNewField({ ...newField, options: e.target.value })} />
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                    {fields.map(field => (
                        <div key={field.id} style={{ position: "relative" }}>
                            <label style={sty.previewLabel}>
                                {field.label}
                                {!field.builtin && " ✦"}
                            </label>
                            {field.type === "select" ? (
                                <select disabled style={sty.previewInput}>
                                    <option>{field.options?.[0] || "Select..."}</option>
                                </select>
                            ) : field.type === "textarea" ? (
                                <textarea disabled style={{ ...sty.previewInput, minHeight: 58 }} placeholder={`Enter ${field.label}`} />
                            ) : (
                                <input disabled type={field.type} style={sty.previewInput} placeholder={`Enter ${field.label}`} />
                            )}
                            {field.builtin
                                ? <div style={sty.builtinBadge}>Built-in</div>
                                : <button style={sty.removeBtn} onClick={() => {
                                    const updated = fields.filter(f => f.id !== field.id);
                                    onSaveFields(updated);
                                }}>✕</button>
                            }
                        </div>
                    ))}
                </div>
                <div style={sty.hint}>✦ = Custom fields you added. Built-in fields cannot be removed.</div>
            </div>

            {/* Upload Documents */}
            <div style={sty.card}>
                <div style={sty.cardHeader}>
                    <div>
                        <div style={sty.cardTitle}>Upload Documents</div>
                        <div style={sty.cardDesc}>Upload boxes shown in the Personal Details tab</div>
                    </div>
                    <button style={sty.addBtn} onClick={() => setShowAddUpload(!showAddUpload)}>
                        {showAddUpload ? "✕ Cancel" : "+ Add Upload Box"}
                    </button>
                </div>

                {showAddUpload && (
                    <div style={sty.addForm}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                            <div>
                                <label style={sty.fLabel}>Label *</label>
                                <input style={sty.input} value={newUpload.label} placeholder="e.g. Driving License"
                                    onChange={e => setNewUpload({ ...newUpload, label: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && handleAddUpload()} autoFocus />
                            </div>
                            <div>
                                <label style={sty.fLabel}>Hint Text</label>
                                <input style={sty.input} value={newUpload.hint} placeholder="PDF/JPG, max 2MB"
                                    onChange={e => setNewUpload({ ...newUpload, hint: e.target.value })} />
                            </div>
                            <div>
                                <label style={sty.fLabel}>Accepted Files</label>
                                <select style={sty.input} value={newUpload.accept} onChange={e => setNewUpload({ ...newUpload, accept: e.target.value })}>
                                    <option value=".pdf,.jpg,.jpeg,.png">PDF + Images</option>
                                    <option value="image/*">Images only</option>
                                    <option value=".pdf">PDF only</option>
                                    <option value=".pdf,.jpg,.jpeg,.png,.doc,.docx">PDF + Images + Docs</option>
                                </select>
                            </div>
                            <button style={sty.saveBtn} onClick={handleAddUpload}>Add</button>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
                    {uploads.map(item => (
                        <div key={item.id} style={{ ...sty.uploadBox, position: "relative" }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>
                                {item.accept?.includes("image") && !item.accept?.includes("pdf") ? "🖼" : "📄"}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: "#6b8099", marginTop: 4 }}>{item.hint}</div>
                            {item.builtin
                                ? <div style={{ ...sty.builtinBadge, top: 6, right: 6 }}>Built-in</div>
                                : <button style={{ ...sty.removeBtn, top: 6, right: 6 }} onClick={() => {
                                    const updated = uploads.filter(u => u.id !== item.id);
                                    onSaveUploads(updated);
                                }}>✕</button>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// ADDRESS EDITOR
// ══════════════════════════════════════════
function AddressEditor({ fields, onSave, saving }) {
    const [newField, setNewField] = useState({ label: "", type: "text" });
    const [showAdd, setShowAdd] = useState(false);

    const handleAdd = () => {
        if (!newField.label.trim()) return;
        const id = `custom_${Date.now()}`;
        const added = [...fields, { id, label: newField.label.trim(), type: newField.type, builtin: false }];
        onSave(added);
        setNewField({ label: "", type: "text" });
        setShowAdd(false);
    };

    return (
        <div style={sty.card}>
            <div style={sty.cardHeader}>
                <div>
                    <div style={sty.cardTitle}>Address Details</div>
                    <div style={sty.cardDesc}>Fields shown in the Address Details tab (Permanent & Correspondence)</div>
                </div>
                <button style={sty.addBtn} onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? "✕ Cancel" : "+ Add Field"}
                </button>
            </div>

            {showAdd && (
                <div style={sty.addForm}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                        <div>
                            <label style={sty.fLabel}>Field Label *</label>
                            <input style={sty.input} value={newField.label} placeholder="e.g. Landmark, Country"
                                onChange={e => setNewField({ ...newField, label: e.target.value })}
                                onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
                        </div>
                        <div>
                            <label style={sty.fLabel}>Field Type</label>
                            <select style={sty.input} value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}>
                                <option value="text">Text</option>
                                <option value="tel">Phone</option>
                                <option value="number">Number</option>
                                <option value="select">Dropdown</option>
                            </select>
                        </div>
                        <button style={sty.saveBtn} onClick={handleAdd}>Add</button>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8, background: "#f2f9ff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,43,91,0.1)" }}>
                {fields.map(field => (
                    <div key={field.id} style={{ position: "relative" }}>
                        <label style={sty.previewLabel}>{field.label}</label>
                        {field.type === "select"
                            ? <select disabled style={sty.previewInput}><option>Select {field.label}</option></select>
                            : <input disabled type={field.type} style={sty.previewInput} placeholder={field.label} />
                        }
                        {field.builtin
                            ? <div style={sty.builtinBadge}>Built-in</div>
                            : <button style={sty.removeBtn} onClick={() => onSave(fields.filter(f => f.id !== field.id))}>✕</button>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// TABLE EDITOR (Qualification + Experience)
// BUG FIX: Save full array including builtins to preserve order
// ══════════════════════════════════════════
function TableEditor({ title, desc, columns, onSave, saving, showToast }) {
    const [addAfterIdx, setAddAfterIdx] = useState(null); // index to insert after
    const [newCol, setNewCol] = useState({ label: "", type: "text" });
    const [dragIdx, setDragIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);

    const handleAddCol = () => {
        if (!newCol.label.trim()) return;
        const id = `custom_${Date.now()}`;
        const col = { id, label: newCol.label.trim(), type: newCol.type, builtin: false };
        let updated;
        if (addAfterIdx === null || addAfterIdx === "end") {
            // Add before the Upload column (last builtin) if inserting at end
            const uploadIdx = columns.findIndex(c => c.id === "upload");
            if (uploadIdx >= 0 && addAfterIdx !== "end") {
                updated = [...columns.slice(0, uploadIdx), col, ...columns.slice(uploadIdx)];
            } else {
                updated = [...columns, col];
            }
        } else {
            // Insert after the column at addAfterIdx
            updated = [
                ...columns.slice(0, addAfterIdx + 1),
                col,
                ...columns.slice(addAfterIdx + 1),
            ];
        }
        onSave(updated); // BUG FIX: save full array
        setNewCol({ label: "", type: "text" });
        setAddAfterIdx(null);
        showToast("Column added! Users will see it immediately.");
    };

    const handleRemove = (id) => {
        onSave(columns.filter(c => c.id !== id));
    };

    const handleDragStart = (idx) => setDragIdx(idx);
    const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
    const handleDrop = (dropIdx) => {
        if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setDragOverIdx(null); return; }
        const reordered = [...columns];
        const [moved] = reordered.splice(dragIdx, 1);
        reordered.splice(dropIdx, 0, moved);
        onSave(reordered); // BUG FIX: save full reordered array
        setDragIdx(null);
        setDragOverIdx(null);
        showToast("Column order saved!");
    };

    return (
        <div style={sty.card}>
            <div style={sty.cardHeader}>
                <div>
                    <div style={sty.cardTitle}>{title}</div>
                    <div style={sty.cardDesc}>{desc}</div>
                </div>
            </div>

            {/* Column chips */}
            <div style={{ marginBottom: 16 }}>
                <div style={sty.sectionLabel}>Current Columns (drag to reorder)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {columns.map((col, idx) => (
                        <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div
                                draggable={!col.builtin}
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={e => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "7px 12px",
                                    background: dragOverIdx === idx ? "rgba(0,166,166,0.2)" : col.builtin ? "#1a3a2a" : "#1e3a5f",
                                    border: `1px solid ${dragOverIdx === idx ? "#00a6a6" : col.builtin ? "#34d399" : "#60a5fa"}`,
                                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                                    color: col.builtin ? "#34d399" : "#60a5fa",
                                    cursor: col.builtin ? "default" : "grab",
                                    opacity: dragIdx === idx ? 0.5 : 1,
                                    userSelect: "none",
                                    transition: "all 0.15s",
                                }}>
                                {!col.builtin && <span style={{ fontSize: 11, opacity: 0.5 }}>⠿</span>}
                                {col.label}
                                <span style={{ fontSize: 10, opacity: 0.6 }}>[{col.type}]</span>
                                {!col.builtin && (
                                    <button
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: "0 2px", lineHeight: 1 }}
                                        onClick={() => handleRemove(col.id)}>✕</button>
                                )}
                            </div>

                            {/* + button after this column */}
                            <button
                                style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: addAfterIdx === idx ? "#00a6a6" : "rgba(0,166,166,0.12)",
                                    border: "1px solid rgba(0,166,166,0.4)",
                                    color: addAfterIdx === idx ? "#fff" : "#00a6a6",
                                    fontSize: 14, cursor: "pointer", fontWeight: 700,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.15s", flexShrink: 0,
                                }}
                                title={`Add column after "${col.label}"`}
                                onClick={() => setAddAfterIdx(addAfterIdx === idx ? null : idx)}>
                                +
                            </button>
                        </div>
                    ))}

                    <button
                        style={{ padding: "7px 14px", background: addAfterIdx === "end" ? "#00a6a6" : "rgba(0,166,166,0.08)", border: "1px dashed rgba(0,166,166,0.4)", color: addAfterIdx === "end" ? "#fff" : "#00a6a6", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        onClick={() => setAddAfterIdx(addAfterIdx === "end" ? null : "end")}>
                        + Add at End
                    </button>
                </div>
            </div>

            {/* Add column form */}
            {addAfterIdx !== null && (
                <div style={{ ...sty.addForm, borderColor: "rgba(0,166,166,0.3)", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6", marginBottom: 10 }}>
                        {addAfterIdx === "end"
                            ? "Add column at the end"
                            : `Add column after "${columns[addAfterIdx]?.label}"`}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, alignItems: "flex-end" }}>
                        <div>
                            <label style={sty.fLabel}>Column Name *</label>
                            <input style={sty.input} value={newCol.label} placeholder="e.g. Grade, License No"
                                onChange={e => setNewCol({ ...newCol, label: e.target.value })}
                                onKeyDown={e => e.key === "Enter" && handleAddCol()} autoFocus />
                        </div>
                        <div>
                            <label style={sty.fLabel}>Column Type</label>
                            <select style={sty.input} value={newCol.type} onChange={e => setNewCol({ ...newCol, type: e.target.value })}>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="select">Dropdown</option>
                                <option value="file">File Upload</option>
                                <option value="url">URL / Link</option>
                            </select>
                        </div>
                        <button style={sty.saveBtn} onClick={handleAddCol}>Add Column</button>
                        <button style={{ ...sty.saveBtn, background: "#374151" }} onClick={() => setAddAfterIdx(null)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Table preview */}
            <div>
                <div style={sty.sectionLabel}>Table Preview (as users see it)</div>
                <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(0,43,91,0.12)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f2f9ff" }}>
                                {columns.map(col => (
                                    <th key={col.id} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#002b5b", textTransform: "uppercase", borderBottom: "1px solid rgba(0,43,91,0.12)", whiteSpace: "nowrap" }}>
                                        {col.label}
                                        {!col.builtin && <span style={{ marginLeft: 4, fontSize: 10, color: "#00a6a6" }}>✦</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1].map(row => (
                                <tr key={row} style={{ borderBottom: "0.5px solid rgba(0,43,91,0.08)" }}>
                                    {columns.map(col => (
                                        <td key={col.id} style={{ padding: "8px 12px" }}>
                                            {col.type === "file"
                                                ? <button style={{ background: "#00a6a6", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 5, fontSize: 12 }}>Upload</button>
                                                : col.type === "select"
                                                    ? <select disabled style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 5, fontSize: 12, background: "#f2f9ff" }}><option>Select</option></select>
                                                    : <input disabled type={col.type || "text"} style={{ border: "1px solid #ddd", borderRadius: 5, padding: "4px 8px", fontSize: 12, width: "90px", background: "#f2f9ff" }} placeholder={col.label} />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={sty.hint}>✦ = Custom columns. Drag non-built-in chips to reorder.</div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// CUSTOM SECTIONS EDITOR
// Admin adds entirely new sections with fields
// These appear as new sidebar tabs in user dashboard
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// MEMBER DETAILS EDITOR
// Shows Member Details tab exactly as user sees it
// Admin can add extra fields
// ══════════════════════════════════════════
function MemberDetailsEditor({ fields, onSave, saving }) {
    const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
    const [showAdd, setShowAdd] = useState(false);

    const MEMBER_ASSET_MAP = {
        "Student": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
        "Affiliate": ["Affiliate (Land & Building Valuation)", "Affiliate (Plant & Machinery Valuation)", "Affiliate (Business Valuation)", "Affiliate (Jewellery & Precious Assets)", "Affiliate (Financial Instruments & Securities)"],
        "Chartered": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
        "Fellow": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
        "Institutional": ["Corporate Membership", "Institutional Membership"],
        "Non-Member": [],
    };
    const MEMBER_TYPES = ["Monthly", "Quarterly", "Annual"];

    const handleAdd = () => {
        if (!newField.label.trim()) return;
        const id = `custom_${Date.now()}`;
        const opts = newField.type === "select"
            ? newField.options.split(",").map(o => o.trim()).filter(Boolean)
            : undefined;
        const added = [...fields, { id, label: newField.label.trim(), type: newField.type, ...(opts ? { options: opts } : {}), builtin: false }];
        onSave(added);
        setNewField({ label: "", type: "text", options: "" });
        setShowAdd(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={sty.card}>
                <div style={sty.cardHeader}>
                    <div>
                        <div style={sty.cardTitle}>Member Details</div>
                        <div style={sty.cardDesc}>
                            Exactly what users see in the Member Details tab. Built-in fields (Member Class, Asset Class) cannot be removed.
                            You can add extra fields below them.
                        </div>
                    </div>
                    <button style={sty.addBtn} onClick={() => setShowAdd(!showAdd)}>
                        {showAdd ? "✕ Cancel" : "+ Add Field"}
                    </button>
                </div>

                {/* Add field form */}
                {showAdd && (
                    <div style={sty.addForm}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                            <div>
                                <label style={sty.fLabel}>Field Label *</label>
                                <input style={sty.input} value={newField.label} placeholder="e.g. RERA Registration No."
                                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
                            </div>
                            <div>
                                <label style={sty.fLabel}>Field Type</label>
                                <select style={sty.input} value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}>
                                    <option value="text">Text Input</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="url">URL / Link</option>
                                    <option value="select">Dropdown</option>
                                    <option value="textarea">Long Text</option>
                                </select>
                            </div>
                            <button style={sty.saveBtn} onClick={handleAdd}>Add Field</button>
                        </div>
                        {newField.type === "select" && (
                            <div style={{ marginTop: 10 }}>
                                <label style={sty.fLabel}>Dropdown Options (comma-separated)</label>
                                <input style={sty.input} value={newField.options} placeholder="Option A, Option B, Option C"
                                    onChange={e => setNewField({ ...newField, options: e.target.value })} />
                            </div>
                        )}
                    </div>
                )}

                {/* Live preview of Member Details form — matches what user sees */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8, background: "#f2f9ff", padding: 20, borderRadius: 10, border: "1px solid rgba(0,43,91,0.1)" }}>

                    {/* Membership No — read only */}
                    <div style={{ position: "relative" }}>
                        <label style={sty.previewLabel}>Membership Number (Auto-generated)</label>
                        <input disabled style={{ ...sty.previewInput, background: "#e8f4f8", color: "#6b8099", fontWeight: 600 }}
                            value="COV-TEMP-2026-XXXXX" readOnly />
                        <div style={sty.builtinBadge}>Built-in</div>
                    </div>

                    {/* Member Class */}
                    <div style={{ position: "relative" }}>
                        <label style={sty.previewLabel}>Member Class *</label>
                        <select disabled style={sty.previewInput}>
                            <option>Select Member Class</option>
                            {Object.keys(MEMBER_ASSET_MAP).map(c => <option key={c}>{c}</option>)}
                        </select>
                        <div style={sty.builtinBadge}>Built-in</div>
                    </div>

                    {/* Asset Class */}
                    <div style={{ position: "relative" }}>
                        <label style={sty.previewLabel}>Assets Class *</label>
                        <select disabled style={sty.previewInput}>
                            <option>Select Asset Class</option>
                        </select>
                        <div style={sty.builtinBadge}>Built-in</div>
                    </div>

                    {/* Valid Till */}
                    <div style={{ position: "relative" }}>
                        <label style={sty.previewLabel}>Membership Valid Till (Auto-calculated)</label>
                        <input disabled style={{ ...sty.previewInput, background: "#e8f4f8", color: "#6b8099", fontWeight: 600 }}
                            value="Auto-calculated on selection" readOnly />
                        <div style={sty.builtinBadge}>Built-in</div>
                    </div>

                    {/* Admin-added extra fields */}
                    {fields.filter(f => !f.builtin).map(field => (
                        <div key={field.id} style={{ position: "relative" }}>
                            <label style={sty.previewLabel}>{field.label} ✦</label>
                            {field.type === "select" ? (
                                <select disabled style={sty.previewInput}>
                                    <option>Select {field.label}</option>
                                    {(field.options || []).map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            ) : field.type === "textarea" ? (
                                <textarea disabled style={{ ...sty.previewInput, minHeight: 60 }} placeholder={`Enter ${field.label}`} />
                            ) : (
                                <input disabled type={field.type} style={sty.previewInput} placeholder={`Enter ${field.label}`} />
                            )}
                            <button style={sty.removeBtn} onClick={() => onSave(fields.filter(f2 => f2.id !== field.id))}>✕</button>
                        </div>
                    ))}
                </div>

                <div style={sty.hint}>✦ = Custom fields you added. Built-in fields (Membership No, Member Class, Asset Class, Member Type, Valid Till) cannot be removed — they are core to the membership process.</div>
            </div>

            {/* Info box about what admin controls */}
            <div style={{ ...sty.card, background: "rgba(0,166,166,0.04)", border: "1px solid rgba(0,166,166,0.2)" }}>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                    <div style={{ fontWeight: 700, color: "#00a6a6", marginBottom: 8 }}>ℹ️ What admin controls in Member Details:</div>
                    <div>• <strong style={{ color: "#e2e8f0" }}>Member Class options</strong> — Student, Affiliate, Chartered, Fellow, Institutional, Non-Member (hardcoded in the system)</div>
                    <div>• <strong style={{ color: "#e2e8f0" }}>Asset Class</strong> — Auto-populated based on selected Member Class</div>
                    <div>• <strong style={{ color: "#e2e8f0" }}>Valid Till</strong> — Auto-calculated based on payment date</div>
                    <div>• <strong style={{ color: "#e2e8f0" }}>Custom fields</strong> — Any extra fields you add above will appear in the Member Details tab</div>
                    <div style={{ marginTop: 8 }}>To change <strong style={{ color: "#e2e8f0" }}>fee amounts</strong>, use the new <strong style={{ color: "#e2e8f0" }}>Membership Fees</strong> tab in the admin panel.</div>
                </div>
            </div>
        </div>
    );
}

function CustomSectionsEditor({ sections, onSave, saving, showToast }) {
    const [newSectionLabel, setNewSectionLabel] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [newField, setNewField] = useState({ label: "", type: "text" });

    const handleAddSection = () => {
        if (!newSectionLabel.trim()) return;
        const id = `section_${Date.now()}`;
        const added = [...sections, { id, label: newSectionLabel.trim(), fields: [] }];
        onSave(added);
        setNewSectionLabel("");
        setShowAdd(false);
        setExpanded(id);
        showToast(`Section "${newSectionLabel}" added to user dashboard!`);
    };

    const handleRemoveSection = (id, label) => {
        if (!window.confirm(`Remove section "${label}" and all its fields?`)) return;
        onSave(sections.filter(s => s.id !== id));
        if (expanded === id) setExpanded(null);
    };

    const handleAddField = (sectionId) => {
        if (!newField.label.trim()) return;
        const fieldId = `field_${Date.now()}`;
        const updated = sections.map(s =>
            s.id === sectionId
                ? { ...s, fields: [...s.fields, { id: fieldId, label: newField.label.trim(), type: newField.type }] }
                : s
        );
        onSave(updated);
        setNewField({ label: "", type: "text" });
        showToast("Field added!");
    };

    const handleRemoveField = (sectionId, fieldId) => {
        const updated = sections.map(s =>
            s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s
        );
        onSave(updated);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={sty.card}>
                <div style={sty.cardHeader}>
                    <div>
                        <div style={sty.cardTitle}>Custom Sections</div>
                        <div style={sty.cardDesc}>
                            Add entirely new sections to the user dashboard. Each section becomes a new tab in the user's sidebar.
                        </div>
                    </div>
                    <button style={sty.addBtn} onClick={() => setShowAdd(!showAdd)}>
                        {showAdd ? "✕ Cancel" : "+ New Section"}
                    </button>
                </div>

                {showAdd && (
                    <div style={sty.addForm}>
                        <label style={sty.fLabel}>Section Name *</label>
                        <div style={{ display: "flex", gap: 10 }}>
                            <input style={{ ...sty.input, flex: 1 }} value={newSectionLabel}
                                placeholder="e.g. Social Media Links, Bank Details, Certifications"
                                onChange={e => setNewSectionLabel(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddSection()} autoFocus />
                            <button style={sty.saveBtn} onClick={handleAddSection}>Create Section</button>
                        </div>
                    </div>
                )}

                {sections.length === 0 && !showAdd && (
                    <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: 14 }}>
                        No custom sections yet. Click "+ New Section" to add one.
                    </div>
                )}
            </div>

            {sections.map(section => (
                <div key={section.id} style={sty.card}>
                    <div style={sty.cardHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                                style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                                onClick={() => setExpanded(expanded === section.id ? null : section.id)}>
                                {expanded === section.id ? "▾" : "▸"}
                            </button>
                            <div>
                                <div style={sty.cardTitle}>{section.label}</div>
                                <div style={sty.cardDesc}>{section.fields.length} field{section.fields.length !== 1 ? "s" : ""} — appears as a sidebar tab for users</div>
                            </div>
                        </div>
                        <button
                            style={{ ...sty.addBtn, background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}
                            onClick={() => handleRemoveSection(section.id, section.label)}>
                            Remove Section
                        </button>
                    </div>

                    {expanded === section.id && (
                        <>
                            {/* Add field form */}
                            <div style={{ ...sty.addForm, marginBottom: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6", marginBottom: 8 }}>
                                    Add field to "{section.label}"
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                                    <div>
                                        <label style={sty.fLabel}>Field Label *</label>
                                        <input style={sty.input} value={newField.label} placeholder="e.g. LinkedIn URL, GST Number"
                                            onChange={e => setNewField({ ...newField, label: e.target.value })}
                                            onKeyDown={e => e.key === "Enter" && handleAddField(section.id)} />
                                    </div>
                                    <div>
                                        <label style={sty.fLabel}>Field Type</label>
                                        <select style={sty.input} value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}>
                                            <option value="text">Text</option>
                                            <option value="url">URL / Link</option>
                                            <option value="tel">Phone</option>
                                            <option value="email">Email</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="textarea">Long Text</option>
                                        </select>
                                    </div>
                                    <button style={sty.saveBtn} onClick={() => handleAddField(section.id)}>Add Field</button>
                                </div>
                            </div>

                            {/* Fields preview */}
                            {section.fields.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#f2f9ff", padding: 16, borderRadius: 10, border: "1px solid rgba(0,43,91,0.1)" }}>
                                    {section.fields.map(field => (
                                        <div key={field.id} style={{ position: "relative" }}>
                                            <label style={sty.previewLabel}>{field.label}</label>
                                            {field.type === "textarea"
                                                ? <textarea disabled style={{ ...sty.previewInput, minHeight: 60 }} placeholder={`Enter ${field.label}`} />
                                                : <input disabled type={field.type} style={sty.previewInput} placeholder={`Enter ${field.label}`} />
                                            }
                                            <button style={sty.removeBtn} onClick={() => handleRemoveField(section.id, field.id)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: 16, color: "#475569", fontSize: 13 }}>
                                    No fields yet. Add fields above.
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── HELPERS ──
function tryParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
}

// ── STYLES ──
const sty = {
    sectionLabel: { fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    tabBtn: { background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "12px", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 3, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" },
    tabBtnActive: { background: "rgba(0,166,166,0.05)", border: "1px solid #00a6a6" },
    tipBox: { marginTop: 20, padding: "12px", background: "rgba(0,166,166,0.05)", border: "1px solid rgba(0,166,166,0.2)", borderRadius: 10, fontSize: 12, color: "#64748b", lineHeight: 1.6 },
    card: { background: "#0d1424", border: "1px solid #1e293b", borderRadius: 16, padding: 24 },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    cardTitle: { fontSize: 15, fontWeight: 800, color: "#fff" },
    cardDesc: { fontSize: 12, color: "#64748b", marginTop: 4 },
    addBtn: { background: "rgba(0,166,166,0.1)", border: "1px solid rgba(0,166,166,0.3)", color: "#00a6a6", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
    saveBtn: { background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
    addForm: { background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 16, marginBottom: 16 },
    input: { width: "100%", padding: "9px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
    fLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 },
    previewLabel: { display: "block", fontSize: 11, color: "#6b8099", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 },
    previewInput: { border: "1px solid rgba(0,43,91,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#012a4a", background: "#f2f9ff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
    removeBtn: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, padding: 0, lineHeight: 1 },
    builtinBadge: { position: "absolute", top: -6, right: -6, background: "#1a3a2a", color: "#34d399", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, border: "1px solid #34d399", zIndex: 1, whiteSpace: "nowrap" },
    uploadBox: { border: "1.5px dashed #00a6a6", borderRadius: 10, padding: "16px 12px", textAlign: "center", background: "#f0fdfc", minWidth: 130, flex: "1 1 130px", maxWidth: 180 },
    hint: { fontSize: 12, color: "#475569", marginTop: 8 },
};
