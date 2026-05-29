import React, { useEffect, useMemo, useState } from "react";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import gsap from "gsap";
import { workspaceApi } from "../services/workspaceApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const S = {
  page: { minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: "0 0 80px", transition: "background-color 0.3s ease" },
  grid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 },
  inner: { position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto", padding: "48px 32px 0" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid var(--border-primary)", marginBottom: 28 },
  h1: { fontSize: 34, fontWeight: 700, lineHeight: 1.1, color: "var(--text-primary)", margin: 0, fontFamily: "'Syne', sans-serif" },
  sub: { fontSize: 14, color: "var(--text-secondary)", marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "24px 0 12px" },
  requestRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-primary)", background: "var(--bg-card)", marginBottom: 8 },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--border-primary)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};

const Approvals = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const res = await workspaceApi.getAll(); setWorkspaces(res?.data ?? []); } catch (error) { toast.error(error.response?.data?.message || "Failed to load workspaces"); } finally { setLoading(false); } })(); }, []);

  const manageableWorkspaces = useMemo(() => {
    if (!user) return [];
    return workspaces.filter((ws) => { const role = ws.members?.find((m) => m.user?._id === user._id)?.role; return role === "owner" || role === "admin"; });
  }, [user, workspaces]);

  useEffect(() => {
    if (!user || manageableWorkspaces.length === 0) return;
    const loadRequests = async () => {
      const entries = await Promise.all(manageableWorkspaces.map(async (ws) => { try { const res = await workspaceApi.getJoinRequests(ws._id); return [ws._id, res?.data ?? []]; } catch { return [ws._id, []]; } }));
      setRequests(Object.fromEntries(entries));
    };
    loadRequests();
  }, [user, manageableWorkspaces]);

  useEffect(() => { gsap.fromTo(".approval-row", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }); }, [requests]);

  const handleApprove = async (workspaceId, requestId) => { try { await workspaceApi.approveJoinRequest(workspaceId, requestId); toast.success("Member approved"); setRequests((prev) => ({ ...prev, [workspaceId]: prev[workspaceId].filter((r) => r._id !== requestId) })); const res = await workspaceApi.getAll(); setWorkspaces(res?.data ?? []); } catch (error) { toast.error(error.response?.data?.message || "Failed to approve request"); } };
  const handleDeny = async (workspaceId, requestId) => { try { await workspaceApi.denyJoinRequest(workspaceId, requestId); toast.success("Request denied"); setRequests((prev) => ({ ...prev, [workspaceId]: prev[workspaceId].filter((r) => r._id !== requestId) })); } catch (error) { toast.error(error.response?.data?.message || "Failed to deny request"); } };

  return (
    <div style={S.page}>
      <div style={S.grid} />
      <div style={S.inner}>
        <header style={S.header}><div><h1 style={S.h1}>Approvals</h1><p style={S.sub}>Approve or deny workspace join requests.</p></div></header>
        <h2 style={S.sectionTitle}>Join requests</h2>
        {loading ? (<div style={{ color: "var(--text-muted)" }}>Loading...</div>) : Object.values(requests).every((r) => r.length === 0) ? (<div style={{ color: "var(--text-muted)" }}>No pending requests.</div>) : (
          Object.entries(requests).map(([workspaceId, items]) => items.length > 0 ? (
            <div key={workspaceId} style={{ marginBottom: 16 }}>
              {items.map((req) => (
                <div key={req._id} className="approval-row" style={S.requestRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Users size={16} /><div><div style={{ color: "var(--text-primary)", fontSize: 13 }}>{req.user?.name || "User"}</div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>{req.user?.email || ""}</div></div></div>
                  <div style={{ display: "flex", gap: 8 }}><button style={S.actionBtn} onClick={() => handleApprove(workspaceId, req._id)}><CheckCircle2 size={14} /> Approve</button><button style={S.actionBtn} onClick={() => handleDeny(workspaceId, req._id)}><XCircle size={14} /> Deny</button></div>
                </div>
              ))}
            </div>
          ) : null)
        )}
      </div>
    </div>
  );
};

export default Approvals;
