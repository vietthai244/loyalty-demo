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

  // Build dependency graph
  buildDependencyGraph(context);

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = findRootNodes(context);

  // Evaluate all nodes starting from roots
  const finalResults: any[] = [];
  rootNodes.forEach(rootNodeId => {
    const result = evaluateNode(rootNodeId, context);
    if (result !== null && result !== undefined) {
      finalResults.push(result);
    }
  });

  // Aggregate final results
  const totalPoints = finalResults.reduce((sum, result) => {
    if (typeof result === 'number') {
      return sum + result;
    }
    return sum;
  }, 0);

  // Extract detailed distributions
  const detailedDistributions = extractDetailedDistributions(context);

  return {
    overallProgramResult: {
      triggered: totalPoints > 0,
      totalCalculatedPoints: totalPoints
    },
    detailedDistributions,
    evaluationLog: context.evaluationLog
  };
}

/**
 * Builds the dependency graph for all nodes in the program.
 */
function buildDependencyGraph(context: EvaluationContext): void {
  const { nodes, edges } = context.program;

  // Initialize dependencies and dependents
  nodes.forEach(node => {
    const state = context.nodeStates.get(node.id)!;
    state.dependencies = [];
    state.dependents = [];
  });

  // Build dependency relationships from edges
  edges.forEach(edge => {
    const sourceState = context.nodeStates.get(edge.source);
    const targetState = context.nodeStates.get(edge.target);

    if (sourceState && targetState) {
      sourceState.dependents.push(edge.target);
      targetState.dependencies.push(edge.source);
    }
  });
}

/**
 * Finds root nodes (nodes with no dependencies).
 */
function findRootNodes(context: EvaluationContext): string[] {
  const rootNodes: string[] = [];
  
  context.nodeStates.forEach((state, nodeId) => {
    if (state.dependencies.length === 0) {
      rootNodes.push(nodeId);
    }
  });

  return rootNodes;
}

/**
 * Evaluates a single node and its dependencies recursively.
 */
function evaluateNode(nodeId: string, context: EvaluationContext): any {
  const state = context.nodeStates.get(nodeId);
  if (!state) {
    logEvaluation(context, nodeId, 'unknown', 'SKIPPED', null, 'Node not found');
    return null;
  }

  // If already evaluated, return cached result
  if (state.evaluated) {
    return state.result;
  }

  // Evaluate dependencies first
  const dependencyResults: any[] = [];
  for (const depId of state.dependencies) {
    const depResult = evaluateNode(depId, context);
    dependencyResults.push(depResult);
  }

  // Find the node data
  const node = context.program.nodes.find(n => n.id === nodeId);
  if (!node) {
    logEvaluation(context, nodeId, 'unknown', 'SKIPPED', null, 'Node data not found');
    return null;
  }

  // Evaluate the node based on its type
  let result: any = null;
  let evaluationStatus: 'MATCHED' | 'NOT_MATCHED' | 'EVALUATED' | 'SKIPPED' = 'EVALUATED';
  let details = '';

  try {
    switch (node.type) {
      case 'constraint':
        result = evaluateConstraint(node, context.eventData);
        evaluationStatus = result ? 'MATCHED' : 'NOT_MATCHED';
        details = `Constraint ${result ? 'passed' : 'failed'}`;
        break;

      case 'operator':
        result = evaluateOperator(node, dependencyResults);
        details = `Operator result: ${result}`;
        break;

      case 'rule':
        result = evaluateRule(node, dependencyResults);
        evaluationStatus = result ? 'MATCHED' : 'NOT_MATCHED';
        details = `Rule ${result ? 'activated' : 'not activated'}`;
        break;

      case 'distribution':
        result = evaluateDistribution(node, dependencyResults, context.eventData);
        details = `Distribution calculated: ${result}`;
        break;

      default:
        evaluationStatus = 'SKIPPED';
        details = `Unknown node type: ${node.type}`;
    }
  } catch (error) {
    evaluationStatus = 'SKIPPED';
    details = `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Update node state
  state.result = result;
  state.evaluated = true;

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