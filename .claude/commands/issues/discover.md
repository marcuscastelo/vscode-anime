# Issue Discovery Automation

Automatically discover existing issues, TODO patterns, and related functionality to prevent duplicate issue creation and provide comprehensive context for development decisions.

## Usage

```
/discover-issues [feature-area] [search-term]
```

**Parameters:**
- `feature-area` (optional): Module or area to focus search (e.g., "recipe", "diet", "weight")
- `search-term` (optional): Specific functionality or error message to search for

## Description

This command performs comprehensive issue discovery by correlating TODO comments, existing GitHub issues, and related code areas. It provides consolidated findings with actionable recommendations to optimize development workflow.

## What it does

1. **TODO Pattern Discovery:**
   - Searches codebase for TODO comments with issue references
   - Identifies TODO patterns that suggest missing functionality
   - Correlates TODO locations with module structure
   - Extracts issue numbers from TODO comments

2. **GitHub Issue Correlation:**
   - Fetches existing issues using `gh issue list`
   - Searches issue titles and descriptions for related keywords
   - Maps TODO comments to existing GitHub issues
   - Identifies gaps between code TODOs and tracked issues

3. **Code Area Analysis:**
   - Analyzes affected modules and file structures
   - Identifies related functionality and dependencies
   - Maps error messages to potential issue areas
   - Suggests relevant files for investigation

4. **Consolidation and Reporting:**
   - Presents findings in structured format
   - Categorizes by issue type (bug, feature, improvement)
   - Provides actionable next steps
   - Suggests whether new issue creation is needed

## Discovery Categories

### TODO-to-Issue Mapping
- **Tracked TODOs:** TODOs with existing GitHub issue references
- **Untracked TODOs:** TODO comments without corresponding issues
- **Implementation gaps:** Features mentioned in issues but not implemented
- **Orphaned issues:** Closed issues with remaining TODO comments

### Functionality Discovery
- **Missing features:** User-facing functionality mentioned but not implemented
- **Error patterns:** Common error messages that suggest missing handling
- **Architecture gaps:** Domain/application layer incomplete implementations
- **Integration points:** Missing connections between modules

### Code Area Analysis
- **Related files:** Files in same module or with similar functionality
- **Test coverage:** Areas with missing or outdated tests
- **Documentation gaps:** Missing JSDoc or implementation notes
- **Migration needs:** Legacy code requiring updates

## Search Strategies

### Keyword-Based Discovery
```bash
# Example searches performed:
rg "TODO.*[Ii]ssue|TODO.*#\d+" --type ts
rg "funcionalidade.*desenvolvimento|não.*possível" --type ts  
rg "Error.*message|throw.*Error" --type ts
```

### Pattern Recognition
- **Error messages:** Portuguese UI messages suggesting limitations
- **Conditional blocks:** Code blocks with "not implemented" patterns
- **Feature flags:** Disabled functionality awaiting implementation
- **Migration comments:** Legacy code requiring updates

### Issue Correlation
```bash
# GitHub issue searches:
gh issue list --search "recipe edit" --state all
gh issue list --label feature --state open
gh issue list --milestone "v0.14.0" --state open
```

## Output Format

### Discovery Summary
```markdown
## Issue Discovery Results

### Found TODOs with Issue References
- [ ] #695: Allow user to edit recipes inside recipes
  - Location: src/sections/recipe/components/RecipeEditModal.tsx:112
  - Status: Open, assigned to marcuscastelo
  - Implementation: Error message shown to users

### Untracked TODOs
- [ ] Recipe validation improvements needed
  - Location: src/modules/recipe/domain/recipe.ts:45
  - Suggestion: Create improvement issue for validation logic

### Related Issues
- #123: Recipe editing improvements (Closed)
- #456: UI error message improvements (Open)
- #789: Domain validation refactoring (Open)

### Recommended Actions
1. ✅ Issue #695 already tracks recipe editing - no new issue needed
2. 🆕 Create improvement issue for recipe validation
3. 🔗 Link recipe validation work to existing issues #456, #789
```

### Error Pattern Analysis
```markdown
### Error Patterns Found
- "Ainda não é possível..." (pt-BR limitation messages)
  - Locations: 3 files, 5 occurrences
  - Patterns: User-facing feature limitations
  - Suggestion: Audit all limitation messages for issue tracking

- "throw new Error" without handleApiError
  - Locations: domain layer violations
  - Suggestion: Architecture review for error handling
```

## Integration Features

### Memory Loading
- Loads `workflow-optimization-patterns` memory for context
- Uses `todo-issue-relationship-pattern` for correlation strategies
- References `issue-creation-workflow-optimization` for next steps

### Command Chaining
- Integrates with `/create-issue` for seamless issue creation
- Provides context for `/implement` command execution
- Prepares data for `/prioritize-milestone` decisions

### Quality Integration
- Validates search results against project standards
- Ensures English-only code comments and identifiers
- Checks for absolute import usage in found files

## Solo Project Adaptations

- **Focus:** Technical discovery over stakeholder coordination
- **Efficiency:** Automated correlation instead of manual tracking
- **Context:** Preserves developer context between sessions
- **Quality:** Integrates with existing quality validation tools

## Advanced Features

### Pattern Learning
- Learns from user's issue creation patterns
- Adapts search strategies based on project evolution
- Improves correlation accuracy over time

### Smart Suggestions
- Suggests issue types based on TODO context
- Recommends labels and milestones based on code area
- Identifies refactoring opportunities during discovery

### Context Preservation
- Saves discovery results for session continuity
- Builds knowledge base of issue patterns
- Facilitates faster future discovery operations

## Requirements

- **GitHub CLI (`gh`)** - Authenticated and functional
- **ripgrep (`rg`)** - Fast text search capabilities
- **Project structure** - Standard module organization
- **Git repository** - Proper remote configuration

## Error Handling

- **Missing tools:** Provides fallback strategies using standard grep
- **API limits:** Handles GitHub API rate limiting gracefully
- **Large codebases:** Optimizes search scope and performance
- **Network issues:** Caches results for offline operation

## Best Practices

1. **Start broad:** Use general search terms first
2. **Refine scope:** Use feature-area parameter for targeted discovery
3. **Validate findings:** Review suggestions before acting
4. **Update workflow:** Use discoveries to improve future searches
5. **Maintain context:** Save important findings for session continuity

## Output

Creates structured discovery report and suggests next actions:

```bash
# Example workflow continuation:
/discover-issues recipe
# → Shows recipe editing is tracked in #695
# → Suggests validation improvements needed
# → Recommends: /create-issue improvement "Recipe validation enhancements"
```

## Integration with Project Standards

- **Clean Architecture:** Identifies layer violations during discovery
- **Error Handling:** Finds missing `handleApiError` usage patterns  
- **Import Standards:** Validates absolute import usage in discovered files
- **Quality Gates:** Ensures discoveries align with `pnpm check` standards
- **Solo Workflow:** Optimized for single developer context and decisions