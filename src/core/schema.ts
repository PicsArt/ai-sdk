export interface ParamSchema {
  type: 'string' | 'number' | 'boolean' | 'file';
  enum?: (string | number)[];
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  label?: string;
  accept?: string;
}

export type ModelParamSchema = Record<string, ParamSchema>;
