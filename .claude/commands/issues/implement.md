# Issue Implementation

Fully implement GitHub issues with autonomous execution after plan approval.

## Usage

```
/implement <issue-number>
```

**Parameters:**
- `issue-number`: GitHub issue number to implement

## Description

This command provides complete autonomous implementation of GitHub issues. After plan approval, it executes all implementation steps without user interaction until completion or hard blockers.

## Memory Integration

**Context Loading:**
- Loads `workflow-optimization-patterns` for implementation best practices
- References `architecture_and_structure` for module organization
- Uses `development_workflow` for quality gate integration
- Applies `code_style_and_conventions` for consistent implementation

**Implementation Intelligence:**
- Recognizes implementation patterns from previous issues
- Applies architectural guidelines automatically
- Uses established error handling and validation patterns
- Maintains consistency with project conventions

**Quality Assurance:**
- Integrates memory of common implementation pitfalls
- Applies learned testing patterns for similar issues
- Uses established commit message patterns
- Leverages quality validation memories for faster fixes

## What it does

1. **Preparation Phase:**
   - Checks current branch name and compares with target: `marcuscastelo/issue<ISSUE_NUMBER>`
   - If already on correct branch, skips branch creation/checkout
   - If not on correct branch:
     - Fetches and checks out latest `rc/` branch or default base
     - Creates feature branch: `marcuscastelo/issue<ISSUE_NUMBER>`
   - Retrieves issue data using `gh` CLI (title, body, labels, comments)
   - Validates issue exists and is implementable

2. **Planning Phase:**
   - Analyzes issue requirements and acceptance criteria
   - Checks referenced commits or working versions
   - Drafts comprehensive implementation plan in Markdown
   - Reviews plan with user and iterates until approved
   - **Planning stops here - waits for explicit approval**

3. **Implementation Phase (Post-Approval):**
   - **Autonomous execution begins immediately**
   - Makes all required code changes
   - Fixes code style, type, and test issues as they arise
   - Updates or rewrites tests to match changes
   - Runs validation scripts until all pass
   - Applies consistent patterns across codebase
   - **No status updates or confirmations during execution**
   - **Only stops for hard blockers or ambiguity**

4. **Completion Validation:**
   - Verifies all tests pass
   - Confirms code quality checks pass (ESLint, Prettier, TypeScript)
   - Ensures build succeeds
   - Validates clean architecture preservation
   - Commits all changes with proper conventional messages
   - Confirms no uncommitted changes remain

## Implementation Categories

### Feature Implementation
- **New functionality:** Complete feature development
- **UI components:** SolidJS component creation with proper patterns
- **Domain logic:** Clean architecture compliance
- **Integration:** Database and API integration
- **Testing:** Comprehensive test coverage

### Bug Fixes
- **Root cause analysis:** Investigate using error messages and stack traces
- **Targeted fixes:** Minimal changes to resolve issue
- **Regression testing:** Ensure fix doesn't break existing functionality
- **Error handling:** Improve error handling where applicable

### Refactoring
- **Code restructuring:** Improve code organization and quality
- **Architecture alignment:** Ensure clean architecture compliance
- **Performance optimization:** Improve efficiency where needed
- **Legacy migration:** Update deprecated patterns

### Improvements
- **Technical debt:** Address code quality issues
- **Performance enhancements:** Optimize slow operations
- **Developer experience:** Improve tooling and workflows
- **Documentation:** Update docs to match changes

## Blocker Handling

### Hard Blockers (Stop and Ask User)
- **Ambiguous requirements:** Unclear acceptance criteria or specifications
- **Missing dependencies:** Required packages or services unavailable
- **Breaking changes:** Changes that would break existing functionality
- **Infrastructure issues:** Database, deployment, or external service problems
- **Conflicting requirements:** Contradictory specifications in issue

### Soft Blockers (Retry up to 3x)
- **Test failures:** Failing unit, integration, or e2e tests
- **Lint/type errors:** ESLint, Prettier, or TypeScript issues
- **Build failures:** Compilation or bundling errors
- **Validation failures:** Quality check script failures
- **Missing files:** Temporarily missing or locked files

## Implementation Rules

### Autonomous Execution
- **No pausing:** Never wait or ask for confirmation after plan approval
- **Silent operation:** No status updates during implementation
- **Complete execution:** Continue until fully done or hard blocked
- **Error recovery:** Automatically retry soft failures

### Code Quality Standards
- **Clean architecture:** Maintain layer separation and dependencies
- **Type safety:** Ensure TypeScript strict mode compliance
- **Error handling:** Proper `handleApiError` usage in application layer
- **Testing:** Update tests for all changes
- **Formatting:** Apply ESLint and Prettier consistently

### Commit Standards
- **Conventional commits:** Use proper type(scope): description format
- **Atomic changes:** One logical change per commit
- **English messages:** All commit messages in English
- **Descriptive:** Clear explanation of what and why

## Branch and Git Workflow

### Branch Management
- **Feature branches:** `marcuscastelo/issue<NUMBER>` format
- **Branch optimization:** Skip branch creation if already on correct branch
- **Base branch:** Latest `rc/` branch or project default (when creating new branch)
- **Clean state:** Ensure working directory is clean before starting
- **Upstream tracking:** Set up proper remote tracking

### Commit Strategy
- **Progressive commits:** Commit logical chunks of work
- **Descriptive messages:** Clear commit messages explaining changes
- **Test commits:** Separate commits for test updates
- **Fix commits:** Separate commits for quality fixes

## Integration with Project Standards

### Architecture Compliance
- **Domain layer:** Pure business logic, no side effects
- **Application layer:** Orchestration and error handling
- **Infrastructure layer:** External integrations and data access
- **UI layer:** Pure presentational components

### Import and Module Standards
- **Absolute imports:** Use `~/` prefix for all internal imports
- **No barrel files:** Direct imports from specific files
- **Static imports:** No dynamic imports allowed
- **Module boundaries:** Respect clean architecture layers

### Language and Style
- **English code:** All code, comments, and commit messages in English
- **Portuguese UI:** UI text may be in Portuguese when required
- **Consistent naming:** Descriptive, action-based names
- **Type safety:** Prefer type aliases over interfaces

## Success Criteria

### Technical Validation
- ✅ All tests pass (`pnpm test`)
- ✅ Type checking passes (`pnpm type-check`)
- ✅ Linting passes (`pnpm lint`)
- ✅ Build succeeds (`pnpm build`)
- ✅ Quality checks pass (`pnpm check`)

### Code Quality
- ✅ Clean architecture maintained
- ✅ Proper error handling implemented
- ✅ Tests updated for all changes
- ✅ No TypeScript `any` types (except infrastructure)
- ✅ Consistent code style applied

### Git State
- ✅ All changes committed
- ✅ Conventional commit messages
- ✅ No uncommitted changes
- ✅ Feature branch ready for PR

## Output and Completion

### Final Report
- **Success confirmation:** All criteria met
- **Changes summary:** High-level overview of modifications
- **Next steps:** PR creation or additional work needed
- **Blocker report:** Any issues encountered and resolved

### Error Reporting
- **Hard blockers:** Clear description of blocking issues
- **Resolution suggestions:** Recommended next steps
- **Partial completion:** What was accomplished before blocking
- **State preservation:** Current branch and commit state

## Requirements

- GitHub CLI (`gh`) authenticated and functional
- Git repository with proper remote configuration
- Node.js and pnpm for package management
- All project scripts available (`.scripts/` directory)
- Write access to repository and branch creation permissions

## Best Practices

- **Plan thoroughly:** Comprehensive planning before approval
- **Execute completely:** Full autonomous implementation
- **Maintain quality:** Never compromise on code standards
- **Handle errors gracefully:** Proper error recovery and reporting
- **Document changes:** Clear commit messages and code comments
- **Test thoroughly:** Comprehensive test coverage for changes