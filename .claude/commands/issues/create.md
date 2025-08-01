# GitHub Issue Creator

Create any type of GitHub issue (bug, feature, improvement, refactor, task, subissue) using the correct template and workflow.

## Usage

```
/create-issue [type] [description]
```

**Parameters:**
- `type` (optional): bug, feature, improvement, refactor, task, subissue
- `description` (optional): Brief description of the issue

## Description

This command creates GitHub issues using the appropriate templates from the docs/ directory. It handles all issue types with proper formatting, labels, and validation.

## Memory Integration

**Context Loading:**
- Loads `workflow-optimization-patterns` for issue creation best practices
- References `todo-issue-relationship-pattern` for TODO correlation
- Uses `issue-creation-workflow-optimization` for template improvements
- Applies learned patterns from previous issue creations

**Smart Defaults:**
- Suggests issue types based on code area and context
- Pre-fills templates with relevant project information
- Recommends appropriate labels based on module patterns
- Correlates with existing issues to prevent duplicates

**Workflow Awareness:**
- Integrates with `/discover-issues` findings for context
- Maintains consistency with project labeling conventions
- Applies solo project adaptations automatically
- Uses session context for better issue correlation

## What it does

1. **Type Clarification:**
   - Asks for issue type if not specified or ambiguous
   - Validates against supported types: bug, feature, improvement, refactor, task, subissue

2. **Template Selection:**
   - Uses correct template from `docs/` directory:
     - Bug: `ISSUE_TEMPLATE_BUGFIX.md`
     - Feature: `ISSUE_TEMPLATE_FEATURE.md`
     - Improvement: `issue-improvement-*.md`
     - Refactor: `ISSUE_TEMPLATE_REFACTOR.md`
     - Task: `ISSUE_TEMPLATE_TASK.md`
     - Subissue: `ISSUE_TEMPLATE_SUBISSUE.md`

3. **Content Generation:**
   - Fills template with provided information
   - Uses Markdown formatting for all sections
   - Generates in English (UI text may be pt-BR if required)

4. **Investigation (for bugs):**
   - Searches codebase for related files using error messages
   - Adds `Related Files` section with relevant file paths
   - Includes stack trace analysis when available

5. **Environment Info:**
   - Updates app version using `.scripts/semver.sh`
   - Includes current environment details
   - Validates script availability and fallbacks

6. **Issue Creation:**
   - Uses `printf` with heredoc for multi-line content
   - Writes to temp file for shell compatibility
   - Executes `gh issue create --body-file`
   - Verifies content before submission

## Issue Types

### Bug Reports
- **Requirements:** Error message, stack trace, or reproduction steps
- **Investigation:** Automatic codebase search for related files
- **Template:** Structured bug report with environment details
- **Labels:** `bug` + complexity + area labels

### Feature Requests
- **Requirements:** Clear description of desired functionality
- **Template:** Feature specification with acceptance criteria
- **Solo Project Focus:** Technical implementation over business value
- **Labels:** `feature` + complexity + area labels

### Improvements
- **Requirements:** Justification and impact assessment
- **Template:** Technical debt or enhancement description
- **Focus:** Code quality, performance, maintainability
- **Labels:** `improvement` + complexity + area labels

### Refactors
- **Requirements:** Affected files and modules list
- **Template:** Architecture improvement specification
- **Implementation:** Clear scope and affected components
- **Labels:** `refactor` + complexity + area labels

### Tasks
- **Requirements:** Specific actionable items
- **Template:** Structured task with clear deliverables
- **Focus:** Maintenance, chores, non-feature work
- **Labels:** `task` + complexity + area labels

### Subissues
- **Requirements:** Parent issue reference
- **Template:** Subset of larger issue work
- **Linking:** Always references parent issue number
- **Labels:** `subissue` + parent labels

## Shell and CLI Handling

### Zsh Compatibility
- Uses `printf` with double quotes for special characters
- Writes content to temp files before submission
- Verifies file content with `cat` before execution
- Handles Unicode and accented characters properly

### Error Handling
- Checks script existence before execution
- Validates CLI command outputs
- Retries with corrected parameters
- Reports errors gracefully

### File Operations
- Creates temp files in `/tmp/` with unique names
- Verifies write permissions
- Cleans up temporary files after use
- Handles permission issues gracefully

## Labels and Validation

### Required Labels
- **Type label:** One of bug, feature, improvement, refactor, task, subissue
- **Complexity:** low, medium, high, very-high (when assessable)
- **Area:** ui, backend, api, performance, accessibility (when applicable)

### Label Validation
- Uses only existing labels and milestones
- Skips missing labels rather than failing
- Refers to `docs/labels-usage.md` for conventions
- Avoids duplicate or conflicting labels

### Content Validation
- Verifies Markdown formatting
- Checks template compliance
- Validates required sections
- Ensures English language usage

## Solo Project Adaptations

- **Focus:** Technical excellence over business coordination
- **Removal:** Stakeholder approval workflows
- **Emphasis:** Self-review and technical validation
- **Metrics:** Technical over business/team metrics
- **Documentation:** Implementation-focused templates

## Integration Features

- **Version Tracking:** Uses `.scripts/semver.sh` for app version
- **Codebase Search:** Automatic file discovery for bugs
- **Template System:** Consistent formatting across issue types
- **CLI Integration:** Full GitHub CLI workflow support
- **Error Recovery:** Graceful handling of missing dependencies

## Output

Creates GitHub issue and outputs the final command:

```bash
gh issue create --title "feat: add dark mode toggle" \
  --body-file /tmp/issue-body.md \
  --label feature,ui,complexity-medium \
  --milestone "v0.14.0"
```

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- `.scripts/semver.sh` script (with fallback)
- Write access to repository
- Valid issue templates in `docs/` directory
- Shell with `printf` and heredoc support

## Best Practices

- **Clear titles:** Use conventional commit style when applicable
- **Complete templates:** Fill all required sections
- **Proper investigation:** Search codebase for bugs
- **Accurate labels:** Use appropriate type and complexity labels
- **Environment details:** Include version and environment info
- **Validation:** Check content before submission