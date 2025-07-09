import { useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Box, Button, Drawer, Link, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut, useSession } from "next-auth/react"


const MainSidebarLink = styled(Link)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  display: 'block',
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

export const MainSidebar = (props) => {
  const { onClose, open } = props;
  const router = useRouter();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const handlePathChange = () => {
    if (open) {
      onClose?.();
    }
  };

  const { data: session } = useSession();

  useEffect(handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath]);

    const handleSignout = () => {
      try {
        signOut({ callbackUrl: '/login' });
      } catch (err) {
        console.error(err);
      }
    }
  

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={!lgUp && open}
      PaperProps={{ sx: { width: 256 } }}
      sx={{
        zIndex: (theme) => theme.zIndex.appBar + 100
      }}
      variant="temporary"
    >
      <Box sx={{ p: 2 }}>
      <NextLink
        href="/Help"
        passHref
      >
        <MainSidebarLink
          color="textSecondary"
          sx={{ ml: 2 }}
          underline="none"
          variant="subtitle2"
        >
          Help
        </MainSidebarLink>
      </NextLink>
      <NextLink
        href=""
        passHref
      >
        <MainSidebarLink
          color="textSecondary"
          component="a"
          sx={{ ml: 2 }}
          underline="none"
          variant="subtitle2"
        >
          Contact Us
        </MainSidebarLink>
      </NextLink>
      {
        session?.userData ? 
        // (
        //   <Button
        //     size="medium"
        //     sx={{ ml: 2 }}
        //     variant="contained"
        //     onClick={handleSignout}
        //   >
        //     Logout
        //   </Button>
        // ) :
        // (
        //   <Button
        //     component="a"
        //     href="/api/auth/signin?callbackUrl=%2Frole"
        //     size="medium"
        //     sx={{ ml: 2 }}
        //     variant="contained"
        //   >
        //     Login
        //   </Button>
        // )
        (
          <>
            <MainSidebarLink
              href="/role"
              passHref
            >
              <Link
                color="textSecondary"
                component="a"
                sx={{ ml: 2 }}
                underline="none"
                variant="subtitle2"
              >
                Dashboard
              </Link>
            </MainSidebarLink>
            <br/>
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
    </Drawer>
  );
};

MainSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
