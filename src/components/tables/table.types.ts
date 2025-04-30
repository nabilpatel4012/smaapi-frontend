export interface Column {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  isPrimary: boolean;
  isIndex: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface Index {
  name: string;
  columns: string[];
  isUnique: boolean;
}

// Base table interface for creating tables
export interface BaseTable {
  name: string;
  description?: string;
  columns: Column[];
  indexes?: Index[];
}

// Full table interface that includes required id and createdAt
export interface Table extends BaseTable {
  id: string;
  createdAt: string;
}

// Raw table data from API
export interface RawTable {
  table_id: number;
  table_name: string;
  project_id: number;
  table_schema: {
    columns: Column[];
    indexes?: Index[];
  };
  created_at: string;
}

export interface Project {
  project_id: number;
  project_name: string;
  db_type: string;
}
