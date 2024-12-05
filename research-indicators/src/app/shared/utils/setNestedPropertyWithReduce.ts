/* eslint-disable @typescript-eslint/no-explicit-any */
export function setNestedPropertyWithReduce(obj: any, path: string, value: any): void {
  const keys = path.split('.');

  keys.slice(0, -1).reduce((acc, key) => {
    // Crea el subobjeto si no existe
    if (!acc[key]) {
      acc[key] = {};
    }
    return acc[key];
  }, obj)[keys[keys.length - 1]] = value;
}

export function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}
