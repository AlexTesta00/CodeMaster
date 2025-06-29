import type { FunctionParameter, FunctionExample, AllowedTypeName } from './interface'

const primitiveTypes = ['int', 'string', 'boolean', 'float', 'double', 'long'] as const

export function isValidType(typeName: string): typeName is AllowedTypeName {
    if (primitiveTypes.includes(typeName as any)) return true

    let listMatch = typeName.match(/^List\[(.+)\]$/)
    if (listMatch) {
        return isValidType(listMatch[1])
    }

    let mapMatch = typeName.match(/^Map\[(.+),(.+)\]$/)
    if (mapMatch) {
        const keyType = mapMatch[1].trim()
        const valueType = mapMatch[2].trim()
        return isValidType(keyType) && isValidType(valueType)
    }

    return false
}

export function validateValueByType(value: string, typeName: AllowedTypeName): boolean {
    if (primitiveTypes.includes(typeName as any)) {
        switch (typeName) {
            case 'int':
            case 'long':
            case 'float':
            case 'double':
                return !isNaN(Number(value))
            case 'boolean':
                return value === 'true' || value === 'false'
            case 'string':
                return typeof value === 'string'
            default:
                return false
        }
    }

    const listMatch = typeName.match(/^List\[(.+)\]$/)
    if (listMatch) {
        let innerType = listMatch[1]
        if (!value.startsWith('[') || !value.endsWith(']')) return false
        const items = value
            .slice(1, -1)
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0)
        return items.every(i => validateValueByType(i, innerType as AllowedTypeName))
    }

    const mapMatch = typeName.match(/^Map\[(.+),(.+)\]$/)
    if (mapMatch) {
        let keyType = mapMatch[1].trim()
        let valueType = mapMatch[2].trim()

        if (!/^\{.*\}$/.test(value)) return false

        const inner = value.slice(1, -1).trim()
        if (!inner) return true // mappa vuota

        const pairs = inner.split(',').map(p => p.trim())
        for (const pair of pairs) {
            const [k, v] = pair.split(':').map(s => s.trim())
            if (!k || !v) return false
            if (!validateValueByType(k, keyType as AllowedTypeName)) return false
            if (!validateValueByType(v, valueType as AllowedTypeName)) return false
        }

        return true
    }


    return false
}

export function getExampleValidationError(
    example: FunctionExample,
    params: FunctionParameter[]
): string | null {
    if (!Array.isArray(example.inputs)) return 'Example inputs must be an array.'
    if (example.inputs.length !== params.length) return `Inputs count mismatch: expected ${params.length}, got ${example.inputs.length}.`

    for (let i = 0; i < example.inputs.length; i++) {
        if (!validateValueByType(example.inputs[i], params[i].typeName))
            return `Input #${i + 1} ('${example.inputs[i]}') does not match type '${params[i].typeName}'.`
    }

    return null
}

export const isValidPrimitive = (value: string, type: AllowedTypeName): boolean => {
    switch (type) {
        case 'int': return /^-?\d+$/.test(value);
        case 'double': return /^-?\d+(\.\d+)?$/.test(value);
        case 'boolean': return /^(true|false)$/.test(value);
        case 'string': return /^".*"$/.test(value);
        default: return false;
    }
};

export const isValidList = (value: string, subtype: AllowedTypeName): boolean => {
    if (!/^\[.*\]$/.test(value)) return false;
    const inner = value.slice(1, -1);
    if (inner.trim() === '') return true;
    const elements = inner.split(',').map(e => e.trim());
    return elements.every(el => isValidPrimitive(el, subtype));
};

export const isValidMap = (value: string, type: AllowedTypeName): boolean => {
    if (!/^\{.*\}$/.test(value)) return false;

    const [keyType, valueType] = type.slice(4, -1).split(',').map(s => s.trim());
    const inner = value.slice(1, -1).trim();
    if (!inner) return true; // mappa vuota

    const pairs = inner.split(',').map(p => p.trim());

    for (const pair of pairs) {
        const [k, v] = pair.split(':').map(s => s.trim());
        if (!k || !v) return false;
        if (!isValidValue(k, keyType as AllowedTypeName)) return false;
        if (!isValidValue(v, valueType as AllowedTypeName)) return false;
    }

    return true;
};

export const isValidValue = (value: string, type: AllowedTypeName): boolean => {
    if (type.startsWith('List[')) {
        const innerType = type.slice(5, -1) as AllowedTypeName;
        return isValidList(value, innerType);
    } else if (type.startsWith('Map[')) {
        return isValidMap(value, type);
    } else {
        return isValidPrimitive(value, type);
    }
};

export const isValidInput = (input: string, type: AllowedTypeName) => isValidValue(input, type);
export const isValidOutput = (output: string, type: AllowedTypeName) => isValidValue(output, type);

export const getPlaceholder = (type: AllowedTypeName): string => {
    if (type.startsWith('List[')) {
        const inner = type.slice(5, -1);
        return `[${getPlaceholder(inner as AllowedTypeName)},${getPlaceholder(inner as AllowedTypeName)}]`;
    }

    if (type.startsWith('Map[')) {
        const [keyType, valueType] = type.slice(4, -1).split(',');
        return `{${getPlaceholder(keyType.trim() as AllowedTypeName)}:${getPlaceholder(valueType.trim() as AllowedTypeName)}, ${getPlaceholder(keyType.trim() as AllowedTypeName)}:${getPlaceholder(valueType.trim() as AllowedTypeName)}}`;
    }

    switch (type) {
        case 'int':
        case 'long':
            return '1';
        case 'float':
        case 'double':
            return '3.14';
        case 'boolean':
            return 'true';
        case 'string':
            return 'a';
        default:
            return '?';
    }
};
