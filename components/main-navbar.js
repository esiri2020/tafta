import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { AppBar, Box, Button, Container, Divider, IconButton, Link, Toolbar } from '@mui/material';
import { Menu as MenuIcon } from '../icons/menu';
import { Logo } from './logo';
import { signOut, useSession } from "next-auth/react"
import Router from 'next/router';
import { Link as MuiLink } from '@mui/material';

export const MainNavbar = (props) => {
  const { onOpenSidebar } = props;
  const { data: session } = useSession();

  const handleSignout = () => {
    try {
      signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppBar
      elevation={0}
      sx={{
        backgroundColor: '#000',
        borderBottomColor: 'divider',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        color: 'text.secondary'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ minHeight: 64 }}
        >
          <MuiLink component={NextLink} href="https://terraacademyforarts.com/" sx={{ display: 'flex', my: 2, mx: 'auto', width: '160px', '& img': { width: '100%' } }}>
            <img alt="Home" src="/static/images/logo.svg" />
          </MuiLink>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={onOpenSidebar}
            sx={{
              display: {
                md: 'none'
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              alignItems: 'center',
              display: {
                md: 'flex',
                xs: 'none'
              }
            }}
          >

            <MuiLink component={NextLink} href="https://terraacademyforarts.com" color="textSecondary" sx={{ ml: 2 }} underline="none" variant="subtitle2">
              About Us
            </MuiLink>
            <MuiLink component={NextLink} href="https://terraacademyforarts.com/contact-us/" color="textSecondary" sx={{ ml: 2, mr: 2 }} underline="none" variant="subtitle2">
              Contact Us
            </MuiLink>
            <Divider orientation="vertical" variant="middle" flexItem />
            {
              session?.userData ?
                (
                  <>
                    <MuiLink component={NextLink} href="/role" color="textSecondary" sx={{ ml: 2 }} underline="none" variant="subtitle2">
                      Dashboard
                    </MuiLink>
                    <Button
                      size="medium"
                      sx={{ ml: 2 }}
                      variant="contained"
                      onClick={handleSignout}
                    >
                      Logout
                    </Button>
                  </>
                ) :
                (
                  <Button
                    component="a"
                    href="/api/auth/signin?callbackUrl=%2Frole"
                    size="medium"
                    sx={{ ml: 2 }}
                    variant="contained"
                  >
                    Login
                  </Button>
                )
            }

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

MainNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};
