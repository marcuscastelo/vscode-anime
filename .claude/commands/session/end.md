# Session End and Knowledge Export

Summarize session learnings and export knowledge for future continuity.

## Usage

```
/end-session
/end
```

## Description

This command concludes the current session by summarizing learnings, documenting blockers, and exporting session knowledge for future Claude instances to ensure continuity.

## What it does

1. **Session Summary:**
   - Reviews all tasks completed during session
   - Documents new learnings and insights
   - Identifies process improvements
   - Notes any unresolved issues

2. **Knowledge Export:**
   - Extracts patterns and conventions discovered
   - Documents user preferences and workflow adjustments
   - Records technical decisions and rationales
   - Saves context for future sessions

3. **Blocker Documentation:**
   - Identifies encountered obstacles
   - Documents resolution strategies
   - Notes system-specific requirements
   - Records error patterns and fixes

4. **Continuity Preparation:**
   - Creates actionable notes for next session
   - Documents current project state
   - Records important context and decisions
   - Suggests next steps and priorities

## Session Analysis Categories

### Technical Learnings
- **Architecture Insights:** Clean architecture application patterns
- **Code Patterns:** Discovered best practices and anti-patterns
- **Performance Optimizations:** Algorithmic improvements and efficiency gains
- **Error Handling:** Effective error management strategies
- **Testing Approaches:** Successful testing patterns and strategies

### Workflow Improvements
- **Process Refinements:** Improved development workflows
- **Tool Usage:** Effective CLI and tooling patterns
- **Quality Assurance:** Better validation and checking procedures
- **Automation:** Successful automation opportunities
- **Documentation:** Effective documentation strategies

### User Preferences
- **Communication Style:** Preferred interaction patterns
- **Technical Approach:** Favored implementation strategies
- **Quality Standards:** Specific quality requirements
- **Workflow Preferences:** Preferred development processes
- **Tool Choices:** Favored tools and technologies

### Project Context
- **Domain Knowledge:** Business logic understanding
- **Technical Constraints:** System limitations and requirements
- **Integration Patterns:** Successful integration approaches
- **Performance Requirements:** Identified performance needs
- **User Experience Goals:** UX and usability insights

## Learning Documentation Template

### Session Checklist
- [ ] **New user preferences or workflow adjustments**
  - Communication style preferences
  - Technical approach preferences
  - Quality standard expectations

- [ ] **Coding conventions or process clarifications**
  - Naming convention refinements
  - Architecture pattern applications
  - Code organization improvements

- [ ] **Issues encountered (e.g., missing commands, lint errors, blockers)**
  - Technical obstacles and solutions
  - Tool configuration issues
  - Environment setup challenges

- [ ] **Information/context to provide at next session start**
  - Project state and current priorities
  - Important decisions and rationales
  - Ongoing work and next steps

- [ ] **Prompt metadata or workflow issues to flag**
  - Command effectiveness
  - Process improvement opportunities
  - Documentation gaps

- [ ] **Shell/OS-specific requirements**
  - zsh-specific considerations
  - Linux environment specifics
  - Tool version requirements

### Frustration Indicators
- **User feedback patterns:** All-caps, strong language, repeated issues
- **Process bottlenecks:** Frequent workflow interruptions
- **Tool limitations:** Ineffective or missing capabilities
- **Documentation gaps:** Missing or unclear guidance
- **Quality issues:** Recurring validation failures

## Knowledge Categories for Export

### Architecture Patterns
```typescript
// Document discovered patterns
export interface SessionLearning {
  pattern: string
  context: string
  effectiveness: 'high' | 'medium' | 'low'
  applicability: string[]
  examples: CodeExample[]
}
```

### Performance Insights
- **Algorithmic improvements:** O(n²) → O(n) optimizations
- **Memory efficiency:** Reduced allocations and garbage collection
- **Rendering optimizations:** SolidJS reactive pattern improvements
- **Data access patterns:** Efficient database and API usage

### Error Handling Strategies
- **Domain layer purity:** Maintaining clean error throwing
- **Application layer coordination:** Effective `handleApiError` usage
- **User feedback patterns:** Toast and notification strategies
- **Recovery mechanisms:** Graceful error recovery approaches

## Export Formats

### Markdown Documentation
```markdown
# Session Learning Summary - [Date]

## Key Accomplishments
- [List of completed tasks]
- [Significant implementations]
- [Problems solved]

## Technical Insights
- [Architecture discoveries]
- [Performance improvements]
- [Code quality enhancements]

## Process Improvements
- [Workflow optimizations]
- [Tool usage improvements]
- [Quality assurance enhancements]

## Next Session Priorities
- [Immediate next steps]
- [Ongoing work continuation]
- [New feature development]
```

### Structured Knowledge
```json
{
  "sessionId": "uuid",
  "date": "2025-06-29",
  "duration": "2 hours",
  "accomplishments": [...],
  "learnings": [...],
  "blockers": [...],
  "nextSteps": [...],
  "context": {
    "projectState": "...",
    "currentBranch": "...",
    "activeFeatures": [...]
  }
}
```

## Integration with Project

### CLAUDE.md Updates
- Documents new command patterns
- Records effective workflows
- Updates best practices
- Refines architectural guidance

### Process Documentation
- Updates development workflows
- Improves quality procedures
- Enhances troubleshooting guides
- Refines automation scripts

### Tool Configuration
- ESLint rule refinements
- TypeScript configuration improvements
- Build process optimizations
- Development environment enhancements

## Continuity Features

### Context Preservation
- **Project state:** Current branch, features, priorities
- **Technical decisions:** Architecture choices and rationales
- **User preferences:** Communication and workflow preferences
- **Quality standards:** Specific requirements and expectations

### Knowledge Transfer
- **Pattern library:** Reusable code and architecture patterns
- **Problem solutions:** Documented solutions for common issues
- **Workflow templates:** Proven development workflows
- **Quality checklists:** Effective validation procedures

### Future Session Preparation
- **Immediate priorities:** Next tasks and objectives
- **Context briefing:** Current project state and decisions
- **Tool readiness:** Required tools and configurations
- **Process guidance:** Effective workflows and approaches

## Output Format

### Session Summary
```markdown
# Session Summary - [Date]

## Accomplishments
- ✅ Implemented day diet copy functionality
- ✅ Refactored weight evolution component for O(n) performance
- ✅ Fixed TypeScript strict mode violations
- ✅ Updated test suite for new features

## Key Learnings
- **Performance:** Sliding window algorithm for period grouping
- **Architecture:** Clean separation of domain and application concerns
- **Testing:** Effective mock patterns for Supabase integration
- **Error Handling:** Consistent `handleApiError` usage patterns

## Process Improvements
- **Quality Validation:** Streamlined npm run copilot:check workflow
- **Git Workflow:** Improved branch naming and commit conventions
- **Documentation:** Enhanced CLAUDE.md with command references

## Blockers Resolved
- **TypeScript Errors:** Explicit null checks for strict mode
- **Test Failures:** Updated mocks for new repository interfaces
- **Linting Issues:** Absolute import conversions completed

## Next Session Context
- **Current Branch:** marcuscastelo/issue456 (ready for PR)
- **Next Priority:** Dark mode implementation (issue #789)
- **Technical Debt:** Unified item hierarchy optimization needed
- **Quality Status:** All checks passing, ready for deployment
```

### Actionable Next Steps
```markdown
## Immediate Next Session Tasks
1. Create PR for completed day diet copy feature
2. Begin dark mode implementation planning
3. Address unified item hierarchy performance
4. Update documentation for new patterns

## Context for Next Claude Instance
- Project uses clean architecture with strict layer separation
- Performance optimization is high priority (prefer O(n) algorithms)
- User prefers atomic commits with conventional commit messages
- Quality gates must pass before any PR creation
```

## Requirements

- Access to session history and completed tasks
- Understanding of project context and priorities
- Knowledge of effective patterns and workflows
- Ability to identify learning opportunities
- Documentation and export capabilities

## Best Practices

- **Comprehensive review:** Analyze all session activities
- **Pattern recognition:** Identify reusable insights
- **Clear documentation:** Write actionable summaries
- **Context preservation:** Maintain continuity information
- **Process improvement:** Suggest workflow enhancements
- **User focus:** Align with user preferences and goals