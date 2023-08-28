import { MenuItem, Popover } from '@mui/material';

const organizations = [
  'Master Card Cohort',
  'Us Consolate Cohort'
];

export const CohortPopover = (props) => {
  const { anchorEl, onClose, open, cohorts, handleChange, ...other } = props;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      keepMounted
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 248 } }}
      transitionDuration={0}
      {...other}>
      {cohorts?.length && cohorts.map((cohort) => (
        <MenuItem
          key={cohort.id}
          onClick={() => handleChange(cohort)}
        >
          {cohort.name}
        </MenuItem>
      ))}
    </Popover>
  );
};
