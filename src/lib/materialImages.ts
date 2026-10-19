export type MaterialImage = {
  id: string;
  name: string;
  image_url: string;
  alt_text: string,
};

export const MATERIAL_IMAGES: MaterialImage[] = [
  {
    id: 'multi-layer-zirconia',
    name: 'Multi-Layer Zirconia',
    image_url: '/images/multi-layer-zirconia.jpg',
    alt_text: 'Anterior incisor crown restored with multi-layer zirconia displaying gradient translucency.',
  },
  {
    id: 'ht-monolithic-zirconia',
    name: 'HT Monolithic Zirconia',
    image_url: '/images/ht-monolithic-zirconia.jpg',
    alt_text: 'Anterior incisor crown made of HT monolithic zirconia with high translucency.',
  },
  {
    id: 'ut-anterior-zirconia',
    name: 'UT Anterior Zirconia',
    image_url: '/images/ut-anterior-zirconia.jpg',
    alt_text: 'Anterior incisor crown restored with ultra-translucent zirconia showing high incisal transparency.',
  },
  {
    id: 'opaque-zirconia-core',
    name: 'Opaque Zirconia Core',
    image_url: '/images/opaque-zirconia-core.jpg',
    alt_text: 'Opaque high-strength zirconia coping framework before ceramic layering.',
  },
  {
    id: 'lithium-disilicate-emax',
    name: 'Lithium Disilicate (IPS e.max)',
    image_url: '/images/lithium-disilicate-emax.jpg',
    alt_text: 'Monolithic lithium disilicate IPS e.max anterior crown with lifelike enamel translucency.',
  },
  {
    id: 'zr-reinforced-lithium-silicate',
    name: 'Zr-Reinforced Lithium Silicate',
    image_url: '/images/zr-reinforced-lithium-silicate.jpg',
    alt_text: 'Zirconia-reinforced lithium silicate crown (VITA SUPRINITY / Celtra Press) with warm glassy translucency.',
  },
  {
    id: 'feldspathic-porcelain',
    name: 'Feldspathic Porcelain',
    image_url: '/images/feldspathic-porcelain.jpg',
    alt_text: 'Layered feldspathic porcelain veneer with fine surface texture and a bright incisal halo.',
  },
  {
    id: 'leucite-empress',
    name: 'Leucite-Reinforced (Empress)',
    image_url: '/images/leucite-empress.jpg',
    alt_text: 'Leucite-reinforced glass ceramic inlay (IPS Empress CAD) seated in a posterior molar.',
  },
  {
    id: 'pfm-cocr',
    name: 'PFM on Co-Cr Alloy',
    image_url: '/images/pfm-cocr.jpg',
    alt_text: 'Porcelain-fused-to-metal crown with ceramic over a laser-milled nickel-free Co-Cr alloy coping.',
  },
  {
    id: 'titanium-abutment',
    name: 'Ti Abutment + Zirconia Crown',
    image_url: '/images/titanium-abutment.jpg',
    alt_text: 'Screw-retained zirconia crown on a Grade 5 titanium custom abutment.',
  },
  {
    id: 'high-gold-alloy',
    name: 'Full Cast High-Gold',
    image_url: '/images/high-gold-alloy.jpg',
    alt_text: 'Full cast high-gold alloy crown with a polished metal finish.',
  },
  {
    id: 'multi-layer-pmma',
    name: 'Multi-Layer PMMA Disc',
    image_url: '/images/multi-layer-pmma.jpg',
    alt_text: 'Multi-layer PMMA provisional crown with a natural dentine-to-enamel gradient.',
  },
  {
    id: 'peek-biohpp',
    name: 'PEEK / BioHPP',
    image_url: '/images/peek-biohpp.jpg',
    alt_text: 'PEEK / BioHPP implant framework substructure in a bone-tone tan shade.',
  },
  {
    id: '3d-printed-composite',
    name: '3D Printed Composite Resin',
    image_url: '/images/3d-printed-composite.jpg',
    alt_text: '3D-printed permanent micro-hybrid composite crown with a fine matte surface.',
  },
  {
    id: 'aligner-foil',
    name: 'Clear Aligner Foil',
    image_url: '/images/aligner-foil.jpg',
    alt_text: 'Clear medical-grade multi-layer aligner foil thermoformed over a dental model.',
  },
  {
    id: 'nightguard-splint',
    name: 'Dual-Laminate Nightguard',
    image_url: '/images/nightguard-splint.jpg',
    alt_text: 'Dual-laminate hard/soft occlusal nightguard splint with a clear hard outer layer.',
  },
  {
    id: 'valplast-flexible',
    name: 'Flexible Valplast / TCS',
    image_url: '/images/valplast-flexible.jpg',
    alt_text: 'Flexible Valplast partial denture clasp in translucent pink thermoplastic.',
  },
  {
    id: 'heat-cured-denture',
    name: 'Heat-Cured PMMA Denture',
    image_url: '/images/heat-cured-denture.jpg',
    alt_text: 'High-impact heat-cured PMMA acrylic denture base with a pink veined finish.',
  },
];

const BY_ID: Record<string, MaterialImage> = MATERIAL_IMAGES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, MaterialImage>
);

export function getMaterialImage(id: string | undefined): MaterialImage | undefined {
  return id ? BY_ID[id] : undefined;
}
