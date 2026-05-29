import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Search, ChevronDown, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const isLight = theme === 'light';

  /* Entry animation */
  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  /* Scroll-adaptive background — like Devini */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Dropdown animation */
  useEffect(() => {
    if (open && dropRef.current) {
      gsap.fromTo(dropRef.current,
        { opacity: 0, scale: 0.92, y: -6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [open]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ⌘K search shortcut */
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

  /* Dynamic nav background based on scroll + theme */
  const navBg = isLight
    ? scrolled
      ? 'rgba(255,255,255,0.92)'
      : 'rgba(255,255,255,0.80)'
    : scrolled
      ? 'rgba(8,10,20,0.88)'
      : 'rgba(8,10,20,0.70)';

  const navBorder = isLight
    ? 'rgba(0,0,0,0.08)'
    : 'rgba(255,255,255,0.08)';

  const navShadow = isLight
    ? scrolled
      ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)'
      : '0 2px 12px rgba(0,0,0,0.05)'
    : scrolled
      ? '0 8px 32px rgba(0,0,0,0.45)'
      : '0 4px 20px rgba(0,0,0,0.3)';

  return (
    <>
      {/* Fixed centered pill wrapper */}
      <div
        ref={wrapRef}
        style={{
          position: 'fixed',
          top: 14,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: '0 16px',
        }}
      >
        <nav
          ref={navRef}
          style={{
            pointerEvents: 'all',
            width: '100%',
            maxWidth: 900,
            height: 48,
            background: navBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${navBorder}`,
            borderRadius: 999,
            boxShadow: navShadow,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px 0 14px',
            gap: 0,
            transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Brand */}
          <NavLink
            to="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', marginRight: 16, flexShrink: 0,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff',
              fontFamily: "'Syne', sans-serif",
              boxShadow: '0 3px 10px rgba(27,111,232,0.35)',
              flexShrink: 0,
            }}>T</div>
            <span style={{
              fontSize: 15, fontWeight: 700,
              color: isLight ? '#1A1A2E' : '#F0F4FF',
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.02em',
            }}>TaskFlow</span>
          </NavLink>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => ({
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 11px', borderRadius: 999,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  color: isActive
                    ? (isLight ? '#1A1A2E' : '#F0F4FF')
                    : (isLight ? '#6B7280' : 'rgba(160,170,200,0.65)'),
                  background: isActive
                    ? (isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)')
                    : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                })}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 999,
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${navBorder}`,
                color: isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)',
                fontSize: 12, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Search size={12} />
              <span>Search</span>
              <span style={{
                fontSize: 10, padding: '1px 5px', borderRadius: 4,
                background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${navBorder}`,
                fontFamily: 'monospace',
                color: isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)',
              }}>⌘K</span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '3px 10px 3px 3px', borderRadius: 999,
                  background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${navBorder}`,
                  cursor: 'pointer',
                  color: isLight ? '#1A1A2E' : '#F0F4FF',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  fontFamily: "'Syne', sans-serif",
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {user?.avatar
                    ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name ?? 'Account'}
                </span>
                <ChevronDown size={12} style={{ opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {open && (
                <div
                  ref={dropRef}
                  style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    minWidth: 210,
                    background: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(12,16,28,0.97)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${navBorder}`,
                    borderRadius: 16,
                    boxShadow: isLight
                      ? '0 12px 40px rgba(0,0,0,0.10)'
                      : '0 16px 48px rgba(0,0,0,0.55)',
                    padding: '6px',
                    zIndex: 200,
                    transformOrigin: 'top right',
                  }}
                >
                  {/* Email */}
                  <div style={{
                    padding: '8px 12px', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)',
                    userSelect: 'none',
                  }}>
                    {user?.email ?? ''}
                  </div>
                  <div style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

                  {[
                    { icon: <Settings size={14} />, label: 'Settings', onClick: () => { setOpen(false); navigate('/settings'); } },
                    {
                      icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
                      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
                      onClick: () => { toggleTheme(); setOpen(false); },
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={item.onClick}
                      onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '8px 12px', borderRadius: 10,
                        fontSize: 13, fontWeight: 500,
                        cursor: 'pointer',
                        color: isLight ? '#374151' : 'rgba(200,210,230,0.85)',
                        transition: 'background 0.12s',
                      }}
                    >
                      {item.icon} {item.label}
                    </div>
                  ))}

                  <div style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
                  <div
                    onClick={handleLogout}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 12px', borderRadius: 10,
                      fontSize: 13, fontWeight: 500,
                      cursor: 'pointer',
                      color: isLight ? '#DC2626' : '#FF6B6B',
                      transition: 'background 0.12s',
                    }}
                  >
                    <LogOut size={14} /> Sign out
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;