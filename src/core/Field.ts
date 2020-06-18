import { FieldType } from "./FieldType";
import { ModelConstructor } from "./Model";

// ///////////////////////////////////////////////////////////
// TYPE DEFINITIONS ARE HERE TO PREVENT DEPENDENCY LOOP

// { username: { ...fieldProperties }, password: { ...fieldProperties } }
export type ModelFields<T = any> = {
  [key in keyof T]: Field;
};

export type ValidatorFn<T = any> = (field: Field<T>, values: Partial<T>) => boolean;

// TYPE DEFINITIONS ARE HERE TO PREVENT DEPENDENCY LOOP
// ///////////////////////////////////////////////////////////

// export interface FieldMeta {
//   verifyOwner?: boolean;
//   confidential?: boolean;
// }

export type Field<T = any> = {
  name: keyof T; // Extract<keyof T, string>;
  type: FieldType;
  areManyOf?: ModelConstructor; // many to many
  assert?: ValidatorFn<T>;
  default?: any;
  enum?: any[];
  fileType?: string[];
  isOneOf?: ModelConstructor; // one to many
  listOf?: FieldType;
  max?: number;
  maxLength?: number;
  maxSize?: string;
  // meta?: FieldMeta;
  min?: number;
  minLength?: number;
  pattern?: RegExp;
  primary?: boolean;
  required?: boolean;
  unique?: boolean;
  // multilingual?: boolean;
  // isOf?: ModelClass; // one to one
};
