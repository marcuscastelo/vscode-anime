# GitHub Issue Refiner

Refines existing GitHub issues by clarifying requirements, adding missing details, and ensuring they follow proper templates for optimal implementation.

## Usage

```
/refine-issue <issue-number>
```

**Parameters:**
- `issue-number` (required): GitHub issue number to refine

## Description

This command takes an existing GitHub issue and guides you through an interactive refinement process. It fetches the current issue content, analyzes it against project templates, and helps clarify any ambiguous or missing information to make the issue actionable for implementation.

## What it does

1. **Issue Retrieval:**
   - Fetches issue content using `gh issue view --json` with all available fields
   - Retrieves both issue body and all comments for complete context
   - Validates issue exists and is accessible

2. **Template Analysis:**
   - Analyzes current issue content and structure
   - Automatically deduces the most appropriate template from `docs/`:
     - Bug: `ISSUE_TEMPLATE_BUGFIX.md`
     - Feature: `ISSUE_TEMPLATE_FEATURE.md`  
     - Improvement: `issue-improvement-*.md`
     - Refactor: `ISSUE_TEMPLATE_REFACTOR.md`
     - Task: `ISSUE_TEMPLATE_TASK.md`
     - Subissue: `ISSUE_TEMPLATE_SUBISSUE.md`
   - If template cannot be confidently determined, presents options to user

3. **Interactive Refinement:**
   - Prompts for missing or unclear information in each template field
   - Asks clarifying questions to resolve ambiguities
   - Ensures all acceptance criteria are explicit and actionable
   - Confirms user intent for global/codebase-wide changes
   - Suggests scope improvements and expected outcomes
   - Validates technical feasibility and implementation approach

4. **Content Enhancement:**
   - Fills gaps in problem description and context
   - Adds technical details and implementation hints
   - Includes relevant file paths and code references
   - Ensures issue is self-contained and LLM-friendly
   - Adds traceability with `reportedBy` metadata

5. **Label Management:**
   - Analyzes current labels and suggests improvements
   - Proposes additions based on refined content:
     - Type labels: `bug`, `feature`, `improvement`, `refactor`, `task`, `subissue`
     - Complexity: `complexity-low`, `complexity-medium`, `complexity-high`, `complexity-very-high`
     - Area: `ui`, `backend`, `api`, `performance`, `data-consumption`, `accessibility`
     - Status: `blocked`, `needs-investigation`, `needs-design`
   - Confirms with user before applying label changes
   - Removes generic or conflicting labels

6. **Issue Update:**
   - Structures refined content according to selected template
   - Uses Markdown formatting for consistency
   - Writes issue body to temporary file using heredoc
   - Updates issue using `gh issue edit --body-file`
   - Applies label changes in same workflow
   - Handles CLI errors gracefully with automatic retries

## Interactive Process

### Template Selection
- **Automatic:** When issue type and structure are clear
- **Manual:** When ambiguous, presents available templates with explanations
- **Validation:** Ensures selected template matches issue intent

### Clarification Questions
- **Missing Context:** "What specific problem does this solve?"
- **Vague Requirements:** "What exactly should happen when...?"
- **Technical Details:** "Which files/modules are affected?"
- **Acceptance Criteria:** "How will we know this is complete?"
- **Scope Confirmation:** "Should this change apply globally across the codebase?"

### Content Validation
- **Completeness:** All template sections filled appropriately
- **Clarity:** Unambiguous language and specific requirements
- **Actionability:** Clear implementation steps and outcomes
- **Self-containment:** No external dependencies or assumptions

## Refinement Focus Areas

### Bug Reports
- Clear reproduction steps and error conditions
- Environment details and version information
- Expected vs actual behavior descriptions
- Related files and stack trace analysis

### Feature Requests
- User value proposition and use cases
- Technical implementation approach
- Integration points with existing features
- Performance and scalability considerations

### Improvements
- Current pain points and limitations
- Proposed technical solution approach
- Impact assessment and risk analysis
- Backward compatibility considerations

### Refactors
- Specific files and modules affected
- Architecture improvements and benefits
- Migration strategy for existing code
- Testing approach and validation plan

### Tasks
- Specific deliverables and outcomes
- Dependencies on other work
- Completion criteria and validation
- Timeline and priority considerations

## Shell and CLI Handling

### Robust Issue Updates
```bash
# Write content to temp file with heredoc
cat <<'EOF' > /tmp/issue-body-$issue_number.md
$refined_content
EOF

# Update issue with file
gh issue edit $issue_number --body-file /tmp/issue-body-$issue_number.md
```

### Error Recovery
- Handles missing temporary files by recreating them
- Retries failed CLI commands with corrected parameters  
- Validates file permissions and accessibility
- Reports actionable error messages

### Data Retrieval
```bash
# Fetch complete issue data
gh issue view $issue_number --json number,title,body,labels,comments,state,author
```

## Solo Project Adaptations

- **Direct Action:** Updates issues immediately after user confirmation
- **Technical Focus:** Emphasizes implementation details over business processes
- **Self-Review:** Systematic validation without peer review requirements
- **Quality Maintenance:** Preserves technical standards without bureaucracy

## Output Format

### Refined Issue Structure
```markdown
# Issue Title

reportedBy: github-copilot.v1/refine-github-issue

## [Template Sections]
- Problem description
- Acceptance criteria  
- Technical approach
- Implementation details
- Testing strategy
```

### Confirmation Messages
```
✅ Issue #123 refined successfully
📋 Template: Feature Request
🏷️  Labels: feature, ui, complexity-medium
🔗 https://github.com/owner/repo/issues/123
```

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- Write access to repository
- Valid issue templates in `docs/` directory
- Issue must exist and be accessible
- Shell with heredoc and temp file support

## Best Practices

- **Always confirm:** Get user approval before making changes
- **Be specific:** Ask targeted questions to clarify ambiguities
- **Stay focused:** Keep refinements within original issue scope
- **Maintain quality:** Ensure refined issues meet project standards
- **Document changes:** Include traceability and attribution
- **Handle errors:** Provide clear feedback and recovery options

## Error Handling

- **Issue not found:** Validates issue number exists
- **Permission denied:** Checks repository access rights
- **CLI failures:** Retries with corrected parameters
- **Template missing:** Falls back to generic structure
- **File operations:** Handles temp file creation failures