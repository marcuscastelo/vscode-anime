# Workflow Orchestration

Automatically orchestrate multi-step development workflows with intelligent command routing, context management, and error recovery.

## Usage

```
/orchestrate <workflow-type> [parameters]
```

**Workflow Types:**
- `feature-development` - Complete feature development cycle
- `bug-investigation` - Bug discovery, analysis, and resolution
- `refactor-cycle` - Architecture improvement and validation
- `issue-resolution` - End-to-end issue implementation
- `quality-improvement` - Comprehensive quality enhancement

**Parameters:**
- Feature development: `[feature-description]`
- Bug investigation: `[error-message|issue-number]`
- Refactor cycle: `[target-area]`
- Issue resolution: `<issue-number>`
- Quality improvement: `[focus-area]`

## Description

This command provides intelligent workflow orchestration that automatically sequences commands, manages context, and handles errors across multi-step development processes. It reduces cognitive overhead and ensures consistent workflow execution.

## Orchestration Framework

### Workflow Definition Structure
```typescript
interface WorkflowDefinition {
  name: string
  description: string
  phases: WorkflowPhase[]
  contextRequirements: string[]
  qualityGates: QualityGate[]
  errorRecovery: ErrorRecoveryStrategy[]
  successCriteria: string[]
}

interface WorkflowPhase {
  name: string
  commands: CommandSequence[]
  prerequisites: string[]
  outcomes: string[]
  nextPhaseConditions: string[]
  rollbackStrategy?: string
}
```

### Supported Workflows

#### Feature Development Orchestration
```typescript
const featureDevelopmentWorkflow = {
  name: 'feature-development',
  phases: [
    {
      name: 'discovery',
      commands: [
        { command: '/discover-issues', params: ['feature-area'] },
        { command: '/workflow-context', params: ['save', 'discovery'] }
      ],
      outcomes: ['existing issues identified', 'context preserved'],
      nextPhase: 'planning'
    },
    {
      name: 'planning',
      commands: [
        { command: '/create-issue', params: ['feature', 'description'] },
        { command: '/workflow-context', params: ['save', 'planning'] }
      ],
      outcomes: ['issue created', 'scope defined'],
      nextPhase: 'implementation'
    },
    {
      name: 'implementation',
      commands: [
        { command: '/implement', params: ['issue-number'] },
        { command: '/workflow-context', params: ['save', 'implementation'] }
      ],
      outcomes: ['feature implemented', 'tests updated'],
      nextPhase: 'quality'
    },
    {
      name: 'quality',
      commands: [
        { command: '/fix', params: [] },
        { command: '/review', params: [] },
        { command: '/workflow-context', params: ['save', 'quality'] }
      ],
      outcomes: ['quality gates passed', 'review completed'],
      nextPhase: 'delivery'
    },
    {
      name: 'delivery',
      commands: [
        { command: '/commit', params: [] },
        { command: '/pull-request', params: [] },
        { command: '/workflow-context', params: ['clear', 'session'] }
      ],
      outcomes: ['changes committed', 'PR created'],
      nextPhase: 'complete'
    }
  ]
}
```

#### Bug Investigation Orchestration
```typescript
const bugInvestigationWorkflow = {
  name: 'bug-investigation',
  phases: [
    {
      name: 'discovery',
      commands: [
        { command: '/discover-issues', params: ['bug', 'error-message'] },
        { command: '/workflow-context', params: ['save', 'discovery'] }
      ],
      outcomes: ['related issues found', 'code areas identified'],
      nextPhase: 'analysis'
    },
    {
      name: 'analysis',
      commands: [
        // Intelligent codebase analysis based on discovery results
        { command: 'analyze-code-area', dynamic: true },
        { command: '/workflow-context', params: ['save', 'analysis'] }
      ],
      outcomes: ['root cause identified', 'fix strategy determined'],
      nextPhase: 'resolution'
    },
    {
      name: 'resolution',
      commands: [
        { command: '/create-issue', params: ['bug', 'findings'] },
        { command: '/implement', params: ['issue-number'] },
        { command: '/fix', params: [] }
      ],
      outcomes: ['bug fixed', 'quality validated'],
      nextPhase: 'delivery'
    }
  ]
}
```

#### Issue Resolution Orchestration
```typescript
const issueResolutionWorkflow = {
  name: 'issue-resolution',
  phases: [
    {
      name: 'preparation',
      commands: [
        { command: '/workflow-context', params: ['load', 'session'] },
        // Load issue context and related information
        { command: 'load-issue-context', params: ['issue-number'] }
      ],
      outcomes: ['context loaded', 'issue analyzed'],
      nextPhase: 'implementation'
    },
    {
      name: 'implementation',
      commands: [
        { command: '/implement', params: ['issue-number'] }
      ],
      outcomes: ['issue implemented'],
      nextPhase: 'validation'
    },
    {
      name: 'validation',
      commands: [
        { command: '/fix', params: [] },
        { command: '/review', params: [] }
      ],
      outcomes: ['quality validated'],
      nextPhase: 'delivery'
    },
    {
      name: 'delivery',
      commands: [
        { command: '/commit', params: [] },
        { command: '/pull-request', params: [] }
      ],
      outcomes: ['changes delivered'],
      nextPhase: 'complete'
    }
  ]
}
```

## Intelligent Features

### Context-Aware Command Routing
```typescript
// Dynamic command selection based on context
const intelligentRouting = {
  contextAnalysis: {
    loadWorkflowContext: 'analyze current session state',
    evaluatePhase: 'determine optimal next command',
    assessPrerequisites: 'verify command readiness'
  },
  
  commandAdaptation: {
    parameterOptimization: 'adapt parameters based on context',
    skipUnnecessary: 'bypass completed or irrelevant steps',
    dynamicSequencing: 'reorder commands based on current state'
  },
  
  errorPrevention: {
    prerequisiteCheck: 'verify command prerequisites before execution',
    contextValidation: 'ensure context compatibility',
    qualityGateEnforcement: 'prevent progression with quality issues'
  }
}
```

### Adaptive Workflow Execution
```typescript
// Real-time workflow adaptation
const adaptiveExecution = {
  phaseSkipping: {
    completedWork: 'skip phases already completed in context',
    userOverride: 'allow manual phase specification',
    intelligentDetection: 'detect when phases can be safely skipped'
  },
  
  errorRecovery: {
    automaticRetry: 'retry commands with corrected parameters',
    contextRestoration: 'restore previous stable state',
    workflowContinuation: 'resume from stable checkpoint'
  },
  
  optimizationLearning: {
    patternRecognition: 'learn effective command sequences',
    timingOptimization: 'optimize command execution timing',
    contextPrediction: 'predict likely next steps'
  }
}
```

### Quality Gate Integration
```typescript
// Automatic quality validation at key points
const qualityIntegration = {
  mandatoryGates: {
    beforeCommit: 'ensure pnpm check passes',
    beforePR: 'validate complete implementation',
    beforeDelivery: 'confirm all quality standards met'
  },
  
  contextualGates: {
    architectureCompliance: 'verify clean architecture adherence',
    errorHandling: 'confirm proper handleApiError usage',
    testCoverage: 'validate test updates for changes'
  },
  
  recoveryActions: {
    qualityFailure: 'automatically invoke /fix command',
    contextLoss: 'restore context from last stable state',
    workflowInterrupt: 'save state and provide recovery options'
  }
}
```

## Command Execution Engine

### Command Sequencing
```typescript
// Intelligent command execution with context preservation
const executionEngine = {
  commandPreparation: {
    contextLoading: 'load relevant context before command',
    parameterOptimization: 'adapt parameters based on workflow state',
    prerequisiteValidation: 'ensure command readiness'
  },
  
  executionMonitoring: {
    progressTracking: 'monitor command execution progress',
    errorDetection: 'detect and categorize execution errors',
    outputAnalysis: 'analyze command outputs for next steps'
  },
  
  contextPreservation: {
    stateCapture: 'capture state before and after each command',
    learningExtraction: 'extract patterns for workflow optimization',
    continuityMaintenance: 'preserve context across command boundaries'
  }
}
```

### Error Recovery Strategies
```typescript
// Robust error handling for workflow continuity
const errorRecovery = {
  commandFailure: {
    retry: 'retry with corrected parameters or context',
    skip: 'skip optional commands that fail',
    substitute: 'use alternative commands for same outcome'
  },
  
  workflowFailure: {
    rollback: 'return to last stable workflow checkpoint',
    partial: 'complete achievable parts of workflow',
    manual: 'transition to manual execution with context'
  },
  
  contextFailure: {
    reconstruction: 'rebuild context from available information',
    recovery: 'restore context from memory and session data',
    continuation: 'continue with reduced but functional context'
  }
}
```

## User Interaction Patterns

### Progress Reporting
```typescript
// Real-time workflow progress communication
const progressReporting = {
  phaseTransition: {
    summary: 'summarize completed phase outcomes',
    preview: 'preview next phase objectives',
    estimation: 'provide time estimates for remaining work'
  },
  
  commandExecution: {
    status: 'real-time command execution status',
    outcomes: 'summarize command results and impacts',
    nextSteps: 'preview upcoming commands and rationale'
  },
  
  errorCommunication: {
    diagnosis: 'clear explanation of errors and impacts',
    options: 'present recovery options with trade-offs',
    recommendations: 'suggest optimal recovery path'
  }
}
```

### Workflow Customization
```typescript
// User control over orchestration behavior
const customizationOptions = {
  interactiveMode: {
    phaseApproval: 'request approval before each phase',
    commandReview: 'show commands before execution',
    outcomeValidation: 'confirm outcomes before continuation'
  },
  
  automationLevel: {
    full: 'complete automation with error recovery',
    guided: 'automated execution with progress reporting',
    manual: 'command suggestions with user execution'
  },
  
  scopeControl: {
    phaseSelection: 'run specific workflow phases only',
    commandFiltering: 'exclude or include specific commands',
    outcomeTargeting: 'focus on specific workflow outcomes'
  }
}
```

## Risk Mitigation

### Safe Orchestration Practices
```typescript
// Minimize risk during automated workflow execution
const riskMitigation = {
  safetyChecks: {
    destructiveOperations: 'require explicit confirmation for destructive actions',
    qualityGates: 'enforce quality validation at key checkpoints',
    contextValidation: 'verify context integrity before major operations'
  },
  
  rollbackCapability: {
    checkpointing: 'create rollback points at phase boundaries',
    statePreservation: 'maintain rollback state throughout workflow',
    quickRecovery: 'enable rapid recovery from failed operations'
  },
  
  failSafe: {
    gracefulDegradation: 'fallback to manual execution when automation fails',
    contextPreservation: 'maintain context even during failures',
    userCommunication: 'clear communication about failures and options'
  }
}
```

### Compatibility Assurance
```typescript
// Ensure compatibility with existing commands and workflows
const compatibilityAssurance = {
  commandIntegration: {
    existingCommands: 'use existing commands without modification',
    parameterCompatibility: 'maintain existing parameter interfaces',
    outputCompatibility: 'preserve existing command output formats'
  },
  
  workflowCoexistence: {
    manualOverride: 'allow manual command execution at any point',
    workflowExit: 'enable graceful exit from orchestration',
    hybridExecution: 'support mix of orchestrated and manual commands'
  },
  
  systemIntegration: {
    memoryCompatibility: 'integrate with existing memory system',
    contextCompatibility: 'work with existing context management',
    qualityCompatibility: 'maintain existing quality gates and standards'
  }
}
```

## Solo Project Adaptations

### Individual Developer Optimization
- **No team coordination**: Focus on individual productivity optimization
- **Technical decision speed**: Reduce decision overhead for solo development
- **Quality automation**: Automate quality checks without team approval processes
- **Context preservation**: Maintain individual developer context across sessions
- **Learning acceleration**: Optimize based on individual patterns and preferences

### Project-Specific Integration
- **Clean architecture**: Enforce architectural patterns automatically
- **SolidJS patterns**: Apply framework-specific best practices
- **Supabase integration**: Handle database and real-time patterns consistently
- **Portuguese UI support**: Maintain pt-BR UI text while enforcing English code
- **Quality standards**: Integrate with project's `pnpm check` validation

## Best Practices

1. **Start with low-risk workflows** to build confidence
2. **Use interactive mode** initially to understand orchestration behavior
3. **Leverage context preservation** for workflow continuity
4. **Monitor quality gates** to ensure standards compliance
5. **Learn from workflow patterns** to optimize future orchestrations

## Requirements

- **All existing commands** available and functional
- **Context management** system operational
- **Memory system** for pattern storage and learning
- **Quality validation** tools (`pnpm check`) functional
- **Git and GitHub CLI** for delivery phase operations

## Integration with Project Standards

- **Command compatibility**: Works with all existing `/` commands
- **Quality integration**: Enforces `pnpm check` at appropriate points
- **Memory utilization**: Uses existing memory system for pattern storage
- **Error handling**: Applies project error handling standards
- **Solo workflow**: Optimized for individual developer productivity

## Output

Provides structured workflow progress and intelligent guidance:

```bash
# Orchestration example
$ /orchestrate feature-development "dark mode toggle"

🚀 Starting Feature Development Orchestration

Phase 1: Discovery
→ Running /discover-issues feature "dark mode"
✅ Found: No existing dark mode issues
✅ Context saved: discovery phase

Phase 2: Planning  
→ Running /create-issue feature "Add dark mode toggle to settings"
✅ Created: Issue #789 - Dark mode toggle implementation
✅ Context saved: planning phase

Phase 3: Implementation
→ Running /implement 789
✅ Implementation completed with tests
✅ Context saved: implementation phase

Phase 4: Quality
→ Running /fix
✅ All quality checks passed
→ Running /review  
✅ Code review completed
✅ Context saved: quality phase

Phase 5: Delivery
→ Running /commit
✅ Commit created: "feat: add dark mode toggle to settings"
→ Running /pull-request
✅ PR created: #156 - Add dark mode toggle

🎉 Feature Development Orchestration Complete!
   Issue: #789 | PR: #156 | Time: 45 minutes
```

This orchestration system provides intelligent automation while maintaining full compatibility with existing workflows and preserving user control at all times.