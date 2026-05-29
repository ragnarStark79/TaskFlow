import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Palette, Camera, Save, Eye, EyeOff, Check, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { settingsApi } from '../services/settingsApi';
import toast from 'react-hot-toast';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Styles — Theme-Aware via CSS Variables
───────────────────────────────────────────── */
const S = {
    page: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '0 0 80px',
    },
    grid: {
        position: 'fixed', inset: 0,
        backgroundImage: `
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
    `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        zIndex: 0,
    },
    orb1: {
        position: 'fixed', top: '-10%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--orb-blue) 0%, transparent 70%)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
    },
    orb2: {
        position: 'fixed', bottom: '-15%', right: '-8%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--orb-purple) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
    },
    inner: {
        position: 'relative', zIndex: 1,
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 32px 0',
    },
    header: {
        paddingBottom: 32,
        borderBottom: '1px solid var(--border-primary)',
        marginBottom: 40,
    },
    eyebrow: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 12px',
        borderRadius: 99,
        background: 'var(--bg-badge)',
        border: '1px solid var(--border-accent)',
        marginBottom: 14,
    },
    eyebrowDot: {
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--text-accent)',
        boxShadow: '0 0 7px var(--text-accent)',
    },
    eyebrowText: {
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        color: 'var(--text-accent)', textTransform: 'uppercase',
    },
    h1: {
        fontSize: 36, fontWeight: 700, lineHeight: 1.1,
        color: 'var(--text-primary)', margin: 0,
        fontFamily: "'Syne', sans-serif",
    },
    subtext: {
        fontSize: 14, color: 'var(--text-secondary)',
        marginTop: 8,
    },
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 22,
        padding: '28px 28px 24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    cardTitle: {
        fontSize: 16, fontWeight: 700,
        color: 'var(--text-primary)',
        fontFamily: "'Syne', sans-serif",
        marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 10,
    },
    cardDesc: {
        fontSize: 13, color: 'var(--text-secondary)',
        marginBottom: 24,
    },
    label: {
        display: 'block', fontSize: 12,
        fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: 8,
    },
    inputWrap: {
        marginBottom: 18,
    },
    input: {
        width: '100%', boxSizing: 'border-box',
        padding: '12px 16px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 14,
        color: 'var(--text-primary)',
        fontSize: 14, fontWeight: 500,
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
        fontFamily: 'inherit',
    },
    btn: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 22px',
        borderRadius: 14, border: 'none',
        background: 'var(--gradient-brand)',
        color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-btn)',
        fontFamily: 'inherit',
        transition: 'transform 0.15s, box-shadow 0.2s',
    },
    btnSecondary: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 22px',
        borderRadius: 14,
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-input)',
        color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s, border-color 0.15s',
    },
    avatarPreview: {
        width: 80, height: 80, borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 700, color: '#fff',
        fontFamily: "'Syne', sans-serif",
        flexShrink: 0,
        overflow: 'hidden',
        objectFit: 'cover',
    },
    themeCard: {
        display: 'flex', gap: 16,
        padding: 16,
        borderRadius: 16,
        border: '2px solid transparent',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
        flex: 1,
    },
    themePreview: {
        width: 64, height: 48, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
};

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    
    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [profileLoading, setProfileLoading] = useState(false);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [passLoading, setPassLoading] = useState(false);

    // Refs
    const pageRef = useRef(null);
    const orb1Ref = useRef(null);
    const orb2Ref = useRef(null);
    const cardsRef = useRef([]);

    // Sync if user changes
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatar(user.avatar || '');
        }
    }, [user]);

    // GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Orb float
            gsap.to(orb1Ref.current, {
                x: 30, y: 20, duration: 9,
                repeat: -1, yoyo: true, ease: 'sine.inOut',
            });
            gsap.to(orb2Ref.current, {
                x: -25, y: -30, duration: 11,
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2,
            });

            // Cards stagger in
            gsap.fromTo(
                cardsRef.current.filter(Boolean),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
            );
        }, pageRef);

        return () => ctx.revert();
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'TF';

    // Handlers
    const handleProfileSave = async () => {
        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        setProfileLoading(true);
        try {
            const { data } = await settingsApi.updateProfile({ name: name.trim(), avatar });
            toast.success(data.message || 'Profile updated!');
            // Force a re-check of auth to sync navbar
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setPassLoading(true);
        try {
            const { data } = await settingsApi.changePassword({ currentPassword, newPassword });
            toast.success(data.message || 'Password changed!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPassLoading(false);
        }
    };

    const handleThemeSwitch = (newTheme) => {
        setTheme(newTheme);
    };

    const inputFocus = (e) => {
        e.target.style.borderColor = 'var(--border-input-focus)';
        e.target.style.boxShadow = '0 0 0 3px rgba(56,182,255,0.10)';
        e.target.style.background = 'var(--bg-input-hover)';
    };
    const inputBlur = (e) => {
        e.target.style.borderColor = 'var(--border-primary)';
        e.target.style.boxShadow = 'none';
        e.target.style.background = 'var(--bg-input)';
    };

    return (
        <div ref={pageRef} style={S.page}>
            {/* Ambient */}
            <div ref={orb1Ref} style={S.orb1} />
            <div ref={orb2Ref} style={S.orb2} />
            <div style={S.grid} />

            <div style={S.inner}>
                {/* Header */}
                <header style={S.header}>
                    <div style={S.eyebrow}>
                        <div style={S.eyebrowDot} />
                        <span style={S.eyebrowText}>Account</span>
                    </div>
                    <h1 style={S.h1}>Settings</h1>
                    <p style={S.subtext}>Manage your profile, security, and preferences.</p>
                </header>

                {/* ─── Profile Card ─── */}
                <div ref={el => cardsRef.current[0] = el} style={{ ...S.card, opacity: 0 }}>
                    <div style={{ ...S.cardTitle }}><User size={18} /> Profile Information</div>
                    <p style={S.cardDesc}>Update your display name and profile picture.</p>

                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
                        {/* Avatar Preview */}
                        <div style={{
                            ...S.avatarPreview,
                            background: avatar ? 'transparent' : 'var(--gradient-brand)',
                            border: '2px solid var(--border-primary)',
                        }}>
                            {avatar ? (
                                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }} />
                            ) : (
                                initials
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={S.inputWrap}>
                                <label style={S.label}>Avatar URL</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="url"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        onFocus={inputFocus}
                                        onBlur={inputBlur}
                                        style={{ ...S.input, paddingLeft: 40 }}
                                        placeholder="https://example.com/your-photo.jpg"
                                    />
                                    <Camera size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                            style={S.input}
                            placeholder="Your display name"
                        />
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Email</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            style={{ ...S.input, opacity: 0.6, cursor: 'not-allowed' }}
                            disabled
                        />
                    </div>

                    <button
                        style={{ ...S.btn, opacity: profileLoading ? 0.6 : 1 }}
                        disabled={profileLoading}
                        onClick={handleProfileSave}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Save size={15} />
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* ─── Security Card ─── */}
                <div ref={el => cardsRef.current[1] = el} style={{ ...S.card, opacity: 0 }}>
                    <div style={S.cardTitle}><Lock size={18} /> Security</div>
                    <p style={S.cardDesc}>Change your password to keep your account secure.</p>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showCurrentPass ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onFocus={inputFocus}
                                onBlur={inputBlur}
                                style={{ ...S.input, paddingRight: 42 }}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPass(p => !p)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}
                            >
                                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNewPass ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onFocus={inputFocus}
                                onBlur={inputBlur}
                                style={{ ...S.input, paddingRight: 42 }}
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPass(p => !p)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}
                            >
                                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={S.inputWrap}>
                        <label style={S.label}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                            style={S.input}
                            placeholder="Re-enter new password"
                        />
                        {confirmPassword && newPassword && confirmPassword !== newPassword && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-danger)' }}>
                                <AlertCircle size={13} /> Passwords do not match
                            </div>
                        )}
                        {confirmPassword && newPassword && confirmPassword === newPassword && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#10B981' }}>
                                <Check size={13} /> Passwords match
                            </div>
                        )}
                    </div>

                    <button
                        style={{ ...S.btn, opacity: passLoading ? 0.6 : 1 }}
                        disabled={passLoading}
                        onClick={handlePasswordChange}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Lock size={15} />
                        {passLoading ? 'Updating...' : 'Change Password'}
                    </button>
                </div>

                {/* ─── Appearance Card ─── */}
                <div ref={el => cardsRef.current[2] = el} style={{ ...S.card, opacity: 0 }}>
                    <div style={S.cardTitle}><Palette size={18} /> Appearance</div>
                    <p style={S.cardDesc}>Choose your preferred theme. Changes take effect immediately.</p>

                    <div style={{ display: 'flex', gap: 16 }}>
                        {/* Dark Theme Option */}
                        <div
                            onClick={() => handleThemeSwitch('dark')}
                            style={{
                                ...S.themeCard,
                                background: theme === 'dark' ? 'var(--bg-input-hover)' : 'var(--bg-input)',
                                borderColor: theme === 'dark' ? 'var(--text-accent)' : 'var(--border-primary)',
                            }}
                            onMouseEnter={e => { if (theme !== 'dark') e.currentTarget.style.background = 'var(--bg-input-hover)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { if (theme !== 'dark') e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <div style={{
                                ...S.themePreview,
                                background: '#0A0D14',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                <Moon size={20} color="#F0F4FF" />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Dark</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Rich, immersive dark UI</div>
                                {theme === 'dark' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-accent)' }}>
                                        <Check size={12} /> Active
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Light Theme Option */}
                        <div
                            onClick={() => handleThemeSwitch('light')}
                            style={{
                                ...S.themeCard,
                                background: theme === 'light' ? 'var(--bg-input-hover)' : 'var(--bg-input)',
                                borderColor: theme === 'light' ? 'var(--text-accent)' : 'var(--border-primary)',
                            }}
                            onMouseEnter={e => { if (theme !== 'light') e.currentTarget.style.background = 'var(--bg-input-hover)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { if (theme !== 'light') e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <div style={{
                                ...S.themePreview,
                                background: '#FAFBFC',
                                border: '1px solid rgba(0,0,0,0.08)',
                            }}>
                                <Sun size={20} color="#1A1A2E" />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Light</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Clean, minimal design</div>
                                {theme === 'light' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-accent)' }}>
                                        <Check size={12} /> Active
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
