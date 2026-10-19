'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { TOOTH_CHART_HTML } from '@/components/tooth-chart-markup';

const FDI_BY_INDEX = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48',
];

const TEETH_ORDER = FDI_BY_INDEX;

const PALMER_QUADRANT: Record<string, number> = { UR: 1, UL: 2, LL: 3, LR: 4 };

function parseSelection(raw: string): Set<string> {
  const out = new Set<string>();
  if (!raw) return out;
  for (const token of raw.split(/[,،\s]+/)) {
    if (!token) continue;
    if (/^\d{2}$/.test(token) && FDI_BY_INDEX.includes(token)) {
      out.add(token);
      continue;
    }
    const universal = /^#?(\d{1,2})$/.exec(token);
    if (universal) {
      const n = Number(universal[1]);
      if (n >= 1 && n <= 32) out.add(FDI_BY_INDEX[n - 1]);
      continue;
    }
    const palmer = /^([UL])([LR])([1-8])$/.exec(token.toUpperCase());
    if (palmer) {
      const quadrant = PALMER_QUADRANT[palmer[1] + palmer[2]];
      out.add(`${quadrant}${palmer[3]}`);
    }
  }
  return out;
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const CHART_CSS = `
.dt-tooth-chart {
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  justify-content: center;
}
.dt-tooth-chart .xl-tooth-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.dt-tooth-chart .half-content {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  line-height: 1.5;
  color: var(--text-muted);
}
.dt-tooth-chart .xl-tooth-content > svg {
  width: min(100%, 248px);
  height: auto;
  display: block;
}
.dt-tooth-chart g.tooth {
  cursor: pointer;
  --tooth-body: #C9D4E6;
  --tooth-outline: #5D6F86;
  --tooth-hover-body: rgba(42, 127, 255, 0.35);
  --tooth-accent: #2A7FFF;
  --tooth-selected-outline: #17489F;
  --tooth-label: #000000;
}
html.light .dt-tooth-chart g.tooth {
  --tooth-body: #FAF7F1;
  --tooth-outline: #A9B5C4;
  --tooth-hover-body: rgba(42, 127, 255, 0.22);
  --tooth-label: #42526E;
}
.dt-tooth-chart g.tooth > path:first-of-type {
  fill: var(--tooth-body);
}
.dt-tooth-chart g.tooth > path:last-of-type {
  fill: var(--tooth-outline);
}
.dt-tooth-chart g.tooth[data-selected='1'] > path:first-of-type {
  fill: var(--tooth-accent);
}
.dt-tooth-chart g.tooth[data-selected='1'] > path:last-of-type {
  fill: var(--tooth-selected-outline);
}
.dt-tooth-chart g.tooth:not([data-selected='1']):hover > path:first-of-type {
  fill: var(--tooth-hover-body);
}
.dt-tooth-chart g.tooth:not([data-selected='1']):hover > path:last-of-type {
  fill: var(--tooth-accent);
}
.dt-tooth-chart g.tooth text {
  font-family: inherit;
  fill: var(--tooth-label);
}
.dt-tooth-chart .xl-tooth-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: #E64C4C;
  background: rgba(230, 76, 76, 0.08);
  border: 1px solid rgba(230, 76, 76, 0.35);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.dt-tooth-chart .xl-tooth-clear:hover {
  background: rgba(230, 76, 76, 0.16);
}
.dt-tooth-chart .xl-icon {
  display: inline-flex;
}
.dt-tooth-chart .xl-icon svg {
  width: 13px;
  height: 13px;
  display: block;
}
`;

interface ToothChartSelectorProps {
  value: string;
  onChange: (formattedValue: string) => void;
}

export default function ToothChartSelector({ value, onChange }: ToothChartSelectorProps) {
  const { lang } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => parseSelection(value), [value]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<SVGGElement>('g.tooth').forEach((g) => {
      const fdi = FDI_BY_INDEX[Number(g.getAttribute('tooth'))];
      if (!fdi) return;
      const isSel = selected.has(fdi);
      g.setAttribute('data-selected', isSel ? '1' : '0');
      const paths = Array.from(g.querySelectorAll('path'));
      if (paths.length < 2) return;
      const shade = paths.length > 2 ? paths[1] : null;
      if (shade) shade.style.display = isSel ? 'none' : '';
    });
  }, [selected]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as Element;
    if (typeof target.closest !== 'function') return;
    if (target.closest('.xl-tooth-clear')) {
      onChange('');
      return;
    }
    const group = target.closest('g.tooth') as SVGGElement | null;
    if (!group || !rootRef.current?.contains(group)) return;
    const fdi = FDI_BY_INDEX[Number(group.getAttribute('tooth'))];
    if (!fdi) return;
    const next = new Set(selected);
    if (next.has(fdi)) next.delete(fdi);
    else next.add(fdi);
    onChange(TEETH_ORDER.filter((f) => next.has(f)).join(', '));
  }

  const isAr = lang === 'ar';

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
      <style>{CHART_CSS}</style>
      <div
        ref={rootRef}
        className="dt-tooth-chart"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: TOOTH_CHART_HTML }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border)] pt-3 text-xs">
        <span className="font-bold text-[var(--text-muted)]">
          {isAr ? 'الأسنان المحددة:' : 'Selected teeth:'}
        </span>
        <span className="font-mono font-semibold text-[var(--text)]">
          {value || (isAr ? 'لا شيء (حالة عامة)' : 'None (General / Full Case)')}
        </span>
        <span className="ml-auto font-semibold tabular-nums text-[var(--text-muted)]">
          {selected.size}/32
        </span>
      </div>
    </div>
  );
}
