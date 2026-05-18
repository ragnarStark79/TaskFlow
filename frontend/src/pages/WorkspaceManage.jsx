import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, UserMinus, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { workspaceApi } from "../services/workspaceApi";
import { useAuth } from "../context/AuthContext";

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
  backBtn: {
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E2E8F0",
    margin: "24px 0 12px",
  },
  memberRow: {
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
  roleSelect: {
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#E2E8F0",
    fontSize: 12,
  },
  removeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#F87171",
    fontSize: 12,
    cursor: "pointer",
  },
};

const WorkspaceManage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = async () => {
    try {
      const res = await workspaceApi.getAll();
      const found = (res?.data ?? []).find((ws) => ws._id === workspaceId);
      setWorkspace(found || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    gsap.fromTo(
      ".member-row",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power3.out" },
    );
  }, [workspace]);

  const normalizeRole = (role) => {
    if (role === "member") return "read_write";
    if (role === "guest") return "read_only";
    return role;
  };

  const canManage = useMemo(() => {
    if (!user || !workspace) return false;
    const role = workspace.members?.find((m) => m.user?._id === user._id)?.role;
    return role === "owner" || role === "admin";
  }, [user, workspace]);

  const handleRoleChange = async (memberId, role) => {
    try {
      await workspaceApi.updateMemberRole(workspaceId, memberId, role);
      toast.success("Role updated");
      await loadWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await workspaceApi.removeMember(workspaceId, memberId);
      toast.success("Member removed");
      await loadWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.grid} />
        <div style={S.inner}>
          <div style={{ color: "rgba(160,170,200,0.6)" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div style={S.page}>
        <div style={S.grid} />
        <div style={S.inner}>
          <button style={S.backBtn} onClick={() => navigate("/team")}>
            <ArrowLeft size={14} /> Back to Team
          </button>
          <div style={{ color: "rgba(160,170,200,0.6)", marginTop: 16 }}>
            Workspace not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.grid} />
      <div style={S.inner}>
        <header style={S.header}>
          <div>
            <h1 style={S.h1}>{workspace.name}</h1>
            <p style={S.sub}>Manage roles and access for this workspace.</p>
          </div>
          <button style={S.backBtn} onClick={() => navigate("/team")}>
            <ArrowLeft size={14} /> Back to Team
          </button>
        </header>

        <h2 style={S.sectionTitle}>Members</h2>
        {(workspace.members || []).map((member) => {
          const role = normalizeRole(member.role);
          const isOwner = role === "owner";
          return (
            <div key={member.user?._id} className="member-row" style={S.memberRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={14} />
                <div>
                  <div style={{ color: "#E2E8F0", fontSize: 13 }}>
                    {member.user?.name || "User"}
                  </div>
                  <div style={{ color: "rgba(160,170,200,0.6)", fontSize: 12 }}>
                    {member.user?.email || ""}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  style={S.roleSelect}
                  value={role}
                  disabled={isOwner || !canManage}
                  onChange={(e) => handleRoleChange(member.user?._id, e.target.value)}
                >
                  {isOwner && <option value="owner">Owner</option>}
                  <option value="admin">Admin</option>
                  <option value="read_write">Read / Write</option>
                  <option value="read_only">Read Only</option>
                </select>
                {!isOwner && canManage && (
                  <button style={S.removeBtn} onClick={() => handleRemoveMember(member.user?._id)}>
                    <UserMinus size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceManage;
