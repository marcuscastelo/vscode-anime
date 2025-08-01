# Workflow Context Management

Manage shared context between commands and agent interactions to improve workflow continuity and reduce redundant operations.

## Usage

```
/workflow-context [action] [context-type]
```

**Parameters:**
- `action` (optional): save, load, clear, status
- `context-type` (optional): discovery, implementation, quality, session

## Description

This command provides context preservation and sharing capabilities across different workflow phases and agent interactions. It prevents information loss during command handoffs and optimizes workflow efficiency.

## What it does

### Context Saving
1. **Discovery Context:**
   - Saves TODO patterns and locations found
   - Preserves GitHub issue correlation results
   - Stores code area analysis findings
   - Maintains search strategies that worked

2. **Implementation Context:**
   - Preserves issue analysis and planning decisions
   - Stores code areas being modified
   - Maintains architectural decisions made
   - Saves test update patterns

3. **Quality Context:**
   - Stores common error patterns and solutions
   - Preserves validation results and fixes applied
   - Maintains coding standard decisions
   - Saves performance optimization patterns

4. **Session Context:**
   - Preserves overall workflow progress
   - Stores decisions made and rationale
   - Maintains learning points for future sessions
   - Saves effective command sequences

### Context Loading
1. **Smart Context Retrieval:**
   - Loads relevant context based on current command
   - Provides historical patterns for similar operations
   - Suggests next steps based on previous workflows
   - Applies learned optimizations automatically

2. **Cross-Command Integration:**
   - Shares discovery results with create-issue command
   - Provides implementation context to quality checks
   - Maintains workflow state across agent handoffs
   - Preserves session learning for future use

## Context Structure

### WorkflowContext Interface
```typescript
interface WorkflowContext {
  // Workflow identification
  sessionId: string
  timestamp: string
  phase: 'discovery' | 'analysis' | 'implementation' | 'optimization'
  
  // Code areas and files
  codeAreas: string[]
  modifiedFiles: string[]
  relatedModules: string[]
  
  // Issue tracking
  relatedIssues: number[]
  todoPatterns: string[]
  issueCorrelations: Record<string, any>
  
  // Implementation details
  architecturalDecisions: string[]
  testPatterns: string[]
  errorHandlingApproaches: string[]
  
  // Quality and validation
  validationResults: Record<string, any>
  commonErrors: string[]
  fixPatterns: string[]
  
  // Learning and optimization
  effectiveCommands: string[]
  workflowOptimizations: string[]
  previousFindings: Record<string, any>
  
  // Next steps and recommendations
  suggestedActions: string[]
  workflowContinuation: string[]
}
```

### Context Storage Patterns

#### Discovery Phase Context
```typescript
// Saved during /discover-issues or issue analysis
{
  phase: 'discovery',
  codeAreas: ['recipe/components', 'recipe/domain'],
  relatedIssues: [695, 123, 456],
  todoPatterns: ['recipe editing limitations', 'validation improvements'],
  suggestedActions: ['create validation issue', 'link to #456']
}
```

#### Implementation Phase Context
```typescript
// Saved during /implement or code development
{
  phase: 'implementation',
  modifiedFiles: ['RecipeEditModal.tsx', 'recipe.ts'],
  architecturalDecisions: ['use domain validation', 'add handleApiError'],
  testPatterns: ['mock validation', 'test error scenarios'],
  suggestedActions: ['run quality checks', 'update related tests']
}
```

## Integration Features

### Memory Integration
- **Loads relevant memories** based on context type and phase
- **Updates memory patterns** with new workflow learnings
- **Consolidates context** with existing memory knowledge
- **Prevents memory fragmentation** through smart consolidation

### Command Integration
- **Automatic context saving** at key workflow transitions
- **Smart context loading** when commands start
- **Context-aware suggestions** for next steps
- **Workflow continuity** across agent handoffs

### Quality Integration
- **Context validation** against project standards
- **Consistency checking** across workflow phases
- **Pattern verification** with established conventions
- **Quality gate integration** with context awareness

## Command Actions

### Save Context
```bash
/workflow-context save discovery
# Saves current discovery findings to context
# Includes TODO patterns, issues found, code areas analyzed
```

### Load Context
```bash
/workflow-context load implementation
# Loads implementation context for current workflow
# Provides architectural decisions, patterns, next steps
```

### Status Check
```bash
/workflow-context status
# Shows current context state and available contexts
# Provides workflow phase identification and next steps
```

### Clear Context
```bash
/workflow-context clear session
# Clears session context while preserving learnings
# Optionally consolidates learnings into memory
```

## Workflow Automation

### Phase Transitions
```typescript
// Automatic context handoffs between workflow phases
discovery → analysis: Transfer TODO patterns and issue correlations
analysis → implementation: Provide architectural decisions and scope
implementation → quality: Share modifications and test requirements
quality → optimization: Consolidate learnings and patterns
```

### Command Chaining
```typescript
// Smart context sharing between commands
/discover-issues → saves discovery context
/create-issue → loads discovery context for better issue creation  
/implement → loads analysis context for informed implementation
/fix → loads implementation context for targeted fixes
```

## Context Persistence

### Session Context
- **In-memory storage** during active workflow sessions
- **Automatic cleanup** after workflow completion
- **Learning extraction** to permanent memory
- **Session correlation** for pattern identification

### Permanent Patterns
- **Memory consolidation** of effective workflows
- **Pattern extraction** from successful contexts
- **Optimization learning** from context analysis
- **Workflow improvement** based on context data

## Solo Project Adaptations

- **No team coordination** context needed
- **Technical focus** over business stakeholder context
- **Individual workflow** optimization patterns
- **Self-review context** instead of peer review handoffs
- **Quality gate** integration for personal validation

## Advanced Features

### Intelligent Context Prediction
- **Phase detection** based on current command and context
- **Next step suggestions** based on workflow patterns
- **Risk assessment** for context transitions
- **Optimization recommendations** for workflow efficiency

### Context Analytics
- **Workflow efficiency tracking** across sessions
- **Pattern success analysis** for optimization
- **Command sequence optimization** based on context data
- **Learning curve analysis** for workflow improvement

### Error Recovery
- **Context restoration** after interrupted workflows
- **Partial context recovery** from incomplete sessions
- **Workflow restart** with preserved context
- **Error pattern learning** for future prevention

## Best Practices

1. **Save context at phase transitions** for continuity
2. **Load context before major operations** for efficiency
3. **Clear context after completion** to prevent pollution
4. **Review context patterns** periodically for optimization
5. **Consolidate learnings** into permanent memory

## Integration with Project Standards

- **Clean Architecture** context awareness for layer decisions
- **Error Handling** context for consistent patterns
- **Import Standards** context for maintaining absolute imports
- **Quality Gates** integration with context validation
- **Solo Workflow** optimization for individual developer context

## Requirements

- **Temporary storage** capability for session context
- **Memory integration** for permanent pattern storage
- **Command integration** for automatic context management
- **JSON serialization** for context data persistence

## Output

Provides structured context information and workflow guidance:

```bash
# Context status example
Current Phase: implementation
Active Context: recipe-editing-feature
Code Areas: recipe/components, recipe/domain
Related Issues: #695 (recipe editing), #456 (validation)
Next Steps: 
  1. Implement validation logic in domain layer
  2. Add error handling in application layer
  3. Update tests for new functionality
  4. Run quality checks with /fix

# Context handoff example
Discovery context loaded for issue creation:
- Found TODO at RecipeEditModal.tsx:112
- Related issue #695 already exists
- Validation improvements needed
- Suggested: Create improvement issue for validation
```

This command bridges the gap between individual commands and provides workflow intelligence that learns and optimizes over time.