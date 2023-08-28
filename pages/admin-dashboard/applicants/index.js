import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  useGetApplicantsQuery,
  useGetCohortsQuery,
} from "../../../services/api";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { ApplicantsListTable } from "../../../components/dashboard/applicants/applicants-list-table";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { SplashScreen } from "../../../components/splash-screen";
import { selectCohort } from "../../../services/cohortSlice";
import { useAppSelector } from "../../../hooks/rtkHook";
import { CSVLink, CSVDownload } from "react-csv";

const tabs = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
  {
    label: "Active",
    value: "Active",
  },
  // {
  //   label: 'Inactive',
  //   value: 'Inactive'
  // },
  {
    label: "Awaiting Approval",
    value: "awaiting_approval",
  },
];

const ApplicantList = () => {
  const queryRef = useRef(null);
  const cohort = useAppSelector((state) => selectCohort(state));

  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filter, setFilters] = useState("");
  const [query, setQuery] = useState("");
  const [cohortId, setCohortId] = useState(cohort?.id);
  const { data: { cohorts } = { cohorts: [] }, error: cohortError } =
    useGetCohortsQuery({});
  const { data, error, isLoading } = useGetApplicantsQuery({
    page,
    limit,
    filter,
    query,
    cohortId,
  });
  useEffect(() => {
    if (cohort) {
      setCohortId(cohort.id);
    }
  }, [cohort]);

  const handleTabsChange = (event, value) => {
    setFilters(value);
    setCurrentTab(value);
    setQuery("");
  };

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters("all");
    setQuery(queryRef.current?.value);
  };

  const handleSortChange = (event) => {
    setCohortId(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  if (isLoading) return <SplashScreen />;
  if (!data) return <div>No Data!</div>;
  const { applicants, count } = data;

  const formatDataForExport = () => {
    const formattedData = applicants.map((applicant) => {
      const { firstName, lastName, email, userCohort } = applicant;
      const userCohortData = userCohort[0];

      const cohortName = userCohortData.cohort.name;
      const startDate = userCohortData.cohort.start_date;
      const endDate = userCohortData.cohort.end_date;
      const status =
        userCohortData.enrollments.length > 0 ? "Enrolled" : "Not Enrolled";

      return {
        Name: `${firstName} ${lastName}`,
        Email: email,
        Cohort: cohortName,
        StartDate: startDate,
        EndDate: endDate,
        Status: status,
      };
    });

    return formattedData;
  };

  return (
    <>
      <Head>
        <title>Applicant List</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">Applicants</Typography>
              </Grid>
              <Grid item>
                <NextLink href={`/admin-dashboard/applicants/create`} passHref>
                  <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                  >
                    Add
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
          </Box>
          <Card>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              sx={{ px: 3 }}
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
            <Divider />
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                m: -1.5,
                p: 3,
              }}
            >
              <Box
                component="form"
                onSubmit={handleQueryChange}
                sx={{
                  flexGrow: 1,
                  m: 1.5,
                }}
              >
                <TextField
                  defaultValue=""
                  fullWidth
                  inputProps={{ ref: queryRef }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search applicants"
                />
              </Box>

              <Button component="a" variant="contained" sx={{ m: 1.5 }}>
                <CSVLink
                  data={formatDataForExport()}
                  filename={"applicants.csv"}
                  target="_blank"
                  style={{ textDecoration: "none", color: "white" }}
                  // className="MuiButtonBase-root MuiButton-root MuiButton-contained"
                >
                  Export Data
                </CSVLink>
              </Button>

              <TextField
                label="Select Cohort"
                name="cohorts"
                onChange={handleSortChange}
                select
                SelectProps={{ native: true }}
                sx={{ m: 1.5 }}
                value={cohortId}
              >
                {cohorts.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </TextField>
            </Box>
            <ApplicantsListTable
              applicants={applicants}
              applicantsCount={count}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              limit={limit}
              page={page}
              cohortId={cohortId}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

ApplicantList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ApplicantList;
