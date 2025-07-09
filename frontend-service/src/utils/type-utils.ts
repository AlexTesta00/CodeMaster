import type { AllowedTypeName } from './interface'

export const primitiveTypes = ['int', 'string', 'boolean', 'float', 'double', 'long'] as const

export const isValidPrimitive = (value: string, type: AllowedTypeName): boolean => {
    switch (type) {
        case 'int': return /^-?\d+$/.test(value);
        case 'double': return /^-?\d+(\.\d+)?$/.test(value);
        case 'boolean': return /^(true|false)$/.test(value);
        case 'string': return /^".*"$/s.test(value) || /^[a-zA-Z0-9_]+$/.test(value);
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
    if (!inner) return true;

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
    if (type.startsWith('List<')) {
        const innerType = type.slice(5, -1) as AllowedTypeName;
        return isValidList(value, innerType);
    } else if (type.startsWith('Map<')) {
        return isValidMap(value, type);
    } else {
        return isValidPrimitive(value, type);
    }
};

export const isValidInput = (input: string, type: AllowedTypeName) => isValidValue(input, type);
export const isValidOutput = (output: string, type: AllowedTypeName) => isValidValue(output, type);

export const getPlaceholder = (type: AllowedTypeName): string => {
    // if (type.startsWith('List<')) {
    //     const inner = type.slice(5, -1);
    //     return `[${getPlaceholder(inner as AllowedTypeName)},${getPlaceholder(inner as AllowedTypeName)}]`;
    // }
    //
    // if (type.startsWith('Map<')) {
    //     const [keyType, valueType] = type.slice(4, -1).split(',');
    //     return `{${getPlaceholder(keyType.trim() as AllowedTypeName)}:${getPlaceholder(valueType.trim() as AllowedTypeName)}, ${getPlaceholder(keyType.trim() as AllowedTypeName)}:${getPlaceholder(valueType.trim() as AllowedTypeName)}}`;
    // }

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

export const isValidIdentifier = (name: string): boolean => {
    return /^[a-z][a-zA-Z0-9]*$/.test(name)
}