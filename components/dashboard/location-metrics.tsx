import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationMetricsProps {
  data: {
    states: Array<{
      state: string;
      courses: Array<{
        course: string;
        female: number;
        male: number;
        total: number;
      }>;
      total: number;
    }>;
  };
}

const formatNumber = (num: number): string => {
  return Number(num).toLocaleString();
};

export const LocationMetrics: React.FC<LocationMetricsProps> = ({ data }) => {
  // Filter for Lagos, Ogun, and Kano
  const targetStates = ['Lagos', 'Ogun', 'Kano'];
  const filteredStates = data.states.filter(state => 
    targetStates.includes(state.state)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Location Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredStates.map((state) => (
          <Card key={state.state}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {state.state}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.courses.map((course) => (
                  <div key={course.course} className="space-y-2">
                    <h3 className="font-medium text-sm">{course.course}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Male: </span>
                        <span className="font-medium">{formatNumber(course.male)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Female: </span>
                        <span className="font-medium">{formatNumber(course.female)}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium">{formatNumber(course.total)}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium">
                    Total Completed: {formatNumber(state.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 