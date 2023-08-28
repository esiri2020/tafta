import { Box, Button, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { useDeleteApplicantMutation } from '../../../services/api'
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export const ApplicantDataManagement = ({id, ...rest}) => {
  const [ deleteUser, result ] = useDeleteApplicantMutation()
  const router = useRouter();

  const deleteUserHandler = (e) => {
    e.preventDefault()
    toast.promise(
      deleteUser(id),
      {
        loading: 'Deleting...',
        success: <b>Applicant Deleted!</b>,
        error: <b>Could not Delete.</b>,
      }
    )
    router.replace({pathname: '/admin-dashboard/applicants'})
  }
  return (
  <Card {...rest}>
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
          Delete this applicant’s account if requested.
          Please be aware that what has been deleted can not be restored
        </Typography>
      </Box>
    </CardContent>
  </Card>
)}
