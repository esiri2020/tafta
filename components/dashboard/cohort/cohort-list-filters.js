import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Divider, Input, Typography } from '@mui/material';
import { useUpdateEffect } from '../../../hooks/use-update-effect';
import { MultiSelect } from '../../multi-select';


const statusOptions = [
  {
    label: 'All',
    value: 'undefined'
  },
  {
    label: 'Active',
    value: 'true'
  },
  {
    label: 'Inactive',
    value: 'false'
  }
];

export const CohortListFilters = (props) => {
  const { onChange, ...other } = props;
  const [filterItems, setFilterItems] = useState([]);

  useUpdateEffect(() => {
      const filters = {
        name: undefined,
        status: '',
      };

      // Transform the filter items in an object that can be used by the parent component to call the
      // serve with the updated filters
      filterItems.forEach((filterItem) => {
        switch (filterItem.field) {
          case 'name':
            // There will (or should) be only one filter item with field "name"
            // so we can set up it directly
            filters.name = filterItem.value;
            break;
          case 'status':
            filters.status=filterItem.value;
            break;
          default:
            break;
        }
      });

      onChange?.(filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterItems]);

  const handleDelete = (filterItem) => {
    setFilterItems((prevState) => prevState.filter((_filterItem) => {
      return !(filterItem.field === _filterItem.field && filterItem.value === _filterItem.value);
    }));
  };

  const handleStatusChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => filterItem.field !== 'status');
      const latestValue = values[values.length - 1];

      switch (latestValue) {
        case 'true':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'true',
            displayValue: 'Active'
          });
          break;
        case 'false':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'false',
            displayValue: 'Inactive'
          });
          break;
        case 'undefined':
          newFilterItems.push({
            label: 'Status',
            field: 'status',
            value: 'undefined',
            displayValue: 'All'
          });
          break;
      
        default:
          break;
      }

      return newFilterItems;
    });
  };

  const statusValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'status')
    .map((filterItems) => filterItems.value), [filterItems]);

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
          label="Status"
          onChange={handleStatusChange}
          options={statusOptions}
          value={statusValues}
        />
      </Box>
    </div>
  );
};

CohortListFilters.propTypes = {
  onChange: PropTypes.func
};
