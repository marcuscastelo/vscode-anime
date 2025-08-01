# Milestone Issue Prioritization and Deferral

**Command:** `/prioritize-milestone`

## Purpose

This command analyzes a milestone's issues and helps prioritize them for the current milestone or defer them to the next milestone. It aims to maintain optimal milestone sizes (30-60 issues) while ensuring critical issues remain in the current milestone.

## How It Works

1. **Input**: Prompts for the milestone to analyze
2. **Fetch Issues**: Uses `gh` CLI to list all issues assigned to the given milestone
3. **Fetch Milestones**: Uses `gh` CLI to list all available milestones for user confirmation
4. **Prioritization**:
   - Analyzes and suggests which issues are most critical for the current milestone
   - Suggests which issues can be deferred
   - Clearly presents both lists to the user
5. **Next Milestone Confirmation**:
   - Shows available milestones from `gh` CLI
   - Asks user to confirm which milestone should receive the deferred issues
   - Confirms the deferral plan with the user before proceeding
6. **Deferral Execution**:
   - Upon confirmation, uses `gh` CLI to move all deferred issues to the next milestone
   - Reports the changes made

## Usage

```bash
/prioritize-milestone
```

The command will guide you through:
- Selecting the milestone to analyze
- Reviewing the prioritization suggestions
- Confirming the next milestone for deferrals
- Executing the deferral plan

## Prioritization Criteria

The command considers:
- **Issue complexity** (based on labels like `complexity-low`, `complexity-medium`, `complexity-high`)
- **Issue type** (bugs vs features vs improvements)
- **Dependencies** between issues
- **Current milestone capacity** (targeting 30-60 issues)

## Interactive Flow

1. **Milestone Selection**: Choose which milestone to analyze
2. **Issue Analysis**: Review current issues and their classification
3. **Prioritization Review**: Confirm which issues should stay vs be deferred
4. **Target Milestone**: Select destination milestone for deferred issues
5. **Execution**: Move issues and report results

## Requirements

- GitHub CLI (`gh`) must be installed and authenticated
- Proper repository access for milestone management
- Issues should be labeled according to project standards

## Example Workflow

1. User runs `/prioritize-milestone`
2. Command prompts for milestone "Q3-2025"
3. Command uses `gh` to list all issues in "Q3-2025"
4. Command suggests which issues are priority and which can be deferred
5. Command shows available milestones and asks user to confirm "Q4-2025" as next milestone
6. Upon confirmation, command uses `gh` to move deferred issues and reports results

## Output Format

- All results displayed as Markdown
- Clear separation between priority and deferral lists
- Summary of changes made
- Audit trail of decisions

## Related Commands

- `/create-issue` - Create new issues with proper labeling
- `/implement` - Implement specific issues
- `/review` - Review milestone readiness

## References

- [Labels Usage Guide](../../docs/labels-usage.md)
- [Issue Management Workflow](../issues/README.md)