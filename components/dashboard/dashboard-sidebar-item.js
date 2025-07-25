import { useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button, Collapse, ListItem } from '@mui/material';
import { ChevronDown as ChevronDownIcon } from '../../icons/chevron-down';
import { ChevronRight as ChevronRightIcon } from '../../icons/chevron-right';

export const DashboardSidebarItem = ({
  active = false,
  children,
  chip,
  depth,
  icon,
  info,
  open: openProp = false,
  path,
  title,
  ...other
}) => {
  const [open, setOpen] = useState(!!openProp);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  let paddingLeft = 24;

  if (depth > 0) {
    paddingLeft = 32 + 8 * depth;
  }

  // Branch
  if (children) {
    return (
      <ListItem
        disableGutters
        sx={{
          display: 'block',
          mb: 0.5,
          py: 0,
          px: 2
        }}
        {...other}>
        <Button
          endIcon={!open
            ? <ChevronRightIcon fontSize="small" />
            : <ChevronDownIcon fontSize="small" />}
          disableRipple
          onClick={handleToggle}
          startIcon={icon}
          sx={{
            color: active ? 'secondary.main' : 'neutral.300',
            justifyContent: 'flex-start',
            pl: `${paddingLeft}px`,
            pr: 3,
            textAlign: 'left',
            textTransform: 'none',
            width: '100%',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255, 0.08)'
            },
            '& .MuiButton-startIcon': {
              color: active ? 'secondary.main' : 'neutral.400'
            },
            '& .MuiButton-endIcon': {
              color: 'neutral.400'
            }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {title}
          </Box>
          {info}
        </Button>
        <Collapse
          in={open}
          sx={{ mt: 0.5 }}
        >
          {children}
        </Collapse>
      </ListItem>
    );
  }

  // Leaf
  return (
    <ListItem
      disableGutters
      sx={{
        display: 'flex',
        mb: 0.5,
        py: 0,
        px: 2
      }}
    >
      <Button
        component={NextLink}
        href={path}
        startIcon={icon}
        endIcon={chip}
        disableRipple
        sx={{
          borderRadius: 1,
          color: 'neutral.300',
          justifyContent: 'flex-start',
          pl: `${paddingLeft}px`,
          pr: 3,
          textAlign: 'left',
          textTransform: 'none',
          width: '100%',
          ...(active && {
            backgroundColor: 'rgba(255,255,255, 0.08)',
            color: 'secondary.main',
            fontWeight: 'fontWeightBold'
          }),
          '& .MuiButton-startIcon': {
            color: active ? 'secondary.main' : 'neutral.400'
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255, 0.08)'
          }
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {title}
        </Box>
        {info}
      </Button>
    </ListItem>
  );
};

DashboardSidebarItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  depth: PropTypes.number.isRequired,
  icon: PropTypes.node,
  info: PropTypes.node,
  open: PropTypes.bool,
  path: PropTypes.string,
  title: PropTypes.string.isRequired
};
