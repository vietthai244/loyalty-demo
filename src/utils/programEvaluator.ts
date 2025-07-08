// Import evaluators
import { evaluateConstraint } from './evaluators/constraintEvaluator'
import { evaluateOperator } from './evaluators/operatorEvaluator'
import { evaluateRule } from './evaluators/ruleEvaluator'
import { evaluateDistribution } from './evaluators/distributionEvaluator'

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
  threshold?: number; // Used for threshold rules
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

/**
 * Interface for internal node evaluation state during program execution.
 */
export interface NodeEvaluationState {
  nodeId: string;
  result: any;
  evaluated: boolean;
  dependencies: string[];
  dependents: string[];
}

/**
 * Interface for the evaluation context passed between evaluators.
 */
export interface EvaluationContext {
  eventData: EventData;
  nodeStates: Map<string, NodeEvaluationState>;
  evaluationLog: EvaluationLogEntry[];
  program: {
    nodes: ProgramNode[];
    edges: ProgramEdge[];
  };
}

/**
 * Main function to perform a dry test of a loyalty program against event data.
 * @param program - The loyalty program to test
 * @param eventData - The event data to test against
 * @returns DryTestResult containing the evaluation results
 */
export function dryTestProgram(
  program: { nodes: ProgramNode[]; edges: ProgramEdge[] },
  eventData: EventData
): DryTestResult {
  console.log('🚀 Starting dry test program...')
  console.log('📊 Program nodes:', program.nodes.length)
  console.log('🔗 Program edges:', program.edges.length)
  console.log('📝 Event data:', eventData)

  // Initialize evaluation context
  const context: EvaluationContext = {
    eventData,
    nodeStates: new Map(),
    evaluationLog: [],
    program
  };

  // Initialize node states
  program.nodes.forEach(node => {
    context.nodeStates.set(node.id, {
      nodeId: node.id,
      result: null,
      evaluated: false,
      dependencies: [],
      dependents: []
    });
  });

  console.log('📋 Initialized node states for', context.nodeStates.size, 'nodes')

  // Build dependency graph
  buildDependencyGraph(context);
  console.log('🔗 Built dependency graph')

  // Evaluate all nodes in topological order
  const evaluationOrder = topologicalSort(context);
  console.log('📋 Evaluation order:', evaluationOrder)

  // Evaluate nodes in dependency order
  const finalResults: any[] = [];
  evaluationOrder.forEach(nodeId => {
    console.log('🔄 Evaluating node in order:', nodeId)
    const result = evaluateNode(nodeId, context);
    console.log('📈 Node result:', nodeId, '=', result)
    if (result !== null && result !== undefined) {
      finalResults.push(result);
    }
  });

  console.log('📊 Final results from all nodes:', finalResults)

  // Aggregate final results
  const totalPoints = finalResults.reduce((sum, result) => {
    if (typeof result === 'number') {
      return sum + result;
    }
    return sum;
  }, 0);

  console.log('💰 Total calculated points:', totalPoints)

  // Extract detailed distributions
  const detailedDistributions = extractDetailedDistributions(context);
  console.log('🎁 Detailed distributions:', detailedDistributions.length)

  const result = {
    overallProgramResult: {
      triggered: totalPoints > 0,
      totalCalculatedPoints: totalPoints
    },
    detailedDistributions,
    evaluationLog: context.evaluationLog
  };

  console.log('✅ Dry test completed. Result:', result)
  return result;
}

/**
 * Builds the dependency graph for all nodes in the program.
 */
function buildDependencyGraph(context: EvaluationContext): void {
  const { nodes, edges } = context.program;
  
  console.log('🔗 Building dependency graph...')
  console.log('📊 Total nodes:', nodes.length)
  console.log('🔗 Total edges:', edges.length)
  console.log('🔗 Edges:', edges)

  // Initialize dependencies and dependents
  nodes.forEach(node => {
    const state = context.nodeStates.get(node.id)!;
    state.dependencies = [];
    state.dependents = [];
  });

  // Build dependency relationships from edges
  edges.forEach(edge => {
    console.log(`🔗 Processing edge: ${edge.source} -> ${edge.target}`)
    
    const sourceState = context.nodeStates.get(edge.source);
    const targetState = context.nodeStates.get(edge.target);

    if (sourceState && targetState) {
      // Check for self-referential edges
      if (edge.source === edge.target) {
        console.log(`⚠️ Self-referential edge detected: ${edge.source} -> ${edge.target}`);
      }
      
      sourceState.dependents.push(edge.target);
      targetState.dependencies.push(edge.source);
      console.log(`✅ Added dependency: ${edge.source} -> ${edge.target}`)
    } else {
      console.log(`❌ Edge references missing node: source=${edge.source}, target=${edge.target}`)
    }
  });

  // Log final dependency graph
  console.log('📋 Final dependency graph:')
  context.nodeStates.forEach((state, nodeId) => {
    console.log(`  ${nodeId}: dependencies=[${state.dependencies.join(', ')}], dependents=[${state.dependents.join(', ')}]`)
  })
  
  // Check for nodes with no dependencies (root nodes)
  const rootNodes = Array.from(context.nodeStates.entries())
    .filter(([, state]) => state.dependencies.length === 0)
    .map(([nodeId]) => nodeId);
  console.log('🌳 Root nodes (no dependencies):', rootNodes);
  
  // Check for nodes with no dependents (leaf nodes)
  const leafNodes = Array.from(context.nodeStates.entries())
    .filter(([, state]) => state.dependents.length === 0)
    .map(([nodeId]) => nodeId);
  console.log('🍃 Leaf nodes (no dependents):', leafNodes);
}

/**
 * Evaluates a single node and its dependencies recursively.
 */
function evaluateNode(nodeId: string, context: EvaluationContext): any {
  console.log(`🔍 Evaluating node: ${nodeId}`)
  
  const state = context.nodeStates.get(nodeId);
  if (!state) {
    console.log(`❌ Node state not found: ${nodeId}`)
    logEvaluation(context, nodeId, 'unknown', 'SKIPPED', null, 'Node not found');
    return null;
  }

  // If already evaluated, return cached result
  if (state.evaluated) {
    console.log(`📋 Node already evaluated: ${nodeId} = ${state.result}`)
    return state.result;
  }

  // Evaluate dependencies first
  const dependencyResults: any[] = [];
  console.log(`🔗 Evaluating dependencies for ${nodeId}:`, state.dependencies)
  for (const depId of state.dependencies) {
    const depResult = evaluateNode(depId, context);
    dependencyResults.push(depResult);
    console.log(`📥 Dependency result ${depId} -> ${nodeId}:`, depResult)
  }

  // Find the node data
  const node = context.program.nodes.find(n => n.id === nodeId);
  if (!node) {
    console.log(`❌ Node data not found: ${nodeId}`)
    logEvaluation(context, nodeId, 'unknown', 'SKIPPED', null, 'Node data not found');
    return null;
  }

  console.log(`📋 Node data for ${nodeId}:`, {
    type: node.type,
    label: node.data.label,
    isActive: node.data.isActive,
    data: node.data
  })

  // Evaluate the node based on its type
  let result: any = null;
  let evaluationStatus: 'MATCHED' | 'NOT_MATCHED' | 'EVALUATED' | 'SKIPPED' = 'EVALUATED';
  let details = '';

  try {
    switch (node.type) {
      case 'constraint':
        console.log(`🔒 Evaluating constraint: ${nodeId}`)
        result = evaluateConstraint(node, context.eventData);
        evaluationStatus = result ? 'MATCHED' : 'NOT_MATCHED';
        details = `Constraint ${result ? 'passed' : 'failed'}`;
        console.log(`🔒 Constraint result: ${nodeId} = ${result}`)
        break;

      case 'operator':
        console.log(`⚙️ Evaluating operator: ${nodeId}, dependencies:`, dependencyResults)
        result = evaluateOperator(node, dependencyResults);
        details = `Operator result: ${result}`;
        console.log(`⚙️ Operator result: ${nodeId} = ${result}`)
        break;

      case 'rule':
        console.log(`📋 Evaluating rule: ${nodeId}, dependencies:`, dependencyResults)
        result = evaluateRule(node, dependencyResults);
        evaluationStatus = result ? 'MATCHED' : 'NOT_MATCHED';
        details = `Rule ${result ? 'activated' : 'not activated'}`;
        console.log(`📋 Rule result: ${nodeId} = ${result}`)
        break;

      case 'distribution':
        console.log(`🎁 Evaluating distribution: ${nodeId}, dependencies:`, dependencyResults)
        result = evaluateDistribution(node, dependencyResults, context.eventData);
        details = `Distribution calculated: ${result}`;
        console.log(`🎁 Distribution result: ${nodeId} = ${result}`)
        break;

      default:
        evaluationStatus = 'SKIPPED';
        details = `Unknown node type: ${node.type}`;
        console.log(`❓ Unknown node type: ${nodeId} = ${node.type}`)
    }
  } catch (error) {
    evaluationStatus = 'SKIPPED';
    details = `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.log(`💥 Evaluation error for ${nodeId}:`, error)
  }

  // Update node state
  state.result = result;
  state.evaluated = true;

  console.log(`✅ Node evaluation completed: ${nodeId} = ${result}`)

  // Log evaluation
  logEvaluation(context, nodeId, node.type, evaluationStatus, result, details);

  return result;
}

/**
 * Logs an evaluation entry to the evaluation log.
 */
function logEvaluation(
  context: EvaluationContext,
  nodeId: string,
  nodeType: string,
  status: 'MATCHED' | 'NOT_MATCHED' | 'EVALUATED' | 'SKIPPED',
  result: any,
  details: string
): void {
  const node = context.program.nodes.find(n => n.id === nodeId);
  const label = node?.data.label || 'Unknown';

  context.evaluationLog.push({
    nodeId,
    nodeLabel: label,
    nodeType: nodeType as any,
    evaluationStatus: status,
    resultValue: result,
    details
  });
}

/**
 * Extracts detailed distribution information from the evaluation.
 */
function extractDetailedDistributions(context: EvaluationContext): DetailedDistribution[] {
  const distributions: DetailedDistribution[] = [];

  context.program.nodes.forEach(node => {
    if (node.type === 'distribution') {
      const state = context.nodeStates.get(node.id);
      if (state && state.evaluated && state.result && state.result > 0) {
        // Find the rule that triggered this distribution
        const triggeringRule = findTriggeringRule(node.id, context);
        
        distributions.push({
          distributionId: node.id,
          distributionLabel: node.data.label,
          distributionType: node.data.distributionType || 'unknown',
          calculatedAmount: state.result,
          triggeredByRuleId: triggeringRule?.id || 'unknown',
          triggeredByRuleLabel: triggeringRule?.data.label || 'Unknown Rule',
          conditionsMet: true
        });
      }
    }
  });

  return distributions;
}

/**
 * Finds the rule that triggered a distribution by following the dependency chain.
 */
function findTriggeringRule(distributionId: string, context: EvaluationContext): ProgramNode | null {
  const state = context.nodeStates.get(distributionId);
  if (!state) return null;

  // Look for rule nodes in dependencies
  for (const depId of state.dependencies) {
    const depNode = context.program.nodes.find(n => n.id === depId);
    if (depNode?.type === 'rule') {
      const depState = context.nodeStates.get(depId);
      if (depState?.evaluated && depState.result) {
        return depNode;
      }
    }
  }

  return null;
}

/**
 * Performs topological sort to determine evaluation order.
 * Returns array of node IDs in dependency order (dependencies first).
 */
function topologicalSort(context: EvaluationContext): string[] {
  const visited = new Set<string>();
  const tempVisited = new Set<string>();
  const order: string[] = [];
  const path: string[] = [];

  function visit(nodeId: string): void {
    console.log(`🔍 Visiting node: ${nodeId}, path: [${path.join(' -> ')}]`);
    
    if (tempVisited.has(nodeId)) {
      const cyclePath = [...path, nodeId];
      console.log(`❌ Circular dependency detected! Cycle: ${cyclePath.join(' -> ')}`);
      throw new Error(`Circular dependency detected involving node: ${nodeId}. Cycle: ${cyclePath.join(' -> ')}`);
    }
    
    if (visited.has(nodeId)) {
      console.log(`✅ Node already visited: ${nodeId}`);
      return;
    }

    tempVisited.add(nodeId);
    path.push(nodeId);
    
    const state = context.nodeStates.get(nodeId);
    if (state) {
      console.log(`🔗 Node ${nodeId} has dependencies: [${state.dependencies.join(', ')}]`);
      // Visit all dependencies first
      for (const depId of state.dependencies) {
        visit(depId);
      }
    }
    
    path.pop();
    tempVisited.delete(nodeId);
    visited.add(nodeId);
    order.push(nodeId);
    console.log(`✅ Added to order: ${nodeId}`);
  }

  // Visit all nodes
  console.log('🚀 Starting topological sort...');
  for (const nodeId of context.nodeStates.keys()) {
    if (!visited.has(nodeId)) {
      visit(nodeId);
    }
  }

  console.log('📋 Final evaluation order:', order);
  return order;
}

/**
 * Simple test function to verify topological sort works correctly.
 */
export function testTopologicalSort(): void {
  console.log('🧪 Testing topological sort with simple program...');
  
  const testProgram = {
    nodes: [
      { id: 'A', type: 'constraint' as const, position: { x: 0, y: 0 }, data: { label: 'A', isActive: true } },
      { id: 'B', type: 'operator' as const, position: { x: 0, y: 0 }, data: { label: 'B', isActive: true } },
      { id: 'C', type: 'distribution' as const, position: { x: 0, y: 0 }, data: { label: 'C', isActive: true } }
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B' },
      { id: 'e2', source: 'B', target: 'C' }
    ]
  };

  const testEventData = { value: 1000 };

  try {
    const result = dryTestProgram(testProgram, testEventData);
    console.log('✅ Simple test passed:', result);
  } catch (error) {
    console.log('❌ Simple test failed:', error);
  }
} 