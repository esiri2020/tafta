import {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Menu as MenuIcon} from '../../icons/menu';
import {Bell as BellIcon} from '../../icons/bell';
import {Search as SearchIcon} from '../../icons/search';
import {UserCircle as UserCircleIcon} from '../../icons/user-circle';
import {Users as UsersIcon} from '../../icons/users';
import {AccountPopover} from '../account-popover';
import {NotificationBadge} from './notifications/notification-badge';
import {NotificationsPopover} from './notifications/notifications-popover';
import {useGetNotificationsQuery} from '../../services/api';
// import { ContactsPopover } from '../contacts-popover';
// import { ContentSearchDialog } from './content-search-dialog';
// import { LanguagePopover } from './language-popover';

const languages = {
  en: '/static/icons/uk_flag.svg',
  de: '/static/icons/de_flag.svg',
  es: '/static/icons/es_flag.svg',
};

const DashboardNavbarRoot = styled(AppBar)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  ...(theme.palette.mode === 'light'
    ? {
        boxShadow: theme.shadows[3],
      }
    : {
        backgroundColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.divider,
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        boxShadow: 'none',
      }),
}));

// const LanguageButton = () => {
//   const anchorRef = useRef(null);
//   const { i18n } = useTranslation();
//   const [openPopover, setOpenPopover] = useState(false);

//   const handleOpenPopover = () => {
//     setOpenPopover(true);
//   };

//   const handleClosePopover = () => {
//     setOpenPopover(false);
//   };

//   return (
//     <>
//       <IconButton
//         onClick={handleOpenPopover}
//         ref={anchorRef}
//         sx={{ ml: 1 }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             height: 20,
//             width: 20,
//             '& img': {
//               width: '100%'
//             }
//           }}
//         >
//           <img
//             alt=""
//             src={languages[i18n.language]}
//           />
//         </Box>
//       </IconButton>
//       <LanguagePopover
//         anchorEl={anchorRef.current}
//         onClose={handleClosePopover}
//         open={openPopover}
//       />
//     </>
//   );
// };

// const ContentSearchButton = () => {
//   const [openDialog, setOpenDialog] = useState(false);

//   return (
//     <>
//       <Tooltip title="Search">
//         <IconButton
//           onClick={() => setOpenDialog(true)}
//           sx={{ ml: 1 }}>
//           <SearchIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//       <ContentSearchDialog
//         onClose={() => setOpenDialog(false)}
//         open={openDialog}
//       />
//     </>
//   );
// };

// const ContactsButton = () => {
//   const [openPopover, setOpenPopover] = useState(false);
//   const anchorRef = useRef(null);

//   const handleOpenPopover = () => {
//     setOpenPopover(true);
//   };

//   const handleClosePopover = () => {
//     setOpenPopover(false);
//   };

//   return (
//     <>
//       <Tooltip title="Contacts">
//         <IconButton
//           onClick={handleOpenPopover}
//           ref={anchorRef}
//           sx={{ ml: 1 }}>
//           <UsersIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//       <ContactsPopover
//         anchorEl={anchorRef.current}
//         onClose={handleClosePopover}
//         open={openPopover}
//       />
//     </>
//   );
// };

const NotificationsButton = () => {
  const [openPopover, setOpenPopover] = useState(false);
  const anchorRef = useRef(null);
  const {data: notificationsData} = useGetNotificationsQuery({
    page: 0,
    limit: 10,
  });

  const unreadCount = notificationsData?.notifications
    ? notificationsData.notifications.filter(
        notification => !notification.isRead,
      ).length
    : 0;

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  return (
    <>
      <Tooltip title='Notifications'>
        <IconButton onClick={handleOpenPopover} ref={anchorRef} sx={{ml: 1}}>
          {unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color='error'>
              <BellIcon fontSize='small' />
            </Badge>
          ) : (
            <BellIcon fontSize='small' />
          )}
        </IconButton>
      </Tooltip>
      <NotificationsPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

const AccountButton = () => {
  const anchorRef = useRef(null);
  const [openPopover, setOpenPopover] = useState(false);
  // To get the user from the authContext, you can use
  // `const { user } = useAuth();`
  const user = {
    avatar: '/static/images/avatars/avatar_1.png',
    name: 'Anika Visser',
  };

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpenPopover}
        ref={anchorRef}
        sx={{
          alignItems: 'center',
          display: 'flex',
          ml: 2,
        }}>
        <Avatar
          sx={{
            height: 40,
            width: 40,
          }}
          src={user.avatar}>
          <UserCircleIcon fontSize='small' />
        </Avatar>
      </Box>
      <AccountPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

export const DashboardNavbar = props => {
  const {onSidebarOpen, ...other} = props;

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280,
          },
          width: {
            lg: 'calc(100% - 280px)',
          },
        }}
        {...other}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}>
          <IconButton
            onClick={onSidebarOpen}
            sx={{
              display: {
                xs: 'inline-flex',
                lg: 'none',
              },
            }}>
            <MenuIcon fontSize='small' />
          </IconButton>
          <Box sx={{flexGrow: 1}} />
          {/* <LanguageButton /> */}
          {/* <ContentSearchButton /> */}
          {/* <ContactsButton /> */}
          <NotificationsButton />
          <AccountButton />
        </Toolbar>
      </DashboardNavbarRoot>
    </>
  );
};

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};
