import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Styles — mirrors Login's design system
───────────────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.3s ease',
  },
  orb1: {
    position: 'absolute', top: '-8%', right: '-6%',
    width: 520, height: 520,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-green) 0%, transparent 70%)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-12%', left: '-6%',
    width: 580, height: 580,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-blue) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '35%', right: '55%',
    width: 280, height: 280,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-purple) 0%, transparent 70%)',
    filter: 'blur(55px)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 10,
    width: '100%', maxWidth: 420,
    padding: '44px 40px',
    borderRadius: 28,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-elevated)',
    opacity: 0,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '5px 13px',
    borderRadius: 99,
    background: 'rgba(0,210,150,0.09)',
    border: '1px solid rgba(0,210,150,0.22)',
    marginBottom: 22,
    opacity: 0,
  },
  badgeDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#00D296',
    boxShadow: '0 0 8px rgba(0,210,150,0.8)',
  },
  badgeText: {
    fontSize: 11, fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#00D296',
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 32, fontWeight: 700,
    lineHeight: 1.15,
    color: 'var(--text-primary)',
    marginBottom: 8,
    opacity: 0,
    fontFamily: "'Syne', sans-serif",
  },
  sub: {
    fontSize: 14, color: 'var(--text-secondary)',
    marginBottom: 36,
    opacity: 0,
  },
  divider: {
    height: 1,
    background: 'var(--gradient-accent-bar)',
    margin: '4px 0 28px',
    opacity: 0,
  },
  fieldWrap: { marginBottom: 18, opacity: 0 },
  label: {
    display: 'block', fontSize: 12,
    fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: 8,
  },
  inputWrap: { position: 'relative' },
  iconWrap: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none',
    display: 'flex',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px 13px 42px',
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
    width: '100%', padding: '14px 24px',
    borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #00B37E 0%, #1B6FE8 100%)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    letterSpacing: '0.02em',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer',
    boxShadow: '0 8px 28px rgba(0,179,126,0.30)',
    transition: 'opacity 0.2s',
    opacity: 0,
    marginTop: 10,
    fontFamily: 'inherit',
  },
  btnDisabled: {
    opacity: 0.6, cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center', marginTop: 26,
    fontSize: 13, color: 'var(--text-secondary)',
    opacity: 0,
  },
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const Register = () => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  /* refs */
  const pageRef      = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);
  const orb3Ref      = useRef(null);
  const cardRef      = useRef(null);
  const badgeRef     = useRef(null);
  const h1Ref        = useRef(null);
  const subRef       = useRef(null);
  const divRef       = useRef(null);
  const field1Ref    = useRef(null);
  const field2Ref    = useRef(null);
  const field3Ref    = useRef(null);
  const btnRef       = useRef(null);
  const footerRef    = useRef(null);
  const nameInputRef  = useRef(null);
  const emailInputRef = useRef(null);
  const passInputRef  = useRef(null);

  /* ── Master GSAP timeline ── */
  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);

    const ctx = gsap.context(() => {

      /* Orb ambient float */
      gsap.to(orb1Ref.current, {
        x: -28, y: 22, duration: 9,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to(orb2Ref.current, {
        x: 22, y: -26, duration: 11,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5,
      });
      gsap.to(orb3Ref.current, {
        x: -18, y: 20, duration: 7.5,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3,
      });

      /* Entry timeline */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl
        .fromTo(cardRef.current,
          { opacity: 0, y: 52 },
          { opacity: 1, y: 0, duration: 0.75 })

        .fromTo(badgeRef.current,
          { opacity: 0, y: -10, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4 }, '-=0.3')

        .fromTo(h1Ref.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4 }, '-=0.1')

        .fromTo(subRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35 }, '-=0.15')

        .fromTo(divRef.current,
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, '-=0.1')

        /* Three fields stagger */
        .fromTo(field1Ref.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.38 }, '-=0.05')

        .fromTo(field2Ref.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.38 }, '-=0.18')

        .fromTo(field3Ref.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.38 }, '-=0.18')

        .fromTo(btnRef.current,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.05')

        .fromTo(footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }, '-=0.15');

    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ── Focus glow ── */
  const handleFocus = (ref) => {
    gsap.to(ref.current, {
      borderColor: 'rgba(0,210,150,0.45)',
      boxShadow: '0 0 0 3px rgba(0,210,150,0.11)',
      background: 'rgba(255,255,255,0.065)',
      duration: 0.25,
    });
  };
  const handleBlur = (ref) => {
    gsap.to(ref.current, {
      borderColor: 'rgba(255,255,255,0.08)',
      boxShadow: 'none',
      background: 'rgba(255,255,255,0.04)',
      duration: 0.25,
    });
  };

  /* ── Button micro-interactions ── */
  const onBtnEnter = () => {
    if (isSubmitting) return;
    gsap.to(btnRef.current, {
      scale: 1.025,
      boxShadow: '0 12px 36px rgba(0,179,126,0.45)',
      duration: 0.2,
    });
  };
  const onBtnLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      boxShadow: '0 8px 28px rgba(0,179,126,0.30)',
      duration: 0.2,
    });
  };
  const onBtnDown = () => gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });
  const onBtnUp   = () => gsap.to(btnRef.current, { scale: 1.025, duration: 0.1 });

  /* ── Submit (logic unchanged) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    gsap.to(cardRef.current, {
      boxShadow: '0 32px 80px rgba(0,179,126,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
      duration: 0.4,
    });

    const success = await register(name, email, password);
    setIsSubmitting(false);

    if (success) {
      gsap.to(cardRef.current, {
        opacity: 0, y: -24, scale: 0.97,
        duration: 0.35, ease: 'power2.in',
        onComplete: () => navigate('/dashboard'),
      });
    } else {
      /* shake on failure */
      gsap.fromTo(cardRef.current,
        { x: -10 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      gsap.to(cardRef.current, {
        boxShadow: '0 32px 80px rgba(220,40,40,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
        duration: 0.3, yoyo: true, repeat: 1,
      });
    }
  };

  return (
    <div ref={pageRef} style={S.page}>
      {/* Orbs */}
      <div ref={orb1Ref} style={S.orb1} />
      <div ref={orb2Ref} style={S.orb2} />
      <div ref={orb3Ref} style={S.orb3} />

      {/* Grid */}
      <div style={S.grid} />

      {/* Card */}
      <div ref={cardRef} style={S.card}>

        {/* Badge */}
        <div ref={badgeRef} style={S.badge}>
          <div style={S.badgeDot} />
          <span style={S.badgeText}>TaskFlow</span>
        </div>

        <h1 ref={h1Ref} style={S.h1}>Create account</h1>
        <p ref={subRef} style={S.sub}>Join your team and start managing tasks.</p>

        <div ref={divRef} style={S.divider} />

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div ref={field1Ref} style={S.fieldWrap}>
            <label style={S.label}>Full Name</label>
            <div style={S.inputWrap}>
              <div style={S.iconWrap}><User size={16} /></div>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => handleFocus(nameInputRef)}
                onBlur={() => handleBlur(nameInputRef)}
                style={S.input}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div ref={field2Ref} style={S.fieldWrap}>
            <label style={S.label}>Email</label>
            <div style={S.inputWrap}>
              <div style={S.iconWrap}><Mail size={16} /></div>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleFocus(emailInputRef)}
                onBlur={() => handleBlur(emailInputRef)}
                style={S.input}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div ref={field3Ref} style={S.fieldWrap}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <div style={S.iconWrap}><Lock size={16} /></div>
              <input
                ref={passInputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus(passInputRef)}
                onBlur={() => handleBlur(passInputRef)}
                style={S.input}
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            ref={btnRef}
            type="submit"
            disabled={isSubmitting}
            style={{ ...S.btn, ...(isSubmitting ? S.btnDisabled : {}) }}
            onMouseEnter={onBtnEnter}
            onMouseLeave={onBtnLeave}
            onMouseDown={onBtnDown}
            onMouseUp={onBtnUp}
          >
            {isSubmitting
              ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <><span>Create Account</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        {/* Footer */}
        <p ref={footerRef} style={S.footer}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#00D296', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;