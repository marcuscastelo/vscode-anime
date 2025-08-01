# Commit Message Generator

Analyze staged changes and generate a conventional commit message in English, then execute the commit.

## Usage

```
/commit
```

## Description

This command analyzes the current staged git changes and generates a conventional commit message following the project's standards. It will automatically commit the changes after generating the message.

## What it does

1. **Verification Phase:**
   - Runs `scripts/copilot-commit-info.sh` to gather git information
   - Checks if there are staged changes to commit
   - Stops if no staged changes are found

2. **Analysis Phase:**
   - Analyzes staged changes from script output
   - Determines the type of changes (feat, fix, refactor, etc.)
   - Identifies affected modules and components

3. **Generation Phase:**
   - Creates a conventional commit message in English
   - Ensures message is atomic and describes the main change
   - Follows format: `type(scope): description`

4. **Execution Phase:**
   - Displays the generated commit message
   - Executes the commit automatically
   - Uses proper shell escaping for multi-line messages

## Requirements

- Staged git changes must exist
- `scripts/copilot-commit-info.sh` script must be available
- Git repository must be properly initialized

## Output Format

The command outputs the commit message in a markdown code block:

````markdown
feat(day-diet): add copy previous day functionality
````

Then executes:
```bash
git commit -m "feat(day-diet): add copy previous day functionality"
```

## Commit Message Rules

- **Language:** Always in English
- **Format:** Conventional commits style (type(scope): description)
- **Types:** feat, fix, refactor, test, chore, docs, style, perf, ci
- **Scope:** Module or component name when applicable
- **Description:** Clear, concise summary of the main change
- **Security:** Never include sensitive data, code diffs, or secrets
- **Atomicity:** One logical change per commit

## Error Handling

- No staged changes: Warns user to stage changes first
- Script failures: Reports issue and suggests manual verification
- Shell errors: Uses file-based commit for complex messages
- Permission issues: Provides troubleshooting guidance

## Project-Specific Rules

- References affected modules from src/modules/ structure
- Follows clean architecture layer naming
- Respects domain-driven design terminology
- Maintains consistency with existing commit history