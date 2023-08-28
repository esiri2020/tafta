import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Divider, Input, Typography } from '@mui/material';
import { useUpdateEffect } from '../../../hooks/use-update-effect';
import { Search as SearchIcon } from '../../../icons/search';
import { MultiSelect } from '../../multi-select';
import { useGetCohortsQuery } from '../../../services/api'


export const ViewReportsFilters = (props) => {
  const { onChange, ...other } = props;
  const [queryValue, setQueryValue] = useState('');
  const [filterItems, setFilterItems] = useState([]);
  const { data, error, isLoading } = useGetCohortsQuery({ page: 0 })
  const [cohortOptions, setCohortOptions] = useState([])

  useUpdateEffect(() => {
    const filters = {
      name: undefined,
      cohort: [],
    };
    if (isLoading === false && data?.cohorts?.length) {
      let cohorts = data.cohorts.map(cohort => ({
        id: cohort.id,
        label: cohort.name,
        value: cohort.id
      }))
      setCohortOptions(cohorts)
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
        case 'cohort':
          filters.cohort.push(filterItem.value);
          break;
        case 'staff':
          filters.staff.push(filterItem.value);
          break;
        case 'inStock':
          // The value can be "available" or "outOfStock" and we transform it to a boolean
          filters.inStock = filterItem.value === 'available';
          break;
        default:
          break;
      }
    });

    onChange?.(filters);
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterItems, isLoading, data]);

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
            label: 'Email',
            field: 'name',
            value: queryValue
          }
        ]);
      }

      setQueryValue('');
    }
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

  // We memoize this part to prevent re-render issues
  const cohortValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'cohort')
    .map((filterItems) => filterItems.value), [filterItems]);

  const staffValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'staff')
    .map((filterItems) => filterItems.value), [filterItems]);

  const stockValues = useMemo(() => {
    const values = filterItems
      .filter((filterItems) => filterItems.field === 'inStock')
      .map((filterItems) => filterItems.value);

    // Since we do not display the "all" as chip, we add it to the multi-select as a selected value
    if (values.length === 0) {
      values.unshift('all');
    }

    return values;
  }, [filterItems]);

  return (
    <div {...other}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          p: 2
        }}
      >
        <SearchIcon fontSize="small" />
        <Box
          sx={{
            flexGrow: 1,
            ml: 3
          }}
        >
          <Input
            disableUnderline
            fullWidth
            onChange={handleQueryChange}
            onKeyUp={handleQueryKeyup}
            placeholder="Search by user email"
            value={queryValue}
          />
        </Box>
      </Box>
      <Divider />
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
          label="Cohort"
          onChange={handleCohortChange}
          options={cohortOptions}
          value={cohortValues}
        />
      </Box>
    </div>
  );
};

ViewReportsFilters.propTypes = {
  onChange: PropTypes.func
};
