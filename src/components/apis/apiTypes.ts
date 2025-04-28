import { mockTables } from "../../mock/mockTables";

export type TableDefinition = (typeof mockTables)[0];

export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  mapped?: string;
  options: {
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    enum?: string[];
    format?: string;
    default?: any;
    minItems?: number;
    items?: any;
    // New filter-related options
    selectable?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    comparable?: boolean;
  };
}

export interface ResponseDefinition {
  code: string;
  description: string;
  properties: Record<string, any>;
}

export interface ArrayItemsDefinition {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  enum?: string[];
}

// New type for structured filter types
export type FilterType =
  | "select"
  | "search"
  | "sort"
  | "gte"
  | "lte"
  | "and"
  | "or";

// New interface for filter configuration
export interface FilterConfiguration {
  type: FilterType;
  fields?: string[]; // Fields that this filter applies to
  options?: Record<string, any>; // Additional config options
}
