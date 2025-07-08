import type { ProgramNode } from '../programEvaluator'

/**
 * Evaluates an operator node based on its dependencies.
 * @param node - The operator node to evaluate
 * @param dependencyResults - Results from dependent nodes
 * @returns The result of the operator evaluation
 */
export function evaluateOperator(node: ProgramNode, dependencyResults: any[]): any {
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    return null;
  }

  // Validate required fields
  if (!data.operatorType) {
    return null;
  }

  // Filter out null/undefined results
  const validResults = dependencyResults.filter(result => 
    result !== null && result !== undefined
  );

  // Perform operation based on operator type
  switch (data.operatorType) {
    case 'SUM':
      return evaluateSum(validResults);

    case 'MAX':
      return evaluateMax(validResults);

    case 'SHARE':
      return evaluateShare(validResults);

    case 'AND':
      return evaluateAnd(validResults);

    case 'OR':
      return evaluateOr(validResults);

    default:
      return null;
  }
}

/**
 * Evaluates SUM operator - adds all numeric results.
 */
function evaluateSum(results: any[]): number {
  return results.reduce((sum, result) => {
    const num = convertToNumber(result);
    return sum + num;
  }, 0);
}

/**
 * Evaluates MAX operator - finds the maximum numeric value.
 */
function evaluateMax(results: any[]): number {
  if (results.length === 0) return 0;
  
  const numericResults = results.map(convertToNumber);
  return Math.max(...numericResults);
}

/**
 * Evaluates SHARE operator - distributes a value among results.
 * This is a simplified implementation - can be enhanced based on specific business logic.
 */
function evaluateShare(results: any[]): number {
  if (results.length === 0) return 0;
  
  // For now, return the sum of all results
  // This can be enhanced with more sophisticated sharing logic
  return evaluateSum(results);
}

/**
 * Evaluates AND operator - returns true if all results are truthy.
 */
function evaluateAnd(results: any[]): boolean {
  if (results.length === 0) return false;
  
  return results.every(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });
}

/**
 * Evaluates OR operator - returns true if any result is truthy.
 */
function evaluateOr(results: any[]): boolean {
  if (results.length === 0) return false;
  
  return results.some(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });
}

/**
 * Converts a value to a number for numeric operations.
 * Handles string numbers, actual numbers, and returns 0 for non-numeric values.
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
 * Validates operator node data.
 * @param node - The operator node to validate
 * @returns boolean indicating if the operator is valid
 */
export function validateOperator(node: ProgramNode): boolean {
  const { data } = node;
  
  // Check required fields
  if (!data.operatorType) {
    return false;
  }

  // Validate operator type
  const validOperators = ['SUM', 'MAX', 'SHARE', 'AND', 'OR'];
  if (!validOperators.includes(data.operatorType)) {
    return false;
  }

  return true;
} 