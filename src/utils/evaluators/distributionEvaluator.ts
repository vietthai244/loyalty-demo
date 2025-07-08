import type { ProgramNode, EventData } from '../programEvaluator'

/**
 * Evaluates a distribution node and calculates the points to be distributed.
 * @param node - The distribution node to evaluate
 * @param dependencyResults - Results from dependent nodes
 * @param eventData - The event data for base value resolution
 * @returns The calculated distribution amount
 */
export function evaluateDistribution(
  node: ProgramNode, 
  dependencyResults: any[], 
  eventData: EventData
): number {
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    return 0;
  }

  // Check if any dependency is true (rule activation)
  const isActivated = dependencyResults.some(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });

  if (!isActivated) {
    return 0;
  }

  // Validate required fields
  if (!data.pointMappingType) {
    return 0;
  }

  // Calculate distribution based on mapping type
  switch (data.pointMappingType) {
    case 'VALUE_MULTIPLIER':
      return calculateValueMultiplier(data, eventData);

    case 'RATIO_MULTIPLIER':
      return calculateRatioMultiplier(data, eventData);

    case 'FIXED_AMOUNT':
      return calculateFixedAmount(data);

    default:
      return 0;
  }
}

/**
 * Calculates distribution using VALUE_MULTIPLIER.
 * Multiplies the base value by the multiplier.
 */
function calculateValueMultiplier(data: any, eventData: EventData): number {
  const multiplier = data.multiplier || 0;
  const baseValue = getBaseValue(data.baseValueField, eventData);
  
  return baseValue * multiplier;
}

/**
 * Calculates distribution using RATIO_MULTIPLIER.
 * Multiplies the base value by the ratio.
 */
function calculateRatioMultiplier(data: any, eventData: EventData): number {
  const ratio = data.ratio || 0;
  const baseValue = getBaseValue(data.baseValueField, eventData);
  
  return baseValue * ratio;
}

/**
 * Calculates distribution using FIXED_AMOUNT.
 * Returns the fixed amount regardless of base value.
 */
function calculateFixedAmount(data: any): number {
  return data.fixedAmount || 0;
}

/**
 * Gets the base value from event data based on the specified field.
 * @param baseValueField - The field name to extract from event data
 * @param eventData - The event data
 * @returns The base value as a number
 */
function getBaseValue(baseValueField: string | undefined, eventData: EventData): number {
  if (!baseValueField) {
    return 0;
  }

  const value = eventData[baseValueField];
  if (value === undefined) {
    return 0;
  }

  return convertToNumber(value);
}

/**
 * Converts a value to a number for calculations.
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
 * Validates distribution node data.
 * @param node - The distribution node to validate
 * @returns boolean indicating if the distribution is valid
 */
export function validateDistribution(node: ProgramNode): boolean {
  const { data } = node;
  
  // Check required fields
  if (!data.pointMappingType) {
    return false;
  }

  // Validate point mapping type
  const validMappingTypes = ['VALUE_MULTIPLIER', 'RATIO_MULTIPLIER', 'FIXED_AMOUNT'];
  if (!validMappingTypes.includes(data.pointMappingType)) {
    return false;
  }

  // Validate specific fields based on mapping type
  switch (data.pointMappingType) {
    case 'VALUE_MULTIPLIER':
      if (data.multiplier === undefined || data.multiplier < 0) {
        return false;
      }
      break;

    case 'RATIO_MULTIPLIER':
      if (data.ratio === undefined || data.ratio < 0) {
        return false;
      }
      break;

    case 'FIXED_AMOUNT':
      if (data.fixedAmount === undefined || data.fixedAmount < 0) {
        return false;
      }
      break;
  }

  return true;
} 