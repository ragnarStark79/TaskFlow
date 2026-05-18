import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/team', label: 'Team', icon: Users },
  { path: '/approvals', label: 'Approvals', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const S = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    height: 60,
    background: 'rgba(6,8,16,0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
    fontFamily: "'DM Sans', sans-serif",
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    height: '100%',
    display: 'flex', alignItems: 'center',
    padding: '0 24px', gap: 0,
  },
  /* brand */
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', marginRight: 32, flexShrink: 0,
  },
  brandIcon: {
    width: 30, height: 30, borderRadius: 9,
    background: 'linear-gradient(135deg,#1B6FE8,#7B3FE4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800, color: '#fff',
    fontFamily: "'Syne', sans-serif",
    boxShadow: '0 4px 14px rgba(27,111,232,0.45)',
  },
  brandText: {
    fontSize: 16, fontWeight: 700, color: '#F0F4FF',
    fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em',
  },
  /* links */
  links: {
    display: 'flex', alignItems: 'center', gap: 2, flex: 1,
  },
  link: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '6px 13px', borderRadius: 10,
    fontSize: 13, fontWeight: 500,
    textDecoration: 'none',
    color: 'rgba(160,170,200,0.65)',
    transition: 'color 0.15s, background 0.15s',
    whiteSpace: 'nowrap',
  },
  linkActive: {
    color: '#F0F4FF',
    background: 'rgba(255,255,255,0.07)',
  },
  /* right side */
  right: {
    display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0,
  },
  searchBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(160,170,200,0.5)',
    fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  kbd: {
    fontSize: 10, padding: '1px 6px', borderRadius: 5,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(160,170,200,0.5)',
    fontFamily: 'monospace',
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(160,170,200,0.6)',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: '50%',
    background: '#38B6FF', boxShadow: '0 0 6px rgba(56,182,255,0.8)',
    border: '1.5px solid #060810',
  },
  /* avatar dropdown */
  avatarWrap: { position: 'relative' },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 10px 4px 4px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', color: '#F0F4FF',
  },
  avatarCircle: {
    width: 28, height: 28, borderRadius: 8,
    background: 'linear-gradient(135deg,#1B6FE8,#7B3FE4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff',
    fontFamily: "'Syne', sans-serif",
    flexShrink: 0,
  },
  avatarName: { fontSize: 13, fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    minWidth: 180,
    background: 'rgba(12,16,28,0.97)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
    padding: '6px',
    zIndex: 200,
    transformOrigin: 'top right',
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 12px', borderRadius: 9,
    fontSize: 13, fontWeight: 500,
    cursor: 'pointer', color: 'rgba(200,210,230,0.8)',
    transition: 'background 0.12s, color 0.12s',
    userSelect: 'none',
  },
  dropSep: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);

  /* entry animation */
  useEffect(() => {
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.05 }
    );
  }, []);

  /* dropdown open/close */
  useEffect(() => {
    if (!dropRef.current) return;
    if (open) {
      gsap.fromTo(dropRef.current,
        { opacity: 0, scale: 0.92, y: -6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [open]);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TF';

  return (
    <nav ref={navRef} style={S.nav}>
      <div style={S.inner}>
        {/* Brand */}
        <NavLink to="/dashboard" style={S.brand}>
          <div style={S.brandIcon}>T</div>
          <span style={S.brandText}>TaskFlow</span>
        </NavLink>

        {/* Nav links */}
        <div style={S.links}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path}
              style={({ isActive }) => ({
                ...S.link,
                ...(isActive ? S.linkActive : {}),
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={S.right}>
          {/* Search pill */}
          <button style={S.searchBtn} onClick={() => setSearchOpen(true)}>
            <Search size={13} />
            <span>Search</span>
            <span style={S.kbd}>⌘K</span>
          </button>

          {/* Bell */}
          <NotificationBell />

          {/* Avatar + dropdown */}
          <div style={S.avatarWrap}>
            <button style={S.avatarBtn} onClick={() => setOpen(p => !p)}>
              <div style={S.avatarCircle}>{initials}</div>
              <span style={S.avatarName}>{user?.name ?? 'Account'}</span>
              <ChevronDown size={13} style={{ opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {open && (
              <div ref={dropRef} style={S.dropdown}>
                <div style={{ ...S.dropItem, cursor: 'default', opacity: 0.5, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {user?.email ?? ''}
                </div>
                <div style={S.dropSep} />
                <div style={S.dropItem}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                >
                  <Settings size={14} /> Settings
                </div>
                <div style={S.dropSep} />
                <div style={{ ...S.dropItem, color: '#FF6B6B' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.08)'; e.currentTarget.style.color = '#FF6B6B'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B6B'; }}
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;