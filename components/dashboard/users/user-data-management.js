import { Box, Button, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { useDeleteUserMutation } from '../../../services/api'
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export const UserDataManagement = (props) => {
  const [ deleteUser, result ] = useDeleteUserMutation()
  const router = useRouter();

  const deleteUserHandler = (e) => {
    e.preventDefault()
    toast.promise(
      deleteUser(props.id),
      {
        loading: 'Deleting...',
        success: <b>User Deleted!</b>,
        error: <b>Could not delete.</b>,
      }
    )
    router.replace({pathname: '/admin-dashboard/users'})
  }
  return (
  <Card {...props}>
    <CardHeader title="Data Management" />
    <Divider />
    <CardContent>
      <Button
        color="error"
        variant="outlined"
        onClick={deleteUserHandler}
      >
        Delete Account
      </Button>
      <Box sx={{ mt: 1 }}>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          Delete this user.
          Please be aware that what has been deleted can not be restored
        </Typography>
      </Box>
    </CardContent>
  </Card>
)}
