import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SKYAFRIKA — Premium Flight Aggregator
   Palette: Obsidian #07111C · Gold #E8A900 · Cream #F5EDD6 · Slate #8FA3B8
   Fonts: loaded via @import in <style> tag
   Signature: animated SVG route arc on every card
═══════════════════════════════════════════════════════════════════════ */

const T = {
  // backgrounds
  ink:    "#07111C",
  navy:   "#0C1A28",
  card:   "#112031",
  raised: "#172A3E",
  hover:  "#1E3349",
  // borders
  dim:    "#1C3148",
  mid:    "#264460",
  // brand
  gold:   "#E8A900",
  goldLt: "#F5C842",
  goldDk: "#B8840A",
  goldBg: "rgba(232,169,0,0.10)",
  goldRing:"rgba(232,169,0,0.25)",
  // semantic
  green:  "#22C897",
  greenBg:"rgba(34,200,151,0.10)",
  red:    "#F06464",
  redBg:  "rgba(240,100,100,0.10)",
  blue:   "#4FA8F0",
  blueBg: "rgba(79,168,240,0.10)",
  // corridor accents
  egy:    "#E879C8",
  mar:    "#9B7AF5",
  dza:    "#38C4E8",
  // text
  hi:     "#ECF4FF",
  md:     "#9AB5CC",
  lo:     "#4E6E88",
  ghost:  "#2A4860",
};

// ─── FONTS (injected once) ────────────────────────────────────────────
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.ink}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.ink}; }
  ::-webkit-scrollbar-thumb { background: ${T.mid}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.gold}; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.3) sepia(1) saturate(2) hue-rotate(5deg); }
  ::placeholder { color: ${T.ghost} !important; }
  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
  @keyframes arcDraw { from { stroke-dashoffset: 200 } to { stroke-dashoffset: 0 } }
  @keyframes spin { to { transform: rotate(360deg) } }

  /* ── MOBILE RESPONSIVENESS ── */
  html, body { overflow-x: hidden; max-width: 100%; }

  @media (max-width: 860px) {
    .nav-corridors { display: none !important; }
    .logo-sub { display: none !important; }
    .nav-bar { padding: 0 14px !important; gap: 8px !important; }
    .nav-links { overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
    .nav-links::-webkit-scrollbar { display: none; }
    .nav-links button { padding: 6px 9px !important; font-size: 12px !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px 16px !important; }
    .footer-brand { grid-column: 1 / -1; }
    .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
  }

  @media (max-width: 540px) {
    .nav-links button { padding: 6px 7px !important; font-size: 11px !important; }
    .currency-label { display: none !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .scanner-toggles { gap: 4px !important; }
    .scanner-toggles button { padding: 5px 9px !important; font-size: 9px !important; }
    .flight-card-grid { grid-template-columns: 1fr !important; gap: 14px; padding: 16px !important; }
    .flight-card-grid > div:nth-child(2) { padding: 0 !important; text-align: left !important; }
    .flight-card-grid > div:nth-child(3) a { width: 100%; }
    .deal-card-grid { grid-template-columns: 48px 1fr !important; }
    .deal-card-grid > div:nth-child(3),
    .deal-card-grid > div:nth-child(4) {
      grid-column: 2; border-left: none !important; border-top: 1px solid #1C3148; text-align: left !important;
      flex-direction: row !important; justify-content: space-between !important; align-items: center !important;
    }
  }
`;

const sg  = "'Space Grotesk', system-ui, sans-serif";
const mono = "'Space Mono', 'Courier New', monospace";

// ─── DATA ─────────────────────────────────────────────────────────────
const CURR = {
  USD:{s:"$",   n:"US Dollar",          f:"🇺🇸", r:1},
  GBP:{s:"£",   n:"British Pound",      f:"🇬🇧", r:0.79},
  EUR:{s:"€",   n:"Euro",               f:"🇪🇺", r:0.92},
  ZAR:{s:"R",   n:"South African Rand", f:"🇿🇦", r:18.6},
  ZWL:{s:"Z$",  n:"Zimbabwe Dollar",    f:"🇿🇼", r:13.5},
  NGN:{s:"₦",   n:"Nigerian Naira",     f:"🇳🇬", r:1580},
  AED:{s:"AED", n:"UAE Dirham",         f:"🇦🇪", r:3.67},
  KES:{s:"KSh", n:"Kenyan Shilling",    f:"🇰🇪", r:129},
  AUD:{s:"A$",  n:"Australian Dollar",  f:"🇦🇺", r:1.53},
  CAD:{s:"C$",  n:"Canadian Dollar",    f:"🇨🇦", r:1.36},
  EGP:{s:"E£",  n:"Egyptian Pound",     f:"🇪🇬", r:48.5},
  MAD:{s:"MAD", n:"Moroccan Dirham",    f:"🇲🇦", r:9.95},
  DZD:{s:"DA",  n:"Algerian Dinar",     f:"🇩🇿", r:134},
};
const CCM = {
  GB:"GBP", US:"USD", ZA:"ZAR", ZW:"ZWL", NG:"NGN",
  AE:"AED", KE:"KES", AU:"AUD", CA:"CAD",
  EG:"EGP", MA:"MAD", DZ:"DZD",
  DE:"EUR", FR:"EUR", NL:"EUR", IT:"EUR", IE:"EUR",
  BE:"EUR", ES:"EUR", PT:"EUR", AT:"EUR", CH:"EUR",
  NA:"ZAR", BW:"ZAR",
};

function useCurrency() {
  // Start as null so we never render prices before detection completes
  const [cur, setCur] = useState(null);
  const [det, setDet] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const [toast, setToast] = useState(null); // { flag, code, country }

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        const code = CCM[d.country_code] || "USD";
        const c = CURR[code];
        setCur(code);
        setDet(code);
        setDetecting(false);
        // Show toast only if we detected something specific (not just USD fallback)
        if (d.country_code && CCM[d.country_code]) {
          setToast({ flag: c.f, code, country: d.country_name || d.country_code });
          setTimeout(() => setToast(null), 4000);
        }
      })
      .catch(() => {
        setCur("USD");
        setDet("USD");
        setDetecting(false);
      });
  }, []);

  const fmt = (usd) => {
    if (!cur) return "…"; // still detecting — show placeholder
    const c = CURR[cur] || CURR.USD;
    const v = Math.round(usd * c.r);
    return v >= 1000 ? `${c.s}${(v/1000).toFixed(1)}k` : `${c.s}${v.toLocaleString()}`;
  };

  return { cur, setCur, det, detecting, toast, fmt };
}

const AIRPORTS = [
  {c:"HRE",n:"Harare",         co:"Zimbabwe",    f:"🇿🇼"},
  {c:"BUQ",n:"Bulawayo",       co:"Zimbabwe",    f:"🇿🇼"},
  {c:"VFA",n:"Victoria Falls", co:"Zimbabwe",    f:"🇿🇼"},
  {c:"JNB",n:"Johannesburg",   co:"South Africa",f:"🇿🇦"},
  {c:"CPT",n:"Cape Town",      co:"South Africa",f:"🇿🇦"},
  {c:"DUR",n:"Durban",         co:"South Africa",f:"🇿🇦"},
  {c:"LOS",n:"Lagos",          co:"Nigeria",     f:"🇳🇬"},
  {c:"ABV",n:"Abuja",          co:"Nigeria",     f:"🇳🇬"},
  {c:"CAI",n:"Cairo",          co:"Egypt",       f:"🇪🇬"},
  {c:"CMN",n:"Casablanca",     co:"Morocco",     f:"🇲🇦"},
  {c:"RAK",n:"Marrakech",      co:"Morocco",     f:"🇲🇦"},
  {c:"ALG",n:"Algiers",        co:"Algeria",     f:"🇩🇿"},
  {c:"LHR",n:"London",         co:"UK",          f:"🇬🇧"},
  {c:"CDG",n:"Paris",          co:"France",      f:"🇫🇷"},
  {c:"DXB",n:"Dubai",          co:"UAE",         f:"🇦🇪"},
  {c:"DOH",n:"Doha",           co:"Qatar",       f:"🇶🇦"},
  {c:"ADD",n:"Addis Ababa",    co:"Ethiopia",    f:"🇪🇹"},
  {c:"NBO",n:"Nairobi",        co:"Kenya",       f:"🇰🇪"},
  {c:"JFK",n:"New York",       co:"USA",         f:"🇺🇸"},
  {c:"MAD",n:"Madrid",         co:"Spain",       f:"🇪🇸"},
];

const ROUTES = [
  {from:"HRE",fn:"Harare",       to:"JNB",tn:"Johannesburg",cor:"ZW-SA", base:110},
  {from:"HRE",fn:"Harare",       to:"LHR",tn:"London",      cor:"ZW-INT",base:590},
  {from:"HRE",fn:"Harare",       to:"DXB",tn:"Dubai",       cor:"ZW-INT",base:370},
  {from:"BUQ",fn:"Bulawayo",     to:"JNB",tn:"Johannesburg",cor:"ZW-SA", base:95},
  {from:"JNB",fn:"Johannesburg", to:"LHR",tn:"London",      cor:"SA-INT",base:560},
  {from:"CPT",fn:"Cape Town",    to:"LHR",tn:"London",      cor:"SA-INT",base:540},
  {from:"LOS",fn:"Lagos",        to:"LHR",tn:"London",      cor:"NG",    base:460},
  {from:"LOS",fn:"Lagos",        to:"JNB",tn:"Johannesburg",cor:"NG",    base:310},
  {from:"ABV",fn:"Abuja",        to:"LHR",tn:"London",      cor:"NG",    base:490},
  {from:"CAI",fn:"Cairo",        to:"LHR",tn:"London",      cor:"EGY",   base:370},
  {from:"CAI",fn:"Cairo",        to:"DXB",tn:"Dubai",       cor:"EGY",   base:170},
  {from:"CMN",fn:"Casablanca",   to:"CDG",tn:"Paris",       cor:"MAR",   base:150},
  {from:"CMN",fn:"Casablanca",   to:"LHR",tn:"London",      cor:"MAR",   base:210},
  {from:"ALG",fn:"Algiers",      to:"CDG",tn:"Paris",       cor:"DZA",   base:180},
  {from:"ALG",fn:"Algiers",      to:"LHR",tn:"London",      cor:"DZA",   base:250},
];

const COR_COLORS = {
  "ZW-SA": T.gold, "ZW-INT": T.blue, "SA-INT": T.blue,
  "NG": T.green, "EGY": T.egy, "MAR": T.mar, "DZA": T.dza,
};

const AIRLINES = ["Ethiopian Air","Qatar Airways","Emirates","Kenya Airways","British Airways","Air Peace","RwandAir","Royal Air Maroc","EgyptAir","SAA"];

let _seed = 1;
function rand(min, max, s = 0) {
  const x = Math.sin(_seed++ + s) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function mkResults(from, to, date) {
  _seed = (from + to + date).split("").reduce((a, c) => a + c.charCodeAt(0), 1);
  const route = ROUTES.find(r => r.from === from && r.to === to) || { base: 300 };
  return Array.from({ length: rand(6, 10, 1) }, (_, i) => {
    const direct = i < 2;
    const dH = rand(5, 22, i * 7), dM = [0, 15, 30, 45][rand(0, 3, i * 3)];
    const durH = direct ? rand(2, 5, i) : rand(9, 18, i), durM = [0, 20, 40][rand(0, 2, i * 5)];
    const tot = dH * 60 + dM + durH * 60 + durM;
    const aH = Math.floor(tot / 60) % 24, aM = tot % 60;
    const price = Math.round(route.base * (direct ? 1.1 : 0.85) * (0.75 + rand(0, 50, i * 11) / 100));
    const vias = [{c:"ADD",n:"Addis"},{c:"DXB",n:"Dubai"},{c:"NBO",n:"Nairobi"},{c:"DOH",n:"Doha"}].filter(v => v.c !== from && v.c !== to);
    return {
      id: `R${i}`, airline: AIRLINES[rand(0, AIRLINES.length - 1, i * 9)],
      price, dep: `${String(dH).padStart(2,"0")}:${String(dM).padStart(2,"0")}`,
      arr: `${String(aH).padStart(2,"0")}:${String(aM).padStart(2,"0")}`,
      nextDay: tot >= 1440, dur: `${durH}h${durM ? " " + durM + "m" : ""}`,
      stops: direct ? 0 : 1, via: direct ? null : vias[rand(0, vias.length - 1, i * 13)],
      seats: rand(1, 9, i * 17), luggage: rand(0, 1, i * 19) === 1,
      url: `https://www.aviasales.com/search/${from}${to}?marker=738320`,
    };
  }).sort((a, b) => a.price - b.price);
}

let _dc = 0;
function mkDeal() {
  const r = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  const price = Math.round(r.base * (0.6 + Math.random() * 0.75));
  const prev = Math.round(price * (1.08 + Math.random() * 0.28));
  const dH = 5 + Math.floor(Math.random() * 17), dM = [0,15,30,45][Math.floor(Math.random()*4)];
  const durH = 2 + Math.floor(Math.random() * 13), durM = [0,20,40][Math.floor(Math.random()*3)];
  const aH = Math.floor((dH*60+dM+durH*60+durM)/60)%24, aM = (dM+durM)%60;
  _dc++;
  return {
    id: `D${Date.now()}${_dc}`, r,
    airline: AIRLINES[Math.floor(Math.random() * AIRLINES.length)],
    price, prev, drop: prev - price,
    dropPct: Math.round((prev - price) / prev * 100),
    dep: `${String(dH).padStart(2,"0")}:${String(dM).padStart(2,"0")}`,
    arr: `${String(aH).padStart(2,"0")}:${String(aM).padStart(2,"0")}`,
    dur: `${durH}h${durM ? " "+durM+"m" : ""}`,
    stops: Math.random() > 0.4 ? 1 : 0,
    seats: 1 + Math.floor(Math.random() * 8),
    isDrop: Math.random() > 0.4,
    isNew: Math.random() > 0.5,
    ts: new Date(),
    url: `https://www.aviasales.com/search/${r.from}${r.to}?marker=738320`,
    color: COR_COLORS[r.cor] || T.gold,
  };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────

// THE SIGNATURE: animated glowing route arc
function RouteArc({ color = T.gold, stops = 0, w = 100 }) {
  const h = Math.round(w * 0.38);
  const mid = w / 2, top = Math.round(h * 0.12), bot = Math.round(h * 0.88);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display:"block", overflow:"visible" }}>
      <defs>
        <filter id={`g${w}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* glow duplicate */}
      <path d={`M6 ${bot} Q${mid} ${top} ${w-6} ${bot}`}
        stroke={color} strokeWidth="4" fill="none" opacity="0.18"
        strokeLinecap="round"/>
      {/* main arc */}
      <path d={`M6 ${bot} Q${mid} ${top} ${w-6} ${bot}`}
        stroke={color} strokeWidth="1.5" fill="none" opacity="0.75"
        strokeDasharray={stops ? "6 3" : "none"}
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{ animation: "arcDraw 0.6s ease-out" }}
        pathLength="200"
      />
      {/* midpoint dot */}
      <circle cx={mid} cy={Math.round(top * 1.4)} r={stops ? 3.5 : 4}
        fill={color} opacity={stops ? 0.6 : 0.9}
        filter={`url(#g${w})`}/>
      {stops > 0 &&
        <circle cx={mid} cy={Math.round(top * 1.4)} r="7"
          fill="none" stroke={color} strokeWidth="1" opacity="0.25"/>}
      {/* endpoints */}
      <circle cx="6" cy={bot} r="3" fill={color} opacity="0.4"/>
      <circle cx={w-6} cy={bot} r="3" fill={color} opacity="0.4"/>
    </svg>
  );
}

function Tag({ children, color = T.gold, dot = false }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 9px", borderRadius:99,
      background:`${color}14`, border:`1px solid ${color}30`,
      color, fontSize:10, fontWeight:700, fontFamily:mono,
      letterSpacing:"0.4px", lineHeight:"16px",
    }}>
      {dot && <span style={{width:5,height:5,borderRadius:"50%",background:color,display:"inline-block"}}/>}
      {children}
    </span>
  );
}

function Separator() {
  return <div style={{ height:1, background:`linear-gradient(90deg,transparent,${T.mid},transparent)`, margin:"0" }}/>;
}

// ─── CURRENCY PICKER ──────────────────────────────────────────────────
function CurrPicker({ cur, setCur, det }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const c = CURR[cur] || CURR.USD;
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display:"flex", alignItems:"center", gap:6,
        padding:"7px 12px", background:T.raised,
        border:`1px solid ${open ? T.gold : T.mid}`,
        borderRadius:8, color:T.hi, fontFamily:mono,
        fontSize:11, cursor:"pointer", transition:"border-color 0.15s",
      }}>
        <span style={{fontSize:14}}>{c.f}</span>
        <span style={{color:T.gold, fontWeight:700}}>{cur}</span>
        <span style={{color:T.lo, fontSize:9}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:800,
          background:T.raised, border:`1px solid ${T.gold}`,
          borderRadius:14, minWidth:220, maxHeight:320, overflowY:"auto",
          boxShadow:`0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${T.goldBg}`,
        }}>
          <div style={{padding:"8px 14px 6px",fontFamily:mono,fontSize:9,color:T.lo,letterSpacing:"1.2px",borderBottom:`1px solid ${T.dim}`}}>
            DETECTED: {det}{det !== cur ? ` · SHOWING: ${cur}` : ""}
          </div>
          {Object.entries(CURR).filter(([k],i,a)=>a.findIndex(x=>x[0]===k)===i).map(([code, d]) => (
            <div key={code} onClick={() => { setCur(code); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px", cursor:"pointer",
                background: cur === code ? T.goldBg : "transparent",
                borderBottom:`1px solid ${T.dim}`, transition:"background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.goldBg}
              onMouseLeave={e => e.currentTarget.style.background = cur === code ? T.goldBg : "transparent"}>
              <span style={{fontSize:18}}>{d.f}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:mono,fontSize:12,fontWeight:700,color:cur===code?T.gold:T.hi}}>{code}</div>
                <div style={{fontFamily:sg,fontSize:10,color:T.lo}}>{d.n}</div>
              </div>
              <span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:T.gold}}>{d.s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TICKER ───────────────────────────────────────────────────────────
function Ticker({ fmt, detecting }) {
  const items = [
    {r:"HRE → JNB 🇿🇼🇿🇦",p:95}, {r:"LOS → LHR 🇳🇬🇬🇧",p:420},
    {r:"CAI → DXB 🇪🇬🇦🇪",p:170}, {r:"CMN → CDG 🇲🇦🇫🇷",p:150},
    {r:"ALG → LHR 🇩🇿🇬🇧",p:250}, {r:"JNB → LHR 🇿🇦🇬🇧",p:540},
    {r:"HRE → LHR 🇿🇼🇬🇧",p:570}, {r:"CAI → LHR 🇪🇬🇬🇧",p:370},
    {r:"LOS → JNB 🇳🇬🇿🇦",p:310}, {r:"CMN → LHR 🇲🇦🇬🇧",p:210},
  ];
  const price = (p) => detecting ? "…" : fmt(p);
  const text = items.map(i => `${i.r}  from ${price(i.p)}`).join("     ·     ");
  return (
    <div style={{ height:26, background:T.navy, borderBottom:`1px solid ${T.dim}`, overflow:"hidden", display:"flex", alignItems:"center" }}>
      <div style={{
        display:"inline-block", whiteSpace:"nowrap",
        fontFamily:mono, fontSize:10.5, color:T.lo, letterSpacing:"0.15px",
        animation:"ticker 55s linear infinite", paddingLeft:"100%",
      }}>
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────
function Nav({ page, go, cur, setCur, det, detecting, fmt }) {
  const links = [["home","Home"],["scanner","Search"],["terminal","Deals"],["about","About"],["contact","Contact"]];
  return (
    <div style={{ position:"sticky", top:0, zIndex:500 }}>
      <Ticker fmt={fmt} detecting={detecting}/>
      <nav className="nav-bar" style={{
        background:"rgba(7,17,28,0.96)", backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${T.dim}`,
        height:58, display:"flex", alignItems:"center", padding:"0 24px", gap:16,
        boxShadow:`0 4px 40px rgba(0,0,0,0.5)`,
      }}>
        {/* Logo */}
        <div onClick={() => go("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10, marginRight:8, flexShrink:0 }}>
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:"linear-gradient(135deg,#E8A900,#F97316)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, boxShadow:`0 0 18px rgba(232,169,0,0.35)`,
          }}>✈</div>
          <div>
            <div style={{ fontFamily:mono, fontSize:14, fontWeight:700, color:T.hi, letterSpacing:"0.5px", lineHeight:1 }}>
              Sky<span style={{ color:T.gold }}>Afrika</span>
            </div>
            <div className="logo-sub" style={{ fontFamily:mono, fontSize:7, color:T.ghost, letterSpacing:"2.5px", marginTop:2 }}>FLIGHT AGGREGATOR</div>
          </div>
        </div>

        {/* Nav links */}
        <div className="nav-links" style={{ display:"flex", flex:1, gap:0 }}>
          {links.map(([id, l]) => (
            <button key={id} onClick={() => go(id)} style={{
              padding:"6px 12px", border:"none", cursor:"pointer", background:"transparent",
              borderBottom: page === id ? `2px solid ${T.gold}` : "2px solid transparent",
              fontFamily:sg, fontSize:13, fontWeight: page === id ? 600 : 400,
              color: page === id ? T.hi : T.lo, transition:"color 0.15s", whiteSpace:"nowrap",
            }}
            onMouseEnter={e => { if(page!==id) e.currentTarget.style.color=T.md; }}
            onMouseLeave={e => { if(page!==id) e.currentTarget.style.color=T.lo; }}
            >{l}</button>
          ))}
        </div>

        {/* Country chips */}
        <div className="nav-corridors" style={{ display:"flex", gap:3, alignItems:"center", flexShrink:0 }}>
          {[
            {f:"🇿🇼",l:"ZIM"}, {f:"🇿🇦",l:"SA"}, {f:"🇳🇬",l:"NGA"},
            {f:"🇪🇬",l:"EGY",c:T.egy,nw:true}, {f:"🇲🇦",l:"MAR",c:T.mar,nw:true}, {f:"🇩🇿",l:"DZA",c:T.dza,nw:true},
          ].map(x => (
            <div key={x.l} title={x.l} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:1,
              padding:"3px 6px", borderRadius:6, position:"relative",
              background: x.nw ? `${x.c}10` : "transparent",
              border: x.nw ? `1px solid ${x.c}28` : "1px solid transparent",
            }}>
              <span style={{fontSize:13}}>{x.f}</span>
              <span style={{fontFamily:mono,fontSize:6,color:x.nw?x.c:T.ghost,fontWeight:700,letterSpacing:"0.3px"}}>{x.l}</span>
              {x.nw && (
                <span style={{
                  position:"absolute", top:-5, right:-5,
                  background:x.c, color:"#07111C",
                  fontFamily:mono, fontSize:6, fontWeight:700,
                  padding:"1px 3px", borderRadius:3, lineHeight:1.3,
                }}>NEW</span>
              )}
            </div>
          ))}
        </div>

        {detecting ? (
          <div style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"7px 14px", background:T.raised,
            border:`1px solid ${T.mid}`, borderRadius:8,
            fontFamily:mono, fontSize:11, color:T.lo,
          }}>
            <span style={{
              width:10, height:10, borderRadius:"50%",
              border:`2px solid ${T.gold}`,
              borderTopColor:"transparent",
              display:"inline-block",
              animation:"spin 0.7s linear infinite",
            }}/>
            <span className="currency-label">Detecting…</span>
          </div>
        ) : (
          <CurrPicker cur={cur} setCur={setCur} det={det}/>
        )}
      </nav>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────
function HomePage({ go, fmt, detecting }) {
  const popular = [
    {from:"Harare",    to:"London",        f:"🇿🇼→🇬🇧", p:570, direct:false, col:T.gold},
    {from:"Lagos",     to:"London",        f:"🇳🇬→🇬🇧", p:420, direct:false, col:T.green},
    {from:"Harare",    to:"Johannesburg",  f:"🇿🇼→🇿🇦", p:95,  direct:true,  col:T.gold},
    {from:"Cairo",     to:"Dubai",         f:"🇪🇬→🇦🇪", p:170, direct:true,  col:T.egy},
    {from:"Casablanca",to:"Paris",         f:"🇲🇦→🇫🇷", p:150, direct:true,  col:T.mar},
    {from:"Algiers",   to:"London",        f:"🇩🇿→🇬🇧", p:250, direct:false, col:T.dza},
    {from:"Cape Town", to:"London",        f:"🇿🇦→🇬🇧", p:540, direct:false, col:T.blue},
    {from:"Lagos",     to:"Johannesburg",  f:"🇳🇬→🇿🇦", p:310, direct:false, col:T.green},
  ];

  return (
    <div style={{ background:T.ink }}>
      {/* ── HERO ── */}
      <div style={{
        minHeight:520, display:"flex", alignItems:"center", justifyContent:"center",
        textAlign:"center", padding:"80px 24px 90px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,169,0,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(79,168,240,0.05) 0%, transparent 70%), ${T.ink}`,
        position:"relative", overflow:"hidden",
      }}>
        {/* Background grid lines */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:`linear-gradient(${T.dim}30 1px, transparent 1px), linear-gradient(90deg, ${T.dim}30 1px, transparent 1px)`,
          backgroundSize:"80px 80px", opacity:0.4,
        }}/>

        <div style={{ position:"relative", maxWidth:680, margin:"0 auto", animation:"fadeIn 0.5s ease-out" }}>
          {/* Eyebrow badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 16px", marginBottom:28, borderRadius:99,
            background:T.goldBg, border:`1px solid ${T.goldRing}`,
          }}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.gold,boxShadow:`0 0 8px ${T.gold}`,animation:"pulse 2s infinite"}}/>
            <span style={{fontFamily:mono,fontSize:11,color:T.gold,letterSpacing:"1.5px",fontWeight:700}}>AFRICA'S FLIGHT AGGREGATOR</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:sg, fontWeight:700,
            fontSize:"clamp(42px,7vw,76px)",
            lineHeight:1.02, letterSpacing:"-2.5px",
            color:T.hi, marginBottom:12,
          }}>
            One search.<br/>
            <span style={{ color:T.gold }}>Every fare.</span>
          </h1>

          {/* Sub headline */}
          <p style={{
            fontFamily:sg, fontSize:"clamp(15px,2.5vw,19px)",
            color:T.lo, lineHeight:1.6, marginBottom:10,
            fontWeight:300,
          }}>
            Zimbabwe · South Africa · Nigeria ·{" "}
            <span style={{color:T.egy}}>Egypt</span> ·{" "}
            <span style={{color:T.mar}}>Morocco</span> ·{" "}
            <span style={{color:T.dza}}>Algeria</span>
          </p>
          <p style={{fontFamily:sg, fontSize:14, color:T.lo, lineHeight:1.6, marginBottom:40}}>
            Prices auto-detected in your local currency — GBP, NGN, ZAR, EGP and more.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => go("scanner")} style={{
              padding:"15px 36px",
              background:"linear-gradient(135deg,#E8A900,#F97316)",
              border:"none", borderRadius:12,
              fontFamily:sg, fontSize:15, fontWeight:600, color:"#07111C",
              cursor:"pointer", letterSpacing:"-0.2px",
              boxShadow:`0 8px 32px rgba(232,169,0,0.3)`,
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(232,169,0,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 32px rgba(232,169,0,0.3)";}}>
              Search Flights Free →
            </button>
            <button onClick={() => go("terminal")} style={{
              padding:"15px 28px",
              background:"rgba(255,255,255,0.04)",
              border:`1px solid ${T.mid}`, borderRadius:12,
              fontFamily:sg, fontSize:15, fontWeight:400, color:T.md,
              cursor:"pointer", transition:"all 0.2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.hi;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.mid;e.currentTarget.style.color=T.md;}}>
              Live Deals
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background:T.card, borderTop:`1px solid ${T.dim}`, borderBottom:`1px solid ${T.dim}`, padding:"18px 24px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:20 }}>
          {[{n:"20+",l:"Routes"},{n:"10+",l:"Platforms"},{n:"13",l:"Currencies"},{n:"6",l:"Countries"},{n:"100%",l:"Free"}].map(s => (
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:mono, fontSize:26, fontWeight:700, color:T.gold, lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:sg, fontSize:12, color:T.lo, marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POPULAR ROUTES ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"64px 24px" }}>
        <div style={{ marginBottom:36 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:T.gold, letterSpacing:"2px", marginBottom:8, textTransform:"uppercase" }}>Popular Routes</div>
          <h2 style={{ fontFamily:sg, fontSize:28, fontWeight:700, color:T.hi, letterSpacing:"-0.8px" }}>Where people are flying</h2>
          <p style={{ fontFamily:sg, fontSize:14, color:T.lo, marginTop:6 }}>Live prices in your currency · Updated in real time</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12 }}>
          {popular.map((r, i) => (
            <div key={i} onClick={() => go("scanner")} style={{
              background:T.card, border:`1px solid ${T.dim}`,
              borderRadius:16, padding:"20px 22px", cursor:"pointer",
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background=T.raised; e.currentTarget.style.borderColor=r.col; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background=T.card; e.currentTarget.style.borderColor=T.dim; e.currentTarget.style.transform="none"; }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:sg, fontSize:15, fontWeight:600, color:T.hi, marginBottom:3 }}>{r.from} → {r.to}</div>
                  <div style={{ fontFamily:sg, fontSize:12, color:T.lo }}>{r.f} · {r.direct ? "Direct" : "Via hub"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  {detecting
                    ? <div style={{width:52,height:20,background:T.raised,borderRadius:6,marginBottom:2,animation:"pulse 1.2s infinite"}}/>
                    : <div style={{ fontFamily:mono, fontSize:20, fontWeight:700, color:r.col, lineHeight:1 }}>{fmt(r.p)}</div>
                  }
                  <div style={{ fontFamily:sg, fontSize:10, color:T.ghost, marginTop:3 }}>per person</div>
                </div>
              </div>
              <RouteArc color={r.col} stops={r.direct ? 0 : 1} w={100}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE GRID ── */}
      <div style={{ background:T.navy, borderTop:`1px solid ${T.dim}`, padding:"64px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:T.gold, letterSpacing:"2px", marginBottom:8 }}>WHY SKYAFRIKA</div>
            <h2 style={{ fontFamily:sg, fontSize:28, fontWeight:700, color:T.hi, letterSpacing:"-0.8px" }}>Built for Africa. Open to the world.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
            {[
              {ic:"🔍",t:"Scans 10+ platforms at once",d:"Travelpayouts, Skyscanner, Kayak, Booking.com, Ethiopian Airlines, Qatar Airways and more — simultaneously."},
              {ic:"💱",t:"Auto-detects your currency",d:"Your IP tells us where you are. GBP in the UK, NGN in Nigeria, ZAR in South Africa, EGP in Egypt — instantly."},
              {ic:"📉",t:"Real-time price drop alerts",d:"When a fare drops, we fire alerts to WhatsApp, Telegram, Facebook and Instagram automatically."},
              {ic:"🌍",t:"Six African corridors",d:"Zimbabwe, South Africa, Nigeria, Egypt, Morocco, Algeria — the routes the big platforms underserve."},
              {ic:"✈",t:"Direct and connecting",d:"Filter by non-stop or browse all options with full stopover detail and next-day arrival flags."},
              {ic:"📱",t:"Social deal broadcast",d:"Subscribe to our channels. Best fares pushed to you before seats sell out."},
            ].map(f => (
              <div key={f.t} style={{ background:T.card, border:`1px solid ${T.dim}`, borderRadius:16, padding:"26px 24px", transition:"border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor=T.mid}
                onMouseLeave={e => e.currentTarget.style.borderColor=T.dim}>
                <div style={{ fontSize:26, marginBottom:14 }}>{f.ic}</div>
                <div style={{ fontFamily:sg, fontSize:15, fontWeight:600, color:T.hi, marginBottom:8, lineHeight:1.35 }}>{f.t}</div>
                <div style={{ fontFamily:sg, fontSize:13, color:T.lo, lineHeight:1.75 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PLATFORM STRIP ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px 32px" }}>
        <div style={{ textAlign:"center", fontFamily:mono, fontSize:10, color:T.ghost, letterSpacing:"2px", marginBottom:18 }}>PRICES SCANNED FROM</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
          {["Travelpayouts","Skyscanner","Kayak","Booking.com","Ethiopian Air","Qatar Airways","Emirates","Kenya Airways","Royal Air Maroc","EgyptAir","RwandAir","SAA"].map(p => (
            <div key={p} style={{ padding:"7px 16px", background:T.card, border:`1px solid ${T.dim}`, borderRadius:99, fontFamily:sg, fontSize:12, color:T.lo }}>{p}</div>
          ))}
        </div>
      </div>

      {/* ── DISCLOSURE ── */}
      <div style={{ maxWidth:1100, margin:"0 auto 0", padding:"0 24px 32px" }}>
        <div style={{ background:T.goldBg, border:`1px solid ${T.goldRing}`, borderRadius:12, padding:"14px 20px", display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{fontSize:15,marginTop:1}}>📢</span>
          <div>
            <div style={{fontFamily:sg,fontSize:12,color:T.gold,fontWeight:700,marginBottom:2}}>Affiliate Disclosure</div>
            <div style={{fontFamily:sg,fontSize:12,color:T.lo,lineHeight:1.65}}>SkyAfrika earns small commissions from Travelpayouts, Skyscanner, Kayak and Booking.com when you book. This never inflates prices — all fares are sourced directly from partners.</div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ background:`linear-gradient(180deg, ${T.ink} 0%, ${T.navy} 100%)`, borderTop:`1px solid ${T.dim}`, padding:"64px 24px", textAlign:"center" }}>
        <h2 style={{ fontFamily:sg, fontSize:26, fontWeight:700, color:T.hi, marginBottom:10, letterSpacing:"-0.5px" }}>Ready to find your cheapest flight?</h2>
        <p style={{ fontFamily:sg, fontSize:14, color:T.lo, marginBottom:28 }}>Free · No sign-up · Your currency · All platforms</p>
        <button onClick={() => go("scanner")} style={{
          padding:"15px 40px", background:"linear-gradient(135deg,#E8A900,#F97316)",
          border:"none", borderRadius:12, fontFamily:sg, fontSize:15, fontWeight:600,
          color:"#07111C", cursor:"pointer", boxShadow:`0 8px 32px rgba(232,169,0,0.3)`,
        }}>Search Flights Free →</button>
      </div>
    </div>
  );
}

// ─── AIRPORT PICKER ───────────────────────────────────────────────────
function APicker({ label, value, onChange, exclude }) {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false); const ref = useRef();
  const sel = AIRPORTS.find(a => a.c === value);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const list = AIRPORTS.filter(a => a.c !== exclude && (q === "" || [a.n, a.c, a.co].join(" ").toLowerCase().includes(q.toLowerCase())));
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ fontFamily:mono, fontSize:10, color:T.lo, letterSpacing:"1.5px", marginBottom:7, textTransform:"uppercase" }}>{label}</div>
      <div onClick={() => setOpen(!open)} style={{
        padding:"14px 16px", border:`1.5px solid ${open ? T.gold : value ? T.mid : T.dim}`,
        borderRadius:12, background:T.navy, cursor:"pointer",
        display:"flex", alignItems:"center", gap:10, minHeight:54, transition:"border-color 0.15s",
      }}>
        {sel ? (
          <><span style={{fontSize:22}}>{sel.f}</span>
          <div><div style={{fontFamily:sg,fontSize:14,fontWeight:600,color:T.hi}}>{sel.n}</div><div style={{fontFamily:mono,fontSize:11,color:T.lo}}>{sel.co} · {sel.c}</div></div></>
        ) : <span style={{fontFamily:sg,fontSize:14,color:T.ghost}}>Select airport…</span>}
        <span style={{marginLeft:"auto",color:T.ghost,fontSize:10}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:400,
          background:T.raised, border:`1px solid ${T.gold}`, borderRadius:14,
          maxHeight:300, overflowY:"auto", boxShadow:`0 24px 60px rgba(0,0,0,0.7)`,
        }}>
          <div style={{padding:"10px"}}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type city or code…" style={{
              width:"100%", padding:"9px 14px", background:T.navy,
              border:`1px solid ${T.mid}`, borderRadius:8,
              color:T.hi, fontFamily:sg, fontSize:13, outline:"none", boxSizing:"border-box",
            }}/>
          </div>
          {list.map(a => (
            <div key={a.c} onClick={() => { onChange(a.c); setQ(""); setOpen(false); }}
              style={{ padding:"11px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${T.dim}`, transition:"background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background=T.goldBg}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:20}}>{a.f}</span>
              <div style={{flex:1}}><div style={{fontFamily:sg,fontSize:13,fontWeight:600,color:T.hi}}>{a.n}</div><div style={{fontFamily:sg,fontSize:11,color:T.lo}}>{a.co}</div></div>
              <span style={{fontFamily:mono,fontSize:13,color:T.gold,fontWeight:700}}>{a.c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SCANNER PAGE ─────────────────────────────────────────────────────
function ScannerPage({ fmt, cur, detecting }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [date, setDate] = useState(""); const [trip, setTrip] = useState("oneway");
  const [pax, setPax] = useState(1); const [cls, setCls] = useState("economy");
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); const [sort, setSort] = useState("price");
  const [filter, setFilter] = useState("all"); const [exp, setExp] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const ok = from && to && date;

  const doSearch = () => {
    if (!ok) return;
    setLoading(true); setResults([]); setDone(false);
    setTimeout(() => { setResults(mkResults(from, to, date)); setLoading(false); setDone(true); }, 1700);
  };

  const shown = results
    .filter(r => filter === "all" || (filter === "direct" ? r.stops === 0 : r.stops > 0))
    .sort((a, b) => sort === "price" ? a.price - b.price : sort === "dur" ? a.dur.localeCompare(b.dur) : a.dep.localeCompare(b.dep));

  return (
    <div style={{ maxWidth:880, margin:"0 auto", padding:"44px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:mono, fontSize:10, color:T.gold, letterSpacing:"2px", marginBottom:6 }}>FLIGHT SEARCH</div>
        <h1 style={{ fontFamily:sg, fontSize:28, fontWeight:700, color:T.hi, letterSpacing:"-0.8px", marginBottom:4 }}>Find your cheapest flight</h1>
        <p style={{ fontFamily:sg, fontSize:13, color:T.lo }}>
          Scanning all platforms · Prices in{" "}
          {detecting
            ? <span style={{color:T.lo}}>detecting your currency…</span>
            : <span style={{color:T.gold,fontWeight:600}}>{cur} ({(CURR[cur]||CURR.USD).s})</span>
          }
        </p>
      </div>

      {/* Search Form */}
      <div style={{ background:T.card, border:`1px solid ${T.dim}`, borderRadius:20, padding:"28px", marginBottom:28, boxShadow:`0 12px 48px rgba(0,0,0,0.4)` }}>
        {/* Toggles */}
        <div className="scanner-toggles" style={{ display:"flex", gap:6, marginBottom:22, flexWrap:"wrap", alignItems:"center" }}>
          {[["oneway","One Way"],["return","Return"]].map(([v,l]) => (
            <button key={v} onClick={() => setTrip(v)} style={{
              padding:"5px 14px", borderRadius:99,
              border:`1px solid ${trip===v ? T.gold : T.mid}`,
              background: trip===v ? T.goldBg : "transparent",
              color: trip===v ? T.gold : T.lo,
              fontFamily:mono, fontSize:10, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
            }}>{l}</button>
          ))}
          <span style={{width:1,height:16,background:T.dim,margin:"0 4px"}}/>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setPax(n)} style={{
              padding:"5px 10px", borderRadius:99,
              border:`1px solid ${pax===n ? T.gold : T.mid}`,
              background: pax===n ? T.goldBg : "transparent",
              color: pax===n ? T.gold : T.lo,
              fontFamily:mono, fontSize:10, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
            }}>{n}</button>
          ))}
          <span style={{fontFamily:mono,fontSize:10,color:T.ghost,marginLeft:2}}>pax</span>
          <span style={{width:1,height:16,background:T.dim,margin:"0 4px"}}/>
          {["economy","business","first"].map(c => (
            <button key={c} onClick={() => setCls(c)} style={{
              padding:"5px 14px", borderRadius:99,
              border:`1px solid ${cls===c ? T.blue : T.mid}`,
              background: cls===c ? T.blueBg : "transparent",
              color: cls===c ? T.blue : T.lo,
              fontFamily:mono, fontSize:10, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
            }}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>
          ))}
        </div>

        {/* Airport Row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 44px 1fr", gap:10, alignItems:"end", marginBottom:14 }}>
          <APicker label="From" value={from} onChange={setFrom} exclude={to}/>
          <button onClick={() => { const t=from; setFrom(to); setTo(t); }} style={{
            width:44, height:44, border:`1px solid ${T.mid}`, borderRadius:"50%",
            background:T.raised, color:T.gold, fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background=T.goldBg;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.mid;e.currentTarget.style.background=T.raised;}}>⇄</button>
          <APicker label="To" value={to} onChange={setTo} exclude={from}/>
        </div>

        {/* Date Row */}
        <div style={{ display:"grid", gridTemplateColumns:trip==="return"?"1fr 1fr":"1fr", gap:12, marginBottom:22 }}>
          {[["Departure",date,setDate,today],["Return","","()=>{}",date||today]].slice(0,trip==="return"?2:1).map(([l,v,s,m],i) => (
            <div key={l}>
              <div style={{fontFamily:mono,fontSize:10,color:T.lo,letterSpacing:"1.5px",marginBottom:7,textTransform:"uppercase"}}>{l} date</div>
              <input type="date" min={m} value={i===0?date:""} onChange={e=>i===0?setDate(e.target.value):null}
                style={{width:"100%",padding:"13px 16px",background:T.navy,border:`1.5px solid ${(i===0?date:"")?"${T.mid}":T.dim}`,borderRadius:12,color:(i===0?date:"")?"${T.hi}":T.ghost,fontFamily:sg,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}}
                onFocus={e=>e.target.style.borderColor=T.gold}
                onBlur={e=>e.target.style.borderColor=(i===0?date:"")?T.mid:T.dim}/>
            </div>
          ))}
        </div>

        <button onClick={doSearch} disabled={!ok||loading} style={{
          width:"100%", padding:"15px",
          background: ok ? "linear-gradient(135deg,#E8A900,#F97316)" : T.raised,
          border: ok ? "none" : `1px solid ${T.dim}`,
          borderRadius:14, fontFamily:sg, fontSize:15, fontWeight:600,
          color: ok ? "#07111C" : T.ghost,
          cursor: ok ? "pointer" : "not-allowed",
          boxShadow: ok ? "0 6px 24px rgba(232,169,0,0.3)" : "none",
          transition:"all 0.2s",
        }}>{loading ? "Scanning all platforms…" : "Search Flights"}</button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginBottom:14 }}>
            {["Travelpayouts","Skyscanner","Kayak","Ethiopian","Qatar","Emirates","Booking.com"].map(p => (
              <Tag key={p}>{p}</Tag>
            ))}
          </div>
          <div style={{fontFamily:sg,fontSize:13,color:T.lo}}>Comparing fares across all platforms…</div>
        </div>
      )}

      {/* Results */}
      {done && !loading && (
        <div style={{ animation:"fadeIn 0.35s ease-out" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{fontFamily:sg,fontSize:16,fontWeight:600,color:T.hi}}>{shown.length} flights found</div>
              <div style={{fontFamily:sg,fontSize:12,color:T.lo,marginTop:2}}>Cheapest: <span style={{color:T.gold,fontWeight:700}}>{shown.length?fmt(Math.min(...shown.map(r=>r.price))):"—"}</span></div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[["all","All"],["direct","Direct"],["stops","Stops"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)} style={{
                  padding:"5px 12px", borderRadius:99, cursor:"pointer",
                  border:`1px solid ${filter===v?T.blue:T.mid}`,
                  background:filter===v?T.blueBg:"transparent",
                  color:filter===v?T.blue:T.lo,
                  fontFamily:mono, fontSize:10, fontWeight:700, transition:"all 0.15s",
                }}>{l}</button>
              ))}
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"5px 12px",border:`1px solid ${T.mid}`,borderRadius:99,background:T.raised,color:T.md,fontFamily:mono,fontSize:10,cursor:"pointer",outline:"none"}}>
                <option value="price">Price ↑</option>
                <option value="dep">Depart ↑</option>
              </select>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {shown.map((r, i) => (
              <div key={r.id} style={{
                background: i===0 ? T.raised : T.card,
                border:`1px solid ${i===0?T.gold:T.dim}`,
                borderRadius:16, overflow:"hidden", transition:"border-color 0.15s",
                boxShadow: i===0 ? `0 4px 24px rgba(232,169,0,0.15)` : "none",
              }}
              onMouseEnter={e=>{if(i!==0)e.currentTarget.style.borderColor=T.mid;}}
              onMouseLeave={e=>{if(i!==0)e.currentTarget.style.borderColor=T.dim;}}>
                {i===0 && (
                  <div style={{background:"linear-gradient(90deg,#E8A900,#F97316)",padding:"4px 18px",display:"flex",gap:10}}>
                    <span style={{fontFamily:mono,fontSize:10,fontWeight:700,color:"#07111C",letterSpacing:"0.5px"}}>★ BEST PRICE</span>
                    <span style={{fontFamily:mono,fontSize:10,color:"#07111C"}}>{fmt(r.price)}/person · {r.stops===0?"Non-stop":"Via "+r.via?.c}</span>
                  </div>
                )}
                <div className="flight-card-grid" onClick={() => setExp(exp===r.id?null:r.id)} style={{
                  display:"grid", gridTemplateColumns:"1fr auto auto",
                  padding:"18px 20px", cursor:"pointer", alignItems:"center",
                }}>
                  <div>
                    <div style={{fontFamily:sg,fontSize:14,fontWeight:600,color:T.hi,marginBottom:12}}>{r.airline}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:mono,fontSize:22,fontWeight:700,color:T.hi,lineHeight:1}}>{r.dep}</div>
                        <div style={{fontFamily:mono,fontSize:10,color:T.lo,marginTop:3}}>{from}</div>
                      </div>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <span style={{fontFamily:sg,fontSize:11,color:T.lo}}>{r.dur}</span>
                        <RouteArc color={r.stops===0?T.green:T.blue} stops={r.stops} w={90}/>
                        <span style={{fontFamily:mono,fontSize:9,fontWeight:700,color:r.stops===0?T.green:T.blue}}>
                          {r.stops===0?"NON-STOP":`VIA ${r.via?.c}`}
                        </span>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:mono,fontSize:22,fontWeight:700,color:T.hi,lineHeight:1}}>{r.arr}{r.nextDay&&<sup style={{fontSize:9,color:T.gold}}>+1</sup>}</div>
                        <div style={{fontFamily:mono,fontSize:10,color:T.lo,marginTop:3}}>{to}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                      {r.seats <= 4 && <Tag color={T.red}>🔥 {r.seats} seats left</Tag>}
                      <Tag color={r.luggage?T.green:T.ghost}>{r.luggage?"✓ Bag inc.":"✗ Bag extra"}</Tag>
                    </div>
                  </div>
                  <div style={{ padding:"0 20px", textAlign:"right" }}>
                    <div style={{fontFamily:mono,fontSize:30,fontWeight:700,color:T.gold,lineHeight:1}}>{fmt(r.price)}</div>
                    <div style={{fontFamily:sg,fontSize:11,color:T.lo,marginTop:3}}>per person</div>
                    {pax>1&&<div style={{fontFamily:sg,fontSize:12,color:T.md,marginTop:4}}>Total {fmt(r.price*pax)}</div>}
                  </div>
                  <div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{
                      display:"block", padding:"13px 18px",
                      background:"linear-gradient(135deg,#E8A900,#F97316)",
                      borderRadius:12, textDecoration:"none",
                      fontFamily:sg, fontSize:13, fontWeight:600, color:"#07111C", whiteSpace:"nowrap",
                      boxShadow:"0 4px 16px rgba(232,169,0,0.25)",
                    }}>Book →</a>
                  </div>
                </div>
                {exp===r.id && (
                  <div style={{borderTop:`1px solid ${T.dim}`,padding:"18px 20px",background:T.navy,display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                    <div>
                      <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1.5px",marginBottom:10}}>COMPARE ON ALL PLATFORMS</div>
                      {Object.entries(r.links||{}).map(([p,url])=>(
                        <a key={p} href={url} target="_blank" rel="noopener noreferrer" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",border:`1px solid ${T.dim}`,borderRadius:8,marginBottom:6,textDecoration:"none",color:T.md,fontFamily:sg,fontSize:13,transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.dim}>
                          <span>{p}</span><span style={{color:T.gold}}>→</span>
                        </a>
                      ))}
                    </div>
                    <div>
                      <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1.5px",marginBottom:10}}>SHARE THIS DEAL</div>
                      {[
                        {l:"Share on WhatsApp",c:"#22C897",fn:()=>window.open(`https://wa.me/?text=${encodeURIComponent(`✈️ ${from}→${to} from ${fmt(r.price)}\nBook: ${r.url}`)}`)},
                        {l:"Share on Telegram",c:"#38C4E8",fn:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(r.url)}`)},
                        {l:"Copy link",c:T.blue,fn:()=>navigator.clipboard?.writeText(`✈️ ${from}→${to} from ${fmt(r.price)} | ${r.url}`)},
                      ].map(b=>(
                        <button key={b.l} onClick={b.fn} style={{display:"block",width:"100%",padding:"9px 14px",border:`1px solid ${b.c}28`,borderRadius:8,background:"transparent",color:b.c,fontFamily:sg,fontSize:13,fontWeight:500,cursor:"pointer",marginBottom:7,textAlign:"left",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${b.c}12`;e.currentTarget.style.borderColor=b.c;}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=`${b.c}28`;}}>{b.l} →</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TERMINAL PAGE ────────────────────────────────────────────────────
const INIT_PLATS=[{id:"facebook",name:"Facebook",color:"#4FA8F0",icon:"f"},{id:"instagram",name:"Instagram",color:"#E879C8",icon:"📷"},{id:"telegram",name:"Telegram",color:"#38C4E8",icon:"✈"},{id:"whatsapp",name:"WhatsApp",color:"#22C897",icon:"💬"}];

function TerminalPage({ fmt }) {
  const [deals,setDeals]=useState([]);
  const [plats,setPlats]=useState(INIT_PLATS.map(p=>({...p,connected:false})));
  const [running,setRunning]=useState(false);
  const [tab,setTab]=useState("feed");
  const [log,setLog]=useState([]);
  const [stats,setStats]=useState({total:0,posted:0,drops:0,earned:0});
  const [auto,setAuto]=useState(true);
  const [modal,setModal]=useState(null);
  const ivRef=useRef(); const plRef=useRef(plats);
  useEffect(()=>{plRef.current=plats;},[plats]);

  const addLog=(msg,type="info")=>setLog(p=>[{msg,type,t:new Date()},...p].slice(0,80));

  const post=(dealId,pid)=>{
    setDeals(prev=>prev.map(d=>{
      if(d.id!==dealId)return d;
      const cap=`✈️ ${d.isDrop?"PRICE DROP":"NEW DEAL"}!\n${d.r.fn}→${d.r.tn} from ${fmt(d.price)}\n${d.isDrop?`Was ${fmt(d.prev)} · save ${fmt(d.drop)}\n`:""}Book: ${d.url}`;
      if(pid==="whatsapp")window.open(`https://wa.me/?text=${encodeURIComponent(cap)}`,"_blank");
      else if(pid==="telegram")window.open(`https://t.me/share/url?url=${encodeURIComponent(d.url)}&text=${encodeURIComponent(cap)}`,"_blank");
      else navigator.clipboard?.writeText(cap);
      addLog(`→ ${plRef.current.find(p=>p.id===pid)?.name}: ${d.r.fn}→${d.r.tn} ${fmt(d.price)}`,"success");
      setStats(s=>({...s,posted:s.posted+1,earned:s.earned+Math.round(d.price*0.02)}));
      return {...d,posted:{...(d.posted||{}),[pid]:true}};
    }));
  };

  const postAll=d=>plRef.current.filter(p=>p.connected).forEach(p=>post(d.id,p.id));

  const start=()=>{
    setRunning(true); addLog("Scanner started","success");
    const fire=()=>{
      const d=mkDeal();
      setDeals(p=>[d,...p].slice(0,50));
      setStats(s=>({...s,total:s.total+1,drops:s.drops+(d.isDrop?1:0)}));
      addLog(`[${d.isDrop?"DROP":"NEW"}] ${d.r.fn}→${d.r.tn} ${fmt(d.price)}`,d.isDrop?"warning":"info");
      if(auto)plRef.current.filter(p=>p.connected).forEach(p=>setTimeout(()=>post(d.id,p.id),300));
      ivRef.current=setTimeout(fire,2800+Math.random()*4500);
    };
    fire();
  };
  const stop=()=>{setRunning(false);clearTimeout(ivRef.current);addLog("Scanner stopped","error");};
  useEffect(()=>()=>clearTimeout(ivRef.current),[]);

  return (
    <div style={{maxWidth:1080,margin:"0 auto",padding:"36px 24px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"2px",marginBottom:4}}>DEAL SYNDICATION TERMINAL</div>
          <h1 style={{fontFamily:sg,fontSize:24,fontWeight:700,color:T.hi}}>SkyAfrika Live Deals</h1>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:running?T.green:T.ghost,boxShadow:running?`0 0 8px ${T.green}`:"none",animation:running?"pulse 2s infinite":"none"}}/>
            <span style={{fontFamily:sg,fontSize:12,color:running?T.green:T.lo}}>{running?"Live · scanning now":"Offline"}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setAuto(!auto)} style={{padding:"7px 14px",borderRadius:99,border:`1px solid ${auto?T.gold:T.mid}`,background:auto?T.goldBg:"transparent",color:auto?T.gold:T.lo,fontFamily:mono,fontSize:10,fontWeight:700,cursor:"pointer"}}>Auto-post: {auto?"ON":"OFF"}</button>
          <button onClick={running?stop:start} style={{padding:"10px 22px",border:`1px solid ${running?T.red:T.green}`,background:running?T.redBg:T.greenBg,color:running?T.red:T.green,fontFamily:sg,fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:10}}>{running?"Stop Scanner":"▶ Start"}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
        {[{l:"Deals found",v:stats.total,c:T.hi},{l:"Price drops",v:stats.drops,c:T.red},{l:"Posts sent",v:stats.posted,c:T.green},{l:"Est. earned",v:`$${stats.earned}`,c:T.gold}].map(s=>(
          <div key={s.l} style={{background:T.card,border:`1px solid ${T.dim}`,borderRadius:14,padding:"16px 18px"}}>
            <div style={{fontFamily:sg,fontSize:12,color:T.lo,marginBottom:4}}>{s.l}</div>
            <div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.dim}`,marginBottom:20}}>
        {[["feed","Live Feed"],["platforms","Platforms"],["log","Log"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 18px",border:"none",background:"transparent",borderBottom:tab===id?`2px solid ${T.gold}`:"2px solid transparent",fontFamily:sg,fontSize:13,fontWeight:tab===id?600:400,color:tab===id?T.hi:T.lo,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {tab==="feed"&&(
        <div>
          {deals.length===0?(
            <div style={{textAlign:"center",padding:"80px 0",border:`1px solid ${T.dim}`,borderRadius:16}}>
              <div style={{fontSize:44,marginBottom:16}}>✈️</div>
              <div style={{fontFamily:sg,fontSize:15,color:T.md,fontWeight:600,marginBottom:6}}>No deals yet</div>
              <div style={{fontFamily:sg,fontSize:13,color:T.lo}}>Press Start to begin monitoring</div>
            </div>
          ):deals.map(d=>{
            const fresh=Date.now()-d.ts.getTime()<6000;
            return (
              <div key={d.id} style={{border:`1px solid ${fresh?d.color:T.dim}`,background:T.card,borderRadius:14,marginBottom:8,overflow:"hidden",transition:"border-color 0.8s"}}>
                <div className="deal-card-grid" style={{display:"grid",gridTemplateColumns:"64px 1fr auto auto",alignItems:"stretch"}}>
                  <div style={{padding:"10px 4px",background:`${d.color}08`,borderRight:`1px solid ${T.dim}`,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:3}}>
                    <span style={{fontSize:18}}>{d.r.cor==="EGY"?"🇪🇬":d.r.cor==="MAR"?"🇲🇦":d.r.cor==="DZA"?"🇩🇿":d.r.cor.includes("ZW")?"🇿🇼":d.r.cor.includes("NG")?"🇳🇬":"🌍"}</span>
                    <span style={{fontFamily:mono,fontSize:7,color:d.color,fontWeight:700,textAlign:"center"}}>{d.r.cor}</span>
                  </div>
                  <div style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                      {d.isNew&&<Tag color={T.green} dot>NEW</Tag>}
                      {d.isDrop&&<Tag color={T.red} dot>-{d.dropPct}%</Tag>}
                      <span style={{fontFamily:mono,fontSize:9,color:T.ghost,alignSelf:"center"}}>{d.ts.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
                    </div>
                    <div style={{fontFamily:sg,fontSize:14,fontWeight:600,color:T.hi,marginBottom:2}}>{d.r.fn} → {d.r.tn}</div>
                    <div style={{fontFamily:sg,fontSize:12,color:T.lo}}>{d.airline} · {d.dep}→{d.arr} · <span style={{color:d.stops===0?T.green:T.blue}}>{d.stops===0?"Direct":"1 stop"}</span></div>
                  </div>
                  <div style={{padding:"12px 16px",borderLeft:`1px solid ${T.dim}`,textAlign:"right",display:"flex",flexDirection:"column",justifyContent:"center",minWidth:108}}>
                    {d.isDrop&&<div style={{fontFamily:mono,fontSize:11,color:T.ghost,textDecoration:"line-through"}}>{fmt(d.prev)}</div>}
                    <div style={{fontFamily:mono,fontSize:22,fontWeight:700,color:T.gold}}>{fmt(d.price)}</div>
                  </div>
                  <div style={{padding:"12px",borderLeft:`1px solid ${T.dim}`,display:"flex",flexDirection:"column",justifyContent:"center",gap:6,minWidth:94}}>
                    <button onClick={()=>postAll(d)} style={{padding:"7px 8px",borderRadius:8,border:`1px solid ${T.goldRing}`,background:T.goldBg,color:T.gold,fontFamily:sg,fontSize:11,fontWeight:600,cursor:"pointer"}}>Post All</button>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 8px",borderRadius:8,border:`1px solid ${T.mid}`,textDecoration:"none",color:T.lo,fontFamily:sg,fontSize:11,textAlign:"center"}}>Book →</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="platforms"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          {plats.map(p=>(
            <div key={p.id} style={{background:T.card,border:`1px solid ${p.connected?p.color:T.dim}`,borderRadius:16,padding:"22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:38,height:38,background:p.connected?p.color:`${p.color}18`,border:`1px solid ${p.color}40`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{p.icon}</div>
                <div><div style={{fontFamily:sg,fontSize:14,fontWeight:600,color:T.hi}}>{p.name}</div><div style={{fontFamily:sg,fontSize:11,color:p.connected?T.green:T.lo}}>{p.connected?"● Connected":"○ Disconnected"}</div></div>
              </div>
              <p style={{fontFamily:sg,fontSize:12,color:T.lo,lineHeight:1.7,marginBottom:16}}>
                {p.id==="facebook"&&"Posts deal alerts to your Page. Reaches diaspora communities in their local currency."}
                {p.id==="instagram"&&"Shares deals with diaspora hashtags for organic reach."}
                {p.id==="telegram"&&"Bot posts instantly to your channel. Best for real-time alerts."}
                {p.id==="whatsapp"&&"Broadcasts to Channel subscribers with affiliate links."}
              </p>
              {p.connected
                ?<button onClick={()=>setPlats(prev=>prev.map(pl=>pl.id===p.id?{...pl,connected:false}:pl))} style={{width:"100%",padding:"9px",border:`1px solid ${T.red}`,background:T.redBg,color:T.red,fontFamily:sg,fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:8}}>Disconnect</button>
                :<button onClick={()=>setModal(p)} style={{width:"100%",padding:"9px",border:`1px solid ${p.color}`,background:"transparent",color:p.color,fontFamily:sg,fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:8}}>Connect →</button>
              }
            </div>
          ))}
        </div>
      )}

      {tab==="log"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1px"}}>SYSTEM LOG</div>
            <button onClick={()=>setLog([])} style={{padding:"4px 12px",border:`1px solid ${T.dim}`,background:"transparent",color:T.lo,fontFamily:sg,fontSize:11,cursor:"pointer",borderRadius:6}}>Clear</button>
          </div>
          <div style={{background:T.navy,border:`1px solid ${T.dim}`,borderRadius:12,padding:"16px",height:380,overflowY:"auto"}}>
            {log.length===0?<div style={{fontFamily:sg,fontSize:13,color:T.lo}}>No activity yet</div>
            :log.map((l,i)=>(
              <div key={i} style={{fontFamily:mono,fontSize:11,lineHeight:"22px",color:l.type==="success"?T.green:l.type==="error"?T.red:l.type==="warning"?T.gold:T.lo}}>
                <span style={{color:T.ghost}}>[{l.t.toLocaleTimeString("en-GB")}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.raised,border:`2px solid ${modal.color}`,width:"100%",maxWidth:440,padding:28,borderRadius:18,animation:"fadeIn 0.2s ease-out"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:40,height:40,background:modal.color,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{modal.icon}</div>
              <div><div style={{fontFamily:sg,fontSize:16,fontWeight:700,color:T.hi}}>Connect {modal.name}</div><div style={{fontFamily:sg,fontSize:12,color:T.lo,marginTop:2}}>Auto-post deals to this channel</div></div>
              <button onClick={()=>setModal(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:T.lo,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            {["API Token / Access Key","Channel ID or Page ID"].map((l,i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div style={{fontFamily:sg,fontSize:12,color:T.lo,marginBottom:5}}>{l}</div>
                <input placeholder={i===0?"Paste your token…":"@channel or numeric ID"} style={{width:"100%",padding:"11px 14px",background:T.navy,border:`1px solid ${T.mid}`,borderRadius:10,color:T.hi,fontFamily:sg,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={()=>{setPlats(prev=>prev.map(p=>p.id===modal.id?{...p,connected:true}:p));addLog(`Connected: ${modal.name}`,"success");setModal(null);}} style={{width:"100%",padding:"13px",background:modal.color,border:"none",borderRadius:12,fontFamily:sg,fontSize:14,fontWeight:700,color:"#07111C",cursor:"pointer",marginTop:4}}>Connect & Activate</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────
function AboutPage({ go }) {
  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"52px 24px"}}>
      <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"2px",marginBottom:8}}>ABOUT</div>
      <h1 style={{fontFamily:sg,fontSize:32,fontWeight:700,color:T.hi,letterSpacing:"-1px",marginBottom:8}}>What is SkyAfrika?</h1>
      <p style={{fontFamily:sg,fontSize:16,color:T.lo,lineHeight:1.75,maxWidth:580,marginBottom:52}}>Africa's first dedicated flight aggregator — built for the diaspora, priced in your currency, covering six African corridors the big platforms underserve.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginBottom:48}}>
        {[{ic:"🎯",t:"Mission",d:"Make finding cheap flights across Africa as simple as a single search — Zimbabwe, South Africa, Nigeria, Egypt, Morocco, Algeria."},
          {ic:"🔍",t:"How it works",d:"We scan Travelpayouts, Skyscanner, Kayak, Booking.com, Ethiopian Airlines, Qatar Airways and more simultaneously."},
          {ic:"💱",t:"Your currency",d:"IP detection shows prices in GBP, NGN, ZAR, EGP, MAD or any of 13 currencies. Override any time."},
          {ic:"💰",t:"How we earn",d:"Free to use. Small affiliate commissions when you book. Prices are never inflated."},
        ].map(x=>(
          <div key={x.t} style={{background:T.card,border:`1px solid ${T.dim}`,borderRadius:16,padding:"26px"}}>
            <div style={{fontSize:26,marginBottom:12}}>{x.ic}</div>
            <div style={{fontFamily:sg,fontSize:15,fontWeight:600,color:T.hi,marginBottom:8}}>{x.t}</div>
            <div style={{fontFamily:sg,fontSize:13,color:T.lo,lineHeight:1.75}}>{x.d}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>go("contact")} style={{padding:"12px 28px",background:"linear-gradient(135deg,#E8A900,#F97316)",border:"none",borderRadius:10,fontFamily:sg,fontSize:14,fontWeight:600,color:"#07111C",cursor:"pointer"}}>Get in touch →</button>
    </div>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────
function ContactPage() {
  const [f,setF]=useState({name:"",email:"",message:""});
  const [sent,setSent]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const submit=()=>{
    if(!f.name||!f.email||!f.message)return;
    window.open(`mailto:contact@skyafrika.com?subject=Enquiry&body=${encodeURIComponent(`Name: ${f.name}\nEmail: ${f.email}\n\n${f.message}`)}`,"_blank");
    setSent(true);
  };
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"52px 24px"}}>
      <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"2px",marginBottom:8}}>CONTACT</div>
      <h1 style={{fontFamily:sg,fontSize:32,fontWeight:700,color:T.hi,letterSpacing:"-1px",marginBottom:8}}>Get in touch</h1>
      <p style={{fontFamily:sg,fontSize:15,color:T.lo,marginBottom:36}}>Questions, partnerships, affiliate applications.</p>
      {sent?(
        <div style={{background:T.greenBg,border:`1px solid ${T.green}30`,borderRadius:16,padding:"40px",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontFamily:sg,fontSize:16,fontWeight:600,color:T.green,marginBottom:6}}>Email client opened</div>
          <div style={{fontFamily:sg,fontSize:13,color:T.md}}>Or email contact@skyafrika.com directly.</div>
          <button onClick={()=>setSent(false)} style={{marginTop:16,padding:"9px 22px",border:`1px solid ${T.dim}`,borderRadius:8,background:"transparent",color:T.lo,fontFamily:sg,fontSize:12,cursor:"pointer"}}>Send another</button>
        </div>
      ):(
        <div style={{background:T.card,border:`1px solid ${T.dim}`,borderRadius:18,padding:"28px"}}>
          {[{l:"Your name *",k:"name",t:"text",p:"Full name"},{l:"Email *",k:"email",t:"email",p:"you@email.com"}].map(fld=>(
            <div key={fld.k} style={{marginBottom:14}}>
              <div style={{fontFamily:sg,fontSize:12,color:T.lo,marginBottom:5}}>{fld.l}</div>
              <input type={fld.t} value={f[fld.k]} onChange={e=>set(fld.k,e.target.value)} placeholder={fld.p} style={{width:"100%",padding:"12px 16px",background:T.navy,border:`1.5px solid ${f[fld.k]?T.mid:T.dim}`,borderRadius:10,color:T.hi,fontFamily:sg,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=f[fld.k]?T.mid:T.dim}/>
            </div>
          ))}
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:sg,fontSize:12,color:T.lo,marginBottom:5}}>Message *</div>
            <textarea value={f.message} onChange={e=>set("message",e.target.value)} placeholder="How can we help?" rows={5} style={{width:"100%",padding:"12px 16px",background:T.navy,border:`1.5px solid ${f.message?T.mid:T.dim}`,borderRadius:10,color:T.hi,fontFamily:sg,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",transition:"border-color 0.15s"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=f.message?T.mid:T.dim}/>
          </div>
          <button onClick={submit} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#E8A900,#F97316)",border:"none",borderRadius:12,fontFamily:sg,fontSize:14,fontWeight:600,color:"#07111C",cursor:"pointer",boxShadow:"0 6px 24px rgba(232,169,0,0.25)"}}>Send message →</button>
        </div>
      )}
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────
function Footer({ go }) {
  return (
    <footer style={{background:T.navy,borderTop:`1px solid ${T.dim}`,padding:"52px 24px 28px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:40}}>
          <div className="footer-brand">
            <div style={{fontFamily:mono,fontSize:18,fontWeight:700,color:T.hi,marginBottom:10}}>Sky<span style={{color:T.gold}}>Afrika</span></div>
            <p style={{fontFamily:sg,fontSize:13,color:T.lo,lineHeight:1.8,maxWidth:280,marginBottom:20}}>Africa's flight aggregator. One search across every platform. Prices in your local currency, automatically.</p>
          </div>
          <div>
            <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1.5px",marginBottom:14}}>NAVIGATE</div>
            {[["scanner","Search Flights"],["terminal","Live Deals"],["about","About"],["contact","Contact"]].map(([id,l])=>(
              <div key={id} onClick={()=>go(id)} style={{fontFamily:sg,fontSize:13,color:T.lo,marginBottom:9,cursor:"pointer",transition:"color 0.15s"}} onMouseEnter={e=>e.target.style.color=T.hi} onMouseLeave={e=>e.target.style.color=T.lo}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1.5px",marginBottom:14}}>CORRIDORS</div>
            {["Zimbabwe · SA","Nigeria · London","Egypt · Dubai","Morocco · Paris","Algeria · London","Cape Town · UK"].map(r=>(
              <div key={r} style={{fontFamily:sg,fontSize:13,color:T.lo,marginBottom:9}}>{r}</div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:mono,fontSize:10,color:T.gold,letterSpacing:"1.5px",marginBottom:14}}>PARTNERS</div>
            {["Travelpayouts","Skyscanner","Kayak","Booking.com","Ethiopian Air","Qatar Airways"].map(p=>(
              <div key={p} style={{fontFamily:sg,fontSize:13,color:T.lo,marginBottom:9}}>{p}</div>
            ))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${T.dim}`,paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:sg,fontSize:12,color:T.ghost}}>© 2026 SkyAfrika · skyafrika.vercel.app</div>
          <div style={{fontFamily:sg,fontSize:12,color:T.ghost}}>Affiliate commissions keep this free. Prices never inflated.</div>
        </div>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const { cur, setCur, det, detecting, toast, fmt } = useCurrency();
  const go = p => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };

  return (
    <div style={{ minHeight:"100vh", background:T.ink, color:T.md, fontFamily:sg }}>
      <style>{FONT_CSS}</style>

      {/* ── CURRENCY AUTO-DETECT TOAST ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          background:T.raised, border:`1px solid ${T.gold}`,
          borderRadius:14, padding:"14px 18px",
          display:"flex", alignItems:"center", gap:12,
          boxShadow:`0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,169,0,0.15)`,
          animation:"fadeIn 0.3s ease-out",
          maxWidth:280,
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:T.goldBg, border:`1px solid ${T.goldRing}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, flexShrink:0,
          }}>{toast.flag}</div>
          <div>
            <div style={{fontFamily:sg, fontSize:13, fontWeight:600, color:T.hi, marginBottom:2}}>
              Currency auto-set
            </div>
            <div style={{fontFamily:sg, fontSize:12, color:T.lo, lineHeight:1.4}}>
              Showing prices in <span style={{color:T.gold, fontWeight:700}}>{toast.code}</span> for {toast.country}
            </div>
          </div>
          <div style={{
            width:4, height:36, borderRadius:2,
            background:T.gold, flexShrink:0,
            boxShadow:`0 0 8px ${T.gold}`,
          }}/>
        </div>
      )}

      <Nav page={page} go={go} cur={cur} setCur={setCur} det={det} detecting={detecting} fmt={fmt}/>
      {page==="home"    && <HomePage go={go} fmt={fmt} detecting={detecting}/>}
      {page==="scanner" && <ScannerPage fmt={fmt} cur={cur} detecting={detecting}/>}
      {page==="terminal"&& <TerminalPage fmt={fmt}/>}
      {page==="about"   && <AboutPage go={go}/>}
      {page==="contact" && <ContactPage/>}
      <Footer go={go}/>
    </div>
  );
}

  
