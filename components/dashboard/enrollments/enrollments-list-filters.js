'use client';

import {useEffect, useState, useRef} from 'react';
import {Search} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {useGetCoursesQuery, useGetCohortsQuery} from '@/services/api';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {format} from 'date-fns';
import {cn} from '@/lib/utils';

export function EnrollmentListFilters({onChange = () => {}}) {
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState('all');
  const [gender, setGender] = useState('all');
  const [dateRange, setDateRange] = useState({from: null, to: null});
  const [activeFilters, setActiveFilters] = useState(0);

  const {data: coursesData, isLoading: coursesLoading} = useGetCoursesQuery();
  const {data: cohortsData, isLoading: cohortsLoading} = useGetCohortsQuery({
    page: 0,
  });

  const isInitialMount = useRef(true);
  const prevFilters = useRef({
    search,
    course,
    status,
    gender,
    dateRange,
  });

  const statusOptions = [
    {label: 'All', value: 'all'},
    {label: 'Active', value: 'active'},
    {label: 'Completed', value: 'completed'},
    {label: 'Expired', value: 'expired'},
    {label: 'Pending', value: 'pending'},
  ];

  const genderOptions = [
    {label: 'All', value: 'all'},
    {label: 'Male', value: 'MALE'},
    {label: 'Female', value: 'FEMALE'},
  ];

  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check if filters actually changed to avoid unnecessary updates
    const currentFilters = {search, course, status, gender, dateRange};
    const filtersChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(prevFilters.current);

    if (filtersChanged) {
      // Update active filters count
      let count = 0;
      if (search) count++;
      if (course && course !== 'all') count++;
      if (status && status !== 'all') count++;
      if (gender && gender !== 'all') count++;
      if (dateRange.from || dateRange.to) count++;
      setActiveFilters(count);

      // Call onChange with the current filters
      if (typeof onChange === 'function') {
        onChange({
          search,
          course: course && course !== 'all' ? [course] : [],
          status: status !== 'all' ? status : '',
          gender: gender !== 'all' ? gender : '',
          dateRange,
        });
      }

      // Update the previous filters ref
      prevFilters.current = currentFilters;
    }
  }, [search, course, status, gender, dateRange, onChange]);

  const handleResetFilters = () => {
    setSearch('');
    setCourse('all');
    setStatus('all');
    setGender('all');
    setDateRange({from: null, to: null});
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0'>
        {/* Search */}
        <div className='flex-1'>
          <Label htmlFor='search' className='text-sm'>
            Search
          </Label>
          <div className='relative mt-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              id='search'
              placeholder='Search by name or email...'
              className='pl-8'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Course Filter */}
        <div className='w-full md:w-[200px]'>
          <Label htmlFor='course' className='text-sm'>
            Course
          </Label>
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger id='course' className='mt-1'>
              <SelectValue placeholder='All Courses' />
            </SelectTrigger>
            <SelectContent className="max-h-72 overflow-y-auto custom-scrollbar">
              <SelectItem value='all'>All Courses</SelectItem>
              {coursesLoading ? (
                <div className='flex justify-center p-2'>
                  <LoadingSpinner size='sm' />
                </div>
              ) : (
                coursesData?.courses?.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.slug}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className='w-full md:w-[180px]'>
          <Label htmlFor='status' className='text-sm'>
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id='status' className='mt-1'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className='w-full md:w-[150px]'>
          <Label htmlFor='gender' className='text-sm'>
            Gender
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id='gender' className='mt-1'>
              <SelectValue placeholder='All Genders' />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className='w-full md:w-[200px]'>
          <Label htmlFor='date-range' className='text-sm'>
            Enrollment Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id='date-range'
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal mt-1',
                  !dateRange.from && !dateRange.to && 'text-muted-foreground',
                )}>
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Select date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={range =>
                  setDateRange({
                    from: range?.from || null,
                    to: range?.to || null,
                  })
                }
                numberOfMonths={2}
              />
              <div className='flex items-center justify-between p-3 border-t'>
                <Button
                  variant='ghost'
                  onClick={() => setDateRange({from: null, to: null})}
                  size='sm'>
                  Clear
                </Button>
                <Button
                  size='sm'
                  onClick={() => {
                    const today = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    setDateRange({from: thirtyDaysAgo, to: today});
                  }}>
                  Last 30 Days
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters > 0 && (
        <div className='flex items-center justify-between pt-2'>
          <div className='flex flex-wrap gap-2'>
            {search && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Search: {search}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setSearch('')}>
                  ✕
                </button>
              </Badge>
            )}
            {course && course !== 'all' && coursesData?.courses && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Course:{' '}
                {coursesData.courses.find(c => c.id === course)?.slug || course}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setCourse('all')}>
                  ✕
                </button>
              </Badge>
            )}
            {status && status !== 'all' && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Status:{' '}
                {statusOptions.find(s => s.value === status)?.label || status}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setStatus('all')}>
                  ✕
                </button>
              </Badge>
            )}
            {gender && gender !== 'all' && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Gender:{' '}
                {genderOptions.find(g => g.value === gender)?.label || gender}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setGender('all')}>
                  ✕
                </button>
              </Badge>
            )}
            {(dateRange.from || dateRange.to) && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Date: {dateRange.from ? format(dateRange.from, 'MMM d') : 'Any'}
                {' - '}
                {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Any'}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setDateRange({from: null, to: null})}>
                  ✕
                </button>
              </Badge>
            )}
          </div>
          <Button variant='ghost' size='sm' onClick={handleResetFilters}>
            Reset All
          </Button>
        </div>
      )}

      <Separator />
    </div>
  );
}
