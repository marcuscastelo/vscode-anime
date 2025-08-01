# Pull Request Command

Create pull requests with proper formatting for vscode-anime extension.

## Usage
```
/pull-request
/pr
```

## What it does
1. Analyzes current branch changes since diverging from develop
2. Reviews all commits that will be included in the PR
3. Generates comprehensive PR description with:
   - Summary of changes
   - Test plan checklist
   - Breaking changes (if any)
   - Related issues
4. Creates PR using GitHub CLI
5. Returns PR URL for review

## PR Structure
```markdown
## Summary
- Brief overview of changes
- Key features or fixes implemented

## Test plan
- [ ] Unit tests pass
- [ ] Extension loads in VS Code
- [ ] Feature works as expected
- [ ] No regressions in existing functionality

## Breaking changes
- None / List any breaking changes

## Related issues
- Closes #123
- Fixes #456
```

## Requirements
- Must be on a feature branch (not develop/main)
- Branch should be up to date with develop
- All tests must pass before creating PR