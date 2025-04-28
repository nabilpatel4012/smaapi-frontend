// components/api/BodyParameter.tsx
import React from "react";
import { Trash } from "lucide-react";
import { FieldDefinition, TableDefinition } from "./apiTypes";
import { mockTables } from "../../mock/mockTables";

interface BodyParameterProps {
  param: FieldDefinition;
  index: number;
  updateBodyParam: (index: number, field: string, value: any) => void;
  updateBodyParamOption: (index: number, option: string, value: any) => void;
  removeBodyParam: (index: number) => void;
  renderOptionsForType: (
    type: string,
    index: number,
    isQuery: boolean
  ) => JSX.Element | null;
  selectedTable: string;
}

const BodyParameter: React.FC<BodyParameterProps> = ({
  param,
  index,
  updateBodyParam,
  updateBodyParamOption,
  removeBodyParam,
  renderOptionsForType,
  selectedTable,
}) => {
  const selectedTableData = mockTables.find(
    (table) => table.name === selectedTable
  );

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={param.name}
              onChange={(e) => updateBodyParam(index, "name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={param.type}
              onChange={(e) => updateBodyParam(index, "type", e.target.value)}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mapping
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={param.mapped || ""}
              onChange={(e) => updateBodyParam(index, "mapped", e.target.value)}
            >
              <option value="">Select column</option>
              {selectedTableData?.columns.map((column) => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center">
              <input
                id={`required-body-${index}`}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={param.required}
                onChange={(e) =>
                  updateBodyParam(index, "required", e.target.checked)
                }
              />
              <label
                htmlFor={`required-body-${index}`}
                className="ml-2 block text-sm text-gray-700"
              >
                Required
              </label>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="ml-4 text-red-600 hover:text-red-900"
          onClick={() => removeBodyParam(index)}
        >
          <Trash size={16} />
        </button>
      </div>

      {renderOptionsForType(param.type, index, false)}
    </div>
  );
};

export default BodyParameter;
