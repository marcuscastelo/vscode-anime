# Claude Commands for Macroflows

This directory contains Claude Code commands adapted from GitHub Copilot prompts for optimal development workflow.

## Command Categories

### Workflow Commands (`workflow/`)
- **`/orchestrate`** - Intelligent multi-step workflow automation
- **`/workflow-context`** - Manage shared context between commands and agents
- **`/commit`** - Generate conventional commit messages and execute commits
- **`/pull-request`** (`/pr`) - Create pull requests with proper formatting and metadata

### Quality Assurance (`quality/`)
- **`/fix`** - Automated codebase checks and error correction
- **`/review`** - Comprehensive code review for PR changes

### Issue Management (`issues/`)
- **`/discover-issues`** - Automated discovery of existing issues and TODO patterns
- **`/create-issue`** - Create GitHub issues using proper templates
- **`/implement`** - Autonomous issue implementation after plan approval
- **`/breakdown`** - Analyze issues to determine if they should be split into subissues
- **`/prioritize-milestone`** - Analyze and prioritize milestone issues for optimal capacity

### Refactoring (`refactor/`)
- **`/refactor`** - Clean architecture refactoring and modularization

### Session Management (`session/`)
- **`/end-session`** (`/end`) - Session summary and knowledge export

## Quick Reference

### Daily Workflow

#### Orchestrated Workflow (Recommended)
```bash
# Automated end-to-end workflows
/orchestrate feature-development "dark mode toggle"  # Complete feature cycle
/orchestrate issue-resolution 123                    # End-to-end issue implementation
/orchestrate bug-investigation "login error"         # Bug discovery and resolution
```

#### Manual Step-by-Step Workflow
```bash
# Traditional manual approach
/fix                    # Ensure clean codebase
/discover-issues        # Check existing issues and TODOs
/create-issue feature   # Create feature request (if needed)
/implement 123          # Implement issue #123
/commit                 # Generate and execute commit
/pull-request          # Create PR for review
```

### Quality Assurance
```bash
/fix                   # Run comprehensive checks and fixes
/review               # Generate code review for PR
```

### Project Management
```bash
/discover-issues       # Automated discovery of existing issues and TODOs
/create-issue bug      # Report and create bug issue
/create-issue refactor # Create refactoring task
/breakdown 123         # Analyze issue #123 for potential breakdown
/prioritize-milestone  # Analyze and prioritize milestone issues
/end-session          # Summarize learnings and export knowledge
```

## Command Features

### Architecture Integration
- **Clean Architecture Compliance:** All commands respect domain/application/infrastructure layer separation
- **Error Handling Standards:** Enforces proper `handleApiError` usage patterns
- **Import Standards:** Maintains absolute imports with `~/` prefix
- **Type Safety:** Ensures TypeScript strict mode compliance

### Project-Specific Adaptations
- **Solo Project Focus:** Commands adapted for single developer workflow
- **SolidJS Patterns:** Optimized for reactive programming patterns
- **Supabase Integration:** Handles database and real-time patterns
- **Portuguese UI Support:** Maintains pt-BR UI text while enforcing English code

### Quality Integration
- **Automated Validation:** Commands integrate with `npm run copilot:check`
- **Test Updates:** Automatically updates tests for code changes
- **Lint Compliance:** Ensures ESLint and Prettier standards
- **Performance Focus:** Prioritizes O(n) algorithms and efficient patterns

## Migration from GitHub Prompts

### Mapping
```
.github/prompts/commit.prompt.md           → .claude/commands/workflow/commit.md
.github/prompts/fix.prompt.md              → .claude/commands/quality/fix.md
.github/prompts/code-review.prompt.md      → .claude/commands/quality/review.md
.github/prompts/github-issue-unified.md    → .claude/commands/issues/create.md
.github/prompts/issue-implementation.md    → .claude/commands/issues/implement.md
.github/prompts/milestone-prioritization.prompt.md → .claude/commands/prioritize-milestone.md
.github/prompts/refactor.prompt.md         → .claude/commands/refactor/clean-architecture.md
.github/prompts/pull-request.prompt.md     → .claude/commands/workflow/pull-request.md
.github/prompts/end-session.prompt.md      → .claude/commands/session/end.md
```

### Improvements
- **Command Structure:** Organized into logical categories
- **Usage Documentation:** Clear usage patterns and examples
- **Integration Points:** Better integration with Claude Code's capabilities
- **Error Handling:** Improved error recovery and reporting
- **Solo Project Focus:** Removed team coordination overhead

## Technical Requirements

### Environment Setup
```bash
export GIT_PAGER=cat  # Required for git/gh commands
```

### Dependencies
- **GitHub CLI (`gh`)** - Authenticated and functional
- **Node.js & pnpm** - Package management and script execution
- **Git repository** - Proper remote configuration
- **Project scripts** - `.scripts/` directory with validation tools

### File System
- **Temp directory access** - Commands use `/tmp/` for intermediate files
- **Write permissions** - Repository write access for commits and PRs
- **Script execution** - Permission to execute project validation scripts

## Integration with CLAUDE.md

These commands are designed to work seamlessly with the patterns and standards documented in `CLAUDE.md`. They enforce:

- Clean architecture layer separation
- Absolute import requirements
- Error handling standards
- Commit message conventions
- Quality validation procedures
- Solo project adaptations

## Usage Guidelines

### Command Execution
- Commands are designed for autonomous execution
- Quality validation is integrated into all commands
- Error recovery is built into command logic
- User confirmation is requested for destructive operations

### Workflow Integration
- Commands chain together for complete development workflows
- State preservation between commands
- Quality gates prevent progression with errors
- Continuous validation throughout process

### Customization
- Commands adapt to project-specific patterns
- User preferences are learned and applied
- Context is preserved across sessions
- Patterns are documented and reused

## Best Practices

1. **Start with `/fix`** - Ensure clean codebase before development
2. **Use proper issue types** - Choose correct template for `/create-issue`
3. **Plan before implementing** - Review implementation plan in `/implement`
4. **Validate continuously** - Let commands handle quality validation
5. **End sessions properly** - Use `/end-session` for knowledge preservation

## Troubleshooting

### Common Issues
- **Permission errors:** Ensure proper git and GitHub authentication
- **Script failures:** Verify `.scripts/` directory and permissions
- **Validation failures:** Run `/fix` to resolve quality issues
- **Network issues:** Check GitHub CLI authentication and connectivity

### Recovery Procedures
- **Failed commits:** Commands will retry with proper shell escaping
- **PR creation errors:** Automatic retry with corrected parameters
- **Validation loops:** Commands will iterate until all checks pass
- **Missing dependencies:** Commands provide fallback strategies

For detailed usage instructions, see individual command documentation files.