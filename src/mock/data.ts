import { faker } from '@faker-js/faker';

// Seed the faker to get consistent results
faker.seed(123);

export interface Project {
  id: string;
  name: string;
  description: string;
  databaseType: 'MongoDB' | 'PostgreSQL' | 'MySQL' | 'DynamoDB';
  createdAt: string;
  apiCount: number;
}

export interface API {
  id: string;
  projectId: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
}

export interface APIDetail extends API {
  schema: object;
  filters: string[];
  requestSchema: object;
  responseSchema: object;
  version: string;
  avgResponseTime: number;
  uptime: number;
  lastUpdated: string;
}

export interface Metric {
  timestamp: string;
  value: number;
}

export interface DashboardMetrics {
  totalApis: number;
  activeApis: number;
  averageResponseTime: number;
  totalRequests: number;
  uptime: number;
  requestsPerSecond: Metric[];
  responseTimeHistory: Metric[];
  errorRate: Metric[];
  cpuUsage: Metric[];
  memoryUsage: Metric[];
}

// Generate mock projects
export const mockProjects: Project[] = Array.from({ length: 8 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  databaseType: faker.helpers.arrayElement(['MongoDB', 'PostgreSQL', 'MySQL', 'DynamoDB']),
  createdAt: faker.date.past().toISOString(),
  apiCount: faker.number.int({ min: 1, max: 15 }),
}));

// Generate mock APIs for each project
export const mockApis: API[] = mockProjects.flatMap((project) => 
  Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => ({
    id: faker.string.uuid(),
    projectId: project.id,
    name: `${faker.word.adjective()}-${faker.word.noun()}-api`,
    description: faker.lorem.sentence(),
    method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    endpoint: `/api/${faker.word.noun().toLowerCase()}/${faker.helpers.arrayElement(['v1', 'v2'])}/data`,
    status: faker.helpers.arrayElement(['active', 'inactive', 'draft']),
    createdAt: faker.date.past().toISOString(),
  }))
);

// Generate API details
export const getApiDetails = (apiId: string): APIDetail => {
  const api = mockApis.find(api => api.id === apiId) as API;
  
  if (!api) {
    throw new Error(`API with ID ${apiId} not found`);
  }
  
  return {
    ...api,
    schema: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        createdAt: { type: "string", format: "date-time" },
      },
      required: ["id", "name"]
    },
    filters: ["id", "name", "email", "createdAt"],
    requestSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" }
      }
    },
    responseSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" }
            }
          }
        }
      }
    },
    version: faker.system.semver(),
    avgResponseTime: faker.number.float({ min: 20, max: 500, precision: 0.01 }),
    uptime: faker.number.float({ min: 99, max: 100, precision: 0.01 }),
    lastUpdated: faker.date.recent().toISOString()
  };
};

// Generate dashboard metrics
export const getDashboardMetrics = (): DashboardMetrics => {
  const now = new Date();
  const generateTimePoints = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(now);
      date.setHours(now.getHours() - (count - i));
      return date.toISOString();
    });
  };

  const timePoints = generateTimePoints(24);
  
  return {
    totalApis: mockApis.length,
    activeApis: mockApis.filter(api => api.status === 'active').length,
    averageResponseTime: faker.number.float({ min: 50, max: 300, precision: 0.01 }),
    totalRequests: faker.number.int({ min: 10000, max: 1000000 }),
    uptime: faker.number.float({ min: 99, max: 100, precision: 0.01 }),
    requestsPerSecond: timePoints.map(timestamp => ({
      timestamp,
      value: faker.number.float({ min: 10, max: 100, precision: 0.1 })
    })),
    responseTimeHistory: timePoints.map(timestamp => ({
      timestamp,
      value: faker.number.float({ min: 50, max: 400, precision: 1 })
    })),
    errorRate: timePoints.map(timestamp => ({
      timestamp,
      value: faker.number.float({ min: 0, max: 5, precision: 0.01 })
    })),
    cpuUsage: timePoints.map(timestamp => ({
      timestamp,
      value: faker.number.float({ min: 10, max: 80, precision: 0.1 })
    })),
    memoryUsage: timePoints.map(timestamp => ({
      timestamp,
      value: faker.number.float({ min: 20, max: 70, precision: 0.1 })
    })),
  };
};

// Helper function to get APIs for a specific project
export const getProjectApis = (projectId: string): API[] => {
  return mockApis.filter(api => api.projectId === projectId);
};

// Helper function to get a specific project
export const getProject = (projectId: string): Project | undefined => {
  return mockProjects.find(project => project.id === projectId);
};

// Helper function to get a specific API
export const getApi = (apiId: string): API | undefined => {
  return mockApis.find(api => api.id === apiId);
};