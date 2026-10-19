'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { getMaterialImage } from '@/lib/materialImages';

interface MaterialOption {
  value: string;
  label: string;
  desc: string;
  swatch: string;
  labelAr?: string;
  descAr?: string;
}

interface MaterialGroup {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  items: MaterialOption[];
}

const GLOSS =
  'linear-gradient(115deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 34%, rgba(0,0,0,0) 62%, rgba(0,0,0,.16) 100%)';

const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    id: 'zirconia',
    label: 'Zirconia',
    labelAr: 'زركونيا',
    icon: '✨',
    items: [
      {
        value: 'Multi-Layer 3D Pro Gradient Zirconia (49%-43% Translucency, 1200-700 MPa)',
        label: 'Multi-Layer 3D Pro Gradient',
        desc: '49→43% translucency · 1200–700 MPa',
        swatch:
          'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.95), rgba(255,255,255,0) 60%), linear-gradient(180deg,#ffffff 0%,#f3ede2 38%,#e4eaf0 72%,#cdd9e5 100%)',
      },
      {
        value: 'High-Translucent (HT) Monolithic Zirconia (1200 MPa - Posterior)',
        label: 'HT Monolithic Zirconia',
        desc: '1200 MPa · posterior full contour',
        swatch:
          'radial-gradient(90% 70% at 50% 20%, #ffffff, rgba(255,255,255,0) 70%), linear-gradient(180deg,#fdfdfd 0%,#f1f5f8 60%,#e4eaf0 100%)',
      },
      {
        value: 'Ultra-Translucent (UT/SHT) Anterior Zirconia (650-900 MPa)',
        label: 'UT / SHT Anterior',
        desc: '650–900 MPa · incisal & anterior',
        swatch:
          'radial-gradient(80% 60% at 50% 15%, rgba(255,255,255,.9), rgba(255,255,255,0) 65%), linear-gradient(180deg,#f7fbff 0%,#eaf3fb 45%,#d0e0f0 100%)',
      },
      {
        value: 'High-Strength Opaque Zirconia (Coping / Framework Core)',
        label: 'High-Strength Opaque',
        desc: 'Framework / coping core',
        swatch: 'linear-gradient(180deg,#ffffff 0%,#f8f8f5 55%,#eceae4 100%)',
      },
    ],
  },
  {
    id: 'glass',
    label: 'Glass Ceramics',
    labelAr: 'سيراميك زجاجي',
    icon: '💎',
    items: [
      {
        value: 'Lithium Disilicate - IPS e.max CAD / Press (500 MPa)',
        label: 'Lithium Disilicate (e.max)',
        desc: 'CAD / Press · 500 MPa',
        swatch:
          'radial-gradient(100% 70% at 30% 10%, rgba(255,255,255,.85), rgba(255,255,255,0) 60%), linear-gradient(135deg,#eef6fd 0%,#dfeaf5 50%,#c6d8e9 100%)',
      },
      {
        value: 'Zirconia-Reinforced Lithium Silicate (VITA SUPRINITY / Celtra)',
        label: 'Zr-Reinforced Lithium Silicate',
        desc: 'VITA SUPRINITY / Celtra Press',
        swatch:
          'radial-gradient(90% 65% at 70% 10%, rgba(255,255,255,.8), rgba(255,255,255,0) 60%), linear-gradient(160deg,#f8f3ea 0%,#e9eef4 55%,#d3dfe9 100%)',
      },
      {
        value: 'Feldspathic Layered Porcelain (VITA VM9 / Master Veneers)',
        label: 'Feldspathic Porcelain',
        desc: 'VITA VM9 · veneers & layering',
        swatch:
          'repeating-linear-gradient(180deg, rgba(255,255,255,.55) 0 6px, rgba(0,0,0,.025) 6px 12px), linear-gradient(180deg,#fffdf7 0%,#f4ead9 60%,#e4d6c1 100%)',
      },
      {
        value: 'Leucite-Reinforced Glass Ceramic (IPS Empress CAD)',
        label: 'Leucite-Reinforced (Empress)',
        desc: 'IPS Empress CAD · inlays / onlays',
        swatch:
          'radial-gradient(85% 60% at 35% 15%, rgba(255,255,255,.8), rgba(255,255,255,0) 62%), linear-gradient(150deg,#fdf8f6 0%,#f2e9e6 55%,#ded1ce 100%)',
      },
    ],
  },
  {
    id: 'metal',
    label: 'Metal-Ceramic',
    labelAr: 'معدن وسيراميك',
    icon: '⚙️',
    items: [
      {
        value: 'PFM: Ceramic Fused to Co-Cr Laser-Milled Alloy (Nickel-Free)',
        label: 'PFM on Co-Cr Alloy',
        desc: 'Laser-milled · nickel-free',
        swatch: 'linear-gradient(180deg,#f8f5ee 0%,#efe9de 48%,#ccd1d7 52%,#98a1aa 100%)',
      },
      {
        value: 'Titanium Custom Abutment (Grade 5) + Screw-Retained Zirconia Crown',
        label: 'Ti Abutment + Zirconia Crown',
        desc: 'Grade 5 titanium · screw-retained',
        swatch: 'linear-gradient(180deg,#f2f5f9 0%,#dfe5ec 42%,#aab3bd 58%,#7b8590 100%)',
      },
      {
        value: 'Full Cast Noble / High-Gold Alloy',
        label: 'Full Cast High-Gold',
        desc: 'Noble / semi-precious alloy',
        swatch: 'linear-gradient(150deg,#fff3c4 0%,#f0cf72 35%,#c99a2e 70%,#8f6a17 100%)',
      },
    ],
  },
  {
    id: 'polymer',
    label: 'Polymers',
    labelAr: 'بوليمرات',
    icon: '🧪',
    items: [
      {
        value: 'Multi-Layer PMMA High-Impact Disc (Long-Term Provisional / All-on-X)',
        label: 'Multi-Layer PMMA Disc',
        desc: 'Long-term provisional · All-on-X',
        swatch: 'linear-gradient(180deg,#ffffff 0%,#f8f4ec 45%,#e6dccd 100%)',
      },
      {
        value: 'PEEK / BioHPP (Polyetheretherketone Implant & Framework)',
        label: 'PEEK / BioHPP',
        desc: 'Implant & framework substructure',
        swatch: 'linear-gradient(150deg,#f2e6d2 0%,#e3d3b8 55%,#c6ae8c 100%)',
      },
      {
        value: '3D Printed Micro-hybrid Composite Resin (Permanent Crown & Bridge)',
        label: '3D Printed Composite Resin',
        desc: 'Permanent crown & bridge',
        swatch:
          'radial-gradient(circle at 22% 32%, rgba(0,0,0,.06) 0 2px, transparent 2px), radial-gradient(circle at 68% 62%, rgba(0,0,0,.05) 0 2px, transparent 2px), linear-gradient(180deg,#fbfaf7 0%,#efece5 100%)',
      },
    ],
  },
  {
    id: 'removable',
    label: 'Removables',
    labelAr: 'متحركات',
    icon: '🛡️',
    items: [
      {
        value: 'Medical-Grade Multi-Layer Aligner Foil (Polyurethane / PETG)',
        label: 'Clear Aligner Foil',
        desc: 'PETG / polyurethane · clear',
        swatch:
          'linear-gradient(120deg, rgba(255,255,255,.72) 0 16%, rgba(255,255,255,0) 18% 40%, rgba(255,255,255,.5) 42% 47%, rgba(255,255,255,0) 49%), linear-gradient(180deg,#eef6fd 0%,#cfdff0 100%)',
      },
      {
        value: 'Dual-Laminate Hard/Soft Occlusal Nightguard Splint',
        label: 'Dual-Laminate Nightguard',
        desc: 'Hard / soft occlusal splint',
        swatch: 'linear-gradient(180deg,#f0f7ff 0%,#dbe9f7 46%,#9db4cb 48%,#71889f 100%)',
      },
      {
        value: 'Flexible Thermoplastic Valplast / TCS Unbreakable Resin',
        label: 'Flexible Valplast / TCS',
        desc: 'Unbreakable flexible denture',
        swatch:
          'radial-gradient(80% 60% at 40% 20%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%), linear-gradient(150deg,#f6d9dd 0%,#e8b6bf 55%,#cd8b98 100%)',
      },
      {
        value: 'High-Impact Heat-Cured PMMA Acrylic Full Denture',
        label: 'Heat-Cured PMMA Denture',
        desc: 'Full / partial denture acrylic',
        swatch:
          'radial-gradient(70% 50% at 30% 25%, rgba(255,255,255,.35), rgba(255,255,255,0) 60%), linear-gradient(160deg,#efc3c9 0%,#dc9aa6 55%,#b9727f 100%)',
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    icon: '📝',
    items: [
      {
        value: 'Other / Custom Laboratory Material (Specified in Notes)',
        label: 'Other / Custom Material',
        desc: 'Specify the details in Notes',
        labelAr: 'خامة معمل أخرى مخصصة',
        descAr: 'حدد التفاصيل في الملاحظات',
        swatch:
          'repeating-linear-gradient(45deg, rgba(125,140,160,.18) 0 8px, rgba(125,140,160,.06) 8px 16px), linear-gradient(180deg,#f4f6f9 0%,#e8ecf1 100%)',
      },
    ],
  },
];

const MATERIAL_SLUGS: Record<string, string> = {
  'Multi-Layer 3D Pro Gradient Zirconia (49%-43% Translucency, 1200-700 MPa)': 'multi-layer-zirconia',
  'High-Translucent (HT) Monolithic Zirconia (1200 MPa - Posterior)': 'ht-monolithic-zirconia',
  'Ultra-Translucent (UT/SHT) Anterior Zirconia (650-900 MPa)': 'ut-anterior-zirconia',
  'High-Strength Opaque Zirconia (Coping / Framework Core)': 'opaque-zirconia-core',
  'Lithium Disilicate - IPS e.max CAD / Press (500 MPa)': 'lithium-disilicate-emax',
  'Zirconia-Reinforced Lithium Silicate (VITA SUPRINITY / Celtra)': 'zr-reinforced-lithium-silicate',
  'Feldspathic Layered Porcelain (VITA VM9 / Master Veneers)': 'feldspathic-porcelain',
  'Leucite-Reinforced Glass Ceramic (IPS Empress CAD)': 'leucite-empress',
  'PFM: Ceramic Fused to Co-Cr Laser-Milled Alloy (Nickel-Free)': 'pfm-cocr',
  'Titanium Custom Abutment (Grade 5) + Screw-Retained Zirconia Crown': 'titanium-abutment',
  'Full Cast Noble / High-Gold Alloy': 'high-gold-alloy',
  'Multi-Layer PMMA High-Impact Disc (Long-Term Provisional / All-on-X)': 'multi-layer-pmma',
  'PEEK / BioHPP (Polyetheretherketone Implant & Framework)': 'peek-biohpp',
  '3D Printed Micro-hybrid Composite Resin (Permanent Crown & Bridge)': '3d-printed-composite',
  'Medical-Grade Multi-Layer Aligner Foil (Polyurethane / PETG)': 'aligner-foil',
  'Dual-Laminate Hard/Soft Occlusal Nightguard Splint': 'nightguard-splint',
  'Flexible Thermoplastic Valplast / TCS Unbreakable Resin': 'valplast-flexible',
  'High-Impact Heat-Cured PMMA Acrylic Full Denture': 'heat-cured-denture',
};

const ALL_ITEMS = MATERIAL_GROUPS.flatMap((g) => g.items);

function groupIndexOf(value: string): number {
  return MATERIAL_GROUPS.findIndex((g) => g.items.some((it) => it.value === value));
}

export default function MaterialPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const selectedGroupIdx = groupIndexOf(value);
  const selected = ALL_ITEMS.find((it) => it.value === value) || null;

  const [tab, setTab] = useState({ value, idx: selectedGroupIdx === -1 ? 0 : selectedGroupIdx });
  const activeIdx = tab.value === value ? tab.idx : selectedGroupIdx === -1 ? 0 : selectedGroupIdx;
  const activeGroup = MATERIAL_GROUPS[activeIdx] || MATERIAL_GROUPS[0];

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {MATERIAL_GROUPS.map((g, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setTab({ value, idx: i })}
              aria-pressed={on}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                on
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]'
              }`}
            >
              <span className="mr-1">{g.icon}</span>
              {isAr ? g.labelAr : g.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {activeGroup.items.map((item) => {
          const on = item.value === value;
          const materialId = MATERIAL_SLUGS[item.value];
          const media = getMaterialImage(materialId);
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(on ? '' : item.value)}
              aria-pressed={on}
              title={item.value}
              className={`group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-left transition hover:-translate-y-0.5`}
              style={
                on
                  ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent), 0 10px 24px rgba(0,0,0,0.28)' }
                  : undefined
              }
            >
              <div className="relative h-20 w-full sm:h-24" style={{ background: item.swatch }}>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(78% 68% at 50% 40%, rgba(255,255,255,.20), rgba(0,0,0,.10) 70%, rgba(0,0,0,.38) 100%)',
                  }}
                />
                <svg
                  viewBox="0 0 120 88"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`dtm-${materialId}-body`} x1="0.2" y1="0" x2="0.75" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                      <stop offset="38%" stopColor="#ffffff" stopOpacity="0.36" />
                      <stop offset="72%" stopColor="#000000" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.26" />
                    </linearGradient>
                    <linearGradient id={`dtm-${materialId}-edge`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="60" cy="81" rx="30" ry="4" fill="rgba(0,0,0,.28)" />
                  <path
                    d="M26 41 C26 32 31 25 35 22 C39 19 43 29 47 29 C51 29 55 19 60 19 C65 19 69 29 73 29 C77 29 81 19 85 22 C89 25 94 32 94 41 C94 59 90 72 84 76 C76 80 44 80 36 76 C30 72 26 59 26 41 Z"
                    fill={`url(#dtm-${materialId}-body)`}
                    stroke="rgba(0,0,0,.32)"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M26 41 C26 32 31 25 35 22 C39 19 43 29 47 29 C51 29 55 19 60 19 C65 19 69 29 73 29 C77 29 81 19 85 22 C89 25 94 32 94 41 C94 59 90 72 84 76 C76 80 44 80 36 76 C30 72 26 59 26 41 Z"
                    fill={`url(#dtm-${materialId}-edge)`}
                  />
                  <path
                    d="M47 29.5 C47 37 45.5 41 44.5 47"
                    fill="none"
                    stroke="rgba(0,0,0,.13)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M73 29.5 C73 37 74.5 41 75.5 47"
                    fill="none"
                    stroke="rgba(0,0,0,.13)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M34 71 C46 76 74 76 86 71"
                    fill="none"
                    stroke="rgba(0,0,0,.15)"
                    strokeWidth="1.1"
                  />
                  <ellipse
                    cx="57"
                    cy="25"
                    rx="9"
                    ry="4.5"
                    fill="rgba(255,255,255,.45)"
                    transform="rotate(-12 57 25)"
                  />
                  <ellipse cx="36" cy="31" rx="5" ry="3" fill="rgba(255,255,255,.22)" transform="rotate(-24 36 31)" />
                </svg>
                {media && (
                  <img
                    src={media.image_url}
                    alt={media.alt_text}
                    data-material-id={media.id}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      if (el.dataset.ext !== 'alt') {
                        el.dataset.ext = 'alt';
                        el.src = media.image_url.replace(/\.(png|jpe?g)$/i, (m) =>
                          m.toLowerCase() === '.png' ? '.jpg' : '.png'
                        );
                        return;
                      }
                      el.style.display = 'none';
                    }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0" style={{ background: GLOSS }} />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.14), inset 0 -18px 24px rgba(0,0,0,.06)' }}
                />
                {on && (
                  <span
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white"
                    style={{ background: 'var(--accent)' }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[11.5px] font-bold leading-snug text-[var(--text)]">
                  {isAr && item.labelAr ? item.labelAr : item.label}
                </p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-[var(--text-muted)]">
                  {isAr && item.descAr ? item.descAr : item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[var(--text)]">
            {selected
              ? isAr && selected.labelAr
                ? selected.labelAr
                : selected.label
              : isAr
                ? 'لم يتم اختيار خامة بعد'
                : 'No material selected yet'}
          </p>
          <p className="truncate text-[10.5px] text-[var(--text-muted)]">
            {selected ? selected.value : isAr ? 'اختر بطاقة من الأعلى' : 'Pick a card above'}
          </p>
        </div>
        {selected && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            {isAr ? 'إزالة' : 'Clear'}
          </button>
        )}
      </div>
    </div>
  );
}
