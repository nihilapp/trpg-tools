# TODO

## Current Context

Project path:

```txt
/home/nihilncunia/coding/app/fa-tools
```

Recent work:

- Refactored `app/components/MonsterRollTable.vue` so it no longer contains all types, CSV loading, and generation logic.
- Added shared CSV parser:
  - `app/utils/csv.ts`
- Added monster roll table types:
  - `app/types/monster-roll-table.types.ts`
- Added monster roll table CSV file metadata:
  - `app/data/monster-roll-table/files.ts`
- Added monster roll table data loading composable:
  - `app/composables/monster-roll-table/useMonsterRollTableData.ts`
- Added monster generation logic module:
  - `app/utils/monster-roll-table/generator.ts`
- `pnpm build` passes.
- `pnpm exec eslint .` has 0 errors and 33 warnings.

## Next Issue

`app/components/MonsterRollTable.vue` template has nullable result access issues in editor/type checking.

Current state:

```ts
const result = ref<MonsterResult | null>(null);
```

In Vue templates, refs are auto-unwrapped, so `.value` is not used. However, the template type checker can still see `result` as:

```ts
MonsterResult | null
```

This can produce errors on template access like:

```vue
{{ result.observedName }}
```

## Suggested Fix

Update template accesses to use null-safe access:

```vue
{{ result?.observedName }}
{{ result?.summaryText }}
{{ result?.originContext?.origin_ko }}
```

For arrays used in `v-for`, use a fallback:

```vue
v-for="behavior in result?.behaviorPatterns ?? []"
v-for="move in result?.movements ?? []"
v-for="sense in result?.senses ?? []"
v-for="trace in result?.traces ?? []"
v-for="risk in result?.riskSignals ?? []"
v-for="drop in result?.drops ?? []"
v-for="resource in result?.resources ?? []"
```

Also review chained accesses such as:

```vue
result.primarySubtype?.subtype_ko.replace(result.majorType.type_ko, '').trim()
```

and make them null-safe.

## Verification Commands

```bash
pnpm build
pnpm exec eslint app/components/MonsterRollTable.vue
pnpm exec eslint .
```

Expected current baseline:

- Build should pass.
- ESLint should have no errors.
- Existing warnings are mostly outside the monster roll table work:
  - form label accessibility warnings
  - interactive map function declaration order warnings
  - sample API unused argument warnings
