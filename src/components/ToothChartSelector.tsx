'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

export type NumberingSystem = 'UNIVERSAL' | 'FDI' | 'PALMER';

interface ToothItem {
  id: number;
  universal: string; // #1 to #32
  fdi: string;       // 18-48
  palmer: string;    // UR8-LL8
  arch: 'UPPER' | 'LOWER';
  side: 'RIGHT' | 'LEFT';
  type: 'central' | 'lateral' | 'canine' | 'premolar1' | 'premolar2' | 'molar1' | 'molar2' | 'molar3';
  nameEn: string;
  nameAr: string;
  thetaDeg: number;
}

// 32 Natural Teeth Placed Clockwise with Wide Anteriors and Spacious Interproximal Gaps
const TEETH_LIST: ToothItem[] = [
  // ─── UPPER RIGHT (Left Side of Screen: Teeth #1 to #8 / FDI 18 to 11 / UR8 to UR1) ───
  { id: 18, universal: '1', fdi: '18', palmer: 'UR8', arch: 'UPPER', side: 'RIGHT', type: 'molar3',    nameEn: 'Upper Right 3rd Molar (Wisdom #1)',  nameAr: 'الضرس الثالث العلوي الأيمن (#1)', thetaDeg: 8 },
  { id: 17, universal: '2', fdi: '17', palmer: 'UR7', arch: 'UPPER', side: 'RIGHT', type: 'molar2',    nameEn: 'Upper Right 2nd Molar (#2)',         nameAr: 'الضرس الثاني العلوي الأيمن (#2)', thetaDeg: 20 },
  { id: 16, universal: '3', fdi: '16', palmer: 'UR6', arch: 'UPPER', side: 'RIGHT', type: 'molar1',    nameEn: 'Upper Right 1st Molar (#3)',         nameAr: 'الضرس الأول العلوي الأيمن (#3)',  thetaDeg: 32 },
  { id: 15, universal: '4', fdi: '15', palmer: 'UR5', arch: 'UPPER', side: 'RIGHT', type: 'premolar2', nameEn: 'Upper Right 2nd Premolar (#4)',      nameAr: 'الضاحك الثاني العلوي الأيمن (#4)', thetaDeg: 43 },
  { id: 14, universal: '5', fdi: '14', palmer: 'UR4', arch: 'UPPER', side: 'RIGHT', type: 'premolar1', nameEn: 'Upper Right 1st Premolar (#5)',      nameAr: 'الضاحك الأول العلوي الأيمن (#5)',  thetaDeg: 54 },
  { id: 13, universal: '6', fdi: '13', palmer: 'UR3', arch: 'UPPER', side: 'RIGHT', type: 'canine',   nameEn: 'Upper Right Canine (#6)',            nameAr: 'الناب العلوي الأيمن (#6)',         thetaDeg: 65 },
  { id: 12, universal: '7', fdi: '12', palmer: 'UR2', arch: 'UPPER', side: 'RIGHT', type: 'lateral',  nameEn: 'Upper Right Lateral Incisor (#7)',   nameAr: 'القاطع الجانبي العلوي الأيمن (#7)', thetaDeg: 75 },
  { id: 11, universal: '8', fdi: '11', palmer: 'UR1', arch: 'UPPER', side: 'RIGHT', type: 'central',  nameEn: 'Upper Right Central Incisor (#8)',   nameAr: 'القاطع المركزي العلوي الأيمن (#8)', thetaDeg: 85 },

  // ─── UPPER LEFT (Right Side of Screen: Teeth #9 to #16 / FDI 21 to 28 / UL1 to UL8) ───
  { id: 21, universal: '9',  fdi: '21', palmer: 'UL1', arch: 'UPPER', side: 'LEFT', type: 'central',  nameEn: 'Upper Left Central Incisor (#9)',    nameAr: 'القاطع المركزي العلوي الأيسر (#9)', thetaDeg: 95 },
  { id: 22, universal: '10', fdi: '22', palmer: 'UL2', arch: 'UPPER', side: 'LEFT', type: 'lateral',  nameEn: 'Upper Left Lateral Incisor (#10)',   nameAr: 'القاطع الجانبي العلوي الأيسر (#10)', thetaDeg: 105 },
  { id: 23, universal: '11', fdi: '23', palmer: 'UL3', arch: 'UPPER', side: 'LEFT', type: 'canine',   nameEn: 'Upper Left Canine (#11)',            nameAr: 'الناب العلوي الأيسر (#11)',         thetaDeg: 115 },
  { id: 24, universal: '12', fdi: '24', palmer: 'UL4', arch: 'UPPER', side: 'LEFT', type: 'premolar1', nameEn: 'Upper Left 1st Premolar (#12)',     nameAr: 'الضاحك الأول العلوي الأيسر (#12)',  thetaDeg: 126 },
  { id: 25, universal: '13', fdi: '25', palmer: 'UL5', arch: 'UPPER', side: 'LEFT', type: 'premolar2', nameEn: 'Upper Left 2nd Premolar (#13)',     nameAr: 'الضاحك الثاني العلوي الأيسر (#13)', thetaDeg: 137 },
  { id: 26, universal: '14', fdi: '26', palmer: 'UL6', arch: 'UPPER', side: 'LEFT', type: 'molar1',    nameEn: 'Upper Left 1st Molar (#14)',         nameAr: 'الضرس الأول العلوي الأيسر (#14)',   thetaDeg: 148 },
  { id: 27, universal: '15', fdi: '27', palmer: 'UL7', arch: 'UPPER', side: 'LEFT', type: 'molar2',    nameEn: 'Upper Left 2nd Molar (#15)',         nameAr: 'الضرس الثاني العلوي الأيسر (#15)',  thetaDeg: 160 },
  { id: 28, universal: '16', fdi: '28', palmer: 'UL8', arch: 'UPPER', side: 'LEFT', type: 'molar3',    nameEn: 'Upper Left 3rd Molar (Wisdom #16)',  nameAr: 'الضرس الثالث العلوي الأيسر (#16)',  thetaDeg: 172 },

  // ─── LOWER LEFT (Right Side of Screen: Teeth #17 to #24 / FDI 38 to 31 / LL8 to LL1) ───
  { id: 38, universal: '17', fdi: '38', palmer: 'LL8', arch: 'LOWER', side: 'LEFT', type: 'molar3',    nameEn: 'Lower Left 3rd Molar (Wisdom #17)',  nameAr: 'الضرس الثالث السفلي الأيسر (#17)',  thetaDeg: 188 },
  { id: 37, universal: '18', fdi: '37', palmer: 'LL7', arch: 'LOWER', side: 'LEFT', type: 'molar2',    nameEn: 'Lower Left 2nd Molar (#18)',         nameAr: 'الضرس الثاني السفلي الأيسر (#18)',  thetaDeg: 200 },
  { id: 36, universal: '19', fdi: '36', palmer: 'LL6', arch: 'LOWER', side: 'LEFT', type: 'molar1',    nameEn: 'Lower Left 1st Molar (#19)',         nameAr: 'الضرس الأول السفلي الأيسر (#19)',   thetaDeg: 212 },
  { id: 35, universal: '20', fdi: '35', palmer: 'LL5', arch: 'LOWER', side: 'LEFT', type: 'premolar2', nameEn: 'Lower Left 2nd Premolar (#20)',     nameAr: 'الضاحك الثاني السفلي الأيسر (#20)', thetaDeg: 223 },
  { id: 34, universal: '21', fdi: '34', palmer: 'LL4', arch: 'LOWER', side: 'LEFT', type: 'premolar1', nameEn: 'Lower Left 1st Premolar (#21)',     nameAr: 'الضاحك الأول السفلي الأيسر (#21)',  thetaDeg: 234 },
  { id: 33, universal: '22', fdi: '33', palmer: 'LL3', arch: 'LOWER', side: 'LEFT', type: 'canine',   nameEn: 'Lower Left Canine (#22)',            nameAr: 'الناب السفلي الأيسر (#22)',         thetaDeg: 245 },
  { id: 32, universal: '23', fdi: '32', palmer: 'LL2', arch: 'LOWER', side: 'LEFT', type: 'lateral',  nameEn: 'Lower Left Lateral Incisor (#23)',   nameAr: 'القاطع الجانبي السفلي الأيسر (#23)', thetaDeg: 255 },
  { id: 31, universal: '24', fdi: '31', palmer: 'LL1', arch: 'LOWER', side: 'LEFT', type: 'central',  nameEn: 'Lower Left Central Incisor (#24)',   nameAr: 'القاطع المركزي السفلي الأيسر (#24)', thetaDeg: 265 },

  // ─── LOWER RIGHT (Left Side of Screen: Teeth #25 to #32 / FDI 41 to 48 / LR1 to LR8) ───
  { id: 41, universal: '25', fdi: '41', palmer: 'LR1', arch: 'LOWER', side: 'RIGHT', type: 'central',  nameEn: 'Lower Right Central Incisor (#25)',  nameAr: 'القاطع المركزي السفلي الأيمن (#25)', thetaDeg: 275 },
  { id: 42, universal: '26', fdi: '42', palmer: 'LR2', arch: 'LOWER', side: 'RIGHT', type: 'lateral',  nameEn: 'Lower Right Lateral Incisor (#26)',  nameAr: 'القاطع الجانبي السفلي الأيمن (#26)', thetaDeg: 285 },
  { id: 43, universal: '27', fdi: '43', palmer: 'LR3', arch: 'LOWER', side: 'RIGHT', type: 'canine',   nameEn: 'Lower Right Canine (#27)',           nameAr: 'الناب السفلي الأيمن (#27)',         thetaDeg: 295 },
  { id: 44, universal: '28', fdi: '44', palmer: 'LR4', arch: 'LOWER', side: 'RIGHT', type: 'premolar1', nameEn: 'Lower Right 1st Premolar (#28)',     nameAr: 'الضاحك الأول السفلي الأيمن (#28)',  thetaDeg: 306 },
  { id: 45, universal: '29', fdi: '45', palmer: 'LR5', arch: 'LOWER', side: 'RIGHT', type: 'premolar2', nameEn: 'Lower Right 2nd Premolar (#29)',     nameAr: 'الضاحك الثاني السفلي الأيمن (#29)', thetaDeg: 317 },
  { id: 46, universal: '30', fdi: '46', palmer: 'LR6', arch: 'LOWER', side: 'RIGHT', type: 'molar1',    nameEn: 'Lower Right 1st Molar (#30)',        nameAr: 'الضرس الأول السفلي الأيمن (#30)',   thetaDeg: 328 },
  { id: 47, universal: '31', fdi: '47', palmer: 'LR7', arch: 'LOWER', side: 'RIGHT', type: 'molar2',    nameEn: 'Lower Right 2nd Molar (#31)',        nameAr: 'الضرس الثاني السفلي الأيمن (#31)',  thetaDeg: 340 },
  { id: 48, universal: '32', fdi: '48', palmer: 'LR8', arch: 'LOWER', side: 'RIGHT', type: 'molar3',    nameEn: 'Lower Right 3rd Molar (Wisdom #32)', nameAr: 'الضرس الثالث السفلي الأيمن (#32)', thetaDeg: 352 },
];

// ─── Real Anatomical Occlusal Morphology Vector Paths (Wide Anteriors + Generous Interproximal Gaps) ─
function renderRealisticAnatomicalTooth(tooth: ToothItem, isSelected: boolean, isHovered: boolean) {
  const strokeColor = isSelected ? '#ffffff' : isHovered ? '#60a5fa' : '#38bdf8';
  const fillColor = isSelected ? '#2563eb' : isHovered ? '#1b385e' : '#0c1b30';
  const lineCol = isSelected ? '#ffffff' : isHovered ? '#bae6fd' : '#7dd3fc';
  const outlineW = isSelected ? '2.4' : isHovered ? '2.0' : '1.5';

  switch (tooth.type) {
    case 'central':
      // Wide Shovel/Spade Central Incisor with Broad Mesiodistal Edge & Lingual Fossa
      return (
        <g className="transition-colors duration-150">
          <path
            d="M-14 -8 C-12 -14, 12 -14, 14 -8 C17 -1, 14 10, 8 13 C3 14, -3 14, -8 13 C-14 10, -17 -1, -14 -8 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          {/* Broad Incisal Edge & Lingual Fossa Contour */}
          <path d="M-10 -7 Q0 -11 10 -7" fill="none" stroke={lineCol} strokeWidth="1.6" />
          <path d="M-5 -5 L-5 8 M5 -5 L5 8" fill="none" stroke={lineCol} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
        </g>
      );

    case 'lateral':
      // Wide Lateral Incisor with Rounded Distal Corner
      return (
        <g className="transition-colors duration-150">
          <path
            d="M-12 -7 C-10 -12, 10 -12, 12 -7 C14 0, 11 9, 6 12 C2 13, -2 13, -6 12 C-11 9, -14 0, -12 -7 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          <path d="M-8 -6 Q0 -10 8 -6" fill="none" stroke={lineCol} strokeWidth="1.4" />
          <circle cx="0" cy="4" r="2.2" fill="none" stroke={lineCol} strokeWidth="1.1" />
        </g>
      );

    case 'canine':
      // Diamond Cuspid with Wide Pointed Tip & Slopes
      return (
        <g className="transition-colors duration-150">
          <path
            d="M0 -15 C8 -13, 14 -4, 14 4 C14 11, 7 15, 0 16 C-7 15, -14 11, -14 4 C-14 -4, -8 -13, 0 -15 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          <path d="M0 -13 L0 8" fill="none" stroke={lineCol} strokeWidth="1.8" />
          <path d="M-9 -3 Q0 4 9 -3" fill="none" stroke={lineCol} strokeWidth="1.3" />
        </g>
      );

    case 'premolar1':
    case 'premolar2':
      // Bicuspid Crown with Buccal & Lingual Cusps + Central Fissure
      return (
        <g className="transition-colors duration-150">
          <path
            d="M-13 -6 C-11 -13, 11 -13, 13 -6 C15 3, 12 11, 6 13 C0 14, -6 14, -12 11 C-15 3, -15 -3, -13 -6 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          <path d="M-9 0 L9 0" fill="none" stroke={lineCol} strokeWidth="1.6" />
          <path d="M-9 0 L-6 -6 M-9 0 L-6 6 M9 0 L6 -6 M9 0 L6 6" fill="none" stroke={lineCol} strokeWidth="1.2" />
          <circle cx="-4" cy="0" r="1.1" fill={lineCol} />
          <circle cx="4" cy="0" r="1.1" fill={lineCol} />
        </g>
      );

    case 'molar1':
      // 1st Molar with 4/5 Cusps, Oblique Ridge & Central Fossa
      return (
        <g className="transition-colors duration-150">
          <path
            d="M-17 -8 C-15 -18, 15 -18, 17 -8 C20 3, 17 15, 8 18 C0 19, -8 19, -17 15 C-20 3, -20 -3, -17 -8 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          <path d="M-12 -3 Q0 -8 12 -3" fill="none" stroke={lineCol} strokeWidth="1.6" />
          <path d="M-3 -12 L-3 12 M6 -9 L-8 9" fill="none" stroke={lineCol} strokeWidth="1.4" />
          <circle cx="0" cy="0" r="2.2" fill={lineCol} />
        </g>
      );

    case 'molar2':
    case 'molar3':
    default:
      // 2nd & 3rd Molars: 4-Cusp Cruciform (+) Central Groove Anatomy
      return (
        <g className="transition-colors duration-150">
          <path
            d="M-15 -7 C-13 -16, 13 -16, 15 -7 C17 3, 15 14, 7 16 C0 17, -7 17, -15 14 C-17 3, -17 -3, -15 -7 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={outlineW}
          />
          <path d="M-11 0 L11 0 M0 -11 L0 11" fill="none" stroke={lineCol} strokeWidth="1.6" />
          <path d="M-7 -7 L-3 -3 M7 -7 L3 -3 M-7 7 L-3 3 M7 7 L3 3" fill="none" stroke={lineCol} strokeWidth="1.2" />
          <circle cx="0" cy="0" r="1.9" fill={lineCol} />
        </g>
      );
  }
}

interface ToothChartSelectorProps {
  value: string;
  onChange: (formattedValue: string) => void;
}

export default function ToothChartSelector({ value, onChange }: ToothChartSelectorProps) {
  const { lang } = useLanguage();
  const [system, setSystem] = useState<NumberingSystem>('UNIVERSAL');
  const [hoveredTooth, setHoveredTooth] = useState<ToothItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    if (!value) return new Set();
    const parts = value.split(',').map((s: string) => s.trim());
    const ids = new Set<number>();
    TEETH_LIST.forEach((t) => {
      if (
        parts.includes(t.fdi) ||
        parts.includes(`#${t.universal}`) ||
        parts.includes(t.universal) ||
        parts.includes(t.palmer)
      ) {
        ids.add(t.id);
      }
    });
    return ids;
  });

  const isAr = lang === 'ar';

  function getDisplayLabel(tooth: ToothItem) {
    if (system === 'UNIVERSAL') return tooth.universal;
    if (system === 'PALMER') return tooth.palmer;
    return tooth.fdi; // FDI ISO 3950
  }

  function updateParent(newSet: Set<number>, currentSys = system) {
    setSelectedIds(newSet);
    const selectedTeeth = TEETH_LIST.filter((t) => newSet.has(t.id));
    const labels = selectedTeeth.map((t) => {
      if (currentSys === 'UNIVERSAL') return `#${t.universal}`;
      if (currentSys === 'PALMER') return t.palmer;
      return t.fdi;
    });
    onChange(labels.join(', '));
  }

  function toggleTooth(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateParent(next);
  }

  function handleSystemChange(newSys: NumberingSystem) {
    setSystem(newSys);
    updateParent(selectedIds, newSys);
  }

  function selectUpperArch() {
    const next = new Set(selectedIds);
    TEETH_LIST.filter((t) => t.arch === 'UPPER').forEach((t) => next.add(t.id));
    updateParent(next);
  }

  function selectLowerArch() {
    const next = new Set(selectedIds);
    TEETH_LIST.filter((t) => t.arch === 'LOWER').forEach((t) => next.add(t.id));
    updateParent(next);
  }

  function selectAnteriors() {
    const next = new Set(selectedIds);
    TEETH_LIST.filter((t) => ['central', 'lateral', 'canine'].includes(t.type)).forEach((t) => next.add(t.id));
    updateParent(next);
  }

  function selectFullArch() {
    const next = new Set<number>();
    TEETH_LIST.forEach((t) => next.add(t.id));
    updateParent(next);
  }

  function clearAll() {
    updateParent(new Set());
  }

  // Spacious Continuous Oval Arch Parameters
  const cx = 270;
  const cy = 340;
  const rxTooth = 175;
  const ryTooth = 240;
  const rxLabel = 225;
  const ryLabel = 295;

  return (
    <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[#070A10]/95 p-4 sm:p-6 relative overflow-hidden shadow-2xl">
      {/* Header & Numbering System Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🦷</span>
            <label className="text-xs font-bold uppercase tracking-wider text-white">
              {isAr ? 'مخطط القوس السني المتصل (Continuous Oval Odontogram)' : 'Continuous Dental Arch Odontogram'}
            </label>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {isAr
              ? 'أسنان أمامية عريضة وواضحة مع مساحات وفواصل إكلينيكية مريحة بين جميع الأسنان'
              : 'Wide anterior teeth with distinct clinical spacing and comfortable touch targets'}
          </p>
        </div>

        {/* Numbering System Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
          <button
            type="button"
            onClick={() => handleSystemChange('UNIVERSAL')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              system === 'UNIVERSAL'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
            title="Universal ADA Standard (1 to 32 Clockwise)"
          >
            Universal (#1–32)
          </button>

          <button
            type="button"
            onClick={() => handleSystemChange('FDI')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              system === 'FDI'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
            title="ISO 3950 Two-Digit System (11 to 48)"
          >
            FDI (ISO)
          </button>

          <button
            type="button"
            onClick={() => handleSystemChange('PALMER')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              system === 'PALMER'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
            title="Palmer Quadrant Notation"
          >
            Palmer
          </button>
        </div>
      </div>

      {/* Quick Selection Actions Toolbar */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1">
          {isAr ? 'تحديد سريع:' : 'Quick Select:'}
        </span>
        <button
          type="button"
          onClick={selectUpperArch}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition"
        >
          {isAr ? 'الفك العلوي (1–16)' : 'Upper Arch (1–16)'}
        </button>
        <button
          type="button"
          onClick={selectLowerArch}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition"
        >
          {isAr ? 'الفك السفلي (17–32)' : 'Lower Arch (17–32)'}
        </button>
        <button
          type="button"
          onClick={selectAnteriors}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition"
        >
          {isAr ? 'الأسنان الأمامية' : 'Anteriors (6–11, 22–27)'}
        </button>
        <button
          type="button"
          onClick={selectFullArch}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition"
        >
          {isAr ? 'كامل الفم (32 سن)' : 'Full Arch (32)'}
        </button>
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-red-500/30 bg-red-950/20 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition ml-auto"
          >
            ✕ {isAr ? 'مسح التحديد' : 'Clear'}
          </button>
        )}
      </div>

      {/* ── Continuous Oval Arch Canvas (Wide Anteriors + Generous Interproximal Gaps) ── */}
      <div className="mt-4 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[540px] h-[670px] flex items-center justify-center select-none">
          <svg
            viewBox="0 0 540 680"
            className="w-full h-full overflow-visible"
            aria-label="Natural Dentition Dental Arch Chart"
          >
            <defs>
              <filter id="naturalShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#2563eb" floodOpacity="0.9" />
              </filter>
              <filter id="hoverShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#60a5fa" floodOpacity="0.75" />
              </filter>
            </defs>

            {/* Continuous Inner Guide Arch Ellipse */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rxTooth - 34}
              ry={ryTooth - 40}
              fill="none"
              stroke="rgba(42,127,255,0.22)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />

            {/* Center Anatomical Landmark Labels */}
            <text
              x={cx}
              y={cy - 65}
              textAnchor="middle"
              className="fill-[var(--accent-light)] text-xs font-bold uppercase tracking-widest opacity-60 pointer-events-none"
            >
              {isAr ? 'الفك العلوي (Maxilla)' : 'MAXILLA (UPPER)'}
            </text>
            <text
              x={cx}
              y={cy + 75}
              textAnchor="middle"
              className="fill-[var(--accent-light)] text-xs font-bold uppercase tracking-widest opacity-60 pointer-events-none"
            >
              {isAr ? 'الفك السفلي (Mandible)' : 'MANDIBLE (LOWER)'}
            </text>

            {/* Render 32 Natural Anatomical Teeth with Wide Anteriors & Clear Gaps */}
            {TEETH_LIST.map((tooth) => {
              const rad = (tooth.thetaDeg * Math.PI) / 180;
              const isSelected = selectedIds.has(tooth.id);
              const isHovered = hoveredTooth?.id === tooth.id;

              // Exact Rounded Coordinates
              const tx = Math.round((cx - rxTooth * Math.cos(rad)) * 10) / 10;
              const ty = Math.round((cy - ryTooth * Math.sin(rad)) * 10) / 10;
              const lx = Math.round((cx - rxLabel * Math.cos(rad)) * 10) / 10;
              const ly = Math.round((cy - ryLabel * Math.sin(rad)) * 10) / 10;
              const rot = Math.round(tooth.thetaDeg - 90);

              return (
                <g
                  key={tooth.id}
                  onClick={() => toggleTooth(tooth.id)}
                  onMouseEnter={() => setHoveredTooth(tooth)}
                  onMouseLeave={() => setHoveredTooth(null)}
                  className="cursor-pointer"
                >
                  {/* Generous Invisible Touch Target for Easy Clicking */}
                  <circle cx={tx} cy={ty} r="25" fill="transparent" />
                  <circle cx={lx} cy={ly} r="18" fill="transparent" />

                  {/* Outer Number Label (#1 to #32 on outside) */}
                  <text
                    x={lx}
                    y={ly + 5}
                    textAnchor="middle"
                    className={`font-mono font-black text-sm transition-colors duration-150 ${
                      isSelected
                        ? 'fill-white font-black text-base'
                        : isHovered
                        ? 'fill-white font-bold'
                        : 'fill-[var(--text-muted)]'
                    }`}
                  >
                    {getDisplayLabel(tooth)}
                  </text>

                  {/* Guideline between outer label and tooth crown */}
                  <line
                    x1={lx}
                    y1={ly}
                    x2={tx}
                    y2={ty}
                    stroke={isSelected ? '#2A7FFF' : isHovered ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    strokeDasharray="2 2"
                    className="transition-colors duration-150"
                  />

                  {/* Individual Natural Dentition Crown Vector */}
                  <g
                    transform={`translate(${tx}, ${ty}) rotate(${rot})`}
                    filter={isSelected ? 'url(#naturalShadow)' : isHovered ? 'url(#hoverShadow)' : undefined}
                  >
                    {renderRealisticAnatomicalTooth(tooth, isSelected, isHovered)}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Teeth & Hovered Tooth Anatomical Detail Summary Bar */}
      <div className="mt-3 pt-3.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-[var(--text-muted)] shrink-0">
            {isAr ? 'الأسنان المحددة:' : 'Selected Teeth:'}
          </span>
          <span className="font-mono text-xs font-bold text-[var(--accent-light)] bg-[var(--bg-elevated)] px-3.5 py-1.5 rounded-xl border border-[rgba(42,127,255,0.25)] truncate max-w-lg">
            {value || (isAr ? 'لم يتم تحديد أسنان بعد (حالة عامة)' : 'None selected (General / Full Case)')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hoveredTooth && (
            <span className="text-xs text-[var(--accent-light)] font-bold truncate max-w-[240px] animate-in fade-in duration-100 bg-[#0E1B2A] px-2.5 py-1 rounded-lg border border-[var(--border)]">
              {isAr ? hoveredTooth.nameAr : hoveredTooth.nameEn}
            </span>
          )}

          <span className="text-xs font-mono text-white font-bold bg-[var(--accent-dim)] px-3 py-1.5 rounded-xl border border-[var(--accent)]/40 shrink-0">
            {selectedIds.size} {isAr ? 'وحدات محددة' : 'Unit(s) Selected'}
          </span>
        </div>
      </div>
    </div>
  );
}
