import type { ProgramNode } from '../programEvaluator'

/**
 * Evaluates a rule node based on its dependencies.
 * @param node - The rule node to evaluate
 * @param dependencyResults - Results from dependent nodes
 * @returns boolean indicating if the rule is activated
 */
export function evaluateRule(node: ProgramNode, dependencyResults: any[]): boolean {
  console.log(`📋 Evaluating rule: ${node.id}`)
  console.log(`📋 Rule data:`, node.data)
  console.log(`📥 Dependency results:`, dependencyResults)
  
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    console.log(`❌ Rule ${node.id} is not active`)
    return false;
  }

  // Validate required fields
  if (!data.ruleType) {
    console.log(`❌ Rule ${node.id} missing ruleType`)
    return false;
  }

  // Filter out null/undefined results
  const validResults = dependencyResults.filter(result => 
    result !== null && result !== undefined
  );
  
  console.log(`✅ Valid dependency results:`, validResults)

  // Evaluate rule based on type
  let result = false;
  switch (data.ruleType) {
    case 'CONDITIONAL':
      result = evaluateConditionalRule(validResults);
      console.log(`📋 CONDITIONAL rule result: ${result}`)
      break;

    case 'THRESHOLD':
      result = evaluateThresholdRule(validResults, data);
      console.log(`📋 THRESHOLD rule result: ${result}`)
      break;

    case 'SEQUENTIAL':
      result = evaluateSequentialRule(validResults);
      console.log(`📋 SEQUENTIAL rule result: ${result}`)
      break;

    default:
      console.log(`❌ Unknown rule type: ${data.ruleType}`)
      result = false;
  }

  console.log(`✅ Rule ${node.id} final result: ${result}`)
  return result;
}

/**
 * Evaluates a conditional rule - activates if any dependency is true.
 */
function evaluateConditionalRule(results: any[]): boolean {
  if (results.length === 0) return false;
  
  return results.some(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });
}

/**
 * Evaluates a threshold rule - activates if the sum exceeds a threshold.
 */
function evaluateThresholdRule(results: any[], data: any): boolean {
  const threshold = data.threshold || 0;
  const sum = results.reduce((total, result) => {
    const num = convertToNumber(result);
    return total + num;
  }, 0);
  
  return sum >= threshold;
}

/**
 * Evaluates a sequential rule - activates if all dependencies are true in sequence.
 */
function evaluateSequentialRule(results: any[]): boolean {
  if (results.length === 0) return false;
  
  return results.every(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });
}

/**
 * Converts a value to a number for numeric operations.
 */
function convertToNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  return 0;
}

/**
 * Validates rule node data.
 * @param node - The rule node to validate
 * @returns boolean indicating if the rule is valid
 */
export function validateRule(node: ProgramNode): boolean {
  const { data } = node;
  
  // Check required fields
  if (!data.ruleType) {
    return false;
  }

  // Validate rule type
  const validRuleTypes = ['CONDITIONAL', 'THRESHOLD', 'SEQUENTIAL'];
  if (!validRuleTypes.includes(data.ruleType)) {
    return false;
  }

  // Validate threshold for threshold rules
  if (data.ruleType === 'THRESHOLD' && data.threshold !== undefined) {
    const threshold = convertToNumber(data.threshold);
    if (isNaN(threshold)) {
      return false;
    }
  }

  return true;
} 