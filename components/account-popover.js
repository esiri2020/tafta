import Router from 'next/router';
import PropTypes from 'prop-types';
import { Box, MenuItem, MenuList, Popover, Typography } from '@mui/material';

import { signOut, useSession } from "next-auth/react"


export const AccountPopover = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const { data: session } = useSession();

  const handleSignOut = async () => {
    onClose?.();
    const authSkipped = globalThis.sessionStorage.getItem('skip-auth') === 'true';

    if (authSkipped) {
      // Cleanup the skip auth state
      globalThis.sessionStorage.removeItem('skip-auth');

      // Redirect to sign-in page
      Router
        .push('/login')
        .catch(console.error);
      return;
    }

    try {
      signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error(err);
    }
  };
  if (!session?.userData) return;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: { width: '300px' }
      }}
      {...other}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2
        }}
      >
        <Typography variant="overline">
          Account
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          { session.userData.firstName + ' ' + session.userData.lastName }
        </Typography>
        <Typography
          color="text.disabled"
          variant="caption"
        >
          { session.userData.role }
        </Typography>
      </Box>
      <MenuList
        disablePadding
        sx={{
          '& > *': {
            '&:first-of-type': {
              borderTopColor: 'divider',
              borderTopStyle: 'solid',
              borderTopWidth: '1px'
            },
            padding: '12px 16px'
          }
        }}
      >
        <MenuItem onClick={handleSignOut}>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired
};
