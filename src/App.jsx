import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  ChevronDown, ChevronUp, X, Check, Info, MapPin, Globe, MessageCircle,
  Search, Bell, Clock, Settings, BarChart2, Users, Phone,
  List, Trophy, Star, PlusSquare, LayoutGrid, TrendingUp, Activity, Rocket
} from "lucide-react";

// ─── Design tokens ─────────────────────────────────────────────────────────────
var ORANGE  = "#FF5000";
var PURPLE  = "#3A2768";
var TEAL    = "#16A085";
var BLACK   = "#231F20";
var STEEL   = "#808080";
var NIGHT   = "#4D4D4D";
var BG_PAGE = "#FAFAFA";
var BG_BARE = "#F8F9FB";
var BORDER  = "#E3E6E8";

// ─── Status helpers ─────────────────────────────────────────────────────────────
var RANGES = [
  { label: "Well below average", min: 0,  max: 25,  textColor: "#BB003E", arcColor: "#FD0054", modalColor: "#9B0000" },
  { label: "Below average",      min: 26, max: 50,  textColor: "#7F6403", arcColor: "#EFBB06", modalColor: "#9B0000" },
  { label: "Competitive",        min: 51, max: 75,  textColor: "#52713E", arcColor: "#BDE12C", modalColor: "#267425" },
  { label: "Thryving",           min: 76, max: 100, textColor: "#267425", arcColor: "#36A635", modalColor: "#267425" },
];
function getRange(s) {
  return RANGES.find(function(r) { return s >= r.min && s <= r.max; }) || RANGES[0];
}

// ─── SVG arc math ──────────────────────────────────────────────────────────────
function polarToXY(cx, cy, r, deg) {
  var rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, startDeg, endDeg) {
  var s = polarToXY(cx, cy, r, startDeg);
  var e = polarToXY(cx, cy, r, endDeg);
  var large = (endDeg - startDeg) > 180 ? 1 : 0;
  return ["M", s.x, s.y, "A", r, r, 0, large, 1, e.x, e.y].join(" ");
}
// CCW arc from top: sweepDeg = how many degrees to fill counter-clockwise
function ccwArc(cx, cy, r, sweepDeg) {
  var s = polarToXY(cx, cy, r, 0); // always start at top (12 o'clock)
  var endDeg = (360 - sweepDeg % 360 + 360) % 360;
  var e = polarToXY(cx, cy, r, endDeg);
  var large = sweepDeg > 180 ? 1 : 0;
  return ["M", s.x, s.y, "A", r, r, 0, large, 0, e.x, e.y].join(" ");
}

// ─── Donut – full circle (160 px) ────────────────────────────────────────────
function Donut(props) {
  var score = props.score;
  var pts   = props.pts   || 0;
  var noTooltip = props.noTooltip || false;
  var size  = 160, cx = 80, cy = 80, r = 58, sw = 13;
  var range = getRange(score);
  var sweepDeg = (score / 100) * 360;

  var donutCore = (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth={sw} />
        {score > 0 && score < 100 && (
          <path d={ccwArc(cx, cy, r, sweepDeg)}
            fill="none" stroke={range.arcColor} strokeWidth={sw} strokeLinecap="round" />
        )}
        {score === 100 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={range.arcColor} strokeWidth={sw} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 42, lineHeight: "1", color: BLACK }}>{score}</span>
        <span style={{ fontFamily: "Open Sans,sans-serif", fontWeight: 400, fontSize: 12, lineHeight: "20px", color: NIGHT }}>out of 100</span>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {noTooltip ? donutCore : (
        <HoverTip text="Complete recommended actions to improve your score. A 76+ score reflects stronger visibility, and lead potential." position="bottom" maxWidth={220}>
          {donutCore}
        </HoverTip>
      )}
      {pts > 0 && (
        <div style={{ position: "absolute", top: 0, left: size - 8 }}>
          {noTooltip ? (
            <div style={{ background: TEAL, color: "#fff", fontSize: 12, fontWeight: 600, padding: "2px 6px", borderRadius: 100, whiteSpace: "nowrap", fontFamily: "Montserrat,sans-serif", lineHeight: "18px" }}>
              +{pts} pt
            </div>
          ) : (
            <HoverTip text="Change in score since your last update." position="top" maxWidth={200}>
              <div style={{ background: TEAL, color: "#fff", fontSize: 12, fontWeight: 600, padding: "2px 6px", borderRadius: 100, whiteSpace: "nowrap", fontFamily: "Montserrat,sans-serif", lineHeight: "18px", cursor: "default" }}>
                +{pts} pt
              </div>
            </HoverTip>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mini Donut – full circle (40 px) ────────────────────────────────────────
function MiniDonut(props) {
  var score = props.score;
  var size = 40, cx = 20, cy = 20, r = 14, sw = 4;
  var range = getRange(score);
  var sweepDeg = (score / 100) * 360;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth={sw} />
        {score > 0 && score < 100 && (
          <path d={ccwArc(cx, cy, r, sweepDeg)}
            fill="none" stroke={range.arcColor} strokeWidth={sw} strokeLinecap="round" />
        )}
        {score === 100 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={range.arcColor} strokeWidth={sw} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: BLACK }}>{score}</span>
      </div>
    </div>
  );
}

// ─── HoverTip ─────────────────────────────────────────────────────────────────
function HoverTip(props) {
  var [show, setShow] = useState(false);
  var p = props.position || "top";
  var mw = props.maxWidth || 220;
  var d = props.distance !== undefined ? props.distance : 4;
  var tipStyle = {
    position: "absolute", background: "#231F20", color: "#F8F9FB",
    padding: "8px 12px", borderRadius: 4, fontSize: 12, fontWeight: 500,
    fontFamily: "Montserrat,sans-serif", lineHeight: "16px", width: mw,
    zIndex: 300, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", whiteSpace: "normal", pointerEvents: "none",
  };
  var arrowBase = { position: "absolute", width: 0, height: 0 };
  var positions = {
    top:    { tip: { bottom: "calc(100% + " + d + "px)", left: "50%", transform: "translateX(-50%)" },   arrow: { top: "100%",    left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #231F20" } },
    bottom: { tip: { top:    "calc(100% + " + d + "px)", left: "50%", transform: "translateX(-50%)" },   arrow: { bottom: "100%", left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #231F20" } },
    right:  { tip: { left:   "calc(100% + " + d + "px)", top:  "50%", transform: "translateY(-50%)" },   arrow: { right: "100%",  top: "50%",  transform: "translateY(-50%)", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "6px solid #231F20" } },
    left:   { tip: { right:  "calc(100% + " + d + "px)", top:  "50%", transform: "translateY(-50%)" },   arrow: { left: "100%",   top: "50%",  transform: "translateY(-50%)", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "6px solid #231F20" } },
  };
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={function() { setShow(true); }}
      onMouseLeave={function() { setShow(false); }}>
      {props.children}
      {show && (
        <div style={Object.assign({}, tipStyle, positions[p].tip)}>
          {props.text}
          <div style={Object.assign({}, arrowBase, positions[p].arrow)} />
        </div>
      )}
    </div>
  );
}

// ─── Thryv logo (SVG) ─────────────────────────────────────────────────────────
function ThryvLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}>
      {/* Icon mark – simplified T in a pill shape */}
      <svg width={34} height={34} viewBox="0 0 34 34">
        <rect width={34} height={34} rx={8} fill={ORANGE} />
        <path d="M10 10 H24 M17 10 V26" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 17, color: BLACK, letterSpacing: "-0.5px" }}>thryv</span>
        <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 8.5, color: STEEL, letterSpacing: "0.5px", textTransform: "uppercase" }}>Marketing Center</span>
      </div>
    </div>
  );
}

// ─── Category badge ────────────────────────────────────────────────────────────
var CAT_CFG = {
  Listings: { color: "#005FCC", Icon: MapPin   },
  Social:   { color: "#BB003E", Icon: MessageCircle },
  Website:  { color: "#267425", Icon: Globe    },
  SEO:      { color: "#337285", Icon: Search   },
};
function CatBadge(props) {
  var c = CAT_CFG[props.cat] || { color: STEEL, Icon: MapPin };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: c.color, fontSize: 14, fontWeight: 600, fontFamily: "Montserrat,sans-serif" }}>
      <c.Icon size={14} />{props.cat}
    </span>
  );
}

// ─── Onboarding icon (styled circle per category) ────────────────────────────
var OB_CFG = [
  { bg: "#E8F0FE", fg: "#005FCC", Icon: MapPin,         cat: "Listings" },
  { bg: "#FCE4EC", fg: "#BB003E", Icon: MessageCircle,  cat: "Social"   },
  { bg: "#E8F5E9", fg: "#267425", Icon: Globe,          cat: "Website"  },
  { bg: "#E0F2F1", fg: "#337285", Icon: Phone,          cat: "SEO"      },
];
function ObIcon(props) {
  var cfg = OB_CFG[props.idx] || OB_CFG[0];
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <cfg.Icon size={26} color={cfg.fg} strokeWidth={1.8} />
    </div>
  );
}

// ─── Teal check circle ─────────────────────────────────────────────────────────
function CheckCircle() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx={12} cy={12} r={12} fill={TEAL} />
      <path d="M7 12.5l3.2 3.2L17 8.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Locked illustration (SVG) ────────────────────────────────────────────────
function LockedIllustration() {
  return (
    <div style={{ width: 248, height: 82, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Stacked card mockups */}
      {[{ top: 6, left: 24, w: 170, opacity: 0.35 }, { top: 16, left: 16, w: 185, opacity: 0.55 }, { top: 26, left: 8, w: 200, opacity: 0.8 }].map(function(c, i) {
        return (
          <div key={i} style={{ position: "absolute", top: c.top, left: c.left, width: c.w, height: 46, background: "#fff", border: "1px solid " + BORDER, borderRadius: 8, opacity: c.opacity, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ margin: "8px 12px", height: 8, background: BORDER, borderRadius: 4, width: "60%" }} />
            <div style={{ margin: "4px 12px", height: 6, background: BORDER, borderRadius: 4, width: "80%" }} />
          </div>
        );
      })}
      {/* Lock badge */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 44, height: 44, borderRadius: "50%", background: "#334276", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={20} height={24} viewBox="0 0 20 24" fill="none">
          <rect x={2} y={10} width={16} height={13} rx={2} fill="#fff" />
          <path d="M5 10V8a5 5 0 0 1 10 0v2" stroke="#fff" strokeWidth={2.5} fill="none" />
          <circle cx={10} cy={16} r={2} fill="#334276" />
        </svg>
      </div>
    </div>
  );
}

// ─── Modal overlay ─────────────────────────────────────────────────────────────
function Overlay(props) {
  return (
    <div onClick={props.onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={function(e) { e.stopPropagation(); }}>{props.children}</div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
      <circle cx={9} cy={9} r={7} fill="none" stroke="#D0D0D0" strokeWidth={2.5} />
      <path d="M 9 2 A 7 7 0 0 1 16 9" fill="none" stroke={STEEL} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

// ─── Sidebar nav icon map (lucide) ────────────────────────────────────────────
var NAV_CFG = [
  { label: "Overview",               Icon: LayoutGrid    },
  { label: "Digital Marketing Score",Icon: TrendingUp    },
  { label: "Analytics",              Icon: BarChart2     },
  { label: "Leads",                  Icon: Users         },
  { label: "Social",                 Icon: MessageCircle },
  { label: "Website",                Icon: Globe         },
  { label: "Trackable Phone Number", Icon: Phone         },
  { label: "Listings management",    Icon: List          },
  { label: "Competitor Ranking",     Icon: Trophy        },
  { label: "Reputation",             Icon: Star          },
  { label: "Add-ons",                Icon: PlusSquare    },
  { label: "Settings",               Icon: Settings      },
];

// ─── Data ──────────────────────────────────────────────────────────────────────
var ONBOARDING = [
  { id: 1, iconIdx: 0, title: "Get listed on 16+ publishers",          desc: "Update once, and we'll keep your info consistent everywhere clients search."   },
  { id: 2, iconIdx: 1, title: "Create posts your clients want to see", desc: "We'll suggest topics that fit your business and help prepare engaging content." },
  { id: 3, iconIdx: 2, title: "Get a faster, mobile-ready website",    desc: "We'll optimize your site so it loads quickly and looks great on any device."   },
  { id: 4, iconIdx: 3, title: "Try creating a Trackable Phone Number", desc: "Track which marketing efforts are driving calls to your business."             },
];

var BREAKDOWN = [
  { cat: "Listings", score: 35, desc: "Scored on Google business profile completeness, directory consistency, review responses, and local posts." },
  { cat: "Website",  score: 45, desc: "Scored on site performance, content quality, and backlink health. A slow or spammy site signals to search engines that you're not worth surfacing." },
  { cat: "Social",   score: 50, desc: "Scored on connected platforms and posting frequency. An inactive presence can cost you the job before the conversation starts." },
  { cat: "SEO",      score: 38, desc: "Scored on heading quality, keywords, backlinks, and site optimization." },
];

var ACTIONS = [
  { id:1, title:"Add photos to your Google Business Profile",   desc:"Photos help customers see what makes your business special and increase click-through rates.",  cat:"Listings", cta:"Start now"   },
  { id:2, title:"Respond to your 3 most recent reviews",        desc:"Responding to reviews shows you value customer feedback and builds trust with new clients.",   cat:"Listings", cta:"Start now"   },
  { id:3, title:"Create a Facebook post this week",             desc:"Regular social posts keep your audience engaged and signal activity to search engines.",       cat:"Social",   cta:"Start now"   },
  { id:4, title:"Fix broken links on your website",             desc:"Broken links hurt user experience and reduce your search ranking.",                            cat:"Website",  cta:"Get started" },
  { id:5, title:"Add your business to 3 more directories",      desc:"More consistent listings across directories improve your local search visibility.",            cat:"SEO",      cta:"Start now"   },
  { id:6, title:"Update your business description",             desc:"A well-written description helps customers understand your business and improves rankings.",   cat:"SEO",      cta:"Start now"   },
];

var COMPLETED_ACTIONS = [
  { date: "2/8/2026", title: "Get listed on 16+ publishers",       desc: "Update once, and we'll keep your info consistent everywhere clients search.", cat: "Listings" },
  { date: "2/8/2026", title: "Create posts your clients want to see", desc: "We'll suggest topics that fit your business and help prepare engaging content.", cat: "Social" },
  { date: "2/8/2026", title: "Get a faster, mobile-ready website",   desc: "We'll optimize your site so it loads quickly and looks great on any device.", cat: "Website" },
  { date: "2/8/2026", title: "Update your SEO keywords",             desc: "Keep your search terms current to stay visible in local search results.", cat: "SEO" },
];

// Maps onboarding item id → category
var OB_CAT = { 1: "Listings", 2: "Social", 3: "Website", 4: "SEO" };

var SCAN_SECTIONS = [
  { id:"dms", title:"Digital Marketing Score analysis", what:"A score showing how you're performing across listings, website, social and SEO.", why:"See where you stand and how you can help your business attract more clients.", listLabel:"Dashboard", listItems:["Your business's overall Digital Marketing Score","Individual performance breakdowns for listings, website, social and SEO","Prioritized actions to improve"] },
  { id:"cr",  title:"Competitor Ranking report",        what:"Your ranking against competitors and a detailed view of where you stand in your market.", why:"Identify who outranks you and why, so you can focus on what will make you more competitive.", listLabel:"Competitor Ranking", listItems:["Your ranking across 25 data points","Top competitors in your area","Key performance metrics"] },
];

var HISTORY_BASE = [{ date: "08 Jun", score: 42 }];

var CONFETTI = [
  {c:"#E53935",t:5,l:8,r:37},{c:"#1565C0",t:12,l:22,r:74},{c:"#43A047",t:8,l:38,r:111},
  {c:"#FDD835",t:18,l:55,r:148},{c:"#E91E63",t:6,l:70,r:185},{c:"#00ACC1",t:14,l:85,r:222},
  {c:"#E53935",t:3,l:95,r:259},{c:"#1565C0",t:20,l:10,r:296},{c:"#43A047",t:16,l:30,r:333},
  {c:"#FDD835",t:9,l:50,r:15},{c:"#E91E63",t:22,l:65,r:52},{c:"#00ACC1",t:7,l:78,r:89},
];

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DMS() {
  var [score, setScore]     = useState(42);
  var [prevScore, setPrev]  = useState(null);
  var [phase, setPhase]     = useState("idle");
  var [kw, setKw]           = useState("Plumbers near me");
  var [vm, setVm]           = useState("donut");
  var [tab, setTab]         = useState("recommendations");
  var [bdO, setBdO]         = useState(false);
  var [bdC, setBdC]         = useState(null);
  var [showR, setShowR]     = useState(false);
  var [showCon, setShowCon] = useState(false);
  var [showSU, setShowSU]   = useState(false);
  var [toast, setToast]     = useState(null);
  var [obD, setObD]         = useState([]);
  var [actD, setActD]       = useState([]);
  var [exS, setExS]         = useState(null);
  var [showVmMenu, setShowVmMenu] = useState(false);
  var [scannedToday, setScannedToday] = useState(false);
  var [showScanLimit, setShowScanLimit] = useState(false);
  var [showLoadingModal, setShowLoadingModal] = useState(false);
  var [histItems, setHistItems] = useState([]);
  var [breakdown, setBreakdown] = useState(BREAKDOWN);

  // Always-fresh ref so setTimeout closures see latest state
  var latestRef = useRef({});
  latestRef.current = { obD: obD, actD: actD, score: score, breakdown: breakdown };

  var range      = getRange(score);
  var pts        = prevScore !== null ? score - prevScore : 0;
  var allOb      = obD.length >= ONBOARDING.length;
  var isGen      = phase === "gen";
  var isUpd      = phase === "upd";
  var pendingOb  = ONBOARDING.filter(function(i) { return obD.indexOf(i.id) === -1; });

  function sT(msg, sub) { setToast({ msg, sub: sub || "" }); setTimeout(function() { setToast(null); }, 3500); }

  function cOB(id) {
    setObD(function(prev) {
      var next = prev.concat([id]);
      var item = ONBOARDING.find(function(i) { return i.id === id; });
      sT("Recommended action completed!", item ? item.title : "");
      if (item) {
        setHistItems(function(h) { return [{ date: "Jun 11, 2026", title: item.title, desc: item.desc }].concat(h); });
      }
      if (next.length === ONBOARDING.length) { setTimeout(function() { setShowCon(true); }, 400); }
      return next;
    });
  }

  useEffect(function() {
    if (phase === "gen") {
      var t = setTimeout(function() {
        var latest = latestRef.current;
        // Calculate new category scores based on completed items
        var newBreakdown = latest.breakdown.map(function(item) {
          var completions = 0;
          latest.obD.forEach(function(id) { if (OB_CAT[id] === item.cat) completions++; });
          latest.actD.forEach(function(id) {
            var action = ACTIONS.find(function(a) { return a.id === id; });
            if (action && action.cat === item.cat) completions++;
          });
          var increase = 0;
          for (var i = 0; i < completions; i++) {
            increase += Math.floor(Math.random() * 3) + 1;
          }
          return Object.assign({}, item, { score: Math.min(100, item.score + increase) });
        });
        var newOverall = Math.round(newBreakdown.reduce(function(sum, i) { return sum + i.score; }, 0) / newBreakdown.length);
        setBreakdown(newBreakdown);
        setPrev(latest.score);
        setScore(newOverall);
        setShowLoadingModal(false);
        setScannedToday(true);
        if (newOverall > latest.score) setShowSU(true);
        setPhase("upd");
      }, 10000);
      return function() { clearTimeout(t); };
    }
    if (phase === "upd") {
      var t2 = setTimeout(function() { setPhase("idle"); }, 1500);
      return function() { clearTimeout(t2); };
    }
  }, [phase]);

  function getMotivationalText(count) {
    if (count === 0) return "Great things start with a single step. This is yours!";
    if (count === 1) return "Small starts can lead to big results!";
    if (count === ONBOARDING.length - 1) return "You're one step away from finishing what you started!";
    return "Keep up the good work!";
  }

  var bPrimary = { background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Open Sans,sans-serif" };
  var bOutline = { border: "1px solid " + ORANGE, color: ORANGE, background: "#fff", borderRadius: 4, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Open Sans,sans-serif" };
  var bGhost   = { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: STEEL, padding: "8px 16px", fontFamily: "Open Sans,sans-serif" };

  return (
    <div style={{ fontFamily: "Open Sans,sans-serif", background: BG_PAGE, minHeight: "100vh", display: "flex", flexDirection: "column", fontSize: 14, color: BLACK, minWidth: 1100 }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }"}</style>

      {/* ── Top nav ── */}
      <header style={{ height: 66, background: "#fff", borderBottom: "1px solid " + BORDER, display: "flex", alignItems: "center", padding: "0 24px 0 0", flexShrink: 0, zIndex: 20 }}>
        {/* Waffle */}
        <div style={{ width: 52, height: 66, borderRight: "1px solid " + BORDER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,4px)", gap: 3 }}>
            {Array(9).fill(0).map(function(_,i) { return <div key={i} style={{ width: 4, height: 4, background: BLACK, borderRadius: 1 }} />; })}
          </div>
        </div>
        <div style={{ flex: 1 }} />

        {/* Bell */}
        <div style={{ position: "relative", width: 34, height: 34, marginRight: 20, cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: BORDER, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={18} color={BLACK} />
          </div>
          <div style={{ position: "absolute", top: 2, right: 0, background: "#FC5120", borderRadius: 100, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", fontFamily: "Montserrat,sans-serif" }}>9</span>
          </div>
        </div>
        {/* Clock */}
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: BORDER, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 20, cursor: "pointer" }}>
          <Clock size={18} color={BLACK} />
        </div>
        {/* Help */}
        <div style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.82)", borderRadius: 12, height: 24, display: "flex", alignItems: "center", padding: "4px 10px", cursor: "pointer", marginRight: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "Montserrat,sans-serif", color: "rgba(0,0,0,0.82)", whiteSpace: "nowrap" }}>? Help</span>
        </div>
        {/* Avatar */}
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "Open Sans,sans-serif" }}>JF</span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar ── */}
        <aside style={{ width: 244, background: "#fff", borderRight: "1px solid " + BORDER, padding: "8px 0", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "4px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: NIGHT, fontWeight: 600, fontFamily: "Montserrat,sans-serif" }}>Marketing Center</span>
            <div style={{ border: "1px solid " + BORDER, borderRadius: 99, padding: 4, display: "flex", cursor: "pointer" }}>
              <ChevronDown size={14} color={STEEL} style={{ transform: "rotate(90deg)" }} />
            </div>
          </div>
          {NAV_CFG.map(function(item) {
            var active = item.label === "Digital Marketing Score";
            return (
              <div key={item.label} style={{ padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: active ? "#F6DCD0" : "transparent", borderRadius: 4, margin: "1px 8px" }}>
                <item.Icon size={16} color={active ? PURPLE : STEEL} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "Montserrat,sans-serif", color: active ? PURPLE : STEEL, lineHeight: "18px" }}>{item.label}</span>
              </div>
            );
          })}
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, padding: "24px 24px 48px", overflowY: "auto" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 600, fontFamily: "Montserrat,sans-serif", color: BLACK, lineHeight: "32px" }}>Digital Marketing Score</h1>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", paddingTop: 8 }}>

            {/* ── Score card ── */}
            <div style={{ maxWidth: 340, width: "100%", flexShrink: 0, background: "#fff", borderRadius: 10, boxShadow: "0px 2px 4px rgba(0,0,0,0.25)" }}>

              {(
                <div style={{ padding: "24px 24px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 20, fontFamily: "Montserrat,sans-serif", color: BLACK, lineHeight: "26px" }}>Your score</span>
                    {prevScore !== null && (
                      <div style={{ position: "relative" }}>
                        {showVmMenu && <div onClick={function() { setShowVmMenu(false); }} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
                        <button
                          onClick={function() { setShowVmMenu(!showVmMenu); }}
                          style={{ background: "#F6F8FF", border: "1px solid #6774A9", borderRadius: 16, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, position: "relative", zIndex: 100 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#3D5199", fontFamily: "Montserrat,sans-serif", lineHeight: "14px" }}>{vm === "donut" ? "Last updated" : "Last 90 days"}</span>
                          <ChevronDown size={10} color="#3D5199" />
                        </button>
                        {showVmMenu && (
                          <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #E3E6E8", zIndex: 100, minWidth: 140, overflow: "hidden" }}>
                            {[{label:"Last updated",val:"donut"},{label:"Last 90 days",val:"chart"}].map(function(opt) {
                              return (
                                <div key={opt.val} onClick={function() { setVm(opt.val); setShowVmMenu(false); }} style={{ padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Montserrat,sans-serif", fontWeight: vm === opt.val ? 600 : 400, color: vm === opt.val ? "#3A2768" : "#231F20", background: vm === opt.val ? "#F6DCD0" : "#fff" }}>
                                  {opt.label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {vm === "donut" ? (
                    <div style={{ paddingTop: 24 }}>
                      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>
                        <Donut score={score} pts={pts} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", paddingBottom: 24 }}>
                        <button onClick={function() { setShowR(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: range.textColor, fontWeight: 600, fontSize: 12, padding: 0, display: "flex", alignItems: "center", gap: 2, fontFamily: "Montserrat,sans-serif" }}>
                            {range.label} <ChevronDown size={12} color={range.textColor} style={{ transform: "rotate(-90deg)" }} />
                          </button>
                        {pts > 0 && (
                          <div style={{ fontWeight: 600, fontSize: 16, fontFamily: "Montserrat,sans-serif", color: BLACK }}>Your score went up!</div>
                        )}
                        <div style={{ color: BLACK, fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontFamily: "Open Sans,sans-serif" }}>
                          {prevScore !== null ? "Last updated Jun 11, 2026" : "Generated Jun 8, 2026"}
                          <HoverTip text="You can update your score up to three times per month, so give your changes time to take effect between updates." position="top" maxWidth={220}>
                            <Info size={13} color={STEEL} style={{ cursor: "default" }} />
                          </HoverTip>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ paddingTop: 16, paddingBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, paddingBottom: 8 }}>
                        <HoverTip text="Complete recommended actions to improve your score. A 76+ score reflects stronger visibility, and lead potential." position="right" maxWidth={220}>
                          <div style={{ fontSize: 28, fontWeight: 600, color: BLACK, fontFamily: "Montserrat,sans-serif", cursor: "default", lineHeight: "32px" }}>{score}</div>
                        </HoverTip>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 2, alignItems: "flex-start" }}>
                          {pts > 0 && (
                            <HoverTip text="Change in score since your last update." position="right" maxWidth={200} distance={0}>
                              <div style={{ background: TEAL, color: "#fff", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 100, display: "inline-block", fontFamily: "Montserrat,sans-serif", lineHeight: "18px", width: "fit-content", cursor: "default" }}>+{pts} pt</div>
                            </HoverTip>
                          )}
                          <button onClick={function() { setShowR(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: range.textColor, fontWeight: 600, fontSize: 12, padding: 0, fontFamily: "Montserrat,sans-serif", display: "flex", alignItems: "center", gap: 2, lineHeight: "18px" }}>
                            {range.label} <span style={{ fontSize: 14 }}>›</span>
                          </button>
                          <div style={{ color: BLACK, fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontFamily: "Open Sans,sans-serif" }}>
                            Last updated Jun 11, 2026
                            <HoverTip text="You can update your score up to three times per month, so give your changes time to take effect between updates." position="top" maxWidth={220}>
                              <Info size={13} color={STEEL} style={{ cursor: "default" }} />
                            </HoverTip>
                          </div>
                        </div>
                      </div>
                      <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={prevScore !== null ? HISTORY_BASE.concat([{ date: "11 Jun", score: score }]) : HISTORY_BASE} margin={{ top:4, right:8, bottom:4, left:0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#EBEBEB" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize:11, fill:NIGHT, fontFamily:"Open Sans,sans-serif" }} tickLine={false} axisLine={false} />
                            <YAxis domain={[0,100]} width={28} tick={{ fontSize:11, fill:NIGHT, fontFamily:"Open Sans,sans-serif" }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius:6, border:"1px solid "+BORDER, fontSize:12 }} formatter={function(v) { return [v,"Score"]; }} />
                            <Line type="monotone" dataKey="score" stroke="#1565C0" strokeWidth={2} dot={{ r:4, fill:"#1565C0", strokeWidth:0 }} activeDot={{ r:5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div style={{ paddingBottom: 24 }}>
                    {(isGen || isUpd) ? (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:BG_BARE, borderRadius:30, padding:"10px 24px", margin:"0 auto", width:"fit-content" }}>
                        <Spinner /><span style={{ fontSize:12, color:STEEL }}>Updating score...</span>
                      </div>
                    ) : (
                      <div style={{ display:"flex", justifyContent:"center" }}>
                        <button onClick={function() { if (scannedToday) { setShowScanLimit(true); } else { setPhase("m1"); } }} style={bOutline}>Run scan</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Score breakdown toggle ──
                  Figma: bg-[#f8f9fb] border-t, header: justify-center gap-24 px-24 py-8 */}
              <button
                onClick={function() { setBdO(!bdO); if (bdO) setBdC(null); }}
                style={{ width:"100%", background:BG_BARE, borderTop:"1px solid "+BORDER, border:"none", borderLeft:"none", borderRight:"none", borderBottom:"none", cursor:"pointer", outline:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:"8px 24px" }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                    <span style={{ fontWeight:600, fontSize:12, fontFamily:"Montserrat,sans-serif", color:BLACK, whiteSpace:"nowrap" }}>Score breakdown</span>
                    <HoverTip text="Your overall score reflects your performance across Listings, Website, Social and SEO." position="top" maxWidth={200}>
                      <Info size={14} color={STEEL} style={{ cursor: "default" }} />
                    </HoverTip>
                  </div>
                  {bdO ? <ChevronUp size={16} color={STEEL} /> : <ChevronDown size={16} color={STEEL} />}
                </div>
              </button>

              {/* ── Breakdown list ──
                  Figma: outer bg-[#f8f9fb], list bg-[#f8f9fb] gap-4 pb-16 px-24
                  Each item: bg-white border rounded-8 px-12 py-8 */}
              {bdO && (
                <div style={{ background: BG_BARE, paddingBottom: 16 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, padding:"0 24px" }}>
                    {breakdown.map(function(item) {
                      var isOpen = bdC === item.cat;
                      return (
                        <div key={item.cat} style={{ background:"#fff", border:"1px solid "+BORDER, borderRadius:8, overflow:"hidden" }}>
                          <button
                            onClick={function() { setBdC(isOpen ? null : item.cat); }}
                            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"#fff", border:"none", cursor:"pointer", outline:"none" }}>
                            <CatBadge cat={item.cat} />
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {!isOpen && <MiniDonut score={item.score} />}
                              {isOpen ? <ChevronUp size={14} color={STEEL} /> : <ChevronDown size={14} color={STEEL} />}
                            </div>
                          </button>
                          {isOpen && (
                            <div style={{ padding:"0 12px 12px" }}>
                              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, margin:"12px 0 10px" }}>
                                <MiniDonut score={item.score} />
                                <button onClick={function() { setShowR(true); }} style={{ background:"none", border:"none", cursor:"pointer", color:getRange(item.score).textColor, fontWeight:600, fontSize:12, padding:0, display:"flex", alignItems:"center", gap:2, fontFamily:"Montserrat,sans-serif" }}>
                                    {getRange(item.score).label} <span style={{ fontSize:14 }}>›</span>
                                  </button>
                              </div>
                              <div style={{ padding:"10px 0" }}>
                                <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                                  <Activity size={16} color={STEEL} />
                                  <span style={{ fontSize:12, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK }}>What this measures</span>
                                </div>
                                <p style={{ margin:0, fontSize:12, color:BLACK, lineHeight:"18px", fontFamily:"Open Sans,sans-serif" }}>{item.desc}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right panel ── */}
            <div style={{ flex:1, minWidth:0 }}>
              {/* Tab bar */}
              <div style={{ background:BG_PAGE, borderBottom:"1px solid "+BORDER, display:"flex", alignItems:"flex-start", position:"sticky", top:0, zIndex:5 }}>
                {[{key:"recommendations",label:"Recommendations"},{key:allOb?"completed":"history",label:allOb?"Completed":"History"}].map(function(t) {
                  var active = tab === t.key;
                  return (
                    <div key={t.key} onClick={function() { setTab(t.key); }} style={{ height:46, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px 24px", cursor:"pointer", borderBottom:active?"4px solid "+ORANGE:"4px solid transparent", userSelect:"none" }}>
                      <span style={{ fontWeight:600, fontSize:14, fontFamily:"Montserrat,sans-serif", color:active?BLACK:STEEL, lineHeight:"20px" }}>{t.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations */}
              {tab === "recommendations" && (
                <div style={{ padding:"16px 4px 0", display:"flex", flexDirection:"column", gap:16 }}>

                  {/* Get Started — only while pending items exist */}
                  {!allOb && pendingOb.length > 0 && (
                    <div style={{ background:"#fff", borderRadius:10, boxShadow:"0px 2px 4px rgba(0,0,0,0.25)", overflow:"hidden" }}>
                      <div style={{ background:"rgba(83,120,252,0.1)", border:"1px solid rgba(83,120,252,0.1)", borderRadius:8, overflow:"hidden" }}>
                        {/* Purple header */}
                        <div style={{ background:PURPLE, padding:"12px 24px", display:"flex", flexDirection:"column", gap:12 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <div style={{ color:"#fff", fontWeight:600, fontSize:24, fontFamily:"Montserrat,sans-serif", lineHeight:"32px" }}>Get started</div>
                              <div style={{ color:"rgba(255,255,255,.7)", fontSize:12, fontFamily:"Open Sans,sans-serif", lineHeight:"18px" }}>Complete these steps to get personalized recommendations.</div>
                            </div>
                            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                              <span style={{ color:"#fff", fontWeight:600, fontSize:24, fontFamily:"Montserrat,sans-serif", lineHeight:"32px" }}>{obD.length}</span>
                              <span style={{ color:BORDER, fontWeight:600, fontSize:14, fontFamily:"Montserrat,sans-serif" }}>of {ONBOARDING.length}</span>
                            </div>
                          </div>
                          <div style={{ background:"#D9D9D9", borderRadius:6, height:8, overflow:"hidden" }}>
                            <div style={{ background:"linear-gradient(90deg, #3D5199, #FF5000)", height:"100%", width:((obD.length/ONBOARDING.length)*100)+"%", borderRadius:6, transition:"width .35s" }} />
                          </div>
                        </div>
                        {/* Banner */}
                        <div style={{ display:"flex", gap:8, alignItems:"center", padding:"8px 24px" }}>
                          <Rocket size={14} color={PURPLE} style={{ flexShrink:0 }} />
                          <span style={{ fontSize:12, fontWeight:600, color:PURPLE, fontFamily:"Montserrat,sans-serif", lineHeight:"18px" }}>{getMotivationalText(obD.length)}</span>
                        </div>
                      </div>
                      {/* Items */}
                      <div style={{ padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:8 }}>
                        {pendingOb.map(function(item, idx) {
                          return (
                            <div key={item.id} style={{ background:"#fff", border:"1px solid "+BORDER, borderRadius:8, padding:16, display:"flex", gap:24, alignItems:"center" }}>
                              <ObIcon idx={item.iconIdx} />
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontWeight:600, fontSize:16, fontFamily:"Montserrat,sans-serif", color:BLACK, marginBottom:4, lineHeight:"22px" }}>{item.title}</div>
                                <div style={{ fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>{item.desc}</div>
                              </div>
                              <button onClick={function() { cOB(item.id); }} style={Object.assign({}, idx===0?bPrimary:bOutline, { flexShrink:0, whiteSpace:"nowrap", width:142 })}>
                                Start now
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommended actions */}
                  <div style={{ background:"#fff", borderRadius:10, boxShadow:"0px 2px 4px rgba(0,0,0,0.25)", overflow:"hidden" }}>
                    {allOb ? (
                      <div>
                        <div style={{ background:PURPLE, padding:"12px 24px" }}>
                          <div style={{ color:"#fff", fontWeight:600, fontSize:24, fontFamily:"Montserrat,sans-serif", lineHeight:"32px", marginBottom:2 }}>Recommended actions</div>
                          <div style={{ color:"rgba(255,255,255,.7)", fontSize:12, fontFamily:"Open Sans,sans-serif", lineHeight:"18px" }}>Personalized recommendations to help you grow your business.</div>
                        </div>
                        <div style={{ padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:8 }}>
                          {ACTIONS.filter(function(a) { return actD.indexOf(a.id)===-1; }).length===0 ? (
                            <div style={{ padding:"32px 0", textAlign:"center", color:STEEL, fontSize:14 }}>All recommended actions completed! 🎉</div>
                          ) : ACTIONS.filter(function(a) { return actD.indexOf(a.id)===-1; }).map(function(action, idx) {
                            return (
                              <div key={action.id} style={{ background:"#fff", border:"1px solid "+BORDER, borderRadius:8, padding:16, display:"flex", gap:24, alignItems:"center" }}>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ marginBottom:4 }}>
                                  <HoverTip text={"Completing this action item will contribute to increasing your " + action.cat + " score, one of the four major categories that impact your Digital Marketing Score."} position="right" maxWidth={260}>
                                    <CatBadge cat={action.cat} />
                                  </HoverTip>
                                </div>
                                  <div style={{ fontWeight:600, fontSize:16, fontFamily:"Montserrat,sans-serif", color:BLACK, marginBottom:4, lineHeight:"22px" }}>{action.title}</div>
                                  <div style={{ fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>{action.desc}</div>
                                </div>
                                <button
                                  onClick={function() { setActD(actD.concat([action.id])); sT("Action completed!", action.title); setHistItems(function(h) { return [{ date: "Jun 11, 2026", title: action.title, desc: action.desc, cat: action.cat }].concat(h); }); }}
                                  style={Object.assign({}, idx===0?bPrimary:bOutline, { flexShrink:0, width:142 })}>
                                  Start now
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding:24, display:"flex", flexDirection:"column", gap:24 }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:24, fontFamily:"Montserrat,sans-serif", color:BLACK, lineHeight:"32px" }}>Recommended actions</div>
                          <div style={{ fontSize:14, color:BLACK, lineHeight:"20px", marginTop:6, fontFamily:"Open Sans,sans-serif" }}>Personalized recommendations to help you grow your business.</div>
                        </div>
                        <div style={{ background:BG_BARE, borderRadius:8, padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                          <div style={{ fontWeight:600, fontSize:18, fontFamily:"Montserrat,sans-serif", color:BLACK, lineHeight:"26px", textAlign:"center" }}>Complete onboarding to unlock</div>
                          <LockedIllustration />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History empty state */}
              {tab === "history" && histItems.length === 0 && (
                <div style={{ padding:"16px 4px" }}>
                  <div style={{ background:"#fff", borderRadius:16, boxShadow:"0px 2px 2px rgba(0,0,0,0.25)", padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center" }}>
                    <div style={{ width:80, height:80, borderRadius:"50%", background:"#FFF0E8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>📈</div>
                    <div style={{ fontWeight:600, fontSize:20, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Track your progress</div>
                    <div style={{ fontSize:16, color:BLACK, lineHeight:"22px", fontFamily:"Open Sans,sans-serif", maxWidth:360 }}>Complete your recommended actions to grow your business and improve your score.</div>
                    <button onClick={function() { setTab("recommendations"); }} style={Object.assign({}, bOutline, { width:142 })}>Get started</button>
                  </div>
                </div>
              )}

              {/* Completed/History — timeline */}
              {(tab === "completed" || tab === "history") && histItems.length > 0 && (
                <div style={{ padding:"16px 4px" }}>
                  {histItems.map(function(item, idx) {
                    var isLast = idx===histItems.length-1;
                    return (
                      <div key={idx} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                        <div style={{ width:24, display:"flex", flexDirection:"column", alignItems:"center", alignSelf:"stretch", flexShrink:0 }}>
                          <div style={{ width:2, height:8, background:idx===0?"transparent":BORDER }} />
                          <CheckCircle />
                          {!isLast && <div style={{ flex:1, width:2, background:BORDER, minHeight:8 }} />}
                        </div>
                        <div style={{ flex:1, paddingBottom:16, minWidth:0 }}>
                          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0px 2px 2px rgba(0,0,0,0.25)", padding:16 }}>
                            <div style={{ fontSize:12, color:STEEL, marginBottom:8, fontFamily:"Open Sans,sans-serif" }}>{item.date}</div>
                            {item.cat && <div style={{ marginBottom:6 }}><CatBadge cat={item.cat} /></div>}
                            <div style={{ fontWeight:600, fontSize:16, fontFamily:"Montserrat,sans-serif", color:BLACK, marginBottom:4, lineHeight:"22px" }}>{item.title}</div>
                            <div style={{ fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>{item.desc}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ textAlign:"center", padding:"12px 64px", fontSize:12, fontWeight:600, color:STEEL, fontFamily:"Montserrat,sans-serif" }}>
                    This view shows completed actions from the last 30 days.
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ══ Score Ranges modal ══ */}
      {showR && (
        <Overlay onClose={function() { setShowR(false); }}>
          <div style={{ background:"#fff", borderRadius:8, width:460, padding:"28px 32px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Score ranges</h2>
              <button onClick={function() { setShowR(false); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><X size={20} color={STEEL} /></button>
            </div>
            {RANGES.map(function(r,i) {
              return (
                <div key={i} style={{ marginBottom:8, border:"1px solid "+BORDER, borderRadius:8, overflow:"hidden" }}>
                  {r.label==="Thryving" && <div style={{ background:"#267425", color:"#fff", padding:"7px 16px", fontSize:12, fontWeight:600, fontFamily:"Montserrat,sans-serif" }}>🎯 Aim for this range</div>}
                  <div style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <span style={{ color:r.modalColor, fontWeight:600, fontSize:14, fontFamily:"Montserrat,sans-serif" }}>{r.label}</span>
                      <span style={{ color:r.modalColor, fontWeight:600, fontSize:14, fontFamily:"Montserrat,sans-serif" }}>{r.min} – {r.max}</span>
                    </div>
                    <p style={{ margin:0, fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>
                      {r.label==="Well below average"&&"This range reflects very low visibility in search results, and your business may not appear on maps."}
                      {r.label==="Below average"&&"This range reflects low visibility in search results, and your business may appear less on maps."}
                      {r.label==="Competitive"&&"This range reflects moderate visibility in search results, and your business likely appears on maps."}
                      {r.label==="Thryving"&&"This range reflects high visibility in search results, and your business likely appears on maps more often."}
                    </p>
                  </div>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:18 }}>
              <button onClick={function() { setShowR(false); }} style={bPrimary}>Back</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Scan step 1 */}
      {phase==="m1" && (
        <Overlay onClose={function() { setPhase("idle"); }}>
          <div style={{ background:"#fff", borderRadius:8, width:480, padding:"28px 32px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK, paddingRight:16 }}>Update Digital Marketing Score</h2>
              <button onClick={function() { setPhase("idle"); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <div style={{ background:"#E3F2FD", border:"1px solid #BBDEFB", borderRadius:6, padding:"11px 14px", marginBottom:20, display:"flex", gap:10 }}>
              <Info size={16} color="#1565C0" style={{ marginTop:1, flexShrink:0 }} />
              <p style={{ margin:0, fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>Competitor Ranking and Digital Marketing Score reports run simultaneously. Your free trial includes 3 combined reports.</p>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <span style={{ fontWeight:600, fontSize:16, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Ready to run this report?</span>
              <HoverTip text="Resets when trial ends. Unused scans do not roll over." position="left" maxWidth={200}>
                <span style={{ background:"#F9A825", color:"#fff", fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:12, fontFamily:"Montserrat,sans-serif", cursor:"default" }}>3 available</span>
              </HoverTip>
            </div>
            <p style={{ margin:"0 0 16px", fontSize:12, color:STEEL }}>Learn more about what's included below.</p>
            {SCAN_SECTIONS.map(function(s) {
              return (
                <div key={s.id} style={{ borderTop:"1px solid "+BORDER }}>
                  <button onClick={function() { setExS(exS===s.id?null:s.id); }} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", background:"none", border:"none", cursor:"pointer", outline:"none" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <Check size={15} color="#267425" />
                      <span style={{ fontWeight:600, fontSize:14, fontFamily:"Montserrat,sans-serif", color:BLACK }}>{s.title}</span>
                    </span>
                    {exS===s.id?<ChevronUp size={14} color={STEEL}/>:<ChevronDown size={14} color={STEEL}/>}
                  </button>
                  {exS===s.id && (
                    <div style={{ background:BG_BARE, borderRadius:6, padding:"14px 16px", marginBottom:14 }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:14, fontSize:14, color:BLACK, fontFamily:"Open Sans,sans-serif" }}>
                        <div>
                          <p style={{ fontWeight:700, margin:"0 0 2px", lineHeight:"20px" }}>What this is</p>
                          <p style={{ margin:0, lineHeight:"20px" }}>{s.what}</p>
                        </div>
                        <div>
                          <p style={{ fontWeight:700, margin:"0 0 2px", lineHeight:"20px" }}>Why it matters</p>
                          <p style={{ margin:0, lineHeight:"20px" }}>{s.why}</p>
                        </div>
                        <div>
                          <p style={{ margin:"0 0 4px", lineHeight:"20px" }}>
                            <strong>What you will see</strong> in your <strong>{s.listLabel}</strong>
                          </p>
                          <ul style={{ margin:0, paddingLeft:20, listStyleType:"disc" }}>
                            {s.listItems.map(function(it,i) { return <li key={i} style={{ lineHeight:"20px", marginBottom:2 }}>{it}</li>; })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ borderTop:"1px solid "+BORDER, paddingTop:20, display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button onClick={function() { setPhase("idle"); }} style={bGhost}>Cancel</button>
              <button onClick={function() { setPhase("m2"); }} style={bPrimary}>Continue</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Scan step 2 */}
      {phase==="m2" && (
        <Overlay onClose={function() { setPhase("idle"); }}>
          <div style={{ background:"#fff", borderRadius:8, width:480, padding:"28px 32px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK, paddingRight:16 }}>Update Digital Marketing Score</h2>
              <button onClick={function() { setPhase("idle"); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <div style={{ background:"#E6F2FF", border:"1px solid #82BDFF", borderRadius:4, padding:"8px 12px", marginBottom:20, display:"flex", gap:10 }}>
              <Info size={16} color="#057AFF" style={{ flexShrink:0, marginTop:2 }} />
              <p style={{ margin:0, fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>
                Competitor Ranking and Digital Marketing Score reports run simultaneously. Your free trial includes 3 combined reports.
              </p>
            </div>
            <div style={{ display:"flex", gap:16, marginBottom:20 }}>
              <div style={{ fontSize:36 }}>🔍</div>
              <p style={{ margin:0, fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>Type a keyword that customers might search in order to find you.</p>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontWeight:600, fontSize:14, marginBottom:4, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Keyword for this report</label>
              <p style={{ margin:"0 0 8px", fontSize:12, color:STEEL }}>What might your customers search? ("Nail salon", "AC repair", etc.)</p>
              <input type="text" value={kw} onChange={function(e) { setKw(e.target.value); }} style={{ width:"100%", border:"none", borderBottom:"2px solid #1565C0", padding:"6px 0", fontSize:14, outline:"none", fontFamily:"Open Sans,sans-serif" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button onClick={function() { setPhase("m1"); }} style={bGhost}>Back</button>
              <button onClick={function() { setPhase("gen"); setShowLoadingModal(true); }} style={bPrimary}>Run report</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Congratulations */}
      {showCon && (
        <Overlay onClose={function() { setShowCon(false); }}>
          <div style={{ background:"#fff", borderRadius:8, width:460, padding:"28px 32px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Congratulations!</h2>
              <button onClick={function() { setShowCon(false); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <p style={{ fontSize:14, color:BLACK, marginBottom:24, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>You completed onboarding and can now view recommended actions for your business.</p>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"#E8F5E9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>🎉</div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:16 }}>
              <button onClick={function() { setShowCon(false); }} style={bGhost}>Dismiss</button>
              <button onClick={function() { setShowCon(false); }} style={bPrimary}>View recommendations</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Score went up */}
      {showSU && (
        <Overlay onClose={function() { setShowSU(false); }}>
          <div style={{ background:"#fff", borderRadius:8, width:460, padding:"28px 32px", position:"relative", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            {CONFETTI.map(function(p,i) { return <div key={i} style={{ position:"absolute", width:7, height:10, background:p.c, top:p.t+"%", left:p.l+"%", borderRadius:2, transform:"rotate("+p.r+"deg)", opacity:0.85 }} />; })}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, position:"relative" }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK }}>Your score went up!</h2>
              <button onClick={function() { setShowSU(false); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <p style={{ fontSize:14, color:BLACK, marginBottom:20, lineHeight:"20px", fontFamily:"Open Sans,sans-serif", position:"relative" }}>Good progress! Complete recommendations to strengthen your online presence and reach more clients.</p>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24, position:"relative" }}>
              <Donut score={score} pts={pts} noTooltip={true} />
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:16, position:"relative" }}>
              <button onClick={function() { setShowSU(false); }} style={bGhost}>Dismiss</button>
              <button onClick={function() { setShowSU(false); }} style={bPrimary}>View recommendations</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Scan loading modal (step 3) */}
      {showLoadingModal && (
        <Overlay onClose={function() { setShowLoadingModal(false); }}>
          <div style={{ background:"#fff", borderRadius:8, width:480, padding:"28px 32px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK, paddingRight:16 }}>Generating updated score...</h2>
              <button onClick={function() { setShowLoadingModal(false); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 24px" }}>
              <svg width={72} height={72} viewBox="0 0 72 72" style={{ animation:"spin 0.9s linear infinite" }}>
                <circle cx={36} cy={36} r={30} fill="none" stroke={BORDER} strokeWidth={6} />
                <path d="M 36 6 A 30 30 0 0 1 66 36" fill="none" stroke={ORANGE} strokeWidth={6} strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ margin:0, fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>
              We are generating your score and this might take a few minutes. Feel free to check back later.
            </p>
          </div>
        </Overlay>
      )}

      {/* Scan limit modal */}
      {showScanLimit && (
        <Overlay onClose={function() { setShowScanLimit(false); }}>
          <div style={{ background:"#fff", borderRadius:8, width:420, padding:"28px 32px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:600, fontFamily:"Montserrat,sans-serif", color:BLACK, paddingRight:16 }}>Scan already run today</h2>
              <button onClick={function() { setShowScanLimit(false); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={STEEL} /></button>
            </div>
            <p style={{ margin:"0 0 24px", fontSize:14, color:BLACK, lineHeight:"20px", fontFamily:"Open Sans,sans-serif" }}>You've already run a scan today. Check back tomorrow to run another scan.</p>
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={function() { setShowScanLimit(false); }} style={bPrimary}>Got it</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:8, padding:"12px 16px", zIndex:2000, maxWidth:340, boxShadow:"0 4px 12px rgba(0,0,0,.12)", display:"flex", gap:10, alignItems:"flex-start" }}>
          <Check size={18} color="#267425" style={{ flexShrink:0, marginTop:1 }} />
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:"#1B5E20", fontFamily:"Montserrat,sans-serif" }}>{toast.msg}</div>
            {toast.sub && <div style={{ fontSize:12, color:"#267425", marginTop:2, fontFamily:"Open Sans,sans-serif" }}>{toast.sub}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
