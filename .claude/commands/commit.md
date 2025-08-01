# Commit Command

Generate conventional commit messages and execute commits for vscode-anime extension.

## Usage
```
/commit [message-type]
```

## What it does
1. Analyzes current git changes using `git status` and `git diff`
2. Reviews recent commit history for consistency
3. Generates conventional commit message following project patterns
4. Stages relevant files if needed
5. Creates commit with proper formatting
6. **NEVER** includes "Generated with Claude Code" or "Co-Authored-By: Claude"

## Commit Types
- `feat`: New features or enhancements
- `fix`: Bug fixes
- `refactor`: Code restructuring without behavior changes
- `perf`: Performance improvements
- `docs`: Documentation updates
- `test`: Test additions or modifications
- `chore`: Maintenance tasks, dependencies, tooling

## Example Output
```
feat(parser): add support for partial episode entries

- Support parsing incomplete episode markers
- Add validation for partial episode syntax
- Update completion provider for partial entries
```