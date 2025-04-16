import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import {DashboardLayout} from '../../../components/dashboard/dashboard-layout';
import {SplashScreen} from '../../../components/splash-screen';
import {useGetDashboardDataQuery} from '../../../services/api';
import {selectCohort} from '../../../services/cohortSlice';
import {useAppSelector} from '../../../hooks/rtkHook';
import {Activity, CheckCircle, Users, UserPlus, RefreshCw} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';

const OverviewPage = () => {
  const [skip, setSkip] = useState(false);
  const cohort = useAppSelector(state => selectCohort(state));
  const {data, error, loading} = useGetDashboardDataQuery(
    {cohortId: cohort?.id},
    {skip},
  );

  useEffect(() => {
    setSkip(false);
  }, [cohort]);

  if (loading) {
    return <SplashScreen />;
  }
  if (error) return <div>An error occured.</div>;
  if (!data) return null;

  const refreshData = () => {
    setSkip(true);
  };

  const colors = {
    primary: '#0ea5e9',
    secondary: '#f97316',
    tertiary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gender: {
      female: '#d946ef',
      male: '#0ea5e9',
    },
    residency: {
      refugee: '#f97316',
      migrant_workers: '#8b5cf6',
      resident: '#10b981',
      idp: '#3b82f6',
    },
    status: {
      active: '#10b981',
      inactive: '#f97316',
      certified: '#3b82f6',
    },
    community: {
      urban: '#0ea5e9',
      rural: '#10b981',
      periUrban: '#f59e0b',
    },
    registration: {
      individual: '#8b5cf6',
      enterprise: '#f97316',
    },
    business: {
      informal: '#ef4444',
      startup: '#f59e0b',
      formalExisting: '#0ea5e9',
    },
    businessSize: {
      micro: '#10b981',
      small: '#0ea5e9',
      medium: '#8b5cf6',
      large: '#f97316',
    },
    education: {
      'Elementary School': '#ef4444',
      'Secondary School': '#f59e0b',
      'College Of Education': '#10b981',
      'Nd Hnd': '#0ea5e9',
      Bsc: '#8b5cf6',
      Msc: '#d946ef',
      Phd: '#f97316',
    },
    completion: {
      '0-25%': '#ef4444',
      '26-50%': '#f59e0b',
      '51-75%': '#0ea5e9',
      '76-100%': '#10b981',
    },
  };

  // Format numbers with commas
  const formatNumber = num => {
    return Number.parseInt(num).toLocaleString();
  };

  if (loading) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-20 mb-2' />
                <Skeleton className='h-4 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <Card className='border-red-200'>
          <CardHeader>
            <CardTitle className='text-red-500'>
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant='outline' className='mt-4' onClick={refreshData}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Prepare data for charts
  const genderData = [
    {name: 'Female', value: Number.parseInt(data.female_enrollments)},
    {name: 'Male', value: Number.parseInt(data.male_enrollments)},
  ];

  const statusData = [
    {name: 'Active', value: Number.parseInt(data.active_enrollees)},
    {name: 'Inactive', value: Number.parseInt(data.inactive_enrollments)},
    {name: 'Certified', value: Number.parseInt(data.certified_enrollees)},
  ];

  const residencyData = [
    {
      name: 'Resident',
      value: Number.parseInt(data?.statusOfResidency?.resident),
    },
    {
      name: 'Migrant Workers',
      value: Number.parseInt(data?.statusOfResidency?.migrant_workers),
    },
    {
      name: 'Refugee',
      value: Number.parseInt(data?.statusOfResidency?.refugee),
    },
    {name: 'IDP', value: Number.parseInt(data?.statusOfResidency?.idp)},
    {
      name: 'Non-Resident',
      value: Number.parseInt(data?.statusOfResidency?.non_resident),
    },
  ];

  console.log(data.statusOfResidency);

  const ageRangeData = data.age_range.map(item => ({
    name: item.ageRange,
    value: Number.parseInt(item.count),
  }));

  const locationData = data.location
    .sort((a, b) => Number.parseInt(b.count) - Number.parseInt(a.count))
    .slice(0, 10)
    .map(item => ({
      name: item.location,
      value: Number.parseInt(item.count),
    }));

  // Prepare enrollment completion graph data if available
  const enrollmentCompletionData = data.enrollment_completion_graph
    ? data.enrollment_completion_graph.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        count: Number.parseInt(item.count),
      }))
    : [
        {month: 'Jan', count: 30},
        {month: 'Feb', count: 40},
        {month: 'Mar', count: 45},
        {month: 'Apr', count: 55},
        {month: 'May', count: 70},
        {month: 'Jun', count: 95},
      ];

  // Prepare new metrics data
  const educationLevelData = data.educationLevelData
    ? data.educationLevelData.map(item => ({
        name: item.level,
        value: Number.parseInt(item.count),
      }))
    : [];

  const communityAreaData = data.communityAreaData
    ? [
        {name: 'Urban', value: Number.parseInt(data.communityAreaData.urban)},
        {name: 'Rural', value: Number.parseInt(data.communityAreaData.rural)},
        {
          name: 'Peri-Urban',
          value: Number.parseInt(data.communityAreaData.periUrban),
        },
      ]
    : [];

  const registrationTypeData = data.registrationTypeData
    ? [
        {
          name: 'Individual',
          value: Number.parseInt(data.registrationTypeData.individual),
        },
        {
          name: 'Enterprise',
          value: Number.parseInt(data.registrationTypeData.enterprise),
        },
      ]
    : [];

  const businessTypeData = data.businessTypeData
    ? data.businessTypeData.map(item => ({
        name: item.type,
        value: Number.parseInt(item.count),
      }))
    : [];

  const businessSizeData = data.businessSizeData
    ? data.businessSizeData.map(item => ({
        name: item.size,
        value: Number.parseInt(item.count),
      }))
    : [];

  const employmentStatusData = data.employmentStatusData
    ? data.employmentStatusData.map(item => ({
        name: item.status,
        value: Number.parseInt(item.count),
      }))
    : [];

  const courseEnrollmentData = data.courseEnrollmentData
    ? data.courseEnrollmentData
        .filter(item => Number.parseInt(item.count) > 0)
        .map(item => ({
          name: item.name,
          value: Number.parseInt(item.count),
        }))
    : [];

  const internshipProgramData = data.internshipProgramData
    ? data.internshipProgramData
        .filter(item => Number.parseInt(item.count) > 0)
        .map(item => ({
          name: item.program,
          value: Number.parseInt(item.count),
        }))
    : [];

  const projectTypeData = data.projectTypeData
    ? data.projectTypeData
        .filter(item => Number.parseInt(item.count) > 0)
        .map(item => ({
          name: item.type,
          value: Number.parseInt(item.count),
        }))
    : [];

  const completionRangeData = data.enrollmentProgressData?.completionRanges
    ? data.enrollmentProgressData.completionRanges.map(item => ({
        name: item.range,
        value: Number.parseInt(item.count),
      }))
    : [];

  return (
    <>
      <Head>
        <title>Super Admin Dashboard</title>
      </Head>

      <div className='container mx-auto p-4 md:p-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Overview of enrollment statistics and applicant demographics
            </p>
          </div>
          <div className='mt-4 md:mt-0 flex flex-col sm:flex-row gap-4 items-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshData}
              disabled={loading}>
              {loading ? (
                <>
                  <span className='mr-2'>Loading...</span>
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Refresh Data
                </>
              )}
            </Button>
            {/* <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select Cohort' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Cohorts</SelectItem>
                <SelectItem value='cohort1'>Cohort 1</SelectItem>
                <SelectItem value='cohort2'>Cohort 2</SelectItem>
                <SelectItem value='cohort3'>Cohort 3</SelectItem>
              </SelectContent>
            </Select> */}
            {/* <div className='w-full mt-2 md:mt-0 text-xs text-muted-foreground text-right'>
              {lastUpdated ? (
                <span>Last updated: {lastUpdated.toLocaleString()}</span>
              ) : null}
            </div> */}
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='demographics'>Demographics</TabsTrigger>
            <TabsTrigger value='education'>Education & Employment</TabsTrigger>
            <TabsTrigger value='business'>Business</TabsTrigger>
            <TabsTrigger value='locations'>Locations</TabsTrigger>
            <TabsTrigger value='courses'>Courses & Programs</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Applicants
                  </CardTitle>
                  <UserPlus className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatNumber(data.total_applicants)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Total registered users in the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Enrolled Applicants
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatNumber(data.total_enrolled_applicants)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {(
                      (Number.parseInt(data.total_enrolled_applicants) /
                        Number.parseInt(data.total_applicants)) *
                      100
                    ).toFixed(1)}
                    % of total applicants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Enrollees
                  </CardTitle>
                  <Activity className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatNumber(data.active_enrollees)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {(
                      (Number.parseInt(data.active_enrollees) /
                        Number.parseInt(data.total_enrolled_applicants)) *
                      100
                    ).toFixed(1)}
                    % of enrolled applicants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Certified Enrollees
                  </CardTitle>
                  <CheckCircle className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatNumber(data.certified_enrollees)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {(
                      (Number.parseInt(data.certified_enrollees) /
                        Number.parseInt(data.total_enrolled_applicants)) *
                      100
                    ).toFixed(1)}
                    % completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <Card className='col-span-4'>
                <CardHeader>
                  <CardTitle>Enrollment Status</CardTitle>
                  <CardDescription>
                    Distribution of active, inactive, and certified enrollees
                  </CardDescription>
                </CardHeader>
                <CardContent className='pl-2'>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='value' name='Enrollees'>
                        {statusData.map((entry, index) => {
                          const statusKey = entry.name.toLowerCase();
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors.status[statusKey]}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className='col-span-3'>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>
                    Male vs Female enrollment breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({name, percent}) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'>
                        {genderData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.gender[entry.name.toLowerCase()]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {data.enrollmentProgressData && (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Completion Progress</CardTitle>
                  <CardDescription>
                    Average completion:{' '}
                    {data.enrollmentProgressData.averageCompletion}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-8'>
                    <Progress
                      value={Number(
                        data.enrollmentProgressData.averageCompletion,
                      )}
                      className='h-2'
                    />

                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={completionRangeData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip formatter={value => formatNumber(value)} />
                        <Legend />
                        <Bar dataKey='value' name='Enrollees'>
                          {completionRangeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors.completion[entry.name]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.enrollment_completion_graph && (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Completion Trend</CardTitle>
                  <CardDescription>
                    Daily enrollment completion counts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <AreaChart data={enrollmentCompletionData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='count'
                        name='Completions'
                        stroke={colors.success}
                        fill={colors.success}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='demographics' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of applicants by age range
                  </CardDescription>
                </CardHeader>
                <CardContent className='pl-2'>
                  <ResponsiveContainer width='100%' height={350}>
                    <BarChart data={ageRangeData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                      <Bar
                        dataKey='value'
                        name='Applicants'
                        fill={colors.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Residency Status</CardTitle>
                  <CardDescription>
                    Distribution by residency status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={350}>
                    <PieChart>
                      <Pie
                        data={residencyData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({name, percent}) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill='#8884d8'
                        dataKey='value'>
                        {residencyData.map((entry, index) => {
                          const key = entry.name
                            .toLowerCase()
                            .replace(' ', '_');
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors.residency[key] || colors.info}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Community Area Distribution</CardTitle>
                <CardDescription>Urban vs Rural breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={350}>
                  <PieChart>
                    <Pie
                      data={communityAreaData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({name, percent}) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'>
                      {communityAreaData.map((entry, index) => {
                        const key = entry.name.toLowerCase().replace('-', '');
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.community[key] || colors.info}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip formatter={value => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Type</CardTitle>
                <CardDescription>
                  Individual vs Enterprise registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={350}>
                  <PieChart>
                    <Pie
                      data={registrationTypeData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({name, percent}) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'>
                      {registrationTypeData.map((entry, index) => {
                        const key = entry.name.toLowerCase();
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.registration[key] || colors.info}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip formatter={value => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='education' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Education Level Distribution</CardTitle>
                <CardDescription>
                  Breakdown of applicants by education level
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={educationLevelData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip formatter={value => formatNumber(value)} />
                    <Legend />
                    <Bar dataKey='value' name='Applicants'>
                      {educationLevelData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors.education[entry.name] || colors.tertiary}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Status</CardTitle>
                <CardDescription>
                  Distribution by employment status
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={employmentStatusData} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='name' type='category' width={150} />
                    <Tooltip formatter={value => formatNumber(value)} />
                    <Legend />
                    <Bar
                      dataKey='value'
                      name='Applicants'
                      fill={colors.tertiary}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className='grid gap-4 md:grid-cols-2'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Internship Program Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by internship program type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {internshipProgramData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={350}>
                      <PieChart>
                        <Pie
                          data={internshipProgramData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'>
                          {internshipProgramData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  colors.primary,
                                  colors.secondary,
                                  colors.tertiary,
                                  colors.success,
                                  colors.warning,
                                  colors.info,
                                ][index % 6]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            formatNumber(value),
                            name,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No internship program data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Project Type Distribution</CardTitle>
                  <CardDescription>Breakdown by project type</CardDescription>
                </CardHeader>
                <CardContent>
                  {projectTypeData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={350}>
                      <PieChart>
                        <Pie
                          data={projectTypeData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'>
                          {projectTypeData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  colors.primary,
                                  colors.secondary,
                                  colors.tertiary,
                                ][index % 3]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={value => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No project type data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='business' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Business Type Distribution</CardTitle>
                  <CardDescription>Breakdown by business type</CardDescription>
                </CardHeader>
                <CardContent>
                  {businessTypeData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={350}>
                      <PieChart>
                        <Pie
                          data={businessTypeData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'>
                          {businessTypeData.map((entry, index) => {
                            const key = entry.name
                              .toLowerCase()
                              .replace(' ', '');
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors.business[key] || colors.info}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip formatter={value => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No business type data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Business Size Distribution</CardTitle>
                  <CardDescription>Breakdown by business size</CardDescription>
                </CardHeader>
                <CardContent>
                  {businessSizeData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={350}>
                      <PieChart>
                        <Pie
                          data={businessSizeData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'>
                          {businessSizeData.map((entry, index) => {
                            const key = entry.name.toLowerCase();
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors.businessSize[key] || colors.info}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip formatter={value => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No business size data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Sector Distribution</CardTitle>
                <CardDescription>Breakdown by business sector</CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <div className='flex items-center justify-center h-[350px]'>
                  <p className='text-muted-foreground'>
                    Business sector data will be available in future updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='locations' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                  <CardDescription>
                    States with the highest number of applicants
                  </CardDescription>
                </CardHeader>
                <CardContent className='pl-2'>
                  <ResponsiveContainer width='100%' height={350}>
                    <BarChart data={locationData} layout='vertical'>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis type='number' />
                      <YAxis dataKey='name' type='category' width={100} />
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                      <Bar
                        dataKey='value'
                        name='Applicants'
                        fill={colors.secondary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Urban vs Rural Distribution</CardTitle>
                  <CardDescription>Breakdown by community area</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={350}>
                    <PieChart>
                      <Pie
                        data={communityAreaData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({name, percent}) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill='#8884d8'
                        dataKey='value'>
                        {communityAreaData.map((entry, index) => {
                          const key = entry.name.toLowerCase().replace('-', '');
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors.community[key] || colors.info}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends by Location</CardTitle>
                <CardDescription>
                  Monthly enrollment growth by top locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={350}>
                  <AreaChart
                    data={[
                      {
                        month: 'Jan',
                        Lagos: 30,
                        Abuja: 20,
                        Kaduna: 15,
                        Rivers: 10,
                      },
                      {
                        month: 'Feb',
                        Lagos: 40,
                        Abuja: 25,
                        Kaduna: 20,
                        Rivers: 15,
                      },
                      {
                        month: 'Mar',
                        Lagos: 45,
                        Abuja: 30,
                        Kaduna: 25,
                        Rivers: 20,
                      },
                      {
                        month: 'Apr',
                        Lagos: 55,
                        Abuja: 45,
                        Kaduna: 35,
                        Rivers: 25,
                      },
                      {
                        month: 'May',
                        Lagos: 70,
                        Abuja: 60,
                        Kaduna: 45,
                        Rivers: 30,
                      },
                      {
                        month: 'Jun',
                        Lagos: 95,
                        Abuja: 75,
                        Kaduna: 55,
                        Rivers: 40,
                      },
                    ]}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='Lagos'
                      stackId='1'
                      stroke={colors.primary}
                      fill={colors.primary}
                    />
                    <Area
                      type='monotone'
                      dataKey='Abuja'
                      stackId='1'
                      stroke={colors.secondary}
                      fill={colors.secondary}
                    />
                    <Area
                      type='monotone'
                      dataKey='Kaduna'
                      stackId='1'
                      stroke={colors.tertiary}
                      fill={colors.tertiary}
                    />
                    <Area
                      type='monotone'
                      dataKey='Rivers'
                      stackId='1'
                      stroke={colors.info}
                      fill={colors.info}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='courses' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollment Distribution</CardTitle>
                <CardDescription>
                  Breakdown of enrollments by course
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                {courseEnrollmentData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={400}>
                    <BarChart data={courseEnrollmentData} layout='vertical'>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis type='number' />
                      <YAxis dataKey='name' type='category' width={200} />
                      <Tooltip formatter={value => formatNumber(value)} />
                      <Legend />
                      <Bar
                        dataKey='value'
                        name='Enrollments'
                        fill={colors.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex items-center justify-center h-[400px]'>
                    <p className='text-muted-foreground'>
                      No course enrollment data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='grid gap-4 md:grid-cols-2'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Enrollment Completion Progress</CardTitle>
                  <CardDescription>
                    Distribution by completion percentage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completionRangeData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={350}>
                      <PieChart>
                        <Pie
                          data={completionRangeData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'>
                          {completionRangeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.completion[entry.name] || colors.info
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={value => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No completion data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Average Completion Rate</CardTitle>
                  <CardDescription>
                    Overall course completion progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.enrollmentProgressData ? (
                    <div className='space-y-8'>
                      <div className='flex flex-col items-center justify-center h-[200px]'>
                        <div className='text-6xl font-bold text-primary'>
                          {data.enrollmentProgressData.averageCompletion}%
                        </div>
                        <p className='text-sm text-muted-foreground mt-2'>
                          Average completion rate
                        </p>
                      </div>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-sm'>
                            <span>Overall Progress</span>
                            <span className='font-medium'>
                              {data.enrollmentProgressData.averageCompletion}%
                            </span>
                          </div>
                          <Progress
                            value={Number(
                              data.enrollmentProgressData.averageCompletion,
                            )}
                            className='h-2'
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-[350px]'>
                      <p className='text-muted-foreground'>
                        No completion data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Internship & Project Distribution</CardTitle>
                <CardDescription>
                  Breakdown by internship program and project type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-8 md:grid-cols-2'>
                  <div>
                    <h3 className='text-lg font-medium mb-4'>
                      Internship Programs
                    </h3>
                    {internshipProgramData.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={internshipProgramData}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='name' />
                          <YAxis />
                          <Tooltip formatter={value => formatNumber(value)} />
                          <Legend />
                          <Bar
                            dataKey='value'
                            name='Participants'
                            fill={colors.tertiary}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px]'>
                        <p className='text-muted-foreground'>
                          No internship program data available
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className='text-lg font-medium mb-4'>Project Types</h3>
                    {projectTypeData.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={projectTypeData}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='name' />
                          <YAxis />
                          <Tooltip formatter={value => formatNumber(value)} />
                          <Legend />
                          <Bar
                            dataKey='value'
                            name='Projects'
                            fill={colors.secondary}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px]'>
                        <p className='text-muted-foreground'>
                          No project type data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

OverviewPage.getLayout = function (page) {
  return React.createElement(DashboardLayout, null, page);
};

export default OverviewPage;
