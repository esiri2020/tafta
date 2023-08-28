import { Avatar, Card, CardContent, Grid, Typography } from '@mui/material';
import MotionPhotosAutoRoundedIcon from '@mui/icons-material/MotionPhotosAutoRounded';

export const ActiveEnrollees = (props) => (
  <Card {...props}>
    <CardContent>
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: 'space-between' }}
      >
        <Grid item>
          <Typography
            color="textSecondary"
            display="block"
            sx={{ 
              padding: "0",
              margin: "0",
              lineHeight: "0"
            }}
            gutterBottom
            variant="overline"
          >
            ACTIVE
          </Typography>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
          >
             ENROLLEES
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
              backgroundColor: 'info.main',
              height: 56,
              width: 56
            }}
          >
            <MotionPhotosAutoRoundedIcon />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
