import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const LocationTrendsChart = ({data, colors}) => {
  // Use location trends from API or fallback to sample data
  const trendData = data?.location_trends || [];

  // Check if we have any data
  const hasData = trendData && trendData.length > 0;

  // Get all location keys from the first item (excluding 'month')
  const getLocationKeys = () => {
    if (!hasData) return [];
    return Object.keys(trendData[0]).filter(key => key !== 'month');
  };

  const locationKeys = getLocationKeys();

  // Color mapping for locations
  const locationColorMap = {
    Lagos: colors.primary,
    Kaduna: colors.secondary,
    Ogun: colors.tertiary,
    Abuja: colors.info,
    Rivers: colors.warning,
  };

  // Get color for a location (with fallback)
  const getLocationColor = location => {
    return (
      locationColorMap[location] ||
      colors[
        Object.keys(colors).find(
          key =>
            typeof colors[key] === 'string' &&
            !Object.values(locationColorMap).includes(colors[key]),
        )
      ] ||
      '#' + Math.floor(Math.random() * 16777215).toString(16)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trends by Location</CardTitle>
        <CardDescription>
          Monthly enrollment growth by top locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className='flex items-center justify-center h-[350px]'>
            <p className='text-muted-foreground'>
              No location trends data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={350}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip />
              <Legend />
              {locationKeys.map(location => (
                <Area
                  key={location}
                  type='monotone'
                  dataKey={location}
                  stackId='1'
                  stroke={getLocationColor(location)}
                  fill={getLocationColor(location)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTrendsChart;
