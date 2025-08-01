# Codebase Quality Fix

Automatically run comprehensive checks and fix all detected issues until the codebase passes all quality gates.

## Usage

```
/fix
```

## Description

This command performs automated codebase checks using `npm run copilot:check` and fixes all detected issues including linting errors, type errors, and test failures. It continues iterating until all checks pass.

## Memory Integration

**Context Loading:**
- Loads `workflow-optimization-patterns` for quality standards
- References project-specific error handling patterns  
- Uses architectural guidelines for layer violation fixes
- Applies consistent code style patterns from memory

**Pattern Recognition:**
- Remembers common error patterns and their solutions
- Applies learned fixes from previous iterations
- Uses project-specific conventions (absolute imports, error handling)
- Maintains consistency with established patterns

## What it does

1. **Check Execution:**
   - Runs `npm run copilot:check` with output redirection

2. **Output Validation:**
   - Checks for "COPILOT: All checks passed!" success message
   - Detects error patterns: `failed`, `at constructor`, `error`, `replace`
   - Never stops early - completes all validation scripts

3. **Error Analysis:**
   - Analyzes detected issues using agent capabilities
   - Categorizes errors by type (lint, type, test, build)
   - Prioritizes fixes by impact and dependencies

4. **Automated Fixes:**
   - **Linting errors:** Auto-fixes with ESLint rules
   - **Type errors:** Adds proper types and null checks
   - **Import issues:** Converts to absolute imports with ~/
   - **Test failures:** Updates tests for code changes
   - **Formatting:** Applies Prettier consistently

5. **Iteration Loop:**
   - Re-runs full check process after each fix
   - Continues until "COPILOT: All checks passed!" appears
   - Never skips validation reruns

## Fix Categories

### ESLint Fixes
- **Absolute imports:** Converts relative imports to `~/` format
- **Type safety:** Adds explicit null/undefined checks
- **Unused variables:** Removes or prefixes with underscore
- **Import ordering:** Applies simple-import-sort rules
- **Prettier formatting:** Fixes code style issues

### TypeScript Fixes
- **Explicit types:** Replaces `any` with proper types
- **Null checks:** Adds strict null/undefined validation
- **Generic constraints:** Properly constrains type parameters
- **Callback types:** Specifies exact callback argument types
- **Library types:** Uses proper types for external libraries

### Test Fixes
- **Orphaned tests:** Removes tests for deleted functionality
- **Test updates:** Updates tests to match code changes
- **Mock updates:** Updates mocks for new interfaces
- **Import fixes:** Updates test imports to absolute paths

### Architecture Fixes
- **Layer violations:** Moves code to appropriate layers
- **Error handling:** Adds proper `handleApiError` calls
- **Domain purity:** Removes side effects from domain layer
- **Import structure:** Enforces module boundaries

## Output

Reports final status:
- ✅ "All checks passed!" - Success state
- ❌ "Remaining issues:" - Lists unfixable issues
- 🔄 "Iteration [N]:" - Shows progress during fixes

## Error Handling

- **Script missing:** Reports missing validation scripts
- **Permission denied:** Suggests file permission fixes
- **Network issues:** Handles dependency installation problems
- **Complex errors:** Documents manual intervention needed

## Best Practices

- **Atomic fixes:** Makes single-purpose changes
- **Comprehensive validation:** Always reruns full check suite
- **No shortcuts:** Never skips validation steps
- **Clear reporting:** Documents all changes made
- **Rollback safety:** Preserves git state for rollback

## Project-Specific Rules

- Enforces absolute imports with `~/` prefix
- Maintains clean architecture layer separation
- Preserves Portuguese UI text while fixing English code
- Updates JSDoc for exported functions only
- Follows conventional commit message format for any auto-commits