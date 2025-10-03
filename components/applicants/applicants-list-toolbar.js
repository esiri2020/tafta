import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon, Typography
} from '@mui/material';
import { Search as SearchIcon } from '../../icons/search';
import { Upload as UploadIcon } from '../../icons/upload';
import { Download as DownloadIcon } from '../../icons/download';
import { useGetApplicantsQuery } from '../../services/api'

export const ApplicantsListToolbar = (props) => {
  const { mobilizerId, showMobilizerFilter = true, ...otherProps } = props;
  
  return (
    <Box {...otherProps}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          m: -1
        }}
      >
        <Typography
          sx={{ m: 1 }}
          variant="h4"
        >
          {mobilizerId ? 'My Applicants' : 'Applicants'}
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button
            startIcon={(<UploadIcon fontSize="small" />)}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <Button
            startIcon={(<DownloadIcon fontSize="small" />)}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          {!mobilizerId && (
            <Button
              color="primary"
              variant="contained"
            >
              Add Applicants
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                onKeyDown={(e)=> e.key === 'Enter' ? console.log(e.target.value): ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment onClick={()=> console.log("test")} position="start">
                      <SvgIcon
                        color="action"
                        fontSize="small"
                      >
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  )
                }}
                placeholder={mobilizerId ? "Search My Applicants" : "Search Applicants"}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
