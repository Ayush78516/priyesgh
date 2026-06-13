import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_EVENT_MASTERS,
  EVENT_MASTER_FIELDS,
  EVENT_MASTERS_CMS_KEY,
  parseEventMasters,
  serializeEventMasters,
} from "../../data/eventMasters";

function EventMasterManager({ token, cms = [], showToast, onUpdate }) {
  const [masters, setMasters] = useState(DEFAULT_EVENT_MASTERS);
  const [newValues, setNewValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const cmsMap = {};
    cms.forEach((item) => {
      if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
    });
    setMasters(parseEventMasters(cmsMap[EVENT_MASTERS_CMS_KEY]));
  }, [cms]);

  const totalItems = useMemo(
    () => EVENT_MASTER_FIELDS.reduce((sum, field) => sum + (masters[field.key]?.length || 0), 0),
    [masters]
  );

  const persist = async (nextMasters) => {
    setSaving(true);
    try {
      const cleaned = serializeEventMasters(nextMasters);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key: EVENT_MASTERS_CMS_KEY,
          value: JSON.stringify(cleaned),
          type: "text",
        }),
      });

      if (!res.ok) {
        showToast("Failed to save event master", "error");
        return false;
      }

      setMasters(cleaned);
      if (onUpdate) await onUpdate();
      showToast("Event master updated");
      return true;
    } catch {
      showToast("Failed to save event master", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addValue = async (fieldKey) => {
    const value = String(newValues[fieldKey] || "").trim();
    if (!value) {
      showToast("Enter a value", "error");
      return;
    }
    const current = masters[fieldKey] || [];
    if (current.some((item) => item.toLowerCase() === value.toLowerCase())) {
      showToast("Value already exists", "error");
      return;
    }
    const saved = await persist({ ...masters, [fieldKey]: [...current, value] });
    if (saved) setNewValues((prev) => ({ ...prev, [fieldKey]: "" }));
  };

  const updateValue = async () => {
    if (!editing) return;
    const value = draft.trim();
    if (!value) {
      showToast("Enter a value", "error");
      return;
    }
    const current = masters[editing.fieldKey] || [];
    if (current.some((item) => item !== editing.value && item.toLowerCase() === value.toLowerCase())) {
      showToast("Value already exists", "error");
      return;
    }
    const saved = await persist({
      ...masters,
      [editing.fieldKey]: current.map((item) => (item === editing.value ? value : item)),
    });
    if (saved) {
      setEditing(null);
      setDraft("");
    }
  };

  const deleteValue = async () => {
    if (!deleteTarget) return;
    const current = masters[deleteTarget.fieldKey] || [];
    if (current.length <= 1) {
      showToast("At least one value is required", "error");
      setDeleteTarget(null);
      return;
    }
    await persist({
      ...masters,
      [deleteTarget.fieldKey]: current.filter((item) => item !== deleteTarget.value),
    });
    setDeleteTarget(null);
  };

  const s = {
    card: {
      background: "var(--admin-sidebar-bg)",
      border: "1px solid var(--admin-border)",
      borderRadius: 16,
      padding: 24,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: 16,
    },
    panel: {
      background: "var(--admin-surface)",
      border: "1px solid var(--admin-border)",
      borderRadius: 12,
      padding: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--admin-text-strong)",
    },
    input: {
      width: "100%",
      background: "var(--admin-input-bg)",
      border: "1px solid var(--admin-border)",
      borderRadius: 10,
      color: "var(--admin-text)",
      padding: "10px 12px",
      fontSize: 13,
      outline: "none",
    },
    btn: {
      border: "1px solid var(--admin-border)",
      background: "var(--admin-surface-alt)",
      color: "var(--admin-text)",
      borderRadius: 10,
      padding: "8px 10px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
    },
    danger: {
      border: "1px solid rgba(239,68,68,0.35)",
      background: "transparent",
      color: "#ef4444",
      borderRadius: 10,
      padding: "8px 10px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
    },
    primary: {
      border: "none",
      background: "linear-gradient(135deg, #002b5b, #004080)",
      color: "#fff",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--admin-text-strong)" }}>Event Master</div>
            <div style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 6 }}>
              Manage dropdown values used while creating and editing events.
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>{totalItems} values</div>
        </div>

        <div style={s.grid}>
          {EVENT_MASTER_FIELDS.map((field) => (
            <div key={field.key} style={s.panel}>
              <div style={{ ...s.label, marginBottom: 12 }}>{field.label}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  style={s.input}
                  value={newValues[field.key] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setNewValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addValue(field.key); }}
                />
                <button type="button" style={{ ...s.primary, opacity: saving ? 0.65 : 1 }} onClick={() => addValue(field.key)} disabled={saving}>
                  Add
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(masters[field.key] || []).map((value) => {
                  const isEditing = editing?.fieldKey === field.key && editing?.value === value;
                  return (
                    <div key={value} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 10, padding: 10 }}>
                      {isEditing ? (
                        <>
                          <input
                            style={s.input}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") updateValue(); }}
                          />
                          <button type="button" style={s.btn} onClick={updateValue} disabled={saving}>Save</button>
                          <button type="button" style={s.danger} onClick={() => { setEditing(null); setDraft(""); }} disabled={saving}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, color: "var(--admin-text)", fontSize: 13, fontWeight: 700 }}>{value}</span>
                          <button type="button" style={s.btn} onClick={() => { setEditing({ fieldKey: field.key, value }); setDraft(value); }} disabled={saving}>Edit</button>
                          <button type="button" style={s.danger} onClick={() => setDeleteTarget({ fieldKey: field.key, value })} disabled={saving || (masters[field.key] || []).length <= 1}>Delete</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteTarget && (
        <div onClick={() => !saving && setDeleteTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 100%)", background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 18, boxShadow: "0 24px 80px rgba(0,0,0,0.45)", padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--admin-text-strong)" }}>Delete Master Value?</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--admin-muted)" }}>
              Delete {deleteTarget.value} from this event master?
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button type="button" style={s.btn} onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</button>
              <button type="button" style={{ ...s.primary, minWidth: 130, opacity: saving ? 0.7 : 1 }} onClick={deleteValue} disabled={saving}>
                {saving ? "Please wait..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventMasterManager;
