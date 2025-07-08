# Program Evaluation Module (Dry Run)

This document details the implementation of the `dryTestProgram` module, which allows for simulating the execution of loyalty programs against event data. This module is crucial for partners to test and validate their loyalty program configurations before deployment.

---

## Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Create basic DryTestModal component
- [x] Add Dry Test button to ProgramToolbar
- [x] Integrate modal state management in ProgramCanvas
- [x] Basic modal UI with placeholder content

### Phase 2: Data Interfaces & Types
- [ ] **Core Interfaces** (`src/utils/programEvaluator.ts`)
  - [ ] `NodeData` interface
  - [ ] `ProgramNode` interface
  - [ ] `ProgramEdge` interface
  - [ ] `ProgramTemplate` interface
  - [ ] `EventData` interface
  - [ ] `DetailedDistribution` interface
  - [ ] `EvaluationLogEntry` interface
  - [ ] `DryTestResult` interface

### Phase 3: Core Evaluation Engine
- [ ] **Program Evaluator** (`src/utils/programEvaluator.ts`)
  - [ ] `dryTestProgram` main function
  - [ ] Graph traversal logic
  - [ ] Node evaluation engine
  - [ ] Edge connection validation
  - [ ] Result aggregation logic

### Phase 4: Node Type Evaluators
- [ ] **Constraint Evaluator** (`src/utils/evaluators/constraintEvaluator.ts`)
  - [ ] `evaluateConstraint` function
  - [ ] Comparison operators (GREATER_OR_EQUAL, EQUAL, BETWEEN, IN)
  - [ ] Parameter validation
  - [ ] Type conversion logic

- [ ] **Operator Evaluator** (`src/utils/evaluators/operatorEvaluator.ts`)
  - [ ] `evaluateOperator` function
  - [ ] SUM operator logic
  - [ ] MAX operator logic
  - [ ] SHARE operator logic
  - [ ] AND operator logic
  - [ ] OR operator logic

- [ ] **Rule Evaluator** (`src/utils/evaluators/ruleEvaluator.ts`)
  - [ ] `evaluateRule` function
  - [ ] Conditional rule logic
  - [ ] Condition dependency resolution
  - [ ] Rule activation logic

- [ ] **Distribution Evaluator** (`src/utils/evaluators/distributionEvaluator.ts`)
  - [ ] `evaluateDistribution` function
  - [ ] VALUE_MULTIPLIER calculation
  - [ ] RATIO_MULTIPLIER calculation
  - [ ] FIXED_AMOUNT calculation
  - [ ] Base value field resolution

### Phase 5: UI Components
- [ ] **Event Data Input** (`src/components/program/components/EventDataInput.tsx`)
  - [ ] Form for entering test event data
  - [ ] Dynamic field generation based on program constraints
  - [ ] Data validation
  - [ ] Sample data presets

- [ ] **Test Results Display** (`src/components/program/components/TestResultsDisplay.tsx`)
  - [ ] Overall result summary
  - [ ] Detailed distributions table
  - [ ] Evaluation log viewer
  - [ ] Visual flow highlighting

- [ ] **DryTestModal Enhancement** (`src/components/program/components/DryTestModal.tsx`)
  - [ ] Replace placeholder with actual content
  - [ ] Integrate EventDataInput
  - [ ] Integrate TestResultsDisplay
  - [ ] Add run test functionality
  - [ ] Add export results functionality

### Phase 6: Utility Functions
- [ ] **Graph Utilities** (`src/utils/graphUtils.ts`)
  - [ ] `findRootNodes` function
  - [ ] `findLeafNodes` function
  - [ ] `getNodeDependencies` function
  - [ ] `validateGraphStructure` function
  - [ ] `topologicalSort` function

- [ ] **Data Validation** (`src/utils/validationUtils.ts`)
  - [ ] `validateEventData` function
  - [ ] `validateProgramStructure` function
  - [ ] `validateNodeData` function
  - [ ] `validateEdgeConnections` function

- [ ] **Result Processing** (`src/utils/resultUtils.ts`)
  - [ ] `formatTestResults` function
  - [ ] `generateEvaluationSummary` function
  - [ ] `exportResultsToJSON` function
  - [ ] `exportResultsToCSV` function

### Phase 7: Advanced Features
- [ ] **Multiple Event Testing** (`src/components/program/components/BatchTestPanel.tsx`)
  - [ ] Bulk event data input
  - [ ] Batch test execution
  - [ ] Comparative results analysis
  - [ ] Performance metrics

- [ ] **Test Scenarios** (`src/components/program/components/TestScenarios.tsx`)
  - [ ] Predefined test scenarios
  - [ ] Scenario templates
  - [ ] Custom scenario builder
  - [ ] Scenario import/export

- [ ] **Visual Flow Debugger** (`src/components/program/components/FlowDebugger.tsx`)
  - [ ] Step-by-step execution visualization
  - [ ] Node state highlighting
  - [ ] Execution path tracing
  - [ ] Performance profiling

### Phase 8: Integration & Testing
- [ ] **Hook Integration** (`src/components/program/hooks/useDryTest.ts`)
  - [ ] Dry test state management
  - [ ] Test execution logic
  - [ ] Results caching
  - [ ] Error handling

- [ ] **Error Handling** (`src/utils/errorHandling.ts`)
  - [ ] `DryTestError` class
  - [ ] Error categorization
  - [ ] User-friendly error messages
  - [ ] Error recovery suggestions

- [ ] **Performance Optimization**
  - [ ] Memoization of evaluation results
  - [ ] Lazy loading of large datasets
  - [ ] Web Worker for heavy computations
  - [ ] Result caching strategies

### Phase 9: Documentation & Examples
- [ ] **API Documentation**
  - [ ] Function documentation
  - [ ] Interface documentation
  - [ ] Usage examples
  - [ ] Best practices guide

- [ ] **Test Cases**
  - [ ] Unit tests for evaluators
  - [ ] Integration tests
  - [ ] End-to-end tests
  - [ ] Performance tests

---

## 1. Module File Location

The core logic for the program evaluation will reside in a new TypeScript file:

`src/utils/programEvaluator.ts`

---

## 2. Data Interfaces

To ensure type safety and clarity, the following TypeScript interfaces will be defined at the beginning of `src/utils/programEvaluator.ts`. These interfaces represent the structure of program nodes, edges, incoming event data, and the detailed dry run results.

```typescript
// src/utils/programEvaluator.ts

/**
 * Interface for the data property of a ProgramNode.
 * Contains type-specific properties for operators, constraints, and distributions.
 */
export interface NodeData {
  label: string;
  isActive: boolean;
  operatorType?: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR';
  parameter?: string;
  comparisonOperator?: 'GREATER_OR_EQUAL' | 'EQUAL' | 'BETWEEN' | 'IN';
  value?: string | number | string[];
  distributionType?: string;
  pointMappingType?: 'VALUE_MULTIPLIER' | 'RATIO_MULTIPLIER' | 'FIXED_AMOUNT';
  multiplier?: number;
  ratio?: number; // Used for RATIO_MULTIPLIER
  fixedAmount?: number; // Used for FIXED_AMOUNT
  baseValueField?: string;
  ruleType?: string;
  conditions?: string[];
}

/**
 * Interface representing a single node within the loyalty program graph.
 * Compatible with React Flow's node structure.
 */
export interface ProgramNode {
  id: string;
  type: 'operator' | 'rule' | 'constraint' | 'distribution';
  position: { x: number; y: number; }; // Used for diagram rendering, not evaluation
  data: NodeData;
  sourcePosition?: 'top' | 'right' | 'bottom' | 'left';
  targetPosition?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Interface representing an edge (connection) between two nodes in the program graph.
 * Compatible with React Flow's edge structure.
 */
export interface ProgramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Interface representing the complete structure of a loyalty program template.
 */
export interface ProgramTemplate {
  id: string;
  name: string;
  nodes: ProgramNode[];
  edges: ProgramEdge[];
  // Additional template metadata can be added here (e.g., description, category)
}

/**
 * Interface for the event data against which the loyalty program will be evaluated.
 * Includes common parameters used in constraints.
 */
export interface EventData {
  tx_type?: string;
  value?: number;
  location?: string;
  time?: string; // Expected format: "HH:MM" (e.g., "11:30")
  actor?: string;
  totalSpent?: number;
  [key: string]: any; // Allows for arbitrary additional event properties
}

/**
 * Interface for a single successful distribution identified during the dry run.
 */
export interface DetailedDistribution {
  distributionId: string;
  distributionLabel: string;
  distributionType: string;
  calculatedAmount: number;
  triggeredByRuleId: string;
  triggeredByRuleLabel: string;
  conditionsMet: boolean;
}

/**
 * Interface for a single entry in the evaluation log, tracing node evaluations.
 */
export interface EvaluationLogEntry {
  nodeId: string;
  nodeLabel: string;
  nodeType: 'operator' | 'rule' | 'constraint' | 'distribution' | 'unknown';
  evaluationStatus: 'MATCHED' | 'NOT_MATCHED' | 'EVALUATED' | 'SKIPPED';
  resultValue?: any; // The outcome of the node's evaluation (e.g., boolean, number)
  details?: string; // Additional context about the evaluation
}

/**
 * Interface for the complete result object returned by the dryTestProgram function.
 */
export interface DryTestResult {
  overallProgramResult: {
    triggered: boolean; // True if the program's root logic yields a non-zero/non-null result
    totalCalculatedPoints: number; // The final aggregated points from the root operator
  };
  detailedDistributions: DetailedDistribution[];
  evaluationLog: EvaluationLogEntry[];
}
```

---

## 3. Implementation Priority

### High Priority (Phase 2-4)
1. Data interfaces and types
2. Core evaluation engine
3. Basic node evaluators
4. Simple UI for testing

### Medium Priority (Phase 5-6)
1. Enhanced UI components
2. Utility functions
3. Error handling
4. Basic validation

### Low Priority (Phase 7-9)
1. Advanced features
2. Performance optimization
3. Documentation and testing
4. Batch testing capabilities

---

## 4. File Structure

```
src/
├── utils/
│   ├── programEvaluator.ts          # Main evaluation engine
│   ├── evaluators/
│   │   ├── constraintEvaluator.ts   # Constraint node evaluation
│   │   ├── operatorEvaluator.ts     # Operator node evaluation
│   │   ├── ruleEvaluator.ts         # Rule node evaluation
│   │   └── distributionEvaluator.ts # Distribution node evaluation
│   ├── graphUtils.ts                # Graph traversal utilities
│   ├── validationUtils.ts           # Data validation utilities
│   ├── resultUtils.ts               # Result processing utilities
│   └── errorHandling.ts             # Error handling utilities
├── components/program/
│   ├── components/
│   │   ├── DryTestModal.tsx         # Main dry test modal
│   │   ├── EventDataInput.tsx       # Event data input form
│   │   ├── TestResultsDisplay.tsx   # Results display component
│   │   ├── BatchTestPanel.tsx       # Batch testing interface
│   │   ├── TestScenarios.tsx        # Test scenarios management
│   │   └── FlowDebugger.tsx         # Visual flow debugger
│   └── hooks/
│       └── useDryTest.ts            # Dry test state management
└── types/
    └── dryTest.ts                   # Type definitions
```