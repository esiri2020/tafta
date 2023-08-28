import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Divider, Input, Typography } from '@mui/material';
import { useUpdateEffect } from '../../../hooks/use-update-effect';
import { Search as SearchIcon } from '../../../icons/search';
import { MultiSelect } from '../../multi-select';
import { useGetCoursesQuery, useGetCohortsQuery } from '../../../services/api'
import { SplashScreen } from '../../splash-screen';


const statusOptions = [
  {
    label: 'Active',
    value: 'active'
  },
  {
    label: 'Completed',
    value: 'completed'
  },
  {
    label: 'Expired',
    value: 'expired'
  }
];


export const EnrollmentListFilters = (props) => {
  const { onChange, ...other } = props;
  const [queryValue, setQueryValue] = useState('');
  const [filterItems, setFilterItems] = useState([]);
  const { data, error, isLoading } = useGetCoursesQuery()
  const { data: cohortData, cohortIsLoading } = useGetCohortsQuery({ page: 0 })
  const [courseOptions, setCourseOptions] = useState([])
  const [cohortOptions, setCohortOptions] = useState([])


  useUpdateEffect(() => {
    const filters = {
      name: undefined,
      course: [],
      status: '',
      cohort: []
    };

    if (data?.courses) {
      const options = data.courses.map(e => ({ label: e.slug, value: e.id }))
      setCourseOptions(options)
    }

    if (cohortData?.cohorts.length > 0) {
      const options = cohortData.cohorts.map(e => ({ label: e.name, value: e.id }))
      setCohortOptions(options);
    }

    // Transform the filter items in an object that can be used by the parent component to call the
    // serve with the updated filters
    filterItems.forEach((filterItem) => {
      switch (filterItem.field) {
        case 'name':
          // There will (or should) be only one filter item with field "name"
          // so we can set up it directly
          filters.name = filterItem.value;
          break;
        case 'course':
          filters.course.push(filterItem.value);
          break;
        case 'status':
          filters.status = filterItem.value;
          break;
        case 'cohort':
          filters.cohort.push(filterItem.value);
          break;
        default:
          break;
      }
    });

    onChange?.(filters);
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterItems, data, cohortData]);

  const handleDelete = (filterItem) => {
    setFilterItems((prevState) => prevState.filter((_filterItem) => {
      return !(filterItem.field === _filterItem.field && filterItem.value === _filterItem.value);
    }));
  };

  const handleQueryChange = (event) => {
    setQueryValue(event.target.value);
  };

  const handleQueryKeyup = (event) => {
    if (event.code === 'Enter' && queryValue) {
      // We only allow one chip for the name field

      const filterItem = filterItems.find((filterItem) => filterItem.field === 'name');

      if (filterItem) {
        setFilterItems((prevState => prevState.map((filterItem) => {
          if (filterItem.field === 'name') {
            return {
              ...filterItem,
              value: queryValue
            };
          }

          return filterItem;
        })));
      } else {
        setFilterItems((prevState) => [
          ...prevState,
          {
            label: 'Name',
            field: 'name',
            value: queryValue
          }
        ]);
      }

      setQueryValue('');
    }
  };

  const handleCourseChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== 'course') {
          return true;
        }

        const found = values.includes(filterItem.value);

        if (found) {
          valuesFound.push(filterItem.value);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newFilterItems;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = courseOptions.find((option) => option.value === value);

          newFilterItems.push({
            label: 'Course',
            field: 'course',
            value,
            displayValue: option.label
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleStatusChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => filterItem.field !== 'status');
      const latestValue = values[values.length - 1];

      switch (latestValue) {
        case 'active':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'active',
            displayValue: 'Active'
          });
          break;
        case 'completed':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'completed',
            displayValue: 'Completed'
          });
          break;
        case 'expired':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'expired',
            displayValue: 'Expired'
          });
          break;

        default:
          break;
      }

      return newFilterItems;
    });
  };

  const handleCohortChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== 'cohort') {
          return true;
        }

        const found = values.includes(filterItem.value);

        if (found) {
          valuesFound.push(filterItem.value);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newFilterItems;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = cohortOptions.find((option) => option.value === value);

          newFilterItems.push({
            label: 'Cohort',
            field: 'cohort',
            value,
            displayValue: option.label
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleStockChange = (values) => {
    // Stock can only have one value, even if displayed as multi-select, so we select the first one.
    // This example allows you to select one value or "All", which is not included in the
    // rest of multi-selects.

    setFilterItems((prevState) => {
      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => filterItem.field !== 'inStock');
      const latestValue = values[values.length - 1];

      switch (latestValue) {
        case 'available':
          newFilterItems.push({
            label: 'Stock',
            field: 'inStock',
            value: 'available',
            displayValue: 'Available'
          });
          break;
        case 'outOfStock':
          newFilterItems.push({
            label: 'Stock',
            field: 'inStock',
            value: 'outOfStock',
            displayValue: 'Out of Stock'
          });
          break;
        default:
          // Should be "all", so we do not add this filter
          break;
      }

      return newFilterItems;
    });
  };

  // We memoize this part to prevent re-render issues
  const courseValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'course')
    .map((filterItems) => filterItems.value), [filterItems]);

  const statusValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'status')
    .map((filterItems) => filterItems.value), [filterItems]);

  const cohortValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'cohort')
    .map((filterItems) => filterItems.value), [filterItems]);

  // const stockValues = useMemo(() => {
  //   const values = filterItems
  //     .filter((filterItems) => filterItems.field === 'inStock')
  //     .map((filterItems) => filterItems.value);

  //   // Since we do not display the "all" as chip, we add it to the multi-select as a selected value
  //   if (values.length === 0) {
  //     values.unshift('all');
  //   }

  //   return values;
  // }, [filterItems]);
  if (isLoading) return (<SplashScreen />)
  if (!data) return (<div>No Data!</div>);

  return (
    <div {...other}>
      {filterItems.length > 0
        ? (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              p: 2
            }}
          >
            {filterItems.map((filterItem, i) => (
              <Chip
                key={i}
                label={(
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      '& span': {
                        fontWeight: 600
                      }
                    }}
                  >
                    <>
                      <span>
                        {filterItem.label}
                      </span>
                      :
                      {' '}
                      {filterItem.displayValue || filterItem.value}
                    </>
                  </Box>
                )}
                onDelete={() => handleDelete(filterItem)}
                sx={{ m: 1 }}
                variant="outlined"
              />
            ))}
          </Box>
        )
        : (
          <Box sx={{ p: 3 }}>
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              No filters applied
            </Typography>
          </Box>
        )}
      <Divider />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          p: 1
        }}
      >
        <MultiSelect
          label="Course"
          onChange={handleCourseChange}
          options={courseOptions}
          value={courseValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={statusOptions}
          value={statusValues}
        />
        <MultiSelect
          label="Cohort"
          onChange={handleCohortChange}
          options={cohortOptions}
          value={cohortValues}
        />
      </Box>
    </div>
  );
};

EnrollmentListFilters.propTypes = {
  onChange: PropTypes.func
};
