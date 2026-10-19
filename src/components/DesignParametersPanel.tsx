'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { PREF_MARKUP_HTML } from '@/components/pref-markup';
import { PREF_CSS } from '@/components/pref-styles';

export type DesignParams = {
  nums: Record<string, number>;
};

type NumDef = {
  key: string;
  en: string;
  ar: string;
  step: number;
  min: number;
  max: number;
  def: number;
  unit: string;
};

export const NUM_PARAM_DEFS: NumDef[] = [
  { key: 'cementGap', en: 'Cement gap', ar: 'مسافة الإسمنت', step: 0.01, min: 0, max: 0.2, def: 0.03, unit: 'mm' },
  { key: 'adaptiveExtraGap', en: 'Adaptive extra gap', ar: 'مسافة إضافية تكيفية', step: 0.01, min: 0, max: 0.1, def: 0.03, unit: 'mm' },
  { key: 'minimalGapHeight', en: 'Height for minimal gap', ar: 'ارتفاع الحد الأدنى للمسافة', step: 0.1, min: 0.4, max: 1.5, def: 1, unit: 'mm' },
  { key: 'marginAngle', en: 'Margin angle', ar: 'زاوية الحافة', step: 1, min: 45, max: 60, def: 55, unit: '°' },
  { key: 'marginWidth', en: 'Margin width', ar: 'عرض الحافة', step: 0.01, min: 0, max: 2, def: 0.15, unit: 'mm' },
  { key: 'minimalThickness', en: 'Minimal thickness', ar: 'الحد الأدنى للسماكة', step: 0.1, min: 0.4, max: 1, def: 0.5, unit: 'mm' },
  { key: 'approximalDistance', en: 'Approximal distance', ar: 'المسافة التماسية', step: 0.01, min: -0.5, max: 0.2, def: -0.02, unit: 'mm' },
  { key: 'occlusalDistance', en: 'Occlusal distance', ar: 'المسافة الإطباقية', step: 0.1, min: 0, max: 1, def: 0.2, unit: 'mm' },
  { key: 'toolRadius', en: 'Tool radius', ar: 'نصف قطر الأداة', step: 0.01, min: 0, max: 1, def: 0.6, unit: 'mm' },
];

function defaultNums(): Record<string, number> {
  return Object.fromEntries(NUM_PARAM_DEFS.map((d) => [d.key, d.def]));
}

export const DEFAULT_DESIGN_PARAMS: DesignParams = {
  nums: defaultNums(),
};

const AR_FOOTER = ['تثبيت', 'إعادة تعيين', 'حفظ'];

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  return String(Math.round(n * 1000) / 1000);
}

function clampNum(d: NumDef, n: number): number {
  const stepped = Math.min(d.max, Math.max(d.min, Math.round((n - d.min) / d.step) * d.step + d.min));
  return Math.round(stepped * 1e6) / 1e6;
}

interface DesignParametersPanelProps {
  value: DesignParams;
  onChange: (next: DesignParams) => void;
}

export default function DesignParametersPanel({ value, onChange }: DesignParametersPanelProps) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(locked);
  const [toast, setToast] = useState(false);

  useIsoLayoutEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    lockedRef.current = locked;
  });

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const numberInputs = root.querySelectorAll<HTMLInputElement>('.design-preference-ipt-number .el-input__inner');
    NUM_PARAM_DEFS.forEach((d, i) => {
      const input = numberInputs[i];
      if (!input) return;
      const cur = value.nums[d.key] ?? d.def;
      if (document.activeElement !== input) input.value = fmt(cur);
      input.setAttribute('aria-valuenow', String(cur));
      input.setAttribute('aria-valuemin', String(d.min));
      input.setAttribute('aria-valuemax', String(d.max));
    });

    root.querySelectorAll<HTMLLabelElement>('label[for]').forEach((label) => {
      const id = label.getAttribute('for');
      if (!id || root.querySelector('[id="' + id + '"]')) return;
      const input = label.closest('.el-form-item')?.querySelector('input');
      if (input) input.id = id;
    });

    const lockedBtn = root.querySelector<HTMLElement>('.footer .xl-button');
    if (lockedBtn) lockedBtn.classList.toggle('is-on', locked);

    const items = root.querySelectorAll('.config-form .el-form-item');
    items.forEach((item, i) => {
      const target = item.querySelector('.el-form-item__label .el-tooltip__trigger');
      const d = NUM_PARAM_DEFS[i];
      if (!target || !d) return;
      const text = isAr ? d.ar : d.en;
      if (target.textContent !== text) target.textContent = text;
    });
    const footerSpans = root.querySelectorAll('.footer .xl-button span');
    const footerTexts = isAr ? AR_FOOTER : ['Locked', 'Reset', 'Submit'];
    footerSpans.forEach((s, i) => {
      if (footerTexts[i] && s.textContent !== footerTexts[i]) s.textContent = footerTexts[i];
    });
  }, [value, locked, isAr]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function commitNums(nums: Record<string, number>) {
      onChangeRef.current({ ...valueRef.current, nums });
    }

    function onClick(e: Event) {
      const t = e.target as Element | null;
      if (!t || typeof t.closest !== 'function') return;

      const stepBtn = t.closest('.el-input-number__decrease, .el-input-number__increase');
      if (stepBtn && root!.contains(stepBtn)) {
        if (lockedRef.current) return;
        const holder = stepBtn.closest('.design-preference-ipt-number');
        if (!holder) return;
        const holders = Array.from(root!.querySelectorAll('.design-preference-ipt-number'));
        const d = NUM_PARAM_DEFS[holders.indexOf(holder)];
        if (!d) return;
        const dir = stepBtn.classList.contains('el-input-number__decrease') ? -1 : 1;
        const cur = valueRef.current.nums[d.key] ?? d.def;
        commitNums({ ...valueRef.current.nums, [d.key]: clampNum(d, cur + dir * d.step) });
        return;
      }

      const footerBtn = t.closest('.footer .xl-button');
      if (footerBtn && root!.contains(footerBtn)) {
        const footer = footerBtn.parentElement;
        if (!footer) return;
        const idx = Array.from(footer.children).indexOf(footerBtn);
        if (idx === 0) {
          setLocked((v) => !v);
        } else if (idx === 1) {
          if (lockedRef.current) return;
          onChangeRef.current({ nums: defaultNums() });
        } else if (idx === 2) {
          if (lockedRef.current) return;
          setToast(true);
        }
        return;
      }
    }

    function onInput(e: Event) {
      const t = e.target as HTMLInputElement | null;
      if (!t || typeof t.matches !== 'function' || !t.matches('.design-preference-ipt-number .el-input__inner')) return;
      if (lockedRef.current) return;
      const inputs = Array.from(root!.querySelectorAll('.design-preference-ipt-number'));
      const holder = t.closest('.design-preference-ipt-number');
      if (!holder) return;
      const d = NUM_PARAM_DEFS[inputs.indexOf(holder)];
      if (!d) return;
      const raw = parseFloat(t.value);
      if (!isFinite(raw)) return;
      commitNums({ ...valueRef.current.nums, [d.key]: raw });
    }

    function onFocusOut(e: Event) {
      const t = e.target as HTMLInputElement | null;
      if (!t || typeof t.matches !== 'function' || !t.matches('.design-preference-ipt-number .el-input__inner')) return;
      const holder = t.closest('.design-preference-ipt-number');
      if (!holder) return;
      const inputs = Array.from(root!.querySelectorAll('.design-preference-ipt-number'));
      const d = NUM_PARAM_DEFS[inputs.indexOf(holder)];
      if (!d) return;
      const raw = parseFloat(t.value);
      const prev = valueRef.current.nums[d.key] ?? d.def;
      const next = clampNum(d, isFinite(raw) ? raw : prev);
      t.value = fmt(next);
      if (next !== prev) commitNums({ ...valueRef.current.nums, [d.key]: next });
    }

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('input', onInput);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <style>{PREF_CSS}</style>
      <div
        ref={rootRef}
        className={'dt-pref' + (locked ? ' is-locked' : '')}
        dangerouslySetInnerHTML={{ __html: PREF_MARKUP_HTML }}
      />
      {toast && (
        <div className="dt-pref-toast">
          <span className="dt-dot" />
          {isAr ? 'تم حفظ إعدادات التصميم' : 'Design preferences saved'}
        </div>
      )}
    </>
  );
}
