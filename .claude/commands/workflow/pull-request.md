# Pull Request Creator

Review changes, push commits, and create pull request to the nearest rc/** branch.

## Usage

```
/pull-request
/pr
```

## Description

This command analyzes all changes from HEAD to the nearest `rc/**` branch, pushes any unpushed commits, and creates a properly formatted pull request using GitHub CLI.

## What it does

1. **Change Analysis:**
   - Identifies nearest `rc/**` branch (local or remote)
   - Analyzes all modifications from HEAD to base branch
   - Collects commit messages and metadata
   - Determines scope and type of changes

2. **Content Generation:**
   - Creates action-oriented PR title
   - Generates comprehensive PR description
   - Suggests appropriate labels and milestone
   - Extracts issue numbers from branch names

3. **Validation and Push:**
   - Checks for unpushed commits
   - Pushes local commits to remote branch
   - Validates GitHub CLI authentication
   - Confirms PR details with user

4. **PR Creation:**
   - Uses `gh` CLI to create pull request
   - Sets proper title, description, labels, milestone
   - Links to closing issues automatically
   - Reports PR URL upon success

## Change Analysis Process

### Branch Detection
```bash
# Searches for nearest rc/** branch
git branch -r | grep 'rc/' | head -1  # Remote branches
git branch -l | grep 'rc/' | head -1  # Local branches
```

### Diff Analysis
- Compares HEAD to detected base branch
- Analyzes file changes and commit history
- Prioritizes code changes over documentation
- Identifies breaking changes or major features

### Issue Extraction
- Detects branch pattern: `marcuscastelo/issue<number>`
- Automatically adds `closes #<number>` to PR description
- Links related issues mentioned in commits

## PR Content Structure

### Title Format
```
type(scope): concise action-oriented summary
```

Examples:
- `feat(day-diet): add copy previous day functionality`
- `fix(unified-item): resolve hierarchy validation errors`
- `refactor(weight): optimize period grouping algorithm`

### Description Sections

1. **Summary:** What was changed and why
2. **Implementation Details:** Notable technical decisions
3. **Breaking Changes:** Any backward incompatible changes
4. **Testing:** How changes were validated
5. **Issues:** `closes #123` if applicable

### Example Description
```markdown
## Summary
Implements copy previous day functionality allowing users to duplicate their previous day's meals and macros to the current day.

## Implementation Details
- Added `CopyLastDayButton` component with confirmation modal
- Created `copyDayDiet` domain operation with validation
- Integrated with existing day diet infrastructure
- Maintains macro targets and meal structure

## Testing
- Added unit tests for domain operations
- Tested UI interaction flows
- Verified data consistency after copy

Closes #456
```

## Label Suggestions

### Type Labels
- `feature` - New functionality
- `bug` - Bug fixes
- `refactor` - Code restructuring
- `improvement` - Enhancements
- `chore` - Maintenance tasks

### Area Labels
- `ui` - User interface changes
- `backend` - Server-side logic
- `api` - API modifications
- `performance` - Performance improvements
- `accessibility` - Accessibility enhancements

### Complexity Labels
- `complexity-low` - Simple changes
- `complexity-medium` - Moderate complexity
- `complexity-high` - Complex implementation
- `complexity-very-high` - Very complex changes

## Shell and CLI Handling

### Multiline Content Management (CRITICAL - HEREDOC RULES)

**🚨 MANDATORY HEREDOC FORMAT:**
```bash
# ALWAYS use single quotes around EOF delimiter to prevent variable expansion
cat << 'EOF' > /tmp/pr-description.md
## Summary
Your PR description content here.

## Implementation Details
- Bullet points work fine
- Code blocks with `backticks` are safe
- Variables like $VAR will NOT be expanded (good!)

Closes #123
EOF

# THEN use the file with gh CLI
gh pr create --title "your title" --body-file /tmp/pr-description.md
```

**🚨 CRITICAL RULES:**
1. **ALWAYS use `cat << 'EOF'`** (with single quotes)
2. **NEVER use `cat <<EOF`** (without quotes) - causes variable expansion
3. **NEVER use `cat <<"EOF"`** (with double quotes) - allows some expansion
4. **NEVER put content directly in `--body`** - use `--body-file` always
5. **ALWAYS clean up:** `rm /tmp/pr-description.md` after creation

### Error Handling
- Validates `gh` CLI authentication
- Checks remote branch existence
- Handles network connectivity issues
- Reports clear error messages

### Formatting Verification
- Verifies PR body formatting on GitHub
- Retries with corrected formatting if needed
- Uses heredoc to prevent escape sequence issues
- Confirms visual formatting with user

## Push and Validation Process

### Pre-PR Checks
1. **Unpushed Commits:**
   ```bash
   git log @{u}..HEAD --oneline  # Check for unpushed commits
   git push origin HEAD          # Push if needed
   ```

2. **Branch Validation:**
   ```bash
   git status --porcelain        # Ensure clean working directory
   git remote -v                 # Verify remote configuration
   ```

3. **User Confirmation:**
   - Display generated PR title and description
   - Show suggested labels and milestone
   - Request explicit confirmation to proceed

### Quality Validation
- Ensures all checks pass before PR creation
- Validates clean architecture compliance
- Confirms no linting or type errors
- Verifies tests pass

## Target Branch Logic

### Branch Priority (CRITICAL - NEVER USE STABLE)
1. **Remote rc/ branches:** `origin/rc/v0.14.0` - PRIMARY TARGET
2. **Local rc/ branches:** `rc/v0.14.0` - SECONDARY TARGET  
3. **User specification:** MANDATORY prompt if no rc/ branch found
4. **FORBIDDEN:** Never use `stable` branch - PRs to stable are ONLY for version releases

### Branch Detection Rules
```bash
# REQUIRED: Always check for rc/ branches first
RC_BRANCH=$(git branch -r | grep 'origin/rc/' | head -1 | sed 's/.*origin\///')
if [ -z "$RC_BRANCH" ]; then
  RC_BRANCH=$(git branch -l | grep 'rc/' | head -1 | sed 's/^[* ] *//')
fi

# CRITICAL: If no rc/ branch exists, STOP and ask user
if [ -z "$RC_BRANCH" ]; then
  echo "❌ ERROR: No rc/ branch found. Cannot proceed."
  echo "Available branches:"
  git branch -r | grep -v HEAD
  exit 1
fi

# Use detected rc/ branch as base
BASE_BRANCH="$RC_BRANCH"
```

### Version Detection
- Uses `.scripts/semver.sh` for version information
- Includes current version in PR metadata
- References milestone based on target version

## Integration Features

### Issue Automation
- **Branch-based detection:** Extracts issue number from branch name
- **Automatic closure:** Adds `closes #<number>` to description
- **Cross-references:** Links related issues from commits

### Documentation Updates
- **Architecture compliance:** References clean architecture changes
- **Code review:** Mentions significant architectural decisions
- **Migration notes:** Documents any breaking changes

### Milestone Association
- **Version-based:** Associates with target release milestone
- **Feature-based:** Links to relevant feature milestones
- **Bug-based:** Associates with current sprint milestone

## Output Format

### Generated Content
```markdown
**Title:**
feat(day-diet): add copy previous day functionality

**Description:**
## Summary
Implements copy previous day functionality allowing users to...

**Labels:**
feature ui complexity-medium

**Milestone:**
v0.14.0
```

### GitHub CLI Command (CORRECTED)
```bash
# CRITICAL: Always detect rc/ branch first - NEVER hardcode stable
RC_BRANCH=$(git branch -r | grep 'origin/rc/' | head -1 | sed 's/.*origin\///')
if [ -z "$RC_BRANCH" ]; then
  echo "❌ No rc/ branch found - cannot create PR"
  exit 1
fi

# Create PR with detected rc/ branch
gh pr create \
  --title "feat(day-diet): add copy previous day functionality" \
  --body-file /tmp/pr-description.md \
  --label feature,ui,complexity-medium \
  --milestone "v0.14.0" \
  --base "$RC_BRANCH"

# Clean up
rm /tmp/pr-description.md
```

## Error Recovery

### CRITICAL ERRORS TO AVOID

**🚨 NEVER USE STABLE BRANCH:**
- **Problem:** Creating PR to `stable` instead of `rc/` branch
- **Fix:** Always detect and use `rc/` branch as base
- **Rule:** PRs to `stable` are ONLY for version release merges

**🚨 EOF APPEARING IN PR DESCRIPTION:**
- **Problem:** Using `cat <<EOF` without quotes causes shell expansion
- **Fix:** Always use `cat << 'EOF'` with single quotes
- **Result:** Prevents literal "EOF" text in PR descriptions

### Common Issues
- **No rc/ branch:** STOP execution and prompt user - never fallback to stable
- **Unpushed commits:** Automatically pushes before PR creation
- **Formatting issues:** Use proper heredoc with single quotes around EOF
- **Label conflicts:** Removes invalid labels and continues

### Graceful Failures
- **Network issues:** Reports connectivity problems
- **Authentication:** Guides through `gh auth login`
- **Permission errors:** Suggests repository access verification
- **Existing PR:** Detects and reports existing PR for branch

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- Git repository with proper remote configuration
- `.scripts/semver.sh` script (with fallback)
- Write access to repository
- Target `rc/**` branch exists

## Best Practices

- **Clear titles:** Action-oriented, conventional commit style
- **Comprehensive descriptions:** Include context and motivation
- **Proper labeling:** Use existing repository labels
- **Issue linking:** Automatic closure where applicable
- **Quality validation:** Ensure all checks pass
- **User confirmation:** Verify details before creation