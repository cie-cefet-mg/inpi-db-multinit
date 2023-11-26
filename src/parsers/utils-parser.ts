export function getFirstElement(object: any) {
    if (isNonEmptyArray(object) && object[0]) {
        return object[0];
    }

    return undefined;
}

export function isNonEmptyArray(object: any): boolean {
    return !!(object && Array.isArray(object) && object.length > 0);
}