import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import MaleRoundedIcon from '@mui/icons-material/MaleRounded';

export const MaleEnrollees = (props) => (
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
            gutterBottom
            display="block"
            sx={{ 
              padding: "0",
              margin: "0",
              lineHeight: "0"
            }}
            variant="overline"
          >
            MALE 
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
              backgroundColor: 'info.dark',
              height: 56,
              width: 56
            }}
          >
            <MaleRoundedIcon />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
