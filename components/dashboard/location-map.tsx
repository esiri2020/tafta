'use client';

import {useEffect, useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LocationMapProps {
  locationData: {
    location: string;
    count: string | number;
  }[];
}

export function LocationMap({locationData}: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // This would be where you'd initialize a map library like Leaflet or Google Maps
    // For this example, we're just simulating the map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Applicant distribution across Nigeria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted'>
          {!mapLoaded ? (
            <div className='flex h-full items-center justify-center'>
              <span className='text-sm text-muted-foreground'>
                Loading map...
              </span>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center bg-slate-100'>
              <span className='text-sm text-muted-foreground'>
                Map visualization would be displayed here with data points for
                each location
              </span>
            </div>
          )}
        </div>
        <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
          {locationData.slice(0, 6).map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <span>{item.location}</span>
              <span className='font-medium'>{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
