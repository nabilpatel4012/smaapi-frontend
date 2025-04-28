// components/api/BasicInfoForm.tsx
import React from "react";
import { mockTables } from "../../mock/mockTables";

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
  selectedTable: string;
  setSelectedTable: (value: string) => void;
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
        <label className="block text-sm font-medium text-gray-700">Table</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Select a table</option>
          {mockTables.map((table) => (
            <option key={table.id} value={table.name}>
              {table.name}
            </option>
          ))}
        </select>
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
