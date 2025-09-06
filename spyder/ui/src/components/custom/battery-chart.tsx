'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface VehicleData {
  battery_temperature: number;
  timestamp: number;
}

interface BatteryChartProps {
  data: VehicleData[];
  maxDataPoints?: number;
}

const BatteryChart: React.FC<BatteryChartProps> = ({ 
  data, 
  maxDataPoints = 50 
}) => {
  // Keep only the latest data points for performance
  const chartData = data
    .slice(-maxDataPoints)
    .map((item) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString(),
      temp: Number(item.battery_temperature)
    }));

  // Custom tooltip to show exact values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const temp = payload[0].value;
      const isOutOfRange = temp < 20 || temp > 80;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{`Time: ${label}`}</p>
          <p className={`font-semibold ${
            isOutOfRange 
              ? 'text-destructive' 
              : 'text-success'
          }`}>
            {`Temperature: ${temp}°C`}
          </p>
          {isOutOfRange && (
            <p className="text-destructive text-sm">⚠️ Out of safe range!</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot to highlight out-of-range values
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const temp = payload.temp;
    const isOutOfRange = temp < 20 || temp > 80;
    
    if (isOutOfRange) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="hsl(var(--destructive))"
          stroke="hsl(var(--destructive-foreground))"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Battery Temperature Over Time
        </h3>
        <p className="text-sm text-muted-foreground">
          Safe range: 20°C - 80°C | Showing last {chartData.length} readings
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
          />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{ 
              value: 'Temperature (°C)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          
          {/* Safe range reference lines */}
          <ReferenceLine 
            y={20} 
            stroke="hsl(var(--success))" 
            strokeDasharray="5 5"
            label={{ value: "Min Safe (20°C)", position: "right" }}
          />
          <ReferenceLine 
            y={80} 
            stroke="hsl(var(--success))" 
            strokeDasharray="5 5"
            label={{ value: "Max Safe (80°C)", position: "right" }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            type="monotone"
            dataKey="temp"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={<CustomDot />}
            name="Battery Temperature"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BatteryChart;