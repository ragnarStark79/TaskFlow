import React, { useEffect, useMemo, useState } from "react";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { workspaceApi } from "../services/workspaceApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const S = {
  page: {
    minHeight: "100vh",
    background: "#060810",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "0 0 80px",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1120,
    margin: "0 auto",
    padding: "48px 32px 0",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    paddingBottom: 28,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 28,
  },
  h1: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#F0F4FF",
    margin: 0,
    fontFamily: "'Syne', sans-serif",
  },
  sub: {
    fontSize: 14,
    color: "rgba(160,170,200,0.65)",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E2E8F0",
    margin: "24px 0 12px",
  },
  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  },
  chip: {
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(200,210,230,0.75)",
  },
  requestRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    marginBottom: 8,
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  manageCard: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    cursor: "pointer",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
};

const Team = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await workspaceApi.getAll();
        setWorkspaces(res?.data ?? []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load team workspaces");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || workspaces.length === 0) return;
    const loadRequests = async () => {
      const entries = await Promise.all(
        workspaces.map(async (ws) => {
          const role = ws.members?.find((m) => m.user?._id === user._id)?.role;
          if (role !== "owner" && role !== "admin") return [ws._id, []];
          try {
            const res = await workspaceApi.getJoinRequests(ws._id);
            return [ws._id, res?.data ?? []];
          } catch {
            return [ws._id, []];
          }
        }),
      );
      setRequests(Object.fromEntries(entries));
    };

    loadRequests();
  }, [user, workspaces]);

  const teamWorkspaces = useMemo(
    () => workspaces.filter((ws) => (ws.members?.length ?? 0) > 1),
    [workspaces],
  );

  const manageableWorkspaces = useMemo(() => {
    if (!user) return [];
    return workspaces.filter((ws) => {
      const role = ws.members?.find((m) => m.user?._id === user._id)?.role;
      return role === "owner" || role === "admin";
    });
  }, [user, workspaces]);

  useEffect(() => {
    gsap.fromTo(
      ".team-card",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" },
    );
  }, [teamWorkspaces.length]);

  const handleApprove = async (workspaceId, requestId) => {
    try {
      await workspaceApi.approveJoinRequest(workspaceId, requestId);
      toast.success("Member approved");
      setRequests((prev) => ({
        ...prev,
        [workspaceId]: prev[workspaceId].filter((r) => r._id !== requestId),
      }));
      const res = await workspaceApi.getAll();
      setWorkspaces(res?.data ?? []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleDeny = async (workspaceId, requestId) => {
    try {
      await workspaceApi.denyJoinRequest(workspaceId, requestId);
      toast.success("Request denied");
      setRequests((prev) => ({
        ...prev,
        [workspaceId]: prev[workspaceId].filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deny request");
    }
  };


  return (
    <div style={S.page}>
      <div style={S.grid} />
      <div style={S.inner}>
        <header style={S.header}>
          <div>
            <h1 style={S.h1}>Team Workspaces</h1>
            <p style={S.sub}>Workspaces with shared members and join requests.</p>
          </div>
        </header>

        <h2 style={S.sectionTitle}>Your team workspaces</h2>
        {loading ? (
          <div style={{ color: "rgba(160,170,200,0.6)" }}>Loading...</div>
        ) : teamWorkspaces.length === 0 ? (
          <div style={{ color: "rgba(160,170,200,0.6)" }}>
            No team workspaces yet. Invite someone or approve a request to see them here.
          </div>
        ) : (
          <div style={S.gridCards}>
            {teamWorkspaces.map((ws) => (
              <div key={ws._id} className="team-card" style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, color: "#F0F4FF", fontSize: 16 }}>{ws.name}</h3>
                  <span style={S.chip}>{ws.members?.length ?? 0} members</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(160,170,200,0.6)" }}>
                  Workspace ID: {ws._id}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={S.sectionTitle}>Join requests</h2>
        {Object.values(requests).every((r) => r.length === 0) ? (
          <div style={{ color: "rgba(160,170,200,0.6)" }}>No pending requests.</div>
        ) : (
          Object.entries(requests).map(([workspaceId, items]) => (
            items.length > 0 && (
              <div key={workspaceId} style={{ marginBottom: 16 }}>
                {items.map((req) => (
                  <div key={req._id} style={S.requestRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Users size={16} />
                      <div>
                        <div style={{ color: "#E2E8F0", fontSize: 13 }}>
                          {req.user?.name || "User"}
                        </div>
                        <div style={{ color: "rgba(160,170,200,0.6)", fontSize: 12 }}>
                          {req.user?.email || ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.actionBtn} onClick={() => handleApprove(workspaceId, req._id)}>
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button style={S.actionBtn} onClick={() => handleDeny(workspaceId, req._id)}>
                        <XCircle size={14} /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ))
        )}

        <h2 style={S.sectionTitle}>Workspace management</h2>
        {manageableWorkspaces.length === 0 ? (
          <div style={{ color: "rgba(160,170,200,0.6)" }}>
            You do not manage any workspaces yet.
          </div>
        ) : (
          <div style={S.gridCards}>
            {manageableWorkspaces.map((ws) => (
              <div
                key={ws._id}
                style={S.manageCard}
                onClick={() => navigate(`/team/workspaces/${ws._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 700 }}>{ws.name}</div>
                    <div style={{ color: "rgba(160,170,200,0.6)", fontSize: 12 }}>
                      Manage member access
                    </div>
                  </div>
                  <span style={S.chip}>{ws.members?.length ?? 0} members</span>
                </div>
                <div style={{ color: "rgba(160,170,200,0.6)", fontSize: 12 }}>
                  Click to manage roles and removals
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
