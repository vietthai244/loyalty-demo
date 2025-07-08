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
  console.log(`🎁 Evaluating distribution: ${node.id}`)
  console.log(`📋 Distribution data:`, node.data)
  console.log(`📥 Dependency results:`, dependencyResults)
  console.log(`📝 Event data:`, eventData)
  
  const { data } = node;
  
  // Check if node is active
  if (!data.isActive) {
    console.log(`❌ Distribution ${node.id} is not active`)
    return 0;
  }

  // Check if any dependency is true (rule activation)
  const isActivated = dependencyResults.some(result => {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result > 0;
    if (typeof result === 'string') return result.length > 0;
    return Boolean(result);
  });

  console.log(`🔍 Distribution activation check: ${isActivated}`)

  if (!isActivated) {
    console.log(`❌ Distribution ${node.id} not activated - no true dependencies`)
    return 0;
  }

  // Validate required fields
  if (!data.pointMappingType) {
    console.log(`❌ Distribution ${node.id} missing pointMappingType`)
    return 0;
  }

  // Calculate distribution based on mapping type
  let result = 0;
  switch (data.pointMappingType) {
    case 'VALUE_MULTIPLIER':
      result = calculateValueMultiplier(data, eventData);
      console.log(`💰 VALUE_MULTIPLIER result: ${result}`)
      break;

    case 'RATIO_MULTIPLIER':
      result = calculateRatioMultiplier(data, eventData);
      console.log(`💰 RATIO_MULTIPLIER result: ${result}`)
      break;

    case 'FIXED_AMOUNT':
      result = calculateFixedAmount(data);
      console.log(`💰 FIXED_AMOUNT result: ${result}`)
      break;

    default:
      console.log(`❌ Unknown point mapping type: ${data.pointMappingType}`)
      result = 0;
  }

  console.log(`✅ Distribution ${node.id} final result: ${result}`)
  return result;
}

/**
 * Calculates distribution using VALUE_MULTIPLIER.
 * Multiplies the base value by the multiplier.
 */
function calculateValueMultiplier(data: any, eventData: EventData): number {
  const multiplier = data.multiplier || 0;
  const baseValue = getBaseValue(data.baseValueField, eventData);
  
  console.log(`💰 VALUE_MULTIPLIER calculation:`, {
    multiplier,
    baseValueField: data.baseValueField,
    baseValue,
    result: baseValue * multiplier
  })
  
  return baseValue * multiplier;
}

/**
 * Calculates distribution using RATIO_MULTIPLIER.
 * Multiplies the base value by the ratio.
 */
function calculateRatioMultiplier(data: any, eventData: EventData): number {
  const ratio = data.ratio || 0;
  const baseValue = getBaseValue(data.baseValueField, eventData);
  
  console.log(`💰 RATIO_MULTIPLIER calculation:`, {
    ratio,
    baseValueField: data.baseValueField,
    baseValue,
    result: baseValue * ratio
  })
  
  return baseValue * ratio;
}

/**
 * Calculates distribution using FIXED_AMOUNT.
 * Returns the fixed amount regardless of base value.
 */
function calculateFixedAmount(data: any): number {
  const fixedAmount = data.fixedAmount || 0;
  
  console.log(`💰 FIXED_AMOUNT calculation:`, {
    fixedAmount,
    result: fixedAmount
  })
  
  return fixedAmount;
}

/**
 * Gets the base value from event data based on the specified field.
 * @param baseValueField - The field name to extract from event data
 * @param eventData - The event data
 * @returns The base value as a number
 */
function getBaseValue(baseValueField: string | undefined, eventData: EventData): number {
  console.log(`🔍 Getting base value for field: "${baseValueField}"`)
  
  if (!baseValueField) {
    console.log(`❌ No base value field specified`)
    return 0;
  }

  const value = eventData[baseValueField];
  console.log(`🔍 Raw value from event data:`, value)
  
  if (value === undefined) {
    console.log(`❌ Field "${baseValueField}" not found in event data`)
    return 0;
  }

  const convertedValue = convertToNumber(value);
  console.log(`🔍 Converted base value: ${convertedValue}`)
  
  return convertedValue;
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