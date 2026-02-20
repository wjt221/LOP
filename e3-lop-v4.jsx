import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  ChevronRight, ChevronDown, Calendar,
  AlertTriangle, Plus, X, Edit2, MessageSquare,
  BarChart2, FileText, Menu, Layers, Home,
  Users, Mail, Shield, Eye, PenTool, ArrowRight,
  TrendingUp, Trash2, Search, Printer
} from "lucide-react";

// ─── BRAND ───────────────────────────────────────────────────────────────────
const E3 = {
  navy: "#1a2d5a", navyDark: "#111e3d", navyLight: "#2a3f72",
  accent: "#4a7fd4", accentLight: "#e8eef8",
  silver: "#f0f2f7", text: "#1a2d5a", muted: "#6b7a99", border: "#dde3f0",
};

const ORG_LEVELS = [
  { id: "L1", label: "L1 – Leadership Team", short: "L1", desc: "Executive leadership setting organizational direction", color: E3.navy },
  { id: "L2", label: "L2 – Divisions / Functional Heads", short: "L2", desc: "Sales, Marketing, Operations, Regional Heads", color: "#2a5cb8" },
  { id: "L3", label: "L3 – Departments", short: "L3", desc: "Regional sales, product teams, logistics, quality assurance", color: "#4a7fd4" },
];

const ITEM_TYPES = ["Goal", "Strategy", "Tactic"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_CYCLE = [null, "green", "yellow", "red"]; // click cycles through

const STATUS_CONFIG = {
  green:  { label: "On Track",  color: "#059669", bg: "#d1fae5", dot: "#059669" },
  yellow: { label: "At Risk",   color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  red:    { label: "Off Track", color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// Each goal's `strategies` array stores objects: { text, ownerId, childGoalId }
// When a goal has strategies with childGoalId set, those link to L2 goals.
// This models: L1 goal → 3 strategies → 3 L2 goals owned by regional heads → each has 5 strategies → L3 goals

const mkSC = (vals = {}) => Object.fromEntries(MONTHS.map(m => [m, vals[m] ?? null]));

const SEED = {
  currentUser: { id: "u1", name: "Carlos Mendez", email: "carlos@latamco.com", role: "superadmin" },
  companies: [
    {
      id: "c1", name: "LatAm Holdings", industry: "Private Equity / Operations", logo: "LH",
      members: [
        { id: "u1", name: "Carlos Mendez",   email: "carlos@latamco.com",  role: "admin",  title: "CEO" },
        { id: "u2", name: "Sofia Reyes",     email: "sofia@latamco.com",   role: "editor", title: "Mexico Country Head" },
        { id: "u3", name: "Miguel Santos",   email: "miguel@latamco.com",  role: "editor", title: "Dominican Republic Head" },
        { id: "u4", name: "Valentina Cruz",  email: "val@latamco.com",     role: "editor", title: "Colombia Country Head" },
        { id: "u5", name: "Diego Fuentes",   email: "diego@latamco.com",   role: "editor", title: "CFO" },
        { id: "u6", name: "Lucia Vargas",    email: "lucia@latamco.com",   role: "editor", title: "VP People & Culture" },
      ]
    },
    {
      id: "c2", name: "Meridian Health", industry: "Healthcare", logo: "MH",
      members: [
        { id: "u1", name: "Carlos Mendez",  email: "carlos@latamco.com",  role: "admin" },
        { id: "u7", name: "Jordan Lee",     email: "jordan@meridian.com", role: "editor" },
        { id: "u8", name: "Dana Kim",       email: "dana@meridian.com",   role: "editor" },
      ]
    }
  ],
  goals: [
    // ── L1 GOALS ─────────────────────────────────────────────────────────────
    {
      id: "g1", companyId: "c1", orgLevel: "L1", type: "Goal", cascade: "core",
      title: "Drive $50M in EBITDA",
      metric: "Consolidated EBITDA of $50M by Dec 31",
      description: "Achieve profitability targets across all three operating markets through disciplined growth and cost management.",
      owner: "u1", dueDate: "2025-12-31", parentId: null,
      strategies: [
        { text: "Generate $25M EBITDA from Mexico operations",    ownerId: "u2", childGoalId: "g4"  },
        { text: "Generate $15M EBITDA from Dominican Republic",   ownerId: "u3", childGoalId: "g5"  },
        { text: "Generate $10M EBITDA from Colombia operations",  ownerId: "u4", childGoalId: "g6"  },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: [{ id: "cm1", userId: "u1", text: "Mexico ahead of plan. DR needs acceleration in Q2.", date: "2026-02-05" }]
    },
    {
      id: "g2", companyId: "c1", orgLevel: "L1", type: "Goal", cascade: "core",
      title: "Achieve 95% Customer Retention Across All Markets",
      metric: "≤5% churn rate measured quarterly",
      description: "Protect and grow existing revenue base through best-in-class service delivery.",
      owner: "u1", dueDate: "2025-12-31", parentId: null,
      strategies: [
        { text: "Drive Mexico customer retention to 97%",          ownerId: "u2", childGoalId: "g7"  },
        { text: "Drive Dominican Republic retention to 95%",       ownerId: "u3", childGoalId: "g8"  },
        { text: "Drive Colombia customer retention to 93%",        ownerId: "u4", childGoalId: "g9"  },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "yellow" }),
      comments: []
    },
    {
      id: "g3", companyId: "c1", orgLevel: "L1", type: "Goal", cascade: "core",
      title: "Build High-Performance Leadership Bench",
      metric: "Leadership readiness score ≥ 4.0/5.0 by Q3",
      description: "Develop the next tier of leaders to support regional scale plans.",
      owner: "u6", dueDate: "2025-09-30", parentId: null,
      strategies: [
        { text: "Deploy leadership development program in Mexico",  ownerId: "u2", childGoalId: null },
        { text: "Build succession pipeline in Dominican Republic",  ownerId: "u3", childGoalId: null },
        { text: "Launch Colombia talent acceleration program",      ownerId: "u4", childGoalId: null },
        { text: "Roll out 360° feedback across all markets",        ownerId: "u6", childGoalId: null },
        { text: "Establish cross-market mentorship pairs",          ownerId: "u6", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "yellow", Feb: "yellow" }),
      comments: []
    },

    // ── L2 GOALS — Cascade from g1 (Drive $50M EBITDA) ───────────────────────
    {
      id: "g4", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Generate $25M EBITDA from Mexico Operations",
      metric: "$25M EBITDA contribution from MX by Dec 31",
      description: "Mexico is the primary growth engine. Expand revenue, tighten cost structure, and scale the enterprise segment.",
      owner: "u2", dueDate: "2025-12-31", parentId: "g1",
      strategies: [
        { text: "Close 40 new enterprise contracts in H1",        ownerId: "u2", childGoalId: "g10" },
        { text: "Reduce operating cost ratio to 55%",             ownerId: "u2", childGoalId: "g11" },
        { text: "Launch premium tier product by Q2",              ownerId: "u2", childGoalId: null  },
        { text: "Expand CDMX team from 80 to 120 headcount",      ownerId: "u2", childGoalId: null  },
        { text: "Grow Monterrey market share by 15pts",           ownerId: "u2", childGoalId: null  },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: [{ id: "cm2", userId: "u2", text: "Pipeline for enterprise deals is strong — 18 in late stage as of Feb.", date: "2026-02-10" }]
    },
    {
      id: "g5", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Generate $15M EBITDA from Dominican Republic",
      metric: "$15M EBITDA contribution from DR by Dec 31",
      description: "Accelerate growth in the Dominican market through market penetration and operational improvements.",
      owner: "u3", dueDate: "2025-12-31", parentId: "g1",
      strategies: [
        { text: "Increase revenue per account by 20%",            ownerId: "u3", childGoalId: null  },
        { text: "Open Santo Domingo enterprise hub",              ownerId: "u3", childGoalId: null  },
        { text: "Reduce COGS by $2M through supplier renegotiation", ownerId: "u3", childGoalId: null },
        { text: "Win 3 government contract renewals",             ownerId: "u3", childGoalId: null  },
        { text: "Launch new B2B channel with local distributors", ownerId: "u3", childGoalId: null  },
      ],
      scorecard: mkSC({ Jan: "yellow", Feb: "yellow" }),
      comments: [{ id: "cm3", userId: "u3", text: "Government renewal process slower than expected — escalating to Carlos.", date: "2026-02-08" }]
    },
    {
      id: "g6", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Generate $10M EBITDA from Colombia Operations",
      metric: "$10M EBITDA contribution from COL by Dec 31",
      description: "Colombia is the emerging market. Focus on customer acquisition and operational foundation.",
      owner: "u4", dueDate: "2025-12-31", parentId: "g1",
      strategies: [
        { text: "Acquire 500 new SMB customers in H1",            ownerId: "u4", childGoalId: null  },
        { text: "Launch Bogotá service center by March",          ownerId: "u4", childGoalId: null  },
        { text: "Achieve breakeven on new product lines by Q3",   ownerId: "u4", childGoalId: null  },
        { text: "Sign 2 strategic reseller partnerships",         ownerId: "u4", childGoalId: null  },
        { text: "Reduce customer acquisition cost by 25%",        ownerId: "u4", childGoalId: null  },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: []
    },

    // ── L2 GOALS — Cascade from g2 (Customer Retention) ──────────────────────
    {
      id: "g7", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Drive Mexico Customer Retention to 97%",
      metric: "97% retention rate on rolling 12-month cohort",
      description: "Mexico retention is core to EBITDA stability. Proactive account management is the lever.",
      owner: "u2", dueDate: "2025-12-31", parentId: "g2",
      strategies: [
        { text: "Assign dedicated CSM to all accounts >$50K ARR", ownerId: "u2", childGoalId: null },
        { text: "Launch quarterly business reviews for top 100",  ownerId: "u2", childGoalId: null },
        { text: "Build early-warning churn model by Q1",          ownerId: "u2", childGoalId: null },
        { text: "Increase NPS from 42 to 55 by Q3",              ownerId: "u2", childGoalId: null },
        { text: "Train all account managers on retention playbook", ownerId: "u2", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: []
    },
    {
      id: "g8", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Drive Dominican Republic Customer Retention to 95%",
      metric: "95% retention rate on rolling 12-month cohort",
      description: "Reduce churn driven by service quality gaps and slow issue resolution.",
      owner: "u3", dueDate: "2025-12-31", parentId: "g2",
      strategies: [
        { text: "Reduce average ticket resolution time to <24hrs",ownerId: "u3", childGoalId: null },
        { text: "Launch customer success program for SMBs",       ownerId: "u3", childGoalId: null },
        { text: "Hire 5 dedicated retention specialists",         ownerId: "u3", childGoalId: null },
        { text: "Run bi-annual satisfaction surveys",             ownerId: "u3", childGoalId: null },
        { text: "Implement account health scoring dashboard",     ownerId: "u3", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "yellow", Feb: "red" }),
      comments: [{ id: "cm4", userId: "u3", text: "Two large accounts at risk — escalated to retention team.", date: "2026-02-14" }]
    },
    {
      id: "g9", companyId: "c1", orgLevel: "L2", type: "Strategy", cascade: "core",
      title: "Drive Colombia Customer Retention to 93%",
      metric: "93% retention rate on rolling 12-month cohort",
      description: "As a newer market, Colombia needs strong onboarding to anchor retention.",
      owner: "u4", dueDate: "2025-12-31", parentId: "g2",
      strategies: [
        { text: "Build structured 90-day onboarding journey",     ownerId: "u4", childGoalId: null },
        { text: "Create Colombia-specific support SLA",           ownerId: "u4", childGoalId: null },
        { text: "Identify and mitigate top 10 churn risk accounts", ownerId: "u4", childGoalId: null },
        { text: "Launch customer referral incentive program",     ownerId: "u4", childGoalId: null },
        { text: "Achieve 4.2/5.0 app store rating",              ownerId: "u4", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: []
    },

    // ── L3 GOALS — Cascade from g4 (Mexico EBITDA strategies) ────────────────
    {
      id: "g10", companyId: "c1", orgLevel: "L3", type: "Tactic", cascade: "core",
      title: "Close 40 New Enterprise Contracts in H1",
      metric: "40 signed contracts >$100K by June 30",
      description: "Drive enterprise pipeline velocity through focused sales execution.",
      owner: "u2", dueDate: "2025-06-30", parentId: "g4",
      strategies: [
        { text: "Run 3 C-suite roundtables in CDMX",              ownerId: "u2", childGoalId: null },
        { text: "Assign 2 enterprise AEs to Monterrey territory", ownerId: "u2", childGoalId: null },
        { text: "Launch enterprise outbound campaign in March",   ownerId: "u2", childGoalId: null },
        { text: "Shorten procurement cycle to <45 days",         ownerId: "u2", childGoalId: null },
        { text: "Secure 3 anchor reference customers for case studies", ownerId: "u2", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: []
    },
    {
      id: "g11", companyId: "c1", orgLevel: "L3", type: "Tactic", cascade: "core",
      title: "Reduce Mexico Operating Cost Ratio to 55%",
      metric: "OpEx as % of revenue ≤ 55% by Q4",
      description: "Improve unit economics by renegotiating vendor contracts and automating manual processes.",
      owner: "u2", dueDate: "2025-12-31", parentId: "g4",
      strategies: [
        { text: "Renegotiate top 5 supplier contracts by Q1",     ownerId: "u2", childGoalId: null },
        { text: "Automate invoicing and collections workflow",    ownerId: "u2", childGoalId: null },
        { text: "Consolidate 3 redundant SaaS tools",             ownerId: "u5", childGoalId: null },
        { text: "Reduce office real estate costs by 15%",         ownerId: "u5", childGoalId: null },
        { text: "Achieve 20% improvement in labor productivity",  ownerId: "u2", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "yellow", Feb: "green" }),
      comments: []
    },

    // ── Meridian Health (company c2) ──────────────────────────────────────────
    {
      id: "g20", companyId: "c2", orgLevel: "L1", type: "Goal", cascade: "core",
      title: "Onboard 25 Hospital Systems",
      metric: "25 signed contracts with hospital groups by Dec 31",
      description: "Expand network through direct sales and health system partnerships.",
      owner: "u7", dueDate: "2025-12-31", parentId: null,
      strategies: [
        { text: "Accelerate enterprise sales cycle",              ownerId: "u7", childGoalId: null },
        { text: "Build health system partnership program",        ownerId: "u7", childGoalId: null },
        { text: "Launch LOI fast-track process",                  ownerId: "u8", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "yellow", Feb: "yellow" }),
      comments: [{ id: "cm10", userId: "u7", text: "Sales cycle 40% longer than expected. Revised to 18-20 systems unless strategy changes.", date: "2026-02-05" }]
    },
    {
      id: "g21", companyId: "c2", orgLevel: "L1", type: "Goal", cascade: "core",
      title: "Achieve $8M ARR",
      metric: "$8M ARR from subscription + implementation fees",
      description: "Revenue target driven by hospital system onboarding velocity.",
      owner: "u8", dueDate: "2025-12-31", parentId: null,
      strategies: [
        { text: "Increase implementation fee capture",            ownerId: "u8", childGoalId: null },
        { text: "Drive subscription renewals",                    ownerId: "u8", childGoalId: null },
        { text: "Launch upsell program for existing clients",     ownerId: "u7", childGoalId: null },
      ],
      scorecard: mkSC({ Jan: "green", Feb: "green" }),
      comments: []
    },
  ]
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
async function loadData() {
  try { const r = await window.storage.get("e3_lop_v4"); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveData(d) {
  try { await window.storage.set("e3_lop_v4", JSON.stringify(d)); } catch {}
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getGoalStatus(goal) {
  const months = MONTHS.map(m => goal.scorecard?.[m]).filter(Boolean);
  if (!months.length) return null;
  return months[months.length - 1];
}

function getGoalProgress(goal) {
  const months = MONTHS.map(m => goal.scorecard?.[m]).filter(Boolean);
  if (!months.length) return 0;
  return Math.round(months.filter(m => m === "green").length / months.length * 100);
}

function cycleStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current ?? null);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
function StatusDot({ status, size = 14, onClick, interactive }) {
  const cfg = STATUS_CONFIG[status];
  const base = { width: size, height: size, borderRadius: "50%", backgroundColor: cfg ? cfg.dot : "#e5e7eb", flexShrink: 0, transition: "transform 0.1s" };
  if (interactive) return (
    <div onClick={onClick} title={cfg ? `${cfg.label} — click to change` : "No status — click to set"}
      style={{ ...base, cursor: "pointer", boxShadow: "0 0 0 2px rgba(255,255,255,0.8)" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
  );
  return <div style={base} />;
}

function CascadeBadge({ cascade }) {
  return (
    <span className="inline-flex items-center gap-1 rounded font-bold uppercase tracking-widest"
      style={{ fontSize: 9, padding: "2px 7px",
        backgroundColor: cascade === "core" ? E3.navy : "#e5e7eb",
        color: cascade === "core" ? "white" : E3.muted }}>
      {cascade === "core" ? "● CORE" : "○ FLANK"}
    </span>
  );
}

function OrgLevelBadge({ orgLevel }) {
  const lv = ORG_LEVELS.find(l => l.id === orgLevel);
  if (!lv) return null;
  return (
    <span className="inline-flex items-center font-black rounded"
      style={{ fontSize: 10, padding: "2px 7px", backgroundColor: `${lv.color}18`, color: lv.color, letterSpacing: "0.04em" }}>
      {lv.short}
    </span>
  );
}

function Avatar({ name, size = 7 }) {
  const initials = name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = [E3.navy, "#2a5cb8", "#4a7fd4", "#059669", "#b45309", "#7c3aed"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const px = size * 4;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
      style={{ backgroundColor: color, fontSize: size < 8 ? 9 : 11, width: px, height: px }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: E3.border }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color || E3.accent }} />
      </div>
      <span className="text-xs font-black w-8 text-right" style={{ color: E3.navy }}>{value}%</span>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,20,50,0.55)" }}>
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}
        style={{ maxHeight: "90vh", boxShadow: "0 25px 60px rgba(26,45,90,0.25)" }}>
        <div className="flex items-start justify-between px-6 py-4 border-b" style={{ borderColor: E3.border }}>
          <div>
            <h3 className="font-black text-base" style={{ color: E3.navy }}>{title}</h3>
            {subtitle && <div className="text-xs mt-0.5" style={{ color: E3.muted }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ml-4 flex-shrink-0">
            <X size={13} style={{ color: E3.muted }} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,20,50,0.65)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" style={{ boxShadow: "0 25px 60px rgba(26,45,90,0.25)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#fee2e2" }}>
          <Trash2 size={18} style={{ color: "#dc2626" }} />
        </div>
        <h3 className="font-black text-base text-center mb-1" style={{ color: E3.navy }}>{title}</h3>
        <p className="text-sm text-center mb-5" style={{ color: E3.muted }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border hover:bg-gray-50"
            style={{ borderColor: E3.border, color: E3.muted }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-black text-white"
            style={{ backgroundColor: "#dc2626" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── GOAL FORM ────────────────────────────────────────────────────────────────
// strategies are stored as: { text, ownerId, childGoalId }
// When saving with cascadeStrategies=true, caller auto-creates child goals from strategies
function GoalForm({ goal, companyId, members, parentId, defaultOrgLevel, onSave, onClose }) {
  const nextLevel = { L1: "L2", L2: "L3", L3: null };
  const typeForLevel = { L1: "Goal", L2: "Strategy", L3: "Tactic" };

  const [form, setForm] = useState({
    title: goal?.title || "",
    metric: goal?.metric || "",
    description: goal?.description || "",
    orgLevel: goal?.orgLevel || defaultOrgLevel || "L1",
    type: goal?.type || "Goal",
    cascade: goal?.cascade || "core",
    owner: goal?.owner || members[0]?.id || "",
    dueDate: goal?.dueDate || "",
    strategies: goal?.strategies?.length
      ? goal.strategies.map(s => typeof s === "string"
          ? { text: s, ownerId: members[0]?.id || "", childGoalId: null }
          : s)
      : [{ text: "", ownerId: members[0]?.id || "", childGoalId: null }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setStrat = (i, k, v) => setForm(f => {
    const s = f.strategies.map((st, idx) => idx === i ? { ...st, [k]: v } : st);
    return { ...f, strategies: s };
  });
  const addStrat = () => setForm(f => ({
    ...f, strategies: [...f.strategies, { text: "", ownerId: f.owner || members[0]?.id || "", childGoalId: null }]
  }));
  const removeStrat = (i) => setForm(f => ({ ...f, strategies: f.strategies.filter((_, idx) => idx !== i) }));

  const inputCls = "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all";
  const is = { borderColor: E3.border, color: E3.navy };
  const childLevel = nextLevel[form.orgLevel];
  const validStrategies = form.strategies.filter(s => s.text.trim());

  return (
    <div className="space-y-4">
      {/* Level / Type / Cascade */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Org Level</label>
          <select className={inputCls} style={is} value={form.orgLevel}
            onChange={e => { set("orgLevel", e.target.value); set("type", typeForLevel[e.target.value]); }}>
            {ORG_LEVELS.map(l => <option key={l.id} value={l.id}>{l.short}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Type</label>
          <select className={inputCls} style={is} value={form.type} onChange={e => set("type", e.target.value)}>
            {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Cascade</label>
          <select className={inputCls} style={is} value={form.cascade} onChange={e => set("cascade", e.target.value)}>
            <option value="core">Core</option>
            <option value="flank">Flank</option>
          </select>
        </div>
      </div>

      {/* Goal title */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Goal Statement *</label>
        <input className={inputCls} style={is} value={form.title}
          onChange={e => set("title", e.target.value)} placeholder="Expression of success for your group..." />
      </div>

      {/* Metric */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Key Metric</label>
        <input className={inputCls} style={is} value={form.metric}
          onChange={e => set("metric", e.target.value)} placeholder="e.g. $25M EBITDA by Dec 31" />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Description / Context</label>
        <textarea rows={2} className={inputCls + " resize-none"} style={is}
          value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      {/* Owner + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Goal Owner</label>
          <select className={inputCls} style={is} value={form.owner} onChange={e => set("owner", e.target.value)}>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}{m.title ? ` — ${m.title}` : ""}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Due Date</label>
          <input type="date" className={inputCls} style={is} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </div>
      </div>

      {/* Strategies — with owner per strategy */}
      {childLevel && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: E3.border }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: E3.silver }}>
            <div>
              <div className="text-xs font-black uppercase tracking-wider" style={{ color: E3.navy }}>
                Strategies → These become {childLevel} Goals
              </div>
              <div className="text-xs mt-0.5" style={{ color: E3.muted }}>
                Each strategy cascades down as a {childLevel} goal assigned to the accountable owner
              </div>
            </div>
            <button onClick={addStrat} className="flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: E3.navy }}>
              <Plus size={11} /> Add Strategy
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: E3.border }}>
            {form.strategies.map((s, i) => (
              <div key={i} className="p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ backgroundColor: E3.accentLight, color: E3.accent }}>{i + 1}</div>
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={is} value={s.text} placeholder={`Strategy ${i + 1} — how will this goal be achieved?`}
                    onChange={e => setStrat(i, "text", e.target.value)} />
                  {form.strategies.length > 1 && (
                    <button onClick={() => removeStrat(i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {/* Owner for this strategy = accountable for the L2 goal */}
                <div className="flex items-center gap-2 pl-7">
                  <span className="text-xs font-black uppercase tracking-wider flex-shrink-0" style={{ color: E3.muted }}>
                    {childLevel} Owner:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map(m => (
                      <button key={m.id} onClick={() => setStrat(i, "ownerId", m.id)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-bold transition-all"
                        style={{
                          borderColor: s.ownerId === m.id ? E3.accent : E3.border,
                          backgroundColor: s.ownerId === m.id ? E3.accentLight : "white",
                          color: s.ownerId === m.id ? E3.accent : E3.muted,
                        }}>
                        <Avatar name={m.name} size={4} />
                        {m.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  {s.childGoalId && (
                    <span className="text-xs px-2 py-0.5 rounded-full ml-auto flex-shrink-0"
                      style={{ backgroundColor: "#d1fae5", color: "#059669" }}>
                      ✓ {childLevel} goal linked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {validStrategies.length > 0 && (
            <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: E3.border, backgroundColor: "#f0fdf4" }}>
              <ChevronRight size={13} style={{ color: "#059669" }} />
              <span className="text-xs font-bold" style={{ color: "#059669" }}>
                Saving will create {validStrategies.length} linked {childLevel} goal{validStrategies.length > 1 ? "s" : ""} for the assigned owners
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold border hover:bg-gray-50 transition-colors"
          style={{ borderColor: E3.border, color: E3.muted }}>Cancel</button>
        <button
          onClick={() => onSave({
            ...form,
            strategies: form.strategies.filter(s => s.text.trim()),
            companyId,
            parentId
          })}
          disabled={!form.title}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-black text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: E3.navy }}>
          Save {goal ? "Changes" : `+ Cascade ${validStrategies.length > 0 ? validStrategies.length + " " + (childLevel || "") + " Goals" : ""}`}
        </button>
      </div>
    </div>
  );
}

// ─── GOAL DETAIL ──────────────────────────────────────────────────────────────
function GoalDetail({ goal, allGoals, members, currentUser, onEdit, onDelete, onAddComment, onUpdateScorecard }) {
  const [comment, setComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const owner = members.find(m => m.id === goal.owner);
  const parent = allGoals.find(g => g.id === goal.parentId);
  const children = allGoals.filter(g => g.parentId === goal.id);
  const progress = getGoalProgress(goal);

  return (
    <div className="space-y-5">
      {confirmDelete && (
        <ConfirmModal
          title="Delete Goal?"
          message={`"${goal.title}" and all associated data will be permanently removed.`}
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <OrgLevelBadge orgLevel={goal.orgLevel} />
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: E3.accentLight, color: E3.accent }}>{goal.type}</span>
            <CascadeBadge cascade={goal.cascade} />
          </div>
          <h2 className="text-xl font-black leading-snug mb-2" style={{ color: E3.navy }}>{goal.title}</h2>
          {goal.metric && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
              <TrendingUp size={13} style={{ color: "#b45309" }} />
              <span className="text-xs font-bold" style={{ color: "#b45309" }}>KEY METRIC:</span>
              <span className="text-xs font-semibold" style={{ color: E3.navy }}>{goal.metric}</span>
            </div>
          )}
          {goal.description && <p className="text-sm mt-2" style={{ color: E3.muted }}>{goal.description}</p>}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-blue-50 transition-colors" style={{ color: E3.muted }} title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" style={{ color: "#dc2626" }} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress */}
      {progress > 0 && (
        <div className="rounded-xl p-3" style={{ backgroundColor: E3.silver }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: E3.muted }}>On-Track Rate</div>
            <span className="text-xs font-black" style={{ color: progress >= 70 ? "#059669" : progress >= 40 ? "#b45309" : "#dc2626" }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} color={progress >= 70 ? "#059669" : progress >= 40 ? "#f59e0b" : "#dc2626"} />
        </div>
      )}

      {parent && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: E3.border }}>
          <ChevronRight size={12} style={{ color: E3.muted }} />
          <span className="text-xs" style={{ color: E3.muted }}>Cascades from:</span>
          <OrgLevelBadge orgLevel={parent.orgLevel} />
          <span className="text-xs font-semibold truncate" style={{ color: E3.navy }}>{parent.title}</span>
        </div>
      )}

      {goal.strategies?.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: E3.border }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: E3.silver }}>
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: E3.navy }}>
              Strategies → Cascade Down
            </div>
            <span className="text-xs ml-auto" style={{ color: E3.muted }}>
              {goal.strategies.filter(s => s.childGoalId).length} of {goal.strategies.length} linked to child goals
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: E3.border }}>
            {goal.strategies.map((s, i) => {
              const stratObj = typeof s === "string" ? { text: s, ownerId: null, childGoalId: null } : s;
              const stratOwner = members.find(m => m.id === stratObj.ownerId);
              const childGoal = allGoals.find(g => g.id === stratObj.childGoalId);
              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black"
                      style={{ backgroundColor: E3.accentLight, color: E3.accent }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: E3.navy }}>{stratObj.text}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {stratOwner && (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={stratOwner.name} size={5} />
                            <span className="text-xs font-bold" style={{ color: E3.muted }}>{stratOwner.name}</span>
                          </div>
                        )}
                        {childGoal ? (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#d1fae5", color: "#059669" }}>
                            <ChevronRight size={10} />
                            {childGoal.orgLevel} Goal: {childGoal.title.slice(0, 50)}{childGoal.title.length > 50 ? "…" : ""}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: E3.accentLight, color: E3.muted }}>
                            No child goal linked yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ backgroundColor: E3.silver }}>
          <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: E3.muted }}>Owner</div>
          <div className="flex items-center gap-2">
            <Avatar name={owner?.name} size={6} />
            <span className="text-sm font-bold" style={{ color: E3.navy }}>{owner?.name || "—"}</span>
          </div>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: E3.silver }}>
          <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: E3.muted }}>Due Date</div>
          <span className="text-sm font-bold" style={{ color: E3.navy }}>{goal.dueDate || "Not set"}</span>
        </div>
      </div>

      {/* Monthly scorecard — click to cycle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-black uppercase tracking-wider" style={{ color: E3.muted }}>Monthly Scorecard</div>
          <span className="text-xs" style={{ color: E3.muted }}>· click dot to cycle</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MONTHS.map(m => {
            const val = goal.scorecard?.[m] ?? null;
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div className="text-xs font-bold" style={{ color: E3.muted, fontSize: 9 }}>{m}</div>
                <StatusDot status={val} size={26} interactive
                  onClick={() => onUpdateScorecard(goal.id, m, cycleStatus(val))} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2">
          {[["gray","#e5e7eb","Empty"], ...Object.entries(STATUS_CONFIG).map(([k,v]) => [v.dot, v.dot, v.label])].map(([_, color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs" style={{ color: E3.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {children.length > 0 && (
        <div>
          <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: E3.muted }}>Cascades To ({children.length})</div>
          <div className="space-y-1.5">
            {children.map(c => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: E3.border }}>
                <OrgLevelBadge orgLevel={c.orgLevel} />
                <span className="text-xs font-semibold truncate" style={{ color: E3.navy }}>{c.title}</span>
                {getGoalStatus(c) && <StatusDot status={getGoalStatus(c)} size={10} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: E3.muted }}>Comments</div>
        <div className="space-y-3 mb-3">
          {!goal.comments?.length && <div className="text-sm" style={{ color: E3.muted }}>No comments yet.</div>}
          {goal.comments?.map(c => {
            const u = members.find(m => m.id === c.userId);
            return (
              <div key={c.id} className="flex gap-3">
                <Avatar name={u?.name} size={7} />
                <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: E3.silver }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black" style={{ color: E3.navy }}>{u?.name}</span>
                    <span className="text-xs" style={{ color: E3.muted }}>{c.date}</span>
                  </div>
                  <p className="text-sm" style={{ color: E3.navy }}>{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: E3.border, color: E3.navy }}
            placeholder="Add a comment..." value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && comment.trim()) { onAddComment(goal.id, comment); setComment(""); } }} />
          <button onClick={() => { if (comment.trim()) { onAddComment(goal.id, comment); setComment(""); } }}
            className="px-3 py-2 rounded-xl text-white" style={{ backgroundColor: E3.navy }}>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const EMPTY_SCORECARD = Object.fromEntries(MONTHS.map(m => [m, null]));

function AddScorecardItemForm({ members, companyId, selectedOwnerId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", metric: "", description: "",
    orgLevel: "L1", type: "Goal", cascade: "core",
    owner: selectedOwnerId || members[0]?.id || "",
    dueDate: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const typeForLevel = { L1: "Goal", L2: "Strategy", L3: "Tactic" };
  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all";
  const is = { borderColor: E3.border, color: E3.navy };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: `g${Date.now()}`,
      companyId,
      parentId: null,
      comments: [],
      strategies: [],
      scorecard: { ...EMPTY_SCORECARD },
    });
  };

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: E3.accent, borderWidth: 2 }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: E3.accentLight }}>
        <div className="flex items-center gap-2">
          <Plus size={14} style={{ color: E3.accent }} />
          <span className="text-sm font-black" style={{ color: E3.navy }}>Add Scorecard Item</span>
          <span className="text-xs" style={{ color: E3.muted }}>for {members.find(m => m.id === form.owner)?.name || "—"}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <X size={12} style={{ color: E3.muted }} />
        </button>
      </div>

      <div className="p-5 space-y-4 bg-white">
        {/* Owner selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: E3.muted }}>Assign To</label>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (
              <button key={m.id} onClick={() => set("owner", m.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all"
                style={{
                  borderColor: form.owner === m.id ? E3.accent : E3.border,
                  backgroundColor: form.owner === m.id ? E3.accentLight : "white",
                  color: form.owner === m.id ? E3.accent : E3.muted,
                }}>
                <Avatar name={m.name} size={5} />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Level / Type / Cascade */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Org Level</label>
            <select className={inputCls} style={is} value={form.orgLevel}
              onChange={e => { set("orgLevel", e.target.value); set("type", typeForLevel[e.target.value]); }}>
              {ORG_LEVELS.map(l => <option key={l.id} value={l.id}>{l.short} – {l.label.split("–")[1]?.trim()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Type</label>
            <select className={inputCls} style={is} value={form.type} onChange={e => set("type", e.target.value)}>
              {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Cascade</label>
            <select className={inputCls} style={is} value={form.cascade} onChange={e => set("cascade", e.target.value)}>
              <option value="core">Core</option>
              <option value="flank">Flank</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Goal Statement *</label>
          <input className={inputCls} style={is} value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Expression of success for this person's group..."
            onKeyDown={e => e.key === "Enter" && handleSave()} />
        </div>

        {/* Metric */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Key Metric</label>
          <input className={inputCls} style={is} value={form.metric}
            onChange={e => set("metric", e.target.value)}
            placeholder="e.g. Increase NPS by 5 points" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Due Date</label>
            <input type="date" className={inputCls} style={is} value={form.dueDate}
              onChange={e => set("dueDate", e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={handleSave} disabled={!form.title.trim()}
              className="w-full py-2 rounded-lg text-sm font-black text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: E3.navy }}>
              Add to Scorecard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ goals, company, members, currentUser, onGoalClick, onAddGoal }) {
  const cg = goals.filter(g => g.companyId === company.id);
  const [selectedMemberId, setSelectedMemberId] = useState(currentUser?.id || members[0]?.id);
  const [showAddForm, setShowAddForm] = useState(false);

  const currentMonthIdx = new Date().getMonth();
  const currentMonth = MONTHS[currentMonthIdx];

  // Org-wide health
  const statused = cg.map(g => getGoalStatus(g)).filter(Boolean);
  const health = statused.length
    ? Math.round(statused.filter(s => s === "green").length / statused.length * 100) : 0;
  const healthColor = health >= 70 ? "#6ee7b7" : health >= 40 ? "#fcd34d" : "#fca5a5";

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0];
  const memberGoals = cg.filter(g => g.owner === selectedMemberId);
  const memberStatused = memberGoals.map(g => getGoalStatus(g)).filter(Boolean);
  const memberHealth = memberStatused.length
    ? Math.round(memberStatused.filter(s => s === "green").length / memberStatused.length * 100) : null;

  const isViewingOwn = selectedMemberId === currentUser?.id;
  const atRiskGoals = memberGoals.filter(g => ["yellow", "red"].includes(getGoalStatus(g)));

  return (
    <div className="space-y-5">
      {/* Org health banner */}
      <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: E3.navy }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Organizational Health Score</div>
            <div className="text-5xl font-black mb-1" style={{ color: healthColor }}>
              {health}<span className="text-2xl font-normal opacity-40">/100</span>
            </div>
            <div className="text-sm opacity-50">{cg.length} goals tracked · {company.name}</div>
          </div>
          <div className="flex gap-6">
            {[["green","On Track"],["yellow","At Risk"],["red","Off Track"]].map(([s, label]) => (
              <div key={s} className="text-center">
                <div className="text-3xl font-black" style={{ color: STATUS_CONFIG[s].dot }}>
                  {cg.filter(g => getGoalStatus(g) === s).length}
                </div>
                <div className="text-xs opacity-40 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member toggle — avatar pills */}
      <div className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: E3.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-black uppercase tracking-widest" style={{ color: E3.muted }}>Viewing Scorecard For</div>
          <button onClick={() => { setShowAddForm(s => !s); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-colors"
            style={{ backgroundColor: showAddForm ? E3.navy : E3.accentLight, color: showAddForm ? "white" : E3.accent }}>
            <Plus size={12} /> {showAddForm ? "Cancel" : "Add Item"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map(m => {
            const mGoals = cg.filter(g => g.owner === m.id);
            const mAtRisk = mGoals.filter(g => ["yellow","red"].includes(getGoalStatus(g))).length;
            const isSelected = m.id === selectedMemberId;
            return (
              <button key={m.id} onClick={() => setSelectedMemberId(m.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                style={{
                  borderColor: isSelected ? E3.accent : E3.border,
                  backgroundColor: isSelected ? E3.accentLight : "white",
                  boxShadow: isSelected ? `0 0 0 2px ${E3.accent}22` : "none",
                }}>
                <Avatar name={m.name} size={7} />
                <div className="text-left">
                  <div className="text-xs font-black leading-tight" style={{ color: isSelected ? E3.navy : E3.navy }}>
                    {m.name}{m.id === currentUser?.id && <span className="ml-1 font-normal" style={{ color: E3.accent }}>(you)</span>}
                  </div>
                  <div className="text-xs leading-tight" style={{ color: E3.muted }}>
                    {mGoals.length} goal{mGoals.length !== 1 ? "s" : ""}
                    {mAtRisk > 0 && <span className="ml-1 font-black" style={{ color: "#dc2626" }}>· {mAtRisk} at risk</span>}
                  </div>
                </div>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full ml-1 flex-shrink-0" style={{ backgroundColor: E3.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add form — inline, appears below toggle */}
      {showAddForm && (
        <AddScorecardItemForm
          members={members}
          companyId={company.id}
          selectedOwnerId={selectedMemberId}
          onSave={(newGoal) => { onAddGoal(newGoal); setShowAddForm(false); }}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Scorecard for selected member */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: E3.border }}>
        {/* Card header */}
        <div className="px-6 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: E3.border }}>
          <div className="flex items-center gap-3">
            <Avatar name={selectedMember?.name} size={9} />
            <div>
              <h3 className="font-black text-sm" style={{ color: E3.navy }}>
                {isViewingOwn ? "My Scorecard" : `${selectedMember?.name}'s Scorecard`}
              </h3>
              <div className="text-xs mt-0.5" style={{ color: E3.muted }}>
                {memberGoals.length} goal{memberGoals.length !== 1 ? "s" : ""} assigned
                · Current month: <strong>{currentMonth}</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {memberHealth !== null && (
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: memberHealth >= 70 ? "#059669" : memberHealth >= 40 ? "#b45309" : "#dc2626" }}>
                  {memberHealth}%
                </div>
                <div className="text-xs" style={{ color: E3.muted }}>on-track rate</div>
              </div>
            )}
            <button onClick={() => setShowAddForm(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all"
              style={{ borderColor: E3.border, color: E3.muted, backgroundColor: showAddForm ? E3.accentLight : "white" }}
              title={`Add goal to ${isViewingOwn ? "my" : selectedMember?.name + "'s"} scorecard`}>
              <Plus size={12} /> Add Goal
            </button>
          </div>
        </div>

        {/* Table */}
        {memberGoals.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: E3.silver }}>
              <Plus size={22} style={{ color: E3.muted }} />
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: E3.navy }}>No goals assigned to {isViewingOwn ? "you" : selectedMember?.name} yet</div>
            <div className="text-xs mb-4" style={{ color: E3.muted }}>Use the "Add Goal" button to assign items to this scorecard</div>
            <button onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl text-sm font-black text-white"
              style={{ backgroundColor: E3.navy }}>
              <Plus size={13} className="inline mr-1" /> Add First Goal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: E3.silver }}>
                  <th className="text-left px-5 py-3 font-black text-xs uppercase tracking-wider" style={{ color: E3.muted, minWidth: 220 }}>Goal / Strategy / Tactic</th>
                  <th className="text-left px-3 py-3 font-black text-xs uppercase tracking-wider" style={{ color: E3.muted, minWidth: 52 }}>Level</th>
                  <th className="text-left px-3 py-3 font-black text-xs uppercase tracking-wider" style={{ color: E3.muted, minWidth: 56 }}>Track%</th>
                  {MONTHS.map(m => (
                    <th key={m} className="text-center px-1 py-3 font-black text-xs uppercase"
                      style={{ color: m === currentMonth ? E3.navy : E3.muted, minWidth: 26,
                        fontWeight: m === currentMonth ? 900 : 600 }}>
                      {m.slice(0,1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberGoals.map(goal => {
                  const prog = getGoalProgress(goal);
                  return (
                    <tr key={goal.id} onClick={() => onGoalClick(goal)}
                      className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: E3.border }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <CascadeBadge cascade={goal.cascade} />
                          <span className="font-semibold text-sm" style={{ color: E3.navy }}>{goal.title}</span>
                        </div>
                        {goal.metric && (
                          <div className="text-xs mt-0.5 truncate" style={{ color: E3.muted, maxWidth: 300 }}>{goal.metric}</div>
                        )}
                      </td>
                      <td className="px-3 py-3"><OrgLevelBadge orgLevel={goal.orgLevel} /></td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-black"
                          style={{ color: prog >= 70 ? "#059669" : prog >= 40 ? "#b45309" : prog > 0 ? "#dc2626" : E3.muted }}>
                          {prog > 0 ? `${prog}%` : "—"}
                        </span>
                      </td>
                      {MONTHS.map(m => {
                        const val = goal.scorecard?.[m] ?? null;
                        const isCurrent = m === currentMonth;
                        return (
                          <td key={m} className="text-center px-1 py-3"
                            style={{ backgroundColor: isCurrent ? E3.accentLight : "transparent" }}>
                            <div className="flex justify-center">
                              <StatusDot status={val} size={isCurrent ? 14 : 10} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer legend + add row */}
        <div className="px-5 py-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: E3.border, backgroundColor: E3.silver }}>
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.dot }} />
                <span className="text-xs" style={{ color: E3.muted }}>{v.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: E3.border }}>
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: E3.accentLight, border: `1px solid ${E3.accent}` }} />
              <span className="text-xs" style={{ color: E3.muted }}>Current month highlighted · Click any row to view / edit</span>
            </div>
          </div>
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white flex-shrink-0"
            style={{ backgroundColor: E3.navy }}>
            <Plus size={11} /> Add Goal
          </button>
        </div>
      </div>

      {/* At-risk callout for selected member */}
      {atRiskGoals.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: E3.border }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: E3.border }}>
            <AlertTriangle size={14} style={{ color: "#b45309" }} />
            <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: E3.navy }}>
              {isViewingOwn ? "My Goals" : `${selectedMember?.name}'s Goals`} Needing Attention
            </h3>
            <span className="text-xs font-black ml-auto px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{atRiskGoals.length}</span>
          </div>
          <div className="divide-y" style={{ borderColor: E3.border }}>
            {atRiskGoals.map(goal => {
              const status = getGoalStatus(goal);
              return (
                <div key={goal.id} onClick={() => onGoalClick(goal)}
                  className="flex items-center justify-between px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <OrgLevelBadge orgLevel={goal.orgLevel} />
                    <CascadeBadge cascade={goal.cascade} />
                    <span className="text-sm font-semibold truncate" style={{ color: E3.navy }}>{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <StatusDot status={status} size={12} />
                    <span className="text-xs font-bold" style={{ color: STATUS_CONFIG[status]?.color }}>
                      {STATUS_CONFIG[status]?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CASCADE VIEW — VISUAL PYRAMID ───────────────────────────────────────────
// L3 Tactic card (leaf nodes)
function L3Card({ goal, members, onGoalClick, onAdd, canEdit }) {
  const owner = members.find(m => m.id === goal.owner);
  const status = getGoalStatus(goal);
  return (
    <div onClick={() => onGoalClick(goal)}
      className="rounded-xl border cursor-pointer hover:shadow-md transition-all group relative"
      style={{ borderColor: E3.border, borderLeft: `3px solid ${ORG_LEVELS[2].color}`, backgroundColor: "white" }}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: ORG_LEVELS[2].color, fontSize: 9 }}>L3 Tactic</span>
              <CascadeBadge cascade={goal.cascade} />
              {status && <StatusDot status={status} size={8} />}
            </div>
            <div className="text-xs font-bold leading-snug" style={{ color: E3.navy }}>{goal.title}</div>
            {goal.metric && <div className="text-xs mt-1 truncate" style={{ color: E3.muted }}>{goal.metric}</div>}
          </div>
          {canEdit && (
            <button onClick={e => { e.stopPropagation(); onAdd(goal.id, "L3"); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-blue-50 flex-shrink-0"
              style={{ color: E3.muted }}>
              <Plus size={11} />
            </button>
          )}
        </div>
        {owner && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t" style={{ borderColor: E3.border }}>
            <Avatar name={owner.name} size={5} />
            <span className="text-xs" style={{ color: E3.muted }}>{owner.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// L2 Strategy card — shows the strategy card + its L3 children below
function L2Card({ goal, allGoals, members, onGoalClick, onAdd, canEdit }) {
  const [expanded, setExpanded] = useState(true);
  const owner = members.find(m => m.id === goal.owner);
  const status = getGoalStatus(goal);
  const progress = getGoalProgress(goal);

  // Build strategy→L3 links, same pattern as L1Block→L2
  const strategies = (goal.strategies || []).map(s => {
    const strat = typeof s === "string" ? { text: s, ownerId: null, childGoalId: null } : s;
    const childGoal = allGoals.find(g => g.id === strat.childGoalId);
    const stratOwner = members.find(m => m.id === strat.ownerId);
    return { ...strat, childGoal, stratOwner };
  });

  // L3 children added manually (not linked via a strategy)
  const linkedChildIds = new Set(strategies.map(s => s.childGoalId).filter(Boolean));
  const unlinkedL3 = allGoals.filter(g => g.parentId === goal.id && !linkedChildIds.has(g.id));
  const allColumns = [...strategies, ...unlinkedL3.map(g => ({ childGoal: g, text: null, unlinked: true }))];
  const hasChildren = allColumns.length > 0;
  const colCount = Math.min(allColumns.length || 1, 3);

  return (
    <div className="flex flex-col">
      {/* L2 Goal card */}
      <div className="rounded-xl border cursor-pointer hover:shadow-md transition-all group"
        style={{ borderColor: E3.border, borderLeft: `4px solid ${ORG_LEVELS[1].color}`, backgroundColor: "white" }}>
        <div className="p-4" onClick={() => onGoalClick(goal)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider"
                  style={{ color: ORG_LEVELS[1].color, fontSize: 9 }}>L2 Goal</span>
                <CascadeBadge cascade={goal.cascade} />
                {status && <StatusDot status={status} size={9} />}
                {status && <span className="text-xs font-bold" style={{ color: STATUS_CONFIG[status].color, fontSize: 9 }}>{STATUS_CONFIG[status].label}</span>}
              </div>
              <div className="text-sm font-bold leading-snug" style={{ color: E3.navy }}>{goal.title}</div>
              {goal.metric && <div className="text-xs mt-1" style={{ color: E3.muted }}>{goal.metric}</div>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {canEdit && (
                <button onClick={e => { e.stopPropagation(); onAdd(goal.id, "L2"); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-blue-50"
                  style={{ color: E3.muted }} title="Add L3 Strategy">
                  <Plus size={12} />
                </button>
              )}
              {hasChildren && (
                <button onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
                  className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: E3.muted }}>
                  {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              )}
            </div>
          </div>

          {/* Owner + progress */}
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t" style={{ borderColor: E3.border }}>
            {owner && (
              <>
                <Avatar name={owner.name} size={5} />
                <span className="text-xs font-semibold" style={{ color: E3.muted }}>{owner.name}</span>
                {owner.title && <span className="text-xs" style={{ color: E3.border }}>·</span>}
                {owner.title && <span className="text-xs" style={{ color: E3.muted }}>{owner.title}</span>}
              </>
            )}
            {progress > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                <div className="w-16 rounded-full h-1" style={{ backgroundColor: E3.border }}>
                  <div className="h-1 rounded-full" style={{ width: `${progress}%`,
                    backgroundColor: progress >= 70 ? "#059669" : progress >= 40 ? "#f59e0b" : "#dc2626" }} />
                </div>
                <span className="text-xs font-black" style={{ color: E3.muted }}>{progress}%</span>
              </div>
            )}
            {hasChildren && (
              <span className="text-xs ml-auto" style={{ color: E3.muted }}>
                {allColumns.length} L3 strateg{allColumns.length === 1 ? "y" : "ies"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Strategy connectors → L3 goals */}
      {expanded && hasChildren && (
        <div className="mt-1">
          {/* Central drop line from L2 card */}
          <div className="flex justify-center">
            <div style={{ width: 2, height: 14, backgroundColor: E3.border }} />
          </div>

          {allColumns.length === 0 ? (
            canEdit && (
              <div className="flex justify-center">
                <button onClick={() => onAdd(goal.id, "L2")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-dashed text-xs font-bold"
                  style={{ borderColor: E3.border, color: E3.muted }}>
                  <Plus size={12} /> Add a Strategy → becomes an L3 Goal
                </button>
              </div>
            )
          ) : (
            <>
              {/* Horizontal branch */}
              {allColumns.length > 1 && (
                <div className="flex justify-center">
                  <div style={{
                    width: `${Math.min((colCount - 1) * 34, 96)}%`,
                    height: 2, backgroundColor: E3.border
                  }} />
                </div>
              )}

              {/* L3 columns */}
              <div className="grid gap-2 mt-0"
                style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                {allColumns.map((col, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {/* Drop line */}
                    <div style={{ width: 2, height: 12, backgroundColor: E3.border }} />

                    {/* Strategy label connecting L2 → L3 */}
                    {col.text && (
                      <div className="mb-1.5 px-2 py-1.5 rounded-lg text-center w-full"
                        style={{ backgroundColor: "#f0f7ff", border: `1px solid ${E3.border}` }}>
                        <div className="text-xs font-black leading-tight" style={{ color: "#2a5cb8", fontSize: 9 }}>
                          STRATEGY {i + 1}
                        </div>
                        <div className="text-xs leading-snug mt-0.5 font-medium" style={{ color: E3.navy }}>
                          {col.text.length > 55 ? col.text.slice(0, 55) + "…" : col.text}
                        </div>
                        {col.stratOwner && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Avatar name={col.stratOwner.name} size={3} />
                            <span style={{ fontSize: 9, color: "#2a5cb8", fontWeight: 700 }}>
                              {col.stratOwner.name.split(" ")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {col.unlinked && (
                      <div className="mb-1.5 px-2 py-1 rounded-lg text-center w-full"
                        style={{ backgroundColor: E3.silver, border: `1px dashed ${E3.border}` }}>
                        <div style={{ fontSize: 9, color: E3.muted }}>Unlinked</div>
                      </div>
                    )}

                    {/* L3 goal card */}
                    {col.childGoal ? (
                      <div className="w-full">
                        <L3Card goal={col.childGoal} members={members}
                          onGoalClick={onGoalClick} onAdd={onAdd} canEdit={canEdit} />
                      </div>
                    ) : (
                      <div className="w-full rounded-lg border-2 border-dashed flex items-center justify-center py-3 text-xs font-bold"
                        style={{ borderColor: E3.border, color: E3.muted }}>
                        L3 not created yet
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add strategy CTA at bottom */}
              {canEdit && (
                <div className="flex justify-center mt-2">
                  <button onClick={() => onAdd(goal.id, "L2")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors hover:bg-blue-50"
                    style={{ borderColor: E3.border, color: E3.muted }}>
                    <Plus size={11} /> Add L3 Strategy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// L1 Goal block — the top of the pyramid for each goal
function L1Block({ goal, allGoals, members, onGoalClick, onAdd, canEdit }) {
  const [expanded, setExpanded] = useState(true);
  const owner = members.find(m => m.id === goal.owner);
  const status = getGoalStatus(goal);
  const progress = getGoalProgress(goal);

  // Build the display order: use strategies array to order/label each L2 child
  // A strategy can have a childGoalId (linked) or no linked goal yet
  const strategies = (goal.strategies || []).map(s => {
    const strat = typeof s === "string" ? { text: s, ownerId: null, childGoalId: null } : s;
    const childGoal = allGoals.find(g => g.id === strat.childGoalId);
    const stratOwner = members.find(m => m.id === strat.ownerId);
    return { ...strat, childGoal, stratOwner };
  });

  // L2 children that aren't linked via a strategy (manually added)
  const linkedChildIds = new Set(strategies.map(s => s.childGoalId).filter(Boolean));
  const unlinkedL2 = allGoals.filter(g => g.parentId === goal.id && !linkedChildIds.has(g.id));

  // Total columns for grid
  const allColumns = [...strategies, ...unlinkedL2.map(g => ({ childGoal: g, text: null, unlinked: true }))];
  const colCount = Math.min(allColumns.length || 1, 3);

  return (
    <div className="mb-10">
      {/* L1 Goal — full-width navy block */}
      <div className="rounded-2xl text-white p-5 cursor-pointer hover:opacity-95 transition-opacity"
        style={{ backgroundColor: E3.navy, boxShadow: "0 4px 20px rgba(26,45,90,0.18)" }}
        onClick={() => onGoalClick(goal)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>L1 Goal</span>
              <CascadeBadge cascade={goal.cascade} />
              {status && <StatusDot status={status} size={10} />}
              {status && <span className="text-xs font-bold" style={{ color: STATUS_CONFIG[status].dot }}>{STATUS_CONFIG[status].label}</span>}
            </div>
            <h3 className="text-xl font-black leading-snug mb-2">{goal.title}</h3>
            {goal.metric && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <TrendingUp size={12} className="opacity-60" />
                <span className="text-xs font-bold opacity-60 uppercase tracking-wide">Target:</span>
                <span className="text-sm font-black">{goal.metric}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button onClick={e => { e.stopPropagation(); onAdd(goal.id, "L1"); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}>
                  <Plus size={11} /> Add L2
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
                className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}>
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {owner && (
              <div className="flex items-center gap-1.5 mt-1">
                <Avatar name={owner.name} size={6} />
                <div className="text-right">
                  <div className="text-xs font-black opacity-80">{owner.name}</div>
                  {owner.title && <div className="text-xs opacity-40">{owner.title}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
        {progress > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${progress}%`,
                  backgroundColor: progress >= 70 ? "#6ee7b7" : progress >= 40 ? "#fcd34d" : "#fca5a5" }} />
              </div>
              <span className="text-xs font-black opacity-60">{progress}% on track</span>
            </div>
          </div>
        )}
      </div>

      {/* Cascade expansion */}
      {expanded && (
        <div>
          {/* Central drop line */}
          <div className="flex justify-center">
            <div style={{ width: 2, height: 20, backgroundColor: E3.border }} />
          </div>

          {allColumns.length === 0 ? (
            <div className="flex justify-center mt-2">
              {canEdit ? (
                <button onClick={() => onAdd(goal.id, "L1")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed text-sm font-bold"
                  style={{ borderColor: E3.border, color: E3.muted }}>
                  <Plus size={14} /> Add a Strategy → it becomes an L2 Goal
                </button>
              ) : (
                <div className="text-sm py-3" style={{ color: E3.muted }}>No strategies defined yet.</div>
              )}
            </div>
          ) : (
            <>
              {/* Horizontal branch line spanning all columns */}
              {allColumns.length > 1 && (
                <div className="flex justify-center mb-0">
                  <div style={{ width: `${(colCount - 1) * (100 / colCount)}%`,
                    height: 2, backgroundColor: E3.border, maxWidth: 900 }} />
                </div>
              )}

              {/* Strategy labels + drop lines above each L2 card */}
              <div className="grid gap-4 mt-0" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                {allColumns.map((col, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {/* Drop line */}
                    <div style={{ width: 2, height: 16, backgroundColor: E3.border }} />

                    {/* Strategy label pill — "the HOW that became this L2 goal" */}
                    {col.text && (
                      <div className="mb-2 px-3 py-1.5 rounded-full text-center max-w-full"
                        style={{ backgroundColor: E3.accentLight, border: `1px solid ${E3.border}` }}>
                        <div className="text-xs font-black leading-tight" style={{ color: E3.navy }}>
                          Strategy {i + 1}
                        </div>
                        <div className="text-xs leading-snug mt-0.5" style={{ color: E3.muted }}>
                          {col.text.length > 60 ? col.text.slice(0, 60) + "…" : col.text}
                        </div>
                        {col.stratOwner && (
                          <div className="flex items-center justify-center gap-1 mt-1.5">
                            <Avatar name={col.stratOwner.name} size={4} />
                            <span className="text-xs font-bold" style={{ color: E3.accent }}>{col.stratOwner.name.split(" ")[0]}</span>
                            <span className="text-xs" style={{ color: E3.muted }}>accountable</span>
                          </div>
                        )}
                      </div>
                    )}
                    {col.unlinked && (
                      <div className="mb-2 px-3 py-1 rounded-full text-center"
                        style={{ backgroundColor: E3.silver, border: `1px dashed ${E3.border}` }}>
                        <div className="text-xs" style={{ color: E3.muted }}>Manually added</div>
                      </div>
                    )}

                    {/* The L2 Goal card */}
                    {col.childGoal ? (
                      <div className="w-full">
                        <L2Card goal={col.childGoal} allGoals={allGoals} members={members}
                          onGoalClick={onGoalClick} onAdd={onAdd} canEdit={canEdit} />
                      </div>
                    ) : (
                      <div className="w-full rounded-xl border-2 border-dashed flex items-center justify-center py-4 text-xs font-bold"
                        style={{ borderColor: E3.border, color: E3.muted }}>
                        L2 goal not created yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CascadeView({ goals, company, members, onGoalClick, onAdd, canEdit }) {
  const [search, setSearch] = useState("");
  const cg = goals.filter(g => g.companyId === company.id);

  const filtered = useMemo(() => {
    if (!search.trim()) return cg;
    const q = search.toLowerCase();
    return cg.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.metric?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }, [cg, search]);

  const searching = search.trim().length > 0;
  const l1Goals = searching
    ? filtered
    : cg.filter(g => !g.parentId);

  // Org-level stats for pyramid summary header
  const levelStats = ORG_LEVELS.map(lv => {
    const lg = cg.filter(g => g.orgLevel === lv.id);
    return { ...lv, count: lg.length,
      green: lg.filter(g => getGoalStatus(g) === "green").length,
      yellow: lg.filter(g => getGoalStatus(g) === "yellow").length,
      red: lg.filter(g => getGoalStatus(g) === "red").length };
  });

  return (
    <div className="space-y-5">
      {/* Pyramid summary strip */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: E3.border }}>
        <div className="flex">
          {levelStats.map((lv, i) => (
            <div key={lv.id} className="flex-1 text-white p-4 text-center relative"
              style={{ backgroundColor: lv.color, clipPath: i === 0 ? "none" : undefined }}>
              <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{lv.short}</div>
              <div className="text-2xl font-black mb-0.5">{lv.count}</div>
              <div className="text-xs opacity-50 mb-2">{i === 0 ? "Goals" : i === 1 ? "Strategies" : "Tactics"}</div>
              <div className="flex justify-center gap-2">
                {lv.green > 0 && <span className="text-xs font-bold" style={{ color: "#6ee7b7" }}>{lv.green}●</span>}
                {lv.yellow > 0 && <span className="text-xs font-bold" style={{ color: "#fcd34d" }}>{lv.yellow}▲</span>}
                {lv.red > 0 && <span className="text-xs font-bold" style={{ color: "#fca5a5" }}>{lv.red}■</span>}
              </div>
              {/* Divider arrow */}
              {i < 2 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                  style={{ width: 0, height: 0, borderTop: "20px solid transparent",
                    borderBottom: "20px solid transparent", borderLeft: `12px solid ${lv.color}` }} />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-2.5 flex items-center justify-between gap-4" style={{ backgroundColor: E3.silver }}>
          <div className="text-xs font-black uppercase tracking-widest" style={{ color: E3.muted }}>
            Level Order Planning · L1 Goals cascade into L2 Strategies which cascade into L3 Tactics
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white" style={{ borderColor: E3.border }}>
              <Search size={12} style={{ color: E3.muted }} />
              <input className="text-sm focus:outline-none bg-transparent w-36" placeholder="Search goals..."
                value={search} onChange={e => setSearch(e.target.value)} style={{ color: E3.navy }} />
              {search && <button onClick={() => setSearch("")}><X size={11} style={{ color: E3.muted }} /></button>}
            </div>
            {canEdit && (
              <button onClick={() => onAdd(null, "L1")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white"
                style={{ backgroundColor: E3.navy }}>
                <Plus size={12} /> Add L1
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pyramid body */}
      <div>
        {l1Goals.length === 0 && !searching && (
          <div className="bg-white rounded-2xl border text-center py-16" style={{ borderColor: E3.border }}>
            <Layers size={36} className="mx-auto mb-3" style={{ color: E3.border }} />
            <div className="text-sm" style={{ color: E3.muted }}>No goals yet. Add your first L1 Goal to get started.</div>
          </div>
        )}
        {l1Goals.length === 0 && searching && (
          <div className="bg-white rounded-2xl border text-center py-10" style={{ borderColor: E3.border }}>
            <Search size={28} className="mx-auto mb-2" style={{ color: E3.border }} />
            <div className="text-sm" style={{ color: E3.muted }}>No goals match "{search}"</div>
          </div>
        )}
        {searching
          ? filtered.map(g => (
            <div key={g.id} onClick={() => onGoalClick(g)}
              className="bg-white rounded-xl border mb-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
              style={{ borderColor: E3.border }}>
              <OrgLevelBadge orgLevel={g.orgLevel} />
              <CascadeBadge cascade={g.cascade} />
              <span className="text-sm font-semibold flex-1" style={{ color: E3.navy }}>{g.title}</span>
              {getGoalStatus(g) && <StatusDot status={getGoalStatus(g)} size={10} />}
            </div>
          ))
          : l1Goals.map(l1 => (
            <L1Block key={l1.id} goal={l1} allGoals={cg} members={members}
              onGoalClick={onGoalClick} onAdd={onAdd} canEdit={canEdit} />
          ))
        }
      </div>
    </div>
  );
}

// ─── SCORECARD VIEW ───────────────────────────────────────────────────────────
function ScorecardView({ goals, company, members, onGoalClick, onUpdateScorecard }) {
  const cg = goals.filter(g => g.companyId === company.id);
  const [filterLevel, setFilterLevel] = useState("all");
  const filtered = filterLevel === "all" ? cg : cg.filter(g => g.orgLevel === filterLevel);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: E3.border }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: E3.border }}>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: E3.navy }}>Execution Scorecard</h3>
            <div className="text-xs mt-0.5" style={{ color: E3.muted }}>Click any dot to cycle status · Green → Yellow → Red → Empty</div>
          </div>
          <div className="flex gap-1">
            {["all", "L1", "L2", "L3"].map(f => (
              <button key={f} onClick={() => setFilterLevel(f)}
                className="px-2.5 py-1 rounded-lg text-xs font-black transition-colors"
                style={{ backgroundColor: filterLevel === f ? E3.navy : E3.silver, color: filterLevel === f ? "white" : E3.muted }}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: E3.navy }}>
                <th className="text-left px-5 py-3 text-white font-black text-xs uppercase tracking-wider" style={{ minWidth: 60 }}>ID</th>
                <th className="text-left px-3 py-3 text-white font-black text-xs uppercase tracking-wider" style={{ minWidth: 200 }}>Goal</th>
                <th className="text-left px-3 py-3 text-white font-black text-xs uppercase tracking-wider" style={{ minWidth: 80 }}>Lead</th>
                <th className="text-left px-3 py-3 text-white font-black text-xs uppercase tracking-wider" style={{ minWidth: 60 }}>Track%</th>
                {MONTHS.map(m => (
                  <th key={m} className="text-center px-1 py-3 text-white font-black uppercase tracking-wider" style={{ fontSize: 9, minWidth: 28 }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((goal, i) => {
                const owner = members.find(m => m.id === goal.owner);
                const prog = getGoalProgress(goal);
                return (
                  <tr key={goal.id} className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{ borderColor: E3.border }}
                    onClick={() => onGoalClick(goal)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <OrgLevelBadge orgLevel={goal.orgLevel} />
                        <span className="text-sm font-black" style={{ color: E3.navy }}>{i + 1}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-sm truncate" style={{ color: E3.navy, maxWidth: 220 }}>{goal.title}</div>
                      {goal.metric && <div className="text-xs truncate mt-0.5" style={{ color: E3.muted, maxWidth: 220 }}>{goal.metric}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={owner?.name} size={6} />
                        <span className="text-xs font-semibold" style={{ color: E3.navy }}>{owner?.name?.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-black" style={{ color: prog >= 70 ? "#059669" : prog >= 40 ? "#b45309" : prog > 0 ? "#dc2626" : E3.muted }}>
                        {prog > 0 ? `${prog}%` : "—"}
                      </span>
                    </td>
                    {MONTHS.map(m => (
                      <td key={m} className="text-center px-1 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center">
                          <StatusDot status={goal.scorecard?.[m] ?? null} size={20} interactive
                            onClick={() => onUpdateScorecard(goal.id, m, cycleStatus(goal.scorecard?.[m] ?? null))} />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t flex items-center gap-4" style={{ borderColor: E3.border, backgroundColor: E3.silver }}>
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: E3.muted }}>Legend:</span>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.dot }} />
              <span className="text-xs font-semibold" style={{ color: E3.muted }}>{v.label}</span>
            </div>
          ))}
          <span className="text-xs" style={{ color: E3.muted }}>· Based on outcomes, not activity</span>
        </div>
      </div>
    </div>
  );
}

// ─── CHARTS VIEW ──────────────────────────────────────────────────────────────
function ChartsView({ goals, company }) {
  const cg = goals.filter(g => g.companyId === company.id);

  const byLevel = ORG_LEVELS.map(lv => {
    const lg = cg.filter(g => g.orgLevel === lv.id);
    const green = lg.filter(g => getGoalStatus(g) === "green").length;
    const yellow = lg.filter(g => getGoalStatus(g) === "yellow").length;
    const red = lg.filter(g => getGoalStatus(g) === "red").length;
    return { name: lv.short, green, yellow, red, total: lg.length };
  });

  const coreVsFlank = [
    { name: "Core", value: cg.filter(g => g.cascade === "core").length, color: E3.navy },
    { name: "Flank", value: cg.filter(g => g.cascade === "flank").length, color: E3.accent },
  ];

  // Build REAL trend from actual scorecard data
  const trend = useMemo(() => {
    return MONTHS.map(m => {
      const entry = { m };
      ORG_LEVELS.forEach(lv => {
        const lvGoals = cg.filter(g => g.orgLevel === lv.id);
        const withStatus = lvGoals.filter(g => g.scorecard?.[m]);
        if (!withStatus.length) { entry[lv.id] = null; return; }
        const greens = withStatus.filter(g => g.scorecard[m] === "green").length;
        entry[lv.id] = Math.round(greens / withStatus.length * 100);
      });
      return entry;
    }).filter(e => ORG_LEVELS.some(lv => e[lv.id] !== null));
  }, [cg]);

  const card = "bg-white rounded-2xl border shadow-sm p-6";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div className={card} style={{ borderColor: E3.border }}>
          <div className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: E3.navy }}>Goal Status by Org Level</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byLevel} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={E3.border} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: E3.muted, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: E3.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${E3.border}` }} />
              <Bar dataKey="green" name="On Track" stackId="a" fill="#059669" radius={[0,0,0,0]} />
              <Bar dataKey="yellow" name="At Risk" stackId="a" fill="#f59e0b" />
              <Bar dataKey="red" name="Off Track" stackId="a" fill="#dc2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={card} style={{ borderColor: E3.border }}>
          <div className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: E3.navy }}>Core vs. Flank Goals</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={coreVsFlank} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {coreVsFlank.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {coreVsFlank.map(d => (
                <div key={d.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-black" style={{ color: E3.navy }}>{d.name}</span>
                  </div>
                  <div className="text-2xl font-black" style={{ color: d.color }}>{d.value}</div>
                  <div className="text-xs" style={{ color: E3.muted }}>{d.name === "Core" ? "Company-wide priority" : "Diversified approach"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={card} style={{ borderColor: E3.border }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-black uppercase tracking-wider" style={{ color: E3.navy }}>On-Track % by Level — Live from Scorecard</div>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: E3.accentLight, color: E3.accent }}>Real Data</span>
        </div>
        {trend.length < 2 ? (
          <div className="text-center py-8 text-sm" style={{ color: E3.muted }}>Update scorecard data to see trend visualization.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={E3.border} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: E3.muted, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: E3.muted }} axisLine={false} tickLine={false} domain={[0, 100]}
                tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => v !== null ? [`${v}%`] : ["No data"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${E3.border}` }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {ORG_LEVELS.map(lv => (
                <Line key={lv.id} type="monotone" dataKey={lv.id} stroke={lv.color}
                  strokeWidth={2.5} dot={{ r: 3 }} name={lv.short} connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── MEETING VIEW ─────────────────────────────────────────────────────────────
function MeetingView({ goals, company, members }) {
  const cg = goals.filter(g => g.companyId === company.id);
  const today = new Date();
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const needsAttention = cg.filter(g => ["yellow","red"].includes(getGoalStatus(g)));
  const dueSoon = cg.filter(g => { if (!g.dueDate) return false; const d = new Date(g.dueDate); return d >= today && d <= nextWeek; });
  const withComments = cg.filter(g => g.comments?.length > 0);
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    const el = document.getElementById("meeting-printable");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Weekly Leadership Review — ${company.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #1a2d5a; padding: 32px; font-size: 13px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 28px; color: #6b7a99; border-bottom: 1px solid #dde3f0; padding-bottom: 6px; }
        .goal { padding: 10px 0; border-bottom: 1px solid #f0f2f7; }
        .meta { color: #6b7a99; font-size: 11px; margin-top: 2px; }
        .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 900; margin-right: 4px; }
        .bullet { color: #6b7a99; margin: 4px 0; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;margin-bottom:4px">E3 Strategy Cascade · Level Order Planning</div>
      <h1>Weekly Leadership Review</h1>
      <div style="opacity:0.5;margin-bottom:24px">${dateStr} · ${company.name}</div>
      ${el?.innerHTML || ""}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const sections = [
    {
      num: "01", title: "Execution Review — At Risk Goals", count: needsAttention.length, time: "~15 min",
      color: "#dc2626", bg: "#fee2e2",
      content: needsAttention.length === 0
        ? <p className="text-sm pl-8" style={{ color: E3.muted }}>🎉 All goals on track this week!</p>
        : <div className="space-y-3 pl-8">{needsAttention.map(g => {
            const owner = members.find(m => m.id === g.owner);
            return (
              <div key={g.id} className="border rounded-xl p-4" style={{ borderColor: E3.border }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <OrgLevelBadge orgLevel={g.orgLevel} />
                      <CascadeBadge cascade={g.cascade} />
                      <StatusDot status={getGoalStatus(g)} size={10} />
                      <span className="text-xs font-bold" style={{ color: STATUS_CONFIG[getGoalStatus(g)]?.color }}>
                        {STATUS_CONFIG[getGoalStatus(g)]?.label}
                      </span>
                    </div>
                    <div className="font-bold text-sm" style={{ color: E3.navy }}>{g.title}</div>
                    {g.metric && <div className="text-xs mt-0.5" style={{ color: E3.muted }}>📊 {g.metric}</div>}
                    {g.comments?.slice(-1).map(c => (
                      <div key={c.id} className="text-xs italic mt-1" style={{ color: E3.muted }}>"{c.text}"</div>
                    ))}
                  </div>
                  <Avatar name={owner?.name} size={7} />
                </div>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: E3.border }}>
                  <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: E3.muted }}>Discussion Points</div>
                  <div className="text-xs space-y-0.5" style={{ color: E3.muted }}>
                    <div>• What's blocking progress toward: <em>{g.metric}</em>?</div>
                    <div>• Which strategy needs adjustment?</div>
                    <div>• What resources or decisions are needed?</div>
                  </div>
                </div>
              </div>
            );
          })}</div>
    },
    {
      num: "02", title: "Due This Week", count: dueSoon.length, time: "~10 min",
      color: "#b45309", bg: "#fef3c7",
      content: dueSoon.length === 0
        ? <p className="text-sm pl-8" style={{ color: E3.muted }}>No goals due this week.</p>
        : <div className="space-y-2 pl-8">{dueSoon.map(g => {
            const owner = members.find(m => m.id === g.owner);
            return (
              <div key={g.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border" style={{ borderColor: E3.border }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Calendar size={13} style={{ color: "#b45309" }} />
                  <OrgLevelBadge orgLevel={g.orgLevel} />
                  <span className="text-sm font-semibold truncate" style={{ color: E3.navy }}>{g.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <Avatar name={owner?.name} size={6} />
                  <span className="text-xs font-bold" style={{ color: E3.muted }}>{g.dueDate}</span>
                </div>
              </div>
            );
          })}</div>
    },
    {
      num: "03", title: "Open Discussions & Comments", count: withComments.length, time: "~10 min",
      color: E3.accent, bg: E3.accentLight,
      content: withComments.length === 0
        ? <p className="text-sm pl-8" style={{ color: E3.muted }}>No open discussion items.</p>
        : <div className="space-y-2 pl-8">{withComments.map(g => (
            <div key={g.id} className="flex items-center gap-3 text-sm" style={{ color: E3.navy }}>
              <MessageSquare size={13} style={{ color: E3.accent }} />
              <OrgLevelBadge orgLevel={g.orgLevel} />
              <span className="truncate">{g.title}</span>
              <span className="text-xs flex-shrink-0" style={{ color: E3.muted }}>({g.comments.length})</span>
            </div>
          ))}</div>
    },
    {
      num: "04", title: "Scorecard Updates & Wrap-Up", count: null, time: "~5 min",
      color: "#059669", bg: "#d1fae5",
      content: (
        <div className="pl-8 space-y-1.5 text-sm" style={{ color: E3.muted }}>
          <div>• Update monthly scorecard dots for each goal (outcomes, not activity)</div>
          <div>• Confirm accountability owners for at-risk goals</div>
          <div>• Set top priorities for next week across L1, L2, L3</div>
          <div>• Identify any strategic decisions needed at the L1 level</div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: E3.border }}>
      <div className="px-8 py-6 border-b" style={{ backgroundColor: E3.navy, borderColor: E3.navyLight }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-white opacity-40 mb-1">E3 Strategy Cascade · Level Order Planning</div>
            <h2 className="text-xl font-black text-white">Weekly Leadership Review</h2>
            <div className="text-sm text-white opacity-40 mt-1">{dateStr} · {company.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-black px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              AUTO-GENERATED AGENDA
            </div>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}>
              <Printer size={13} /> Print / Export
            </button>
          </div>
        </div>
      </div>
      <div id="meeting-printable" className="px-8 py-6 space-y-8">
        {sections.map(s => (
          <div key={s.num}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                style={{ backgroundColor: s.bg, color: s.color }}>{s.num}</div>
              <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: E3.navy }}>
                {s.title}{s.count !== null ? ` (${s.count})` : ""}
              </h3>
              <span className="text-xs font-semibold" style={{ color: E3.muted }}>{s.time}</span>
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TEAM VIEW ────────────────────────────────────────────────────────────────
function TeamView({ company, members, currentUserRole, onInvite }) {
  const ROLE_ICONS = { admin: Shield, editor: PenTool, viewer: Eye };
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: E3.border }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: E3.border }}>
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: E3.navy }}>Team Members</h3>
          <div className="text-xs mt-0.5" style={{ color: E3.muted }}>{members.length} members · {company.name}</div>
        </div>
        {(currentUserRole === "admin" || currentUserRole === "superadmin") && (
          <button onClick={onInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white"
            style={{ backgroundColor: E3.navy }}>
            <Plus size={12} /> Invite Member
          </button>
        )}
      </div>
      <div className="divide-y" style={{ borderColor: E3.border }}>
        {members.map(m => {
          const RIcon = ROLE_ICONS[m.role] || Eye;
          return (
            <div key={m.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={m.name} size={9} />
                <div>
                  <div className="text-sm font-black" style={{ color: E3.navy }}>{m.name}</div>
                  <div className="text-xs" style={{ color: E3.muted }}>{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: E3.silver }}>
                <RIcon size={11} style={{ color: E3.muted }} />
                <span className="text-xs font-bold capitalize" style={{ color: E3.muted }}>{m.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InviteForm({ onSave, onClose }) {
  const [email, setEmail] = useState(""); const [role, setRole] = useState("editor");
  const inp = "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none";
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Email</label>
        <input type="email" className={inp} style={{ borderColor: E3.border, color: E3.navy }}
          value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: E3.muted }}>Role</label>
        <select className={inp} style={{ borderColor: E3.border, color: E3.navy }}
          value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin — Full access</option>
          <option value="editor">Editor — Edit own items</option>
          <option value="viewer">Viewer — Read only</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-black border hover:bg-gray-50"
          style={{ borderColor: E3.border, color: E3.muted }}>Cancel</button>
        <button onClick={() => email && onSave(email, role)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ backgroundColor: E3.navy }}>
          <Mail size={13} /> Send Invite
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function E3LevelOrderPlanning() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCompanyId, setActiveCompanyId] = useState("c1");
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => { loadData().then(d => { setData(d || SEED); setLoading(false); }); }, []);
  useEffect(() => { if (data) saveData(data); }, [data]);

  const company = data?.companies.find(c => c.id === activeCompanyId);
  const members = company?.members || [];
  const currentUser = data?.currentUser;
  const isSuperAdmin = currentUser?.role === "superadmin";
  const userRole = members.find(m => m.id === currentUser?.id)?.role || currentUser?.role;
  const canEdit = ["admin","superadmin","editor"].includes(userRole);
  const closeModal = () => setModal(null);

  const handleSaveGoal = (form) => {
    const nextLevel = { L1: "L2", L2: "L3", L3: null };
    const typeForLevel = { L1: "Goal", L2: "Strategy", L3: "Tactic" };
    const emptyScorecard = Object.fromEntries(MONTHS.map(m => [m, null]));

    setData(d => {
      const goals = [...d.goals];
      let savedGoalId;

      if (modal?.goal) {
        // ── Editing existing goal ──────────────────────────────────────────
        const idx = goals.findIndex(g => g.id === modal.goal.id);
        const updatedStrategies = form.strategies.map(s => {
          // Preserve any childGoalId already stored on the matching strategy so
          // editing a parent goal never breaks its existing child-goal links.
          const existing = modal.goal.strategies?.find?.(es =>
            (typeof es === "string" ? es : es.text) === s.text && es.childGoalId
          );
          return existing ? { ...s, childGoalId: s.childGoalId || existing.childGoalId } : s;
        });
        goals[idx] = { ...goals[idx], ...form, strategies: updatedStrategies, parentId: goals[idx].parentId };
        savedGoalId = modal.goal.id;

        // Create child goals for any new strategies that don't have a childGoalId yet
        const childLevel = nextLevel[form.orgLevel];
        if (childLevel) {
          updatedStrategies.forEach((s, i) => {
            if (s.text.trim() && !s.childGoalId) {
              const childId = `g${Date.now()}${i}`;
              goals.push({
                id: childId,
                companyId: form.companyId,
                orgLevel: childLevel,
                type: typeForLevel[childLevel],
                cascade: form.cascade,
                title: s.text,
                metric: "",
                description: `Cascaded from ${form.orgLevel} goal: ${form.title}`,
                owner: s.ownerId || form.owner,
                dueDate: form.dueDate,
                parentId: savedGoalId,
                strategies: [],
                scorecard: { ...emptyScorecard },
                comments: [],
              });
              // Link childGoalId back on the strategy
              goals[idx].strategies[i] = { ...s, childGoalId: childId };
            }
          });
        }
      } else {
        // ── New goal ──────────────────────────────────────────────────────
        const parentGoalId = `g${Date.now()}`;
        const childLevel = nextLevel[form.orgLevel];

        // Create child goals first and link them
        const linkedStrategies = (form.strategies || []).map((s, i) => {
          if (!s.text?.trim() || !childLevel) return s;
          const childId = `g${Date.now()}${i + 1}`;
          goals.push({
            id: childId,
            companyId: form.companyId,
            orgLevel: childLevel,
            type: typeForLevel[childLevel],
            cascade: form.cascade,
            title: s.text,
            metric: "",
            description: `Cascaded from ${form.orgLevel} goal: ${form.title}`,
            owner: s.ownerId || form.owner,
            dueDate: form.dueDate,
            parentId: parentGoalId,
            strategies: [],
            scorecard: { ...emptyScorecard },
            comments: [],
          });
          return { ...s, childGoalId: childId };
        });

        goals.push({
          ...form,
          id: parentGoalId,
          strategies: linkedStrategies,
          comments: [],
          scorecard: { ...emptyScorecard },
        });
      }

      return { ...d, goals };
    });
    closeModal();
  };


  const handleAddGoalDirect = (newGoal) => {
    setData(d => ({ ...d, goals: [...d.goals, newGoal] }));
  };

  const handleDeleteGoal = (goalId) => {
    // Also delete children recursively
    setData(d => {
      const toDelete = new Set();
      const collectIds = (id) => {
        toDelete.add(id);
        d.goals.filter(g => g.parentId === id).forEach(g => collectIds(g.id));
      };
      collectIds(goalId);
      return { ...d, goals: d.goals.filter(g => !toDelete.has(g.id)) };
    });
    closeModal();
  };

  const handleAddComment = (goalId, text) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId
        ? { ...g, comments: [...(g.comments || []), { id: `cm${Date.now()}`, userId: currentUser.id, text, date: new Date().toISOString().slice(0,10) }] }
        : g)
    }));
  };

  const handleUpdateScorecard = (goalId, month, value) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId
        ? { ...g, scorecard: { ...g.scorecard, [month]: value } }
        : g)
    }));
  };

  const handleInvite = (email, role) => {
    setData(d => ({
      ...d,
      companies: d.companies.map(c => c.id === activeCompanyId
        ? { ...c, members: [...c.members, { id: `u${Date.now()}`, name: email.split("@")[0], email, role }] }
        : c)
    }));
    closeModal();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: E3.silver }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: E3.navy, borderTopColor: "transparent" }} />
        <div className="text-xs font-black uppercase tracking-widest" style={{ color: E3.muted }}>Loading...</div>
      </div>
    </div>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "cascade", label: "Goal Cascade", icon: Layers },
    { id: "scorecard", label: "Scorecard", icon: BarChart2 },
    { id: "charts", label: "Charts", icon: TrendingUp },
    { id: "meeting", label: "Meeting", icon: FileText },
    { id: "team", label: "Team", icon: Users },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: E3.silver, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} transition-all duration-300 flex flex-col flex-shrink-0 z-20`}
        style={{ backgroundColor: E3.navy, minHeight: "100vh" }}>
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white">
            <span className="font-black text-xs" style={{ color: E3.navy }}>E3</span>
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-black text-white text-sm leading-tight">Strategy Cascade</div>
              <div className="text-xs text-white opacity-30">Level Order Planning</div>
            </div>
          )}
        </div>

        {sidebarOpen && isSuperAdmin && (
          <div className="px-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-black uppercase tracking-widest px-2 mb-2 opacity-30 text-white">Clients</div>
            {data.companies.map(c => (
              <button key={c.id} onClick={() => setActiveCompanyId(c.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${activeCompanyId === c.id ? "bg-white bg-opacity-15" : "hover:bg-white hover:bg-opacity-5"}`}>
                <div className="w-6 h-6 rounded bg-white bg-opacity-20 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{c.logo}</div>
                <span className={`text-sm truncate ${activeCompanyId === c.id ? "font-black text-white" : "text-white opacity-50"}`}>{c.name}</span>
              </button>
            ))}
          </div>
        )}
        {sidebarOpen && !isSuperAdmin && (
          <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-black uppercase tracking-widest opacity-30 text-white mb-1">Workspace</div>
            <div className="text-sm font-black text-white">{company?.name}</div>
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors ${activeView === id ? "bg-white bg-opacity-15 text-white" : "text-white opacity-40 hover:opacity-70 hover:bg-white hover:bg-opacity-5"}`}>
              <Icon size={15} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-bold">{label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-black text-white opacity-20 uppercase tracking-widest leading-relaxed">
              ENVISION.<br />EXECUTE.<br />EXPAND.
            </div>
          </div>
        )}

        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 px-2">
            <Avatar name={currentUser?.name} size={7} />
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">{currentUser?.name}</div>
                <div className="text-xs text-white opacity-30 capitalize">{currentUser?.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderColor: E3.border, boxShadow: "0 1px 3px rgba(26,45,90,0.06)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(s => !s)} style={{ color: E3.muted }}><Menu size={19} /></button>
            <div>
              <h1 className="font-black text-base" style={{ color: E3.navy, letterSpacing: "-0.02em" }}>
                {company?.name} <span className="font-normal opacity-30">·</span> {navItems.find(n => n.id === activeView)?.label}
              </h1>
              <div className="text-xs" style={{ color: E3.muted }}>Level Order Planning · {company?.industry}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <div className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: E3.accentLight, color: E3.accent }}>Super Admin</div>
            )}
            {canEdit && (activeView === "cascade" || activeView === "scorecard") && (
              <button onClick={() => setModal({ type: "add", parentId: null, orgLevel: "L1" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white"
                style={{ backgroundColor: E3.navy }}>
                <Plus size={13} /> Add Goal
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeView === "dashboard" && <DashboardView goals={data.goals} company={company} members={members} currentUser={currentUser} onGoalClick={g => setModal({ type: "detail", goal: g })} onAddGoal={handleAddGoalDirect} />}
          {activeView === "cascade" && <CascadeView goals={data.goals} company={company} members={members} onGoalClick={g => setModal({ type: "detail", goal: g })} onAdd={(parentId, orgLevel) => setModal({ type: "add", parentId, orgLevel })} canEdit={canEdit} />}
          {activeView === "scorecard" && <ScorecardView goals={data.goals} company={company} members={members} onGoalClick={g => setModal({ type: "detail", goal: g })} onUpdateScorecard={handleUpdateScorecard} />}
          {activeView === "charts" && <ChartsView goals={data.goals} company={company} />}
          {activeView === "meeting" && <MeetingView goals={data.goals} company={company} members={members} />}
          {activeView === "team" && <TeamView company={company} members={members} currentUserRole={userRole} onInvite={() => setModal({ type: "invite" })} />}
        </main>
      </div>

      {/* Modals */}
      {modal?.type === "detail" && (() => {
        const liveGoal = data.goals.find(g => g.id === modal.goal.id) || modal.goal;
        return (
          <Modal title="Goal Detail" subtitle={`${liveGoal.orgLevel} · ${liveGoal.type} · ${liveGoal.cascade === "core" ? "Core" : "Flank"}`} onClose={closeModal} wide>
            <GoalDetail goal={liveGoal} allGoals={data.goals} members={members} currentUser={currentUser}
              onEdit={() => setModal({ type: "edit", goal: liveGoal })}
              onDelete={() => handleDeleteGoal(liveGoal.id)}
              onAddComment={handleAddComment} onUpdateScorecard={handleUpdateScorecard} />
          </Modal>
        );
      })()}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal title={modal.type === "edit" ? "Edit Goal" : "Add New Goal"} subtitle="Level Order Planning · Goal → Strategy → Tactic" onClose={closeModal} wide>
          <GoalForm goal={modal.goal} companyId={activeCompanyId} members={members}
            parentId={modal.parentId} defaultOrgLevel={modal.orgLevel}
            onSave={handleSaveGoal} onClose={closeModal} />
        </Modal>
      )}
      {modal?.type === "invite" && (
        <Modal title="Invite Team Member" onClose={closeModal}>
          <InviteForm onSave={handleInvite} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
