import { Avatar, Card, CardContent, Grid, Typography } from "@mui/material";

const ApplicantCard = (props) => {
  return (
    <Card {...props}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography
              color="textSecondary"
              gutterBottom
              display="block"
              sx={{
                padding: "0",
                margin: "0",
                lineHeight: "0",
              }}
              variant="overline"
            >
              {props.textTop}
            </Typography>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {props.textBottom}
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {props.count}
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                backgroundColor: "success.main",
                height: 56,
                width: 56,
              }}
            ></Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ApplicantCard;
