import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../utils/adminFetch";
import {
  DEFAULT_MEMBERSHIP_FEES,
  MEMBERSHIP_FEES_CMS_KEY,
  createBlankMembershipFee,
  parseMembershipFees,
  serializeMembershipFees,
} from "../../data/membershipFees";

const BILLING_TYPES = ["Yearly", "One Time"];

function MembershipFeeManager({ token, cms, showToast, onUpdate }) {
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(false);
  const [gstRate, setGstRate] = useState(null);
  const [gstTaxes, setGstTaxes] = useState([]);

  useEffect(() => {
    const cmsMap = {};
    (cms || []).forEach((item) => {
      if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
    });

    const parsed = parseMembershipFees(cmsMap[MEMBERSHIP_FEES_CMS_KEY]);
    setRows(parsed.length > 0 ? parsed : DEFAULT_MEMBERSHIP_FEES);
  }, [cms]);

  useEffect(() => {
    let alive = true;
    const loadGstRate = async () => {
      try {
        const res = await adminFetch("/api/gst/tax");
        const data = await res.json();
        if (!alive || !data.success) return;
        const taxes = data.data || [];
        setGstTaxes(taxes);
        const active = taxes.find((item) => item.isActive !== false) || taxes[0];
        const rate = Number(active?.gstPercentage);
        setGstRate(Number.isFinite(rate) ? rate : null);
      } catch {
        if (alive) setGstRate(null);
      }
    };
    loadGstRate();
    return () => {
      alive = false;
    };
  }, [token]);

  const totals = useMemo(() => {
    const active = (rows || []).filter((row) => row.active !== false).length;
    return { total: rows?.length || 0, active };
  }, [rows]);

  const updateRow = (rowId, key, value) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createBlankMembershipFee(prev.length)]);
  };

  const moveRow = (index, direction) => {
    setRows((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeRow = (rowId) => {
    if (!window.confirm("Remove this fee row?")) return;
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset to default fee rows? This will replace your current edits.")) return;
    setRows(DEFAULT_MEMBERSHIP_FEES.map((row, index) => ({ ...row, id: row.id || `fee_${index}` })));
  };

  const save = async () => {
    if (!rows) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: MEMBERSHIP_FEES_CMS_KEY,
          value: JSON.stringify(serializeMembershipFees(rows)),
          type: "text",
        }),
      });

      if (res.ok) {
        showToast("Membership fees updated. Changes are live.");
        if (onUpdate) onUpdate();
      } else {
        showToast("Failed to save membership fees", "error");
      }
    } catch {
      showToast("Failed to save membership fees", "error");
    }
    setSaving(false);
  };

  if (rows === null) {
    return <div style={{ color: "#64748b", padding: 20 }}>Loading membership fees...</div>;
  }

  const s = {
    card: {
      background: "#0d1424",
      border: "1px solid #1e293b",
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    th: {
      textAlign: "left",
      padding: "12px 10px",
      fontSize: 12,
      color: "#94a3b8",
      borderBottom: "1px solid #1f2937",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #111827",
      verticalAlign: "top",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      background: "#111827",
      color: "#e2e8f0",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 13,
      outline: "none",
    },
    select: {
      width: "100%",
      boxSizing: "border-box",
      background: "#111827",
      color: "#e2e8f0",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 13,
      outline: "none",
    },
    actionBtn: {
      border: "1px solid #334155",
      background: "#111827",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "8px 10px",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 700,
    },
    primary: {
      background: "#00a6a6",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>Membership Fees</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              Manage the annual fee table used by the payment system. Non-Member is included by default and can be edited here.
            </div>
            <div style={{ fontSize: 12, color: "#7dd3fc", marginTop: 8 }}>
              GST rate is pulled from GST Master {gstRate !== null ? `(active rate: ${gstRate}%)` : "(no active GST rate found, fallback 18% applies)"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {totals.active} active of {totals.total}
            </div>
            <button style={s.actionBtn} onClick={resetDefaults} disabled={saving}>
              Reset Defaults
            </button>
            <button style={s.primary} onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Fees"}
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Sno</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Yearly Fees</th>
                <th style={s.th}>Billing Type</th>
                <th style={s.th}>GST Rate</th>
                <th style={s.th}>Active</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index}>
                  <td style={s.td}>
                    <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>{index + 1}</div>
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.input}
                      value={row.category || ""}
                      onChange={(e) => updateRow(row.id, "category", e.target.value)}
                      placeholder="Student Member"
                    />
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.input}
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount || ""}
                      onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                      placeholder="1000"
                    />
                  </td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={row.billingType || "Yearly"}
                      onChange={(e) => updateRow(row.id, "billingType", e.target.value)}
                    >
                      {BILLING_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                  <td style={s.td}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#e2e8f0", fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={row.plusGst !== false}
                        onChange={(e) => updateRow(row.id, "plusGst", e.target.checked)}
                      />
                      GST on
                    </label>
                    <div style={{ marginTop: 8 }}>
                      <select
                        style={s.select}
                        value={row.gstTaxId || ""}
                        onChange={(e) => updateRow(row.id, "gstTaxId", e.target.value)}
                        disabled={row.plusGst === false}
                      >
                        <option value="">Use active GST rate {gstRate !== null ? `(${gstRate}%)` : ""}</option>
                        {gstTaxes
                          .filter((tax) => tax.isActive !== false)
                          .map((tax) => (
                            <option key={tax._id} value={tax._id}>
                              {tax.name} ({tax.gstPercentage}%)
                            </option>
                          ))}
                      </select>
                    </div>
                  </td>
                  <td style={s.td}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#e2e8f0", fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={row.active !== false}
                        onChange={(e) => updateRow(row.id, "active", e.target.checked)}
                      />
                      Active
                    </label>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button style={s.actionBtn} onClick={() => moveRow(index, -1)} disabled={index === 0 || saving}>↑</button>
                      <button style={s.actionBtn} onClick={() => moveRow(index, 1)} disabled={index === rows.length - 1 || saving}>↓</button>
                      <button style={{ ...s.actionBtn, color: "#fca5a5" }} onClick={() => removeRow(row.id)} disabled={saving}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Keep the first row as the one-time enrollment fee. Add or edit category rows for the member classes you use.
          </div>
          <button style={s.actionBtn} onClick={addRow} disabled={saving}>
            + Add Fee Row
          </button>
        </div>
      </div>
    </div>
  );
}

export default MembershipFeeManager;
