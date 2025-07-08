import type { ProgramNode, EventData } from '../programEvaluator'

/**
 * Evaluates a constraint node against event data.
 * @param node - The constraint node to evaluate
 * @param eventData - The event data to test against
 * @returns boolean indicating if the constraint is satisfied
 */
export function evaluateConstraint(node: ProgramNode, eventData: EventData): boolean {
  console.log(`🔒 Evaluating constraint: ${node.id}`)
  console.log(`📋 Constraint data:`, node.data)
  console.log(`📝 Event data:`, eventData)
  
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    console.log(`❌ Constraint ${node.id} is not active`)
    return false;
  }

  // Validate required fields
  if (!data.parameter || !data.comparisonOperator || data.value === undefined) {
    console.log(`❌ Constraint ${node.id} missing required fields:`, {
      parameter: data.parameter,
      comparisonOperator: data.comparisonOperator,
      value: data.value
    })
    return false;
  }

  // Get the parameter value from event data
  const parameterValue = eventData[data.parameter];
  console.log(`🔍 Parameter "${data.parameter}" value:`, parameterValue)
  
  if (parameterValue === undefined) {
    console.log(`❌ Parameter "${data.parameter}" not found in event data`)
    return false;
  }

  // Convert values to appropriate types for comparison
  const eventValue = convertToNumber(parameterValue);
  const constraintValue = convertToNumber(data.value);
  
  console.log(`🔄 Comparison values:`, {
    eventValue,
    constraintValue,
    operator: data.comparisonOperator
  })

  // Perform comparison based on operator
  let result = false;
  switch (data.comparisonOperator) {
    case 'GREATER_OR_EQUAL':
      result = eventValue >= constraintValue;
      console.log(`🔢 GREATER_OR_EQUAL: ${eventValue} >= ${constraintValue} = ${result}`)
      break;

    case 'EQUAL':
      if (Array.isArray(data.value)) {
        result = data.value.includes(parameterValue);
        console.log(`🔢 EQUAL (array): ${parameterValue} in ${data.value} = ${result}`)
      } else {
        result = eventValue === constraintValue;
        console.log(`🔢 EQUAL: ${eventValue} === ${constraintValue} = ${result}`)
      }
      break;

    case 'BETWEEN':
      if (Array.isArray(data.value) && data.value.length >= 2) {
        const min = convertToNumber(data.value[0]);
        const max = convertToNumber(data.value[1]);
        result = eventValue >= min && eventValue <= max;
        console.log(`🔢 BETWEEN: ${eventValue} between ${min} and ${max} = ${result}`)
      } else {
        console.log(`❌ BETWEEN operator requires array with 2 values`)
        result = false;
      }
      break;

    case 'IN':
      if (Array.isArray(data.value)) {
        result = data.value.includes(parameterValue);
        console.log(`🔢 IN: ${parameterValue} in ${data.value} = ${result}`)
      } else {
        console.log(`❌ IN operator requires array value`)
        result = false;
      }
      break;

    default:
      console.log(`❌ Unknown comparison operator: ${data.comparisonOperator}`)
      result = false;
  }

  console.log(`✅ Constraint ${node.id} result: ${result}`)
  return result;
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