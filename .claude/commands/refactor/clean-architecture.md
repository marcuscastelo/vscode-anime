# Clean Architecture Refactoring

Refactor code to follow clean architecture principles with proper layer separation and modularization.

## Usage

```
/refactor [target] [scope]
```

**Parameters:**
- `target` (optional): Specific file, component, or module to refactor
- `scope` (optional): full, module, component, or function-level refactoring

## Description

This command performs comprehensive refactoring to ensure clean architecture compliance, proper modularization, and code quality improvements for SolidJS/TypeScript projects.

## What it does

1. **Architecture Analysis:**
   - Analyzes current code structure and layer violations
   - Identifies domain, application, and infrastructure concerns
   - Detects cross-layer dependencies and violations

2. **Clean Architecture Enforcement:**
   - Ensures domain layer purity (no side effects)
   - Validates application layer orchestration
   - Confirms infrastructure layer isolation
   - Fixes layer boundary violations

3. **Modularization:**
   - Extracts duplicated logic into reusable utilities
   - Separates UI concerns from business logic
   - Creates proper module boundaries
   - Establishes clear dependency flows

4. **Code Quality Improvements:**
   - Applies consistent naming conventions
   - Removes code duplication
   - Improves type safety
   - Optimizes performance patterns

5. **Validation:**
   - Runs comprehensive quality checks
   - Ensures tests pass after refactoring
   - Validates clean architecture compliance
   - Confirms performance improvements

## Clean Architecture Layers

### Domain Layer (`modules/*/domain/`)

**Rules:**
- **Pure logic only** - No side effects
- **Never call `handleApiError`** - Only throws pure errors
- **No external dependencies** - Framework-agnostic code
- **Business rules** - Core business logic and entities

**Refactoring Actions:**
```typescript
// Before: Domain with side effects
export function updateDayDiet(dayDiet: DayDiet) {
  handleApiError(new Error('Invalid'), { component: 'domain' }) // ❌
  toast.success('Updated') // ❌
  return dayDiet
}

// After: Pure domain logic
export function updateDayDiet(dayDiet: DayDiet): DayDiet {
  if (!isValidDayDiet(dayDiet)) {
    throw new Error('Invalid day diet', { cause: { dayDiet } }) // ✅
  }
  return dayDiet
}
```

### Application Layer (`modules/*/application/`)

**Rules:**
- **Orchestrates domain logic** - Coordinates between layers
- **Handles all side effects** - API calls, error handling, toasts
- **Catches domain errors** - Always calls `handleApiError` with context
- **State management** - SolidJS signals and effects

**Refactoring Actions:**
```typescript
// Before: Application without error handling
export function useDayDietUpdater() {
  const updateDayDiet = (dayDiet: DayDiet) => {
    return updateDayDietInRepository(dayDiet) // ❌ No error handling
  }
  return { updateDayDiet }
}

// After: Proper application orchestration
export function useDayDietUpdater() {
  const updateDayDiet = async (dayDiet: DayDiet) => {
    try {
      const validatedDayDiet = validateDayDiet(dayDiet) // Domain call
      const result = await updateDayDietInRepository(validatedDayDiet)
      toast.success('Day diet updated successfully')
      return result
    } catch (e) {
      handleApiError(e, {
        component: 'DayDietUpdater',
        operation: 'updateDayDiet',
        additionalData: { dayDietId: dayDiet.id }
      })
      throw e
    }
  }
  return { updateDayDiet }
}
```

### UI Layer (`sections/`, `components/`)

**Rules:**
- **Rendering only** - Delegates logic to hooks and utilities
- **No direct side effects** - Uses application layer hooks
- **Presentational focus** - UI concerns only

**Refactoring Actions:**
```typescript
// Before: UI with business logic
export function DayDietCard(props: { dayDiet: DayDiet }) {
  const handleUpdate = () => {
    // Complex business logic in UI ❌
    if (props.dayDiet.calories > 2000) {
      updateDayDiet({ ...props.dayDiet, status: 'complete' })
    }
  }
  return <div onClick={handleUpdate}>...</div>
}

// After: UI delegates to application layer
export function DayDietCard(props: { dayDiet: DayDiet }) {
  const { updateDayDiet } = useDayDietUpdater() // Application layer hook
  
  const handleUpdate = () => void updateDayDiet(props.dayDiet)
  
  return <div onClick={handleUpdate}>...</div>
}
```

## Modularization Patterns

### Extract Utilities
```typescript
// Before: Duplicated logic
export function ComponentA() {
  const formatMacros = (carbs: number, protein: number, fat: number) => {
    return `${carbs}g C, ${protein}g P, ${fat}g F` // Duplicated
  }
}

export function ComponentB() {
  const formatMacros = (carbs: number, protein: number, fat: number) => {
    return `${carbs}g C, ${protein}g P, ${fat}g F` // Duplicated
  }
}

// After: Extracted utility
// ~/shared/utils/macroFormatting.ts
export function formatMacroNutrients(macros: MacroNutrients): string {
  return `${macros.carbs}g C, ${macros.protein}g P, ${macros.fat}g F`
}
```

### Extract Hooks
```typescript
// Before: Logic in component
export function MealEditor() {
  const [meal, setMeal] = createSignal<Meal>()
  const [loading, setLoading] = createSignal(false)
  
  const saveMeal = async () => {
    setLoading(true)
    try {
      await mealRepository.save(meal())
      toast.success('Meal saved')
    } catch (e) {
      handleApiError(e, { component: 'MealEditor' })
    } finally {
      setLoading(false)
    }
  }
}

// After: Extracted hook
// ~/modules/diet/meal/application/useMealEditor.ts
export function useMealEditor() {
  const [meal, setMeal] = createSignal<Meal>()
  const [loading, setLoading] = createSignal(false)
  
  const saveMeal = async () => {
    setLoading(true)
    try {
      await mealRepository.save(meal())
      toast.success('Meal saved')
    } catch (e) {
      handleApiError(e, {
        component: 'MealEditor',
        operation: 'saveMeal',
        additionalData: { mealId: meal()?.id }
      })
    } finally {
      setLoading(false)
    }
  }
  
  return { meal, setMeal, loading, saveMeal }
}
```

## Performance Optimization

### Algorithmic Improvements
```typescript
// Before: O(n²) filtering
export function groupWeightsByPeriod(weights: Weight[]) {
  return periods.map(period => ({
    period,
    weights: weights.filter(w => isInPeriod(w, period)) // O(n²)
  }))
}

// After: O(n) sliding window
export function groupWeightsByPeriod(weights: Weight[]) {
  const groups: WeightGroup[] = []
  let currentGroup: Weight[] = []
  let periodIndex = 0
  
  for (const weight of weights) {
    while (periodIndex < periods.length && !isInPeriod(weight, periods[periodIndex])) {
      if (currentGroup.length > 0) {
        groups.push({ period: periods[periodIndex], weights: currentGroup })
        currentGroup = []
      }
      periodIndex++
    }
    currentGroup.push(weight)
  }
  
  return groups
}
```

## Import and Module Fixes

### Absolute Import Conversion
```typescript
// Before: Relative imports
import { DayDiet } from '../../domain/dayDiet' // ❌
import { handleApiError } from '../../../shared/error/errorHandler' // ❌

// After: Absolute imports
import { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet' // ✅
import { handleApiError } from '~/shared/error/errorHandler' // ✅
```

### Static Import Enforcement
```typescript
// Before: Dynamic imports
const loadComponent = async () => {
  const { Component } = await import('./Component') // ❌
  return Component
}

// After: Static imports with lazy loading
import { lazy } from 'solid-js'
const Component = lazy(() => import('./Component')) // ✅
```

## Validation Process

### Quality Checks
1. **Run comprehensive checks:**
   ```bash
   npm run copilot:check | tee /tmp/copilot-terminal 2>&1
   ```

2. **Verify success message:**
   - Must see "COPILOT: All checks passed!"
   - Check with `.scripts/cat1.sh`, `.scripts/cat2.sh`, `.scripts/cat3.sh`

3. **Architecture validation:**
   - No cross-layer violations
   - Proper error handling patterns
   - Clean import structure

### Test Updates
- Update tests for refactored code
- Remove orphaned tests
- Add tests for new utilities
- Ensure all tests pass

## Commit Strategy

### Atomic Commits
```bash
git commit -m "refactor(day-diet): extract domain validation logic"
git commit -m "refactor(day-diet): move error handling to application layer"
git commit -m "refactor(day-diet): create reusable formatting utilities"
```

### Conventional Commit Types
- `refactor(scope): description` - Code restructuring
- `perf(scope): description` - Performance improvements
- `style(scope): description` - Code style improvements
- `test(scope): description` - Test updates

## Requirements

- Write access to codebase
- `npm run copilot:check` script available
- `.scripts/` validation scripts
- Git repository for atomic commits
- TypeScript and ESLint properly configured

## Best Practices

- **Incremental refactoring** - Small, atomic changes
- **Preserve functionality** - No behavior changes
- **Improve readability** - Clear, descriptive names
- **Reduce complexity** - Simpler, more maintainable code
- **Follow conventions** - Project-specific patterns
- **Test thoroughly** - Ensure no regressions
- **Document changes** - Clear commit messages