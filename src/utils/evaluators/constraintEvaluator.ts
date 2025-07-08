import type { ProgramNode, EventData } from '../programEvaluator'

/**
 * Evaluates a constraint node against event data.
 * @param node - The constraint node to evaluate
 * @param eventData - The event data to test against
 * @returns boolean indicating if the constraint is satisfied
 */
export function evaluateConstraint(node: ProgramNode, eventData: EventData): boolean {
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    return false;
  }

  // Validate required fields
  if (!data.parameter || !data.comparisonOperator || data.value === undefined) {
    return false;
  }

  // Get the parameter value from event data
  const parameterValue = eventData[data.parameter];
  if (parameterValue === undefined) {
    return false;
  }

  // Convert values to appropriate types for comparison
  const eventValue = convertToNumber(parameterValue);
  const constraintValue = convertToNumber(data.value);

  // Perform comparison based on operator
  switch (data.comparisonOperator) {
    case 'GREATER_OR_EQUAL':
      return eventValue >= constraintValue;

    case 'EQUAL':
      if (Array.isArray(data.value)) {
        return data.value.includes(parameterValue);
      }
      return eventValue === constraintValue;

    case 'BETWEEN':
      if (Array.isArray(data.value) && data.value.length >= 2) {
        const min = convertToNumber(data.value[0]);
        const max = convertToNumber(data.value[1]);
        return eventValue >= min && eventValue <= max;
      }
      return false;

    case 'IN':
      if (Array.isArray(data.value)) {
        return data.value.includes(parameterValue);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Converts a value to a number for comparison.
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
  
  return 0;
}

/**
 * Validates constraint node data.
 * @param node - The constraint node to validate
 * @returns boolean indicating if the constraint is valid
 */
export function validateConstraint(node: ProgramNode): boolean {
  const { data } = node;
  
  // Check required fields
  if (!data.parameter || !data.comparisonOperator || data.value === undefined) {
    return false;
  }

  // Validate comparison operator
  const validOperators = ['GREATER_OR_EQUAL', 'EQUAL', 'BETWEEN', 'IN'];
  if (!validOperators.includes(data.comparisonOperator)) {
    return false;
  }

  // Validate value based on operator
  switch (data.comparisonOperator) {
    case 'BETWEEN':
      if (!Array.isArray(data.value) || data.value.length < 2) {
        return false;
      }
      break;

    case 'IN':
      if (!Array.isArray(data.value)) {
        return false;
      }
      break;
  }

  return true;
} 