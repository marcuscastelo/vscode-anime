# Code Review Generator

Perform comprehensive code review for current PR changes and save detailed feedback to docs/ directory.

## Usage

```
/review
```

## Description

This command performs a thorough, reviewer-style code review for all files in the current pull request, providing actionable feedback and concrete improvement suggestions. Reviews are saved to the docs/ directory for reference.

## What it does

1. **PR Analysis:**
   - Uses `gh` CLI to identify PR commit range
   - Determines full diff for the pull request
   - Identifies all affected files and change types

2. **File-by-File Review:**
   - Analyzes each changed file individually
   - Explains all significant changes
   - Provides prioritized, actionable feedback
   - Suggests concrete improvements with examples

3. **Documentation Generation:**
   - Saves review as `docs/review_<filename>.md`
   - Sanitizes file paths for filesystem compatibility
   - Structures review with consistent sections
   - Uses collaborative, improvement-oriented language

4. **Issue Recommendations:**
   - Identifies complex suggestions too large for immediate fixes
   - Recommends opening new issues for major improvements
   - Provides suggested issue titles and summaries

## Review Structure

Each generated review file contains:

### 1. Summary of Changes
- High-level overview of modifications
- Changed functionality and new features
- Removed or deprecated code

### 2. Actionable Feedback & Suggestions
- Prioritized improvement recommendations
- Code snippets and examples where helpful
- References to project conventions and standards

### 3. Potential Issues or Concerns
- Security considerations
- Performance implications
- Maintainability concerns
- Breaking changes

### 4. Recommendations for Improvement
- Architecture improvements
- Code quality enhancements
- Testing suggestions
- Documentation needs

### 5. Large/Complex Suggestions
- Major refactoring opportunities
- Recommended issue creation
- Future enhancement ideas

## Review Categories

### Code Quality
- **Clean Architecture:** Layer separation and dependencies
- **Type Safety:** TypeScript usage and null checks
- **Error Handling:** Proper `handleApiError` usage
- **Testing:** Test coverage and quality
- **Performance:** Efficiency and optimization opportunities

### Project Standards
- **Import Structure:** Absolute imports with `~/` prefix
- **Naming Conventions:** Descriptive, action-based names
- **Language Policy:** English code, Portuguese UI text
- **Commit Compliance:** Atomic changes and conventional messages

### Security & Best Practices
- **Secret Management:** No hardcoded secrets or keys
- **Input Validation:** Proper sanitization and validation
- **Error Exposure:** Safe error handling without data leaks
- **Dependency Security:** Safe library usage

### Architecture Compliance
- **Domain Purity:** No side effects in domain layer
- **Application Layer:** Proper orchestration and error handling
- **Infrastructure Layer:** Correct data access patterns
- **UI Layer:** Pure presentational components

## Output Files

Reviews are saved as:
```
docs/review_<sanitized-filename>.md
```

Example filenames:
- `docs/review_dayDiet.ts.md`
- `docs/review_UnifiedItemActions.tsx.md`
- `docs/review_supabaseDayRepository.ts.md`

## Requirements

- Active pull request with changes
- `gh` CLI tool available and authenticated
- Write access to `docs/` directory
- Git repository with proper remote configuration

## Fallback Strategies

- **Large diffs:** Uses local git strategies for analysis
- **Missing base:** Compares with default branch
- **Binary files:** Notes file type without text review
- **Network issues:** Uses local git diff as fallback

## Integration Features

- **Issue Creation:** Links to related GitHub issues
- **Documentation:** References existing docs and guides
- **Traceability:** Includes `reportedBy` metadata
- **Global Rules:** Follows project-wide conventions

## Best Practices

- **Collaborative tone:** Constructive, improvement-focused feedback
- **Concrete suggestions:** Specific, actionable recommendations
- **Code examples:** Working code snippets when helpful
- **Context awareness:** Considers project architecture and goals
- **Priority ordering:** Most important feedback first

## Project-Specific Focus

- SolidJS reactive patterns and signal usage
- Domain-driven design adherence
- Supabase integration patterns
- TypeScript strict mode compliance
- Clean architecture layer boundaries
- Portuguese search functionality requirements