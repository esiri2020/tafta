import {Box, List, ListItem, ListItemText, Popover} from '@mui/material';
import PropTypes from 'prop-types';

const organizations = ['Master Card Cohort', 'Us Consolate Cohort'];

export const CohortPopover = props => {
  const {
    anchorEl,
    onClose,
    open,
    cohorts,
    handleChange,
    showAllOption,
    ...other
  } = props;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {width: 280},
      }}
      {...other}>
      <Box sx={{p: 2}}>
        <List>
          {showAllOption && (
            <ListItem
              button
              onClick={() => handleChange(null)}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}>
              <ListItemText
                primary='All cohorts'
                secondary='View all cohorts'
              />
            </ListItem>
          )}
          {cohorts?.map(cohort => (
            <ListItem
              button
              key={cohort.id}
              onClick={() => handleChange(cohort)}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}>
              <ListItemText
                primary={cohort.name}
                secondary={`Status: ${cohort.active ? 'Active' : 'Ended'}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Popover>
  );
};

CohortPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  cohorts: PropTypes.array,
  handleChange: PropTypes.func,
  showAllOption: PropTypes.bool,
};
