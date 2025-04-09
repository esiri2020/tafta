// import { useMemo, useState } from 'react';
// import PropTypes from 'prop-types';
// import { Box, Chip, Divider, Input, Typography } from '@mui/material';
// import { useUpdateEffect } from '../../../hooks/use-update-effect';
// import { Search as SearchIcon } from '../../../icons/search';
// import { MultiSelect } from '../../multi-select';
// import { useGetCoursesQuery, useGetCohortsQuery } from '../../../services/api'
// import { SplashScreen } from '../../splash-screen';

// const statusOptions = [
//   {
//     label: 'Active',
//     value: 'active'
//   },
//   {
//     label: 'Completed',
//     value: 'completed'
//   },
//   {
//     label: 'Expired',
//     value: 'expired'
//   }
// ];

// export const EnrollmentListFilters = (props) => {
//   const { onChange, ...other } = props;
//   const [queryValue, setQueryValue] = useState('');
//   const [filterItems, setFilterItems] = useState([]);
//   const { data, error, isLoading } = useGetCoursesQuery()
//   const { data: cohortData, cohortIsLoading } = useGetCohortsQuery({ page: 0 })
//   const [courseOptions, setCourseOptions] = useState([])
//   const [cohortOptions, setCohortOptions] = useState([])

//   useUpdateEffect(() => {
//     const filters = {
//       name: undefined,
//       course: [],
//       status: '',
//       cohort: []
//     };

//     if (data?.courses) {
//       const options = data.courses.map(e => ({ label: e.slug, value: e.id }))
//       setCourseOptions(options)
//     }

//     if (cohortData?.cohorts.length > 0) {
//       const options = cohortData.cohorts.map(e => ({ label: e.name, value: e.id }))
//       setCohortOptions(options);
//     }

//     // Transform the filter items in an object that can be used by the parent component to call the
//     // serve with the updated filters
//     filterItems.forEach((filterItem) => {
//       switch (filterItem.field) {
//         case 'name':
//           // There will (or should) be only one filter item with field "name"
//           // so we can set up it directly
//           filters.name = filterItem.value;
//           break;
//         case 'course':
//           filters.course.push(filterItem.value);
//           break;
//         case 'status':
//           filters.status = filterItem.value;
//           break;
//         case 'cohort':
//           filters.cohort.push(filterItem.value);
//           break;
//         default:
//           break;
//       }
//     });

//     onChange?.(filters);
//   },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [filterItems, data, cohortData]);

//   const handleDelete = (filterItem) => {
//     setFilterItems((prevState) => prevState.filter((_filterItem) => {
//       return !(filterItem.field === _filterItem.field && filterItem.value === _filterItem.value);
//     }));
//   };

//   const handleQueryChange = (event) => {
//     setQueryValue(event.target.value);
//   };

//   const handleQueryKeyup = (event) => {
//     if (event.code === 'Enter' && queryValue) {
//       // We only allow one chip for the name field

//       const filterItem = filterItems.find((filterItem) => filterItem.field === 'name');

//       if (filterItem) {
//         setFilterItems((prevState => prevState.map((filterItem) => {
//           if (filterItem.field === 'name') {
//             return {
//               ...filterItem,
//               value: queryValue
//             };
//           }

//           return filterItem;
//         })));
//       } else {
//         setFilterItems((prevState) => [
//           ...prevState,
//           {
//             label: 'Name',
//             field: 'name',
//             value: queryValue
//           }
//         ]);
//       }

//       setQueryValue('');
//     }
//   };

//   const handleCourseChange = (values) => {
//     setFilterItems((prevState) => {
//       const valuesFound = [];

//       // First cleanup the previous filter items
//       const newFilterItems = prevState.filter((filterItem) => {
//         if (filterItem.field !== 'course') {
//           return true;
//         }

//         const found = values.includes(filterItem.value);

//         if (found) {
//           valuesFound.push(filterItem.value);
//         }

//         return found;
//       });

//       // Nothing changed
//       if (values.length === valuesFound.length) {
//         return newFilterItems;
//       }

//       values.forEach((value) => {
//         if (!valuesFound.includes(value)) {
//           const option = courseOptions.find((option) => option.value === value);

//           newFilterItems.push({
//             label: 'Course',
//             field: 'course',
//             value,
//             displayValue: option.label
//           });
//         }
//       });

//       return newFilterItems;
//     });
//   };

//   const handleStatusChange = (values) => {
//     setFilterItems((prevState) => {
//       const valuesFound = [];

//       // First cleanup the previous filter items
//       const newFilterItems = prevState.filter((filterItem) => filterItem.field !== 'status');
//       const latestValue = values[values.length - 1];

//       switch (latestValue) {
//         case 'active':
//           newFilterItems.push({
//             label: 'Status',
//             field: 'status',
//             value: 'active',
//             displayValue: 'Active'
//           });
//           break;
//         case 'completed':
//           newFilterItems.push({
//             label: 'Status',
//             field: 'status',
//             value: 'completed',
//             displayValue: 'Completed'
//           });
//           break;
//         case 'expired':
//           newFilterItems.push({
//             label: 'Status',
//             field: 'status',
//             value: 'expired',
//             displayValue: 'Expired'
//           });
//           break;

//         default:
//           break;
//       }

//       return newFilterItems;
//     });
//   };

//   const handleCohortChange = (values) => {
//     setFilterItems((prevState) => {
//       const valuesFound = [];

//       // First cleanup the previous filter items
//       const newFilterItems = prevState.filter((filterItem) => {
//         if (filterItem.field !== 'cohort') {
//           return true;
//         }

//         const found = values.includes(filterItem.value);

//         if (found) {
//           valuesFound.push(filterItem.value);
//         }

//         return found;
//       });

//       // Nothing changed
//       if (values.length === valuesFound.length) {
//         return newFilterItems;
//       }

//       values.forEach((value) => {
//         if (!valuesFound.includes(value)) {
//           const option = cohortOptions.find((option) => option.value === value);

//           newFilterItems.push({
//             label: 'Cohort',
//             field: 'cohort',
//             value,
//             displayValue: option.label
//           });
//         }
//       });

//       return newFilterItems;
//     });
//   };

//   const handleStockChange = (values) => {
//     // Stock can only have one value, even if displayed as multi-select, so we select the first one.
//     // This example allows you to select one value or "All", which is not included in the
//     // rest of multi-selects.

//     setFilterItems((prevState) => {
//       // First cleanup the previous filter items
//       const newFilterItems = prevState.filter((filterItem) => filterItem.field !== 'inStock');
//       const latestValue = values[values.length - 1];

//       switch (latestValue) {
//         case 'available':
//           newFilterItems.push({
//             label: 'Stock',
//             field: 'inStock',
//             value: 'available',
//             displayValue: 'Available'
//           });
//           break;
//         case 'outOfStock':
//           newFilterItems.push({
//             label: 'Stock',
//             field: 'inStock',
//             value: 'outOfStock',
//             displayValue: 'Out of Stock'
//           });
//           break;
//         default:
//           // Should be "all", so we do not add this filter
//           break;
//       }

//       return newFilterItems;
//     });
//   };

//   // We memoize this part to prevent re-render issues
//   const courseValues = useMemo(() => filterItems
//     .filter((filterItems) => filterItems.field === 'course')
//     .map((filterItems) => filterItems.value), [filterItems]);

//   const statusValues = useMemo(() => filterItems
//     .filter((filterItems) => filterItems.field === 'status')
//     .map((filterItems) => filterItems.value), [filterItems]);

//   const cohortValues = useMemo(() => filterItems
//     .filter((filterItems) => filterItems.field === 'cohort')
//     .map((filterItems) => filterItems.value), [filterItems]);

//   // const stockValues = useMemo(() => {
//   //   const values = filterItems
//   //     .filter((filterItems) => filterItems.field === 'inStock')
//   //     .map((filterItems) => filterItems.value);

//   //   // Since we do not display the "all" as chip, we add it to the multi-select as a selected value
//   //   if (values.length === 0) {
//   //     values.unshift('all');
//   //   }

//   //   return values;
//   // }, [filterItems]);
//   if (isLoading) return (<SplashScreen />)
//   if (!data) return (<div>No Data!</div>);

//   return (
//     <div {...other}>
//       {filterItems.length > 0
//         ? (
//           <Box
//             sx={{
//               alignItems: 'center',
//               display: 'flex',
//               flexWrap: 'wrap',
//               p: 2
//             }}
//           >
//             {filterItems.map((filterItem, i) => (
//               <Chip
//                 key={i}
//                 label={(
//                   <Box
//                     sx={{
//                       alignItems: 'center',
//                       display: 'flex',
//                       '& span': {
//                         fontWeight: 600
//                       }
//                     }}
//                   >
//                     <>
//                       <span>
//                         {filterItem.label}
//                       </span>
//                       :
//                       {' '}
//                       {filterItem.displayValue || filterItem.value}
//                     </>
//                   </Box>
//                 )}
//                 onDelete={() => handleDelete(filterItem)}
//                 sx={{ m: 1 }}
//                 variant="outlined"
//               />
//             ))}
//           </Box>
//         )
//         : (
//           <Box sx={{ p: 3 }}>
//             <Typography
//               color="textSecondary"
//               variant="subtitle2"
//             >
//               No filters applied
//             </Typography>
//           </Box>
//         )}
//       <Divider />
//       <Box
//         sx={{
//           alignItems: 'center',
//           display: 'flex',
//           flexWrap: 'wrap',
//           p: 1
//         }}
//       >
//         <MultiSelect
//           label="Course"
//           onChange={handleCourseChange}
//           options={courseOptions}
//           value={courseValues}
//         />
//         <MultiSelect
//           label="Status"
//           onChange={handleStatusChange}
//           options={statusOptions}
//           value={statusValues}
//         />
//         <MultiSelect
//           label="Cohort"
//           onChange={handleCohortChange}
//           options={cohortOptions}
//           value={cohortValues}
//         />
//       </Box>
//     </div>
//   );
// };

// EnrollmentListFilters.propTypes = {
//   onChange: PropTypes.func
// };
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


export function EnrollmentListFilters({onChange}) {
  const [search, setSearch] = useState('');
  // Initialize state with "all" instead of empty string
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState('all');
  const [cohort, setCohort] = useState('all');
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
    cohort,
    gender,
    dateRange,
  });

  // Change the statusOptions array to use "all" instead of empty string
  const statusOptions = [
    {label: 'All', value: 'all'},
    {label: 'Active', value: 'active'},
    {label: 'Completed', value: 'completed'},
    {label: 'Expired', value: 'expired'},
    {label: 'Pending', value: 'pending'},
  ];

  // Change the genderOptions array to use "all" instead of empty string
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
    const currentFilters = {search, course, status, cohort, gender, dateRange};
    const filtersChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(prevFilters.current);

    if (filtersChanged) {
      // Update active filters count
      let count = 0;
      if (search) count++;
      if (course && course !== 'all') count++;
      if (status && status !== 'all') count++;
      if (cohort && cohort !== 'all') count++;
      if (gender && gender !== 'all') count++;
      if (dateRange.from || dateRange.to) count++;
      setActiveFilters(count);

      // Call onChange with the current filters
      onChange({
        search,
        course: course && course !== 'all' ? [course] : [],
        status: status !== 'all' ? status : '',
        cohort: cohort && cohort !== 'all' ? [cohort] : [],
        gender: gender !== 'all' ? gender : '',
        dateRange,
      });

      // Update the previous filters ref
      prevFilters.current = currentFilters;
    }
  }, [search, course, status, cohort, gender, dateRange, onChange]);

  const handleResetFilters = () => {
    setSearch('');
    setCourse('all');
    setStatus('all');
    setCohort('all');
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
            <SelectContent>
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
          {/* For the Status Select */}
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

        {/* Cohort Filter */}
        <div className='w-full md:w-[200px]'>
          <Label htmlFor='cohort' className='text-sm'>
            Cohort
          </Label>
          <Select value={cohort} onValueChange={setCohort}>
            <SelectTrigger id='cohort' className='mt-1'>
              <SelectValue placeholder='All Cohorts' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Cohorts</SelectItem>
              {cohortsLoading ? (
                <div className='flex justify-center p-2'>
                  <LoadingSpinner size='sm' />
                </div>
              ) : (
                cohortsData?.cohorts?.map(cohort => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className='w-full md:w-[150px]'>
          <Label htmlFor='gender' className='text-sm'>
            Gender
          </Label>
          {/* For the Gender Select */}
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
            {course && coursesData?.courses && (
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
            {cohort && cohortsData?.cohorts && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Cohort:{' '}
                {cohortsData.cohorts.find(c => c.id === cohort)?.name || cohort}
                <button
                  className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onClick={() => setCohort('all')}>
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
