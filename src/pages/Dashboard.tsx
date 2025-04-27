import React from 'react';
import { Line, Bar, AreaChart, Area, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { getDashboardMetrics } from '../mock/data';
import { Activity, TrendingUp, Users, Server, AlertCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const metrics = getDashboardMetrics();
  
  // Format date for charts
  const formatXAxis = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your API performance and usage metrics</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Activity size={16} />}
          >
            View Live Status
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total APIs</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.totalApis}</h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Server className="text-indigo-600 h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <Badge variant="success">{metrics.activeApis} Active</Badge>
            <Badge variant="default" className="ml-2">{metrics.totalApis - metrics.activeApis} Inactive</Badge>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.averageResponseTime.toFixed(2)} ms</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="text-green-600 h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.responseTimeHistory.slice(-12)}>
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Requests Today</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.totalRequests.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600 h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.requestsPerSecond.slice(-12)}>
                <Bar dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Uptime</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.uptime.toFixed(2)}%</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="text-yellow-600 h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${metrics.uptime}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last 30 days</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests per Second</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.requestsPerSecond}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(2)} req/s`, 'Requests']}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4F46E5" 
                  fill="url(#colorReq)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Time (ms)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.responseTimeHistory}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(2)} ms`, 'Response Time']}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6, fill: '#10B981', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Error Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.errorRate}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Error Rate']}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EF4444" 
                  fill="url(#colorErr)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Usage (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.cpuUsage}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  name="CPU"
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  name="Memory"
                  data={metrics.memoryUsage} 
                  dataKey="value" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;