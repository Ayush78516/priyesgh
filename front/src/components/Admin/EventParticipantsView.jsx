import React from "react";
import { Users, X } from "lucide-react";

export function AllEventParticipants({ events, type }) {
  const isMembers = type === "events_members";
  
  // Aggregate all participants
  const rows = [];
  events.forEach(ev => {
    const payments = isMembers ? (ev.memberPayments || []) : (ev.nonMemberPayments || []);
    payments.forEach(p => {
      rows.push({
        ...p,
        eventId: ev.id,
        eventTitle: ev.title,
        eventDate: ev.startDate,
      });
    });
  });

  return (
    <div className="bg-[#0b1220] rounded-2xl border border-[#1e293b] p-6 shadow-xl w-full">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
        <Users className="text-[#00a6a6]" />
        {isMembers ? "All Member Registrations" : "All Non-Member Registrations"}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e293b] text-xs uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">{isMembers ? "Membership No." : "Email / Contact"}</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">
                  No {isMembers ? "member" : "non-member"} registrations found across any events.
                </td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-[#1e293b] hover:bg-[#111827] transition-colors">
                <td className="py-3 px-4">
                  <div className="text-sm font-bold text-white">{r.eventTitle}</div>
                  <div className="text-xs text-slate-500">{r.eventDate}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300 font-semibold">{r.memberName || r.name || "—"}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{isMembers ? r.membershipNo : (r.email || r.phone || "—")}</td>
                <td className="py-3 px-4 text-sm text-[#00a6a6] font-bold">₹{r.amount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    r.paymentStatus === "Received" || r.paymentStatus === "Success" 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}>
                    {r.paymentStatus || "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EventParticipantsModal({ event, type, onClose }) {
  if (!event) return null;
  const isMembers = type === "members";
  const rows = isMembers ? (event.memberPayments || []) : (event.nonMemberPayments || []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0b1220] rounded-2xl border border-[#1e293b] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-white">{event.title}</h2>
            <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#00a6a6] font-semibold">{isMembers ? "Member" : "Non-Member"} Participants</span>
              <span>•</span>
              <span>{rows.length} Total</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">{isMembers ? "Membership No." : "Email / Contact"}</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                    No {isMembers ? "members" : "non-members"} registered for this event yet.
                  </td>
                </tr>
              ) : rows.map((r, i) => (
                <tr key={i} className="border-b border-[#1e293b] hover:bg-[#111827] transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-300 font-semibold">{r.memberName || r.name || "—"}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{isMembers ? r.membershipNo : (r.email || r.phone || "—")}</td>
                  <td className="py-3 px-4 text-sm text-[#00a6a6] font-bold">₹{r.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      r.paymentStatus === "Received" || r.paymentStatus === "Success" 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {r.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
