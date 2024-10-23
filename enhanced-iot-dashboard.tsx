import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gauge, 
  AlertTriangle, 
  Battery, 
  Thermometer,
  Settings,
  PlusCircle,
  TrashIcon,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState({
    temperature: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
      value: 20 + Math.random() * 5
    })),
    humidity: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
      value: 45 + Math.random() * 10
    })),
    pressure: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
      value: 1000 + Math.random() * 20
    })),
    energyConsumption: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
      value: 50 + Math.random() * 30
    })),
    batteryLevel: 85,
    lastUpdate: new Date().toLocaleTimeString(),
    deviceStatus: 'online',
    alerts: []
  });

  const systemHealthData = [
    { name: 'Healthy', value: 85, fill: '#22c55e' },
    { name: 'Warning', value: 10, fill: '#f59e0b' },
    { name: 'Critical', value: 5, fill: '#ef4444' }
  ];

  // Update data less frequently and maintain smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setDeviceData(prev => ({
        ...prev,
        temperature: [...prev.temperature.slice(1), {
          time: now.toLocaleTimeString(),
          value: 20 + Math.random() * 5
        }],
        humidity: [...prev.humidity.slice(1), {
          time: now.toLocaleTimeString(),
          value: 45 + Math.random() * 10
        }],
        pressure: [...prev.pressure.slice(1), {
          time: now.toLocaleTimeString(),
          value: 1000 + Math.random() * 20
        }],
        energyConsumption: [...prev.energyConsumption.slice(1), {
          time: now.toLocaleTimeString(),
          value: 50 + Math.random() * 30
        }],
        lastUpdate: now.toLocaleTimeString()
      }));
    }, 5000); // Increased update interval to 5 seconds

    return () => clearInterval(interval);
  }, []);

  const DeviceMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4" />
              <span>Temperature Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={300} height={200} data={deviceData.temperature}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8"
                isAnimationActive={false}
              />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="h-4 w-4" />
              <span>Energy Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={300} height={200} data={deviceData.energyConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#82ca9d"
                isAnimationActive={false}
              />
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart width={300} height={200}>
              <Pie
                data={systemHealthData}
                cx={150}
                cy={85}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                isAnimationActive={false}
                label={({ name, value }) => `${name} ${value}%`}
              />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deviceData.alerts.length === 0 ? (
              <div className="text-sm text-gray-500">No active alerts</div>
            ) : (
              deviceData.alerts.map((alert, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert}</AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DeviceManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registered Devices</span>
            <Button size="sm" className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Device</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-gray-500">{device.id}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Update Interval (seconds)</label>
              <Input type="number" defaultValue={30} />
            </div>
            <div>
              <label className="text-sm font-medium">Alert Thresholds</label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Temperature (°C)" />
                <Input placeholder="Humidity (%)" />
              </div>
            </div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">IoT Device Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <div className="text-sm text-gray-500">
            Last update: {deviceData.lastUpdate}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="management">Device Management</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring">
          <DeviceMonitoring />
        </TabsContent>
        <TabsContent value="management">
          <DeviceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
