export type AnyValue<T> = string | number | null | object | T[];

export interface ValidObject {
  [key: string]: any;
}
