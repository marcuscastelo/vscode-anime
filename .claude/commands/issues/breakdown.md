# GitHub Issue Breakdown Analyzer

Analyze a GitHub Issue to determine if it should be broken down into subissues. If so, suggest subissues using the template in `docs/ISSUE_TEMPLATE_SUBISSUE.md`.

## Usage

```
/breakdown <issue-number>
```

**Parameters:**
- `issue-number` (required): GitHub issue number to analyze

## Description

This command analyzes existing GitHub issues to determine if they are complex enough to warrant breaking down into smaller, more manageable subissues. It provides analysis and generates ready-to-execute commands for creating subissues.

## What it does

1. **Issue Fetching:**
   - Uses `gh` CLI to fetch issue details and comments
   - Retrieves full issue content including description and comments
   - Validates issue exists and is accessible

2. **Complexity Analysis:**
   - Assesses if issue is large, complex, or multi-step
   - Identifies multiple distinct components or modules
   - Evaluates if work can be parallelized or sequenced
   - Considers current complexity labels and scope

3. **Breakdown Assessment:**
   - Determines if breakdown would provide value
   - Identifies logical separation points
   - Maps work to specific modules or architectural layers
   - Considers development workflow and dependencies

4. **Subissue Suggestion:**
   - Creates logical subissues with clear scope
   - Maps each subissue to specific modules or steps
   - Ensures subissues are independently workable
   - Maintains traceability to parent issue

5. **Command Generation:**
   - Generates `gh issue create` commands for each subissue
   - Uses `printf` with heredoc for proper formatting
   - Applies appropriate labels based on complexity and area
   - Links subissues to parent issue

## Analysis Criteria

### Issues Suitable for Breakdown

**Complex Features:**
- Multi-module implementation
- Multiple UI components + backend changes
- Sequential implementation phases
- Different skill sets or focus areas

**Large Refactors:**
- Multiple files or modules affected
- Different architectural layers involved
- Can be done incrementally
- Risk mitigation through smaller changes

**Epic-level Tasks:**
- Multiple related but independent features
- Long-term implementation timeline
- Different priority levels for components
- Team coordination benefits

### Issues NOT Suitable for Breakdown

**Simple Tasks:**
- Single file or component changes
- Straightforward bug fixes
- Small improvements or tweaks
- Clear single-step implementation

**Tightly Coupled Work:**
- Changes that must be atomic
- Cannot be tested independently
- Shared critical dependencies
- Risk of integration issues

## Subissue Generation

### Template Compliance
- Uses `docs/ISSUE_TEMPLATE_SUBISSUE.md` format
- Includes parent issue reference
- Clear title and description
- Specific acceptance criteria
- Relevant context and links

### Label Strategy
- **Inherits parent labels:** complexity, area, type
- **Adds subissue label:** `subissue` for identification
- **Maintains consistency:** Same milestone if applicable
- **Complexity adjustment:** May reduce complexity for smaller scope

### Content Structure
```markdown
**Parent Issue:** #<parent-number>
**Title:** <specific-component-title>
**Description:** <focused-scope-description>
**Acceptance Criteria:**
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Integration with parent scope
**Additional Context:** <links-references-notes>
```

## Shell Command Generation

### Command Format
```bash
printf 'Content goes here' > /tmp/subissue-<number>.md
gh issue create --title "Title" --body-file /tmp/subissue-<number>.md --label "labels"
```

### Shell Compatibility
- Uses `printf` with proper escaping
- Handles special characters and newlines
- Creates temporary files for complex content
- Validates content before issue creation

### Error Handling
- Checks `gh` CLI availability
- Validates authentication and permissions
- Handles network errors gracefully
- Provides clear error messages

## Breakdown Strategies

### Architecture-Based Breakdown
- **Domain Layer:** Pure business logic changes
- **Application Layer:** SolidJS orchestration and state
- **Infrastructure Layer:** Supabase integration and data
- **UI Layer:** Components and user interface

### Feature-Based Breakdown
- **Core Functionality:** Essential business logic
- **User Interface:** Forms, displays, interactions
- **Data Layer:** Database changes and migrations
- **Integration:** API connections and external services

### Phase-Based Breakdown
- **Phase 1:** Foundation and core requirements
- **Phase 2:** Additional features and enhancements
- **Phase 3:** Polish, optimization, and edge cases
- **Phase 4:** Documentation and testing

## Analysis Output

### Assessment Summary
- **Complexity Evaluation:** Why breakdown is/isn't recommended
- **Module Analysis:** Which parts of codebase are affected
- **Risk Assessment:** Integration complexity and dependencies
- **Work Estimation:** Relative effort for each component

### Subissue Recommendations
- **Logical Groupings:** How work should be divided
- **Dependencies:** Order of implementation if sequential
- **Scope Definition:** Clear boundaries for each subissue
- **Integration Points:** How subissues connect to parent

### Generated Commands
- **Ready-to-execute:** `gh issue create` commands
- **Proper formatting:** Uses temp files for complex content
- **Label application:** Appropriate labels for each subissue
- **Parent linking:** Clear traceability relationships

## Integration with Existing Workflow

### Command Chaining
```bash
/breakdown 123          # Analyze issue #123
# Review suggestions
# Execute generated commands
/implement 124          # Implement first subissue
/implement 125          # Implement second subissue
```

### Quality Assurance
- **Template compliance:** Uses existing subissue template
- **Label consistency:** Follows `docs/labels-usage.md`
- **English language:** All content in English
- **Markdown formatting:** Proper structure and syntax

## Best Practices

### When to Use Breakdown
- **Issue complexity exceeds single session work**
- **Multiple developers could work in parallel**
- **Risk mitigation through incremental delivery**
- **Clear separation of concerns possible**

### When NOT to Use Breakdown
- **Simple, focused changes**
- **Tightly coupled atomic operations**
- **Already appropriately scoped**
- **Integration complexity outweighs benefits**

### Effective Subissue Creation
- **Clear scope boundaries:** No overlap between subissues
- **Independent testability:** Each can be verified separately
- **Logical sequence:** Dependencies are clear and minimal
- **Appropriate size:** 1-3 day effort per subissue typically

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- Access to repository and issue creation permissions
- `docs/ISSUE_TEMPLATE_SUBISSUE.md` template file
- Shell environment with `printf` and temp file support

## Solo Project Adaptations

- **Focus on technical decomposition** rather than team coordination
- **Emphasizes risk reduction** through incremental implementation
- **Prioritizes clear testing boundaries** for self-validation
- **Maintains architectural consistency** across breakdown
- **Enables focused work sessions** on specific components

## Example Output

```
Analysis for Issue #123:

BREAKDOWN RECOMMENDED:
This feature involves multiple architectural layers and could benefit from incremental implementation.

Suggested Subissues:
1. Domain layer implementation (nutrition calculation logic)
2. Database schema and Supabase functions  
3. SolidJS components and state management
4. UI integration and styling

Generated Commands:
printf 'Parent Issue: #123...' > /tmp/subissue-1.md
gh issue create --title "Domain layer: nutrition calculation logic" --body-file /tmp/subissue-1.md --label "subissue,feature,backend,complexity-medium"

[Additional commands for remaining subissues...]
```

This command enables systematic breakdown of complex issues while maintaining the quality and consistency standards of the existing issue management workflow.