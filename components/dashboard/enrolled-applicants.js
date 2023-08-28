import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import MoneyIcon from '@mui/icons-material/Money';

export const EnrolledApplicants = (props) => (
  <Card
    sx={{ height: '100%' }}
    {...props}
  >
    <CardContent>
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: 'space-between' }}
      >
        <Grid item>
          <Typography
            color="textSecondary"
            gutterBottom
            display="block"
            sx={{ 
              padding: "0",
              margin: "0",
              lineHeight: "0"
            }}
            variant="overline"
          >
            ENROLLED 
          </Typography>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
          >
             APPLICANTS
          </Typography>
          <Typography
            color="textPrimary"
            variant="h4"
          >
            {props.count}
          </Typography>
        </Grid>
        <Grid item>
          <Avatar
            sx={{
              backgroundColor: 'primary.light',
              height: 56,
              width: 56
            }}
          >
            <MoneyIcon />
          </Avatar>
        </Grid>
      </Grid>
      </CardContent>
  </Card>
);
