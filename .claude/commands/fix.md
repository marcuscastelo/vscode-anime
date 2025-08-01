# Fix Command

Automated codebase checks and error correction for vscode-anime extension.

## Usage
```
/fix
```

## What it does
1. Runs `pnpm fix` to auto-fix ESLint issues
2. Runs `pnpm type-check` to verify TypeScript compilation
3. Runs `pnpm test:run` to ensure all tests pass
4. Runs `pnpm build` to verify extension builds correctly
5. Reports any remaining issues that need manual attention

## Success Criteria
- All ESLint issues auto-fixed or reported
- No TypeScript compilation errors
- All tests passing
- Extension builds successfully
- Ready for development or release