// components/api/BasicInfoForm.tsx
import React from "react";
import { mockTables } from "../../mock/mockTables";
import { Table } from "../tables/table.types";

interface BasicInfoFormProps {
  apiName: string;
  setApiName: (value: string) => void;
  apiDescription: string;
  setApiDescription: (value: string) => void;
  httpMethod: string;
  setHttpMethod: (value: string) => void;
  endpointPath: string;
  setEndpointPath: (value: string) => void;
  endpointDescription: string;
  setEndpointDescription: (value: string) => void;
  selectedTable: Table | "";
  setSelectedTable: (value: Table | "") => void;
  tables: Table[];
  isLoadingTables: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  apiName,
  setApiName,
  apiDescription,
  setApiDescription,
  httpMethod,
  setHttpMethod,
  endpointPath,
  setEndpointPath,
  endpointDescription,
  setEndpointDescription,
  selectedTable,
  setSelectedTable,
  tables,
  isLoadingTables,
}) => {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          API Name
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
          placeholder="CreateUser, GetProducts, etc."
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          API Description
        </label>
        <textarea
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={apiDescription}
          onChange={(e) => setApiDescription(e.target.value)}
          placeholder="Brief description of what this API does"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          HTTP Method
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={httpMethod}
          onChange={(e) => setHttpMethod(e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Endpoint Path
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={endpointPath}
          onChange={(e) => setEndpointPath(e.target.value)}
          placeholder="/users, /products/:id, etc."
        />
      </div>

      <div>
        <label
          htmlFor="table"
          className="block text-sm font-medium text-gray-700"
        >
          Table
        </label>
        <select
          id="table"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={selectedTable ? selectedTable.id : ""}
          onChange={(e) => {
            const selected = tables.find(
              (table) => table.id === e.target.value
            );
            setSelectedTable(selected || "");
          }}
          disabled={isLoadingTables}
        >
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>
        {isLoadingTables && (
          <p className="mt-1 text-sm text-gray-500">Loading tables...</p>
        )}
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Endpoint Description
        </label>
        <textarea
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={endpointDescription}
          onChange={(e) => setEndpointDescription(e.target.value)}
          placeholder="Detailed description of this endpoint"
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
