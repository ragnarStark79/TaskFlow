import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Inline styles (no Tailwind needed for GSAP 
   targets — keeps classes clean & animation-safe)
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
  /* floating orbs */
  orb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: 500, height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-blue) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-15%', right: '-8%',
    width: 600, height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-purple) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '40%', left: '55%',
    width: 260, height: 260,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--orb-green) 0%, transparent 70%)',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  /* grid pattern overlay */
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  /* card */
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
    opacity: 0, /* starts hidden — GSAP reveals */
  },
  /* top badge */
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '5px 13px',
    borderRadius: 99,
    background: 'var(--bg-badge)',
    border: '1px solid var(--border-accent)',
    marginBottom: 22,
    opacity: 0,
  },
  badgeDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#38B6FF',
    boxShadow: '0 0 8px rgba(56,182,255,0.8)',
  },
  badgeText: {
    fontSize: 11, fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--text-accent)',
    textTransform: 'uppercase',
  },
  /* heading */
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
  /* divider */
  divider: {
    height: 1,
    background: 'var(--gradient-accent-bar)',
    margin: '4px 0 28px',
    opacity: 0,
  },
  /* field */
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
  /* extras row */
  extras: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28, marginTop: 6,
    opacity: 0,
  },
  rememberLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: 'var(--text-secondary)',
    cursor: 'pointer', userSelect: 'none',
  },
  checkbox: {
    width: 15, height: 15,
    accentColor: '#38B6FF',
    cursor: 'pointer',
  },
  forgotLink: {
    fontSize: 13, fontWeight: 500,
    color: 'var(--text-accent)',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  /* submit */
  btn: {
    width: '100%', padding: '14px 24px',
    borderRadius: 14, border: 'none',
    background: 'var(--gradient-brand)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    letterSpacing: '0.02em',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-btn)',
    transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
    opacity: 0,
    fontFamily: 'inherit',
  },
  btnDisabled: {
    opacity: 0.6, cursor: 'not-allowed',
  },
  /* footer */
  footer: {
    textAlign: 'center', marginTop: 26,
    fontSize: 13, color: 'var(--text-secondary)',
    opacity: 0,
  },
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login }   = useAuth();
  const navigate    = useNavigate();

  /* refs for GSAP */
  const pageRef    = useRef(null);
  const orb1Ref    = useRef(null);
  const orb2Ref    = useRef(null);
  const orb3Ref    = useRef(null);
  const cardRef    = useRef(null);
  const badgeRef   = useRef(null);
  const h1Ref      = useRef(null);
  const subRef     = useRef(null);
  const divRef     = useRef(null);
  const field1Ref  = useRef(null);
  const field2Ref  = useRef(null);
  const extrasRef  = useRef(null);
  const btnRef     = useRef(null);
  const footerRef  = useRef(null);
  const emailInputRef = useRef(null);
  const passInputRef  = useRef(null);

  /* ── Master GSAP timeline on mount ── */
  useEffect(() => {
    /* Load Google Fonts */
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);

    const ctx = gsap.context(() => {

      /* Orbs ambient float (infinite) */
      gsap.to(orb1Ref.current, {
        x: 30, y: 20, duration: 8,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to(orb2Ref.current, {
        x: -25, y: -30, duration: 10,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2,
      });
      gsap.to(orb3Ref.current, {
        x: 15, y: 25, duration: 7,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 4,
      });

      /* Entry timeline */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl
        /* card slides up from below + fades */
        .to(cardRef.current, {
          opacity: 1, y: 0,
          duration: 0.75,
          from: { y: 48 },
        })
        .fromTo(cardRef.current, { y: 48 }, { y: 0, duration: 0.75 }, '<')

        /* badge pops */
        .to(badgeRef.current, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.4,
        }, '-=0.3')
        .fromTo(badgeRef.current,
          { y: -10, scale: 0.85 },
          { y: 0, scale: 1, duration: 0.4 }, '<')

        /* heading & sub stagger */
        .to(h1Ref.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1')
        .fromTo(h1Ref.current, { y: 14 }, { y: 0, duration: 0.4 }, '<')
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.35 }, '-=0.15')
        .fromTo(subRef.current, { y: 10 }, { y: 0, duration: 0.35 }, '<')

        /* divider reveals */
        .to(divRef.current, {
          opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.inOut',
        }, '-=0.1')
        .fromTo(divRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, '<')

        /* fields stagger */
        .to(field1Ref.current, { opacity: 1, x: 0, duration: 0.38 }, '-=0.05')
        .fromTo(field1Ref.current, { x: -16 }, { x: 0, duration: 0.38 }, '<')
        .to(field2Ref.current, { opacity: 1, x: 0, duration: 0.38 }, '-=0.15')
        .fromTo(field2Ref.current, { x: -16 }, { x: 0, duration: 0.38 }, '<')

        /* extras */
        .to(extrasRef.current, { opacity: 1, duration: 0.3 }, '-=0.1')

        /* button bounces in */
        .to(btnRef.current, {
          opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)',
        }, '-=0.05')
        .fromTo(btnRef.current, { scale: 0.88 }, { scale: 1, duration: 0.45 }, '<')

        /* footer */
        .to(footerRef.current, { opacity: 1, duration: 0.3 }, '-=0.15');

    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ── Input focus glow ── */
  const handleInputFocus = (ref) => {
    gsap.to(ref.current, {
      borderColor: 'rgba(56,182,255,0.45)',
      boxShadow: '0 0 0 3px rgba(56,182,255,0.12)',
      background: 'rgba(255,255,255,0.065)',
      duration: 0.25,
    });
  };
  const handleInputBlur = (ref) => {
    gsap.to(ref.current, {
      borderColor: 'rgba(255,255,255,0.08)',
      boxShadow: 'none',
      background: 'rgba(255,255,255,0.04)',
      duration: 0.25,
    });
  };

  /* ── Button hover ── */
  const handleBtnEnter = () => {
    if (isSubmitting) return;
    gsap.to(btnRef.current, {
      scale: 1.025,
      boxShadow: '0 12px 36px rgba(27,111,232,0.50)',
      duration: 0.2,
    });
  };
  const handleBtnLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      boxShadow: '0 8px 28px rgba(27,111,232,0.35)',
      duration: 0.2,
    });
  };
  const handleBtnDown = () => {
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });
  };
  const handleBtnUp = () => {
    gsap.to(btnRef.current, { scale: 1.025, duration: 0.1 });
  };

  /* ── Submit (logic unchanged) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    /* subtle pulse on card while loading */
    gsap.to(cardRef.current, {
      boxShadow: '0 32px 80px rgba(27,111,232,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      duration: 0.4,
    });

    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      /* exit animation before navigate */
      gsap.to(cardRef.current, {
        opacity: 0, y: -24, scale: 0.97,
        duration: 0.35, ease: 'power2.in',
        onComplete: () => navigate('/dashboard'),
      });
    } else {
      /* shake on failure */
      gsap.fromTo(cardRef.current,
        { x: -10 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' },
      );
      gsap.to(cardRef.current, {
        boxShadow: '0 32px 80px rgba(220,40,40,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
        duration: 0.3, yoyo: true, repeat: 1,
      });
    }
  };

  return (
    <div ref={pageRef} style={S.page}>
      {/* Ambient orbs */}
      <div ref={orb1Ref} style={S.orb1} />
      <div ref={orb2Ref} style={S.orb2} />
      <div ref={orb3Ref} style={S.orb3} />

      {/* Grid texture */}
      <div style={S.grid} />

      {/* Card */}
      <div ref={cardRef} style={S.card}>

        {/* Badge */}
        <div ref={badgeRef} style={S.badge}>
          <div style={S.badgeDot} />
          <span style={S.badgeText}>TaskFlow</span>
        </div>

        {/* Heading */}
        <h1 ref={h1Ref} style={S.h1}>Welcome back</h1>
        <p ref={subRef} style={S.sub}>Sign in to continue to your workspace.</p>

        {/* Divider */}
        <div ref={divRef} style={S.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div ref={field1Ref} style={S.fieldWrap}>
            <label style={S.label}>Email</label>
            <div style={S.inputWrap}>
              <div style={S.iconWrap}>
                <Mail size={16} />
              </div>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleInputFocus(emailInputRef)}
                onBlur={() => handleInputBlur(emailInputRef)}
                style={S.input}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div ref={field2Ref} style={S.fieldWrap}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <div style={S.iconWrap}>
                <Lock size={16} />
              </div>
              <input
                ref={passInputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleInputFocus(passInputRef)}
                onBlur={() => handleInputBlur(passInputRef)}
                style={S.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Remember + forgot */}
          <div ref={extrasRef} style={S.extras}>
            <label style={S.rememberLabel}>
              <input
                type="checkbox"
                style={S.checkbox}
              />
              Remember me
            </label>
            <a href="#" style={S.forgotLink}>Forgot password?</a>
          </div>

          {/* Submit */}
          <button
            ref={btnRef}
            type="submit"
            disabled={isSubmitting}
            style={{ ...S.btn, ...(isSubmitting ? S.btnDisabled : {}) }}
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            {isSubmitting
              ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <><span>Sign In</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        {/* Footer */}
        <p ref={footerRef} style={S.footer}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#38B6FF', fontWeight: 600, textDecoration: 'none' }}
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Loader spin keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;