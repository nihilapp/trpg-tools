export interface OriginContext {
  origin_id: string;
  origin_ko: string;
  definition: string;
}

export interface FieldState {
  state_id: string;
  state_ko: string;
  definition: string;
}

export interface MajorType {
  roll_min: number;
  roll_max: number;
  type_en: string;
  type_ko: string;
  field_definition: string;
}

export interface Subtype {
  subtype_id: string;
  major_type_en: string;
  major_type_ko: string;
  subtype_ko: string;
  subtype_en: string;
  classification_axis: string;
  definition: string;
  example_keywords: string;
}

export interface Size {
  roll_min: number;
  roll_max: number;
  size_en: string;
  size_ko: string;
  field_note: string;
}

export interface LeaderStatus {
  roll_min: number;
  roll_max: number;
  leader_grade_ko: string;
  is_leader: string;
  leader_grade_en: string;
  definition: string;
}

export interface SocialPattern {
  social_id: string;
  social_ko: string;
  definition: string;
}

export interface BehaviorPattern {
  behavior_id: string;
  behavior_ko: string;
  definition: string;
  field_evidence: string;
}

export interface Movement {
  movement_id: string;
  movement_ko: string;
  field_observation: string;
  tactical_note: string;
}

export interface Sense {
  sense_id: string;
  sense_ko: string;
  field_observation: string;
  tactical_note: string;
}

export interface AttackMode {
  attack_mode_id: string;
  attack_mode_ko: string;
  definition: string;
  field_sign: string;
}

export interface DamageType {
  damage_type_en: string;
  damage_type_ko: string;
  field_interpretation: string;
  trace_hint: string;
}

export interface Trace {
  trace_id: string;
  trace_ko: string;
  trace_category: string;
  definition: string;
  field_use: string;
  tags: string;
}

export interface Resource {
  resource_id: string;
  resource_ko: string;
  resource_category: string;
  definition: string;
  use_note: string;
  hazard_level: string;
  tags: string;
}

export interface RiskSignal {
  risk_id: string;
  risk_ko: string;
  definition: string;
  classification_note: string;
}

export interface SubtypeTraceLink {
  link_id: string;
  major_type_en: string;
  subtype_id: string;
  trace_id: string;
  weight: number;
  required: string;
  notes: string;
}

export interface SubtypeResourceLink {
  link_id: string;
  major_type_en: string;
  subtype_id: string;
  resource_id: string;
  weight: number;
  required: string;
  notes: string;
}

export interface FieldStateTraceLink {
  link_id: string;
  field_state_id: string;
  trace_id: string;
  weight: number;
  required: string;
  notes: string;
}

export interface TraceResourceLink {
  link_id: string;
  trace_id: string;
  resource_id: string;
  weight_bonus: number;
  notes: string;
}

export interface TypeCommonDrop {
  major_type_en: string;
  major_type_ko: string;
  type_common_drops: string;
}

export interface SubtypeUniqueDrop {
  major_type_en: string;
  major_type_ko: string;
  subtype_id: string;
  subtype_ko: string;
  drop_count: number;
  subtype_unique_drops: string;
}

export interface SpecialConditionDrop {
  rule_id: string;
  condition_group: string;
  condition_value: string;
  drop_ko: string;
  drop_policy: string;
  notes: string;
}

export interface MonsterResult {
  originContext: OriginContext | null;
  fieldState: FieldState | null;
  majorType: MajorType | null;
  primarySubtype: Subtype | null;
  secondarySubtypes: Subtype[];
  size: Size | null;
  leaderStatus: LeaderStatus | null;
  socialPattern: SocialPattern | null;
  behaviorPatterns: BehaviorPattern[];
  movements: Movement[];
  senses: Sense[];
  attackRanges: AttackMode[];
  attackDeliveries: AttackMode[];
  damageTypes: DamageType[];
  traces: Trace[];
  resources: Resource[];
  riskSignals: RiskSignal[];
  drops: string[];
  observedName: string;
  summaryText: string;
}

export interface LockState {
  originContext: boolean;
  fieldState: boolean;
  majorType: boolean;
  subtypes: boolean;
  size: boolean;
  leaderStatus: boolean;
  socialPattern: boolean;
  behaviorPatterns: boolean;
  movements: boolean;
  senses: boolean;
  attackRanges: boolean;
  attackDeliveries: boolean;
  damageTypes: boolean;
  traces: boolean;
  resources: boolean;
  riskSignals: boolean;
}

export interface MonsterRollTables {
  originContexts: OriginContext[];
  fieldStates: FieldState[];
  majorTypes: MajorType[];
  subtypes: Subtype[];
  sizes: Size[];
  leaderStatuses: LeaderStatus[];
  socialPatterns: SocialPattern[];
  behaviorPatterns: BehaviorPattern[];
  movements: Movement[];
  senses: Sense[];
  attackModes: AttackMode[];
  damageTypes: DamageType[];
  traces: Trace[];
  resources: Resource[];
  riskSignals: RiskSignal[];
  subtypeTraceLinks: SubtypeTraceLink[];
  subtypeResourceLinks: SubtypeResourceLink[];
  fieldStateTraceLinks: FieldStateTraceLink[];
  traceResourceLinks: TraceResourceLink[];
  typeCommonDrops: TypeCommonDrop[];
  subtypeUniqueDrops: SubtypeUniqueDrop[];
  specialConditionDrops: SpecialConditionDrop[];
}
