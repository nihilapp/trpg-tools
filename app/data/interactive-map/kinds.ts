import type { MapPinKind } from '~/types/interactive-map.types';

export interface InteractiveMapKindOption {
  kind: MapPinKind;
  label: string;
  icon: string;
  color: string;
  accentClass: string;
  buttonClass: string;
  markerSvg: string;
}

export const interactiveMapKindOptions: InteractiveMapKindOption[] = [
  {
    kind: 'nation',
    label: '국가',
    icon: 'lucide:flag',
    color: '#8b5cf6',
    accentClass: 'bg-violet-500',
    buttonClass: 'data-[active=true]:bg-violet-700',
    markerSvg: '<path d="M6 20V6l12 3 8-3v14l-8 3-12-3z"/><path d="M18 9v14"/><path d="M6 6v14"/><path d="M26 6v14"/>',
  },
  {
    kind: 'region',
    label: '지역',
    icon: 'lucide:map',
    color: '#2563eb',
    accentClass: 'bg-blue-500',
    buttonClass: 'data-[active=true]:bg-blue-700',
    markerSvg: '<path d="M4 7l8-3 8 3 8-3v13l-8 3-8-3-8 3z"/><path d="M12 4v13"/><path d="M20 7v13"/>',
  },
  {
    kind: 'city',
    label: '도시',
    icon: 'lucide:building-2',
    color: '#0f766e',
    accentClass: 'bg-teal-500',
    buttonClass: 'data-[active=true]:bg-teal-700',
    markerSvg: '<path d="M5 21h22"/><path d="M7 21V7h10v14"/><path d="M17 21V11h8v10"/><path d="M10 10h.01"/><path d="M10 13h.01"/><path d="M14 10h.01"/><path d="M14 13h.01"/><path d="M21 14h.01"/><path d="M21 17h.01"/>',
  },
  {
    kind: 'dungeon',
    label: '던전',
    icon: 'lucide:swords',
    color: '#b91c1c',
    accentClass: 'bg-red-600',
    buttonClass: 'data-[active=true]:bg-red-700',
    markerSvg: '<path d="M9 3l6 6"/><path d="M6 8l10 10"/><path d="M5 15l6 6"/><path d="M15 3l6 6"/><path d="M12 8l10 10"/><path d="M11 15l6 6"/>',
  },
  {
    kind: 'ruins',
    label: '유적',
    icon: 'lucide:columns-3',
    color: '#a16207',
    accentClass: 'bg-amber-600',
    buttonClass: 'data-[active=true]:bg-amber-700',
    markerSvg: '<path d="M4 20h24"/><path d="M7 20V8"/><path d="M13 20V8"/><path d="M19 20V8"/><path d="M25 20V8"/><path d="M5 8h22"/><path d="M6 5h20"/>',
  },
  {
    kind: 'faction',
    label: '세력',
    icon: 'lucide:shield',
    color: '#4338ca',
    accentClass: 'bg-indigo-600',
    buttonClass: 'data-[active=true]:bg-indigo-700',
    markerSvg: '<path d="M16 4l9 4v6c0 5-3.8 9.7-9 11-5.2-1.3-9-6-9-11V8z"/>',
  },
  {
    kind: 'hazard',
    label: '위험지대',
    icon: 'lucide:triangle-alert',
    color: '#dc2626',
    accentClass: 'bg-rose-600',
    buttonClass: 'data-[active=true]:bg-rose-700',
    markerSvg: '<path d="M16 4l12 22H4z"/><path d="M16 11v6"/><path d="M16 21h.01"/>',
  },
  {
    kind: 'secret',
    label: '비밀',
    icon: 'lucide:key-round',
    color: '#475569',
    accentClass: 'bg-slate-500',
    buttonClass: 'data-[active=true]:bg-slate-700',
    markerSvg: '<circle cx="10" cy="15" r="4"/><path d="M14 15h12"/><path d="M22 15v-3"/><path d="M18 15v3"/><path d="M26 15v3"/>',
  },
  {
    kind: 'session-area',
    label: '세션 지역',
    icon: 'lucide:bookmark',
    color: '#059669',
    accentClass: 'bg-emerald-500',
    buttonClass: 'data-[active=true]:bg-emerald-700',
    markerSvg: '<path d="M8 4h14l-2 7 2 6H8z"/><path d="M8 4v20"/>',
  },
];

export const interactiveMapKindLabelMap = Object.fromEntries(
  interactiveMapKindOptions.map(option => [ option.kind, option.label ]),
) as Record<MapPinKind, string>;
