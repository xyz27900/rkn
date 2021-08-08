import { AnyValue, ValidObject } from '@/models/generic';

export const isObject = <T> (data: AnyValue<T>): data is ValidObject =>
  !!data && data.constructor.name === 'Object';

export const isNumber = (data: string): boolean =>
  /^\d+$/.test(data);

export const isArray = <T>(data: unknown): data is T[] =>
  Array.isArray(data);
