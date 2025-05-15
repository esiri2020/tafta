import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import {DashboardLayout} from '../../../components/dashboard/dashboard-layout';
import {SplashScreen} from '../../../components/splash-screen';
import {useGetAssessmentMetricsQuery} from '../../../services/api';
import {selectCohort} from '../../../services/cohortSlice';
import {useAppSelector} from '../../../hooks/rtkHook';
import {
  Activity,
  CheckCircle,
  Users,
  UserPlus,
  RefreshCw,
  BookOpen,
  Briefcase,
  ThumbsUp,
  Award,
  Star,
} from 'lucide-react';
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
import {format, parseISO} from 'date-fns';

const AssessmentOverviewPage = () => {
  const [skip, setSkip] = useState(false);
  const cohort = useAppSelector(state => selectCohort(state));
  const {data, error, isLoading} = useGetAssessmentMetricsQuery(
    {cohortId: cohort?.id},
    {skip},
  );

  useEffect(() => {
    setSkip(false);
  }, [cohort]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (error) {
    return <div>An error occurred: {error.toString()}</div>;
  }

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
    enrollment: {
      'Not Started': '#f59e0b',
      'In Progress': '#0ea5e9',
      Completed: '#10b981',
      Unknown: '#d1d5db',
    },
    employment: {
      employed: '#10b981',
      unemployed: '#f97316',
      Unknown: '#d1d5db',
    },
    creative: {
      Yes: '#0ea5e9',
      No: '#f97316',
      Unknown: '#d1d5db',
    },
    satisfaction: {
      unknown: '#d1d5db',
      not_satisfied: '#ef4444',
      satisfied: '#0ea5e9',
      very_satisfied: '#10b981',
    },
    rating: {
      poor: '#ef4444',
      fair: '#f59e0b',
      good: '#0ea5e9',
      excellent: '#10b981',
      Unknown: '#d1d5db',
    },
    skill: {
      no_work_done: '#d1d5db',
      sufficient: '#0ea5e9',
      insufficient: '#f97316',
      competitive: '#10b981',
      Unknown: '#d1d5db',
    },
    recommend: {
      true: '#10b981',
      false: '#ef4444',
      Unknown: '#d1d5db',
    },
  };

  // Format numbers with commas
  const formatNumber = num => {
    return Number.parseInt(num).toLocaleString();
  };

  // Custom tooltip for charts
  const CustomTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-2 border border-gray-200 shadow-md rounded-md'>
          <p className='font-semibold'>{label}</p>
          <p className='text-sm'>
            Count: <span className='font-medium'>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for pie charts
  const enrollmentStatusData = data.enrollmentStatus.map(item => ({
    name: item.status,
    value: item.count,
  }));

  const courseDistributionData = [...data.courseDistribution]
    .sort((a, b) => b.count - a.count)
    .map(item => ({
      name: item.course,
      value: item.count,
    }));

  const employmentStatusData = data.employmentStatus.map(item => ({
    name: item.status,
    value: item.count,
  }));

  const creativeSectorData = data.creativeSector.map(item => ({
    name: item.employed,
    value: item.count,
  }));

  const satisfactionLevelsData = data.satisfactionLevels.map(item => ({
    name: item.level,
    value: item.count,
  }));

  const skillRatingsData = data.skillRatings.map(item => ({
    name: item.rating,
    value: item.count,
  }));

  const recommendationsData = data.recommendations.map(item => ({
    name: item.value === true ? 'Yes' : item.value === false ? 'No' : 'Unknown',
    value: item.count,
  }));

  const platformRatingsData = data.platformRatings.map(item => ({
    name: item.rating,
    value: item.count,
  }));

  // Prepare bar chart data
  const courseBarData = [...data.courseDistribution]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      name: item.course,
      count: item.count,
    }));

  return (
    <>
      <Head>
        <title>Assessment Overview | TAFTA Admin Dashboard</title>
      </Head>
      <div className='container mx-auto p-4 md:p-6'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold'>Assessment Overview</h1>
            <p className='text-muted-foreground'>
              Analytics and statistics for student assessments
              {cohort && ` in cohort ${cohort.name}`}
            </p>
          </div>
          <Button variant='outline' onClick={refreshData}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
          <Card>
            <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium'>
                Total Assessments
              </CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatNumber(data.totalAssessments)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total assessments submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium'>
                In Creative Sector
              </CardTitle>
              <Award className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatNumber(
                  data.creativeSector.find(item => item.employed === 'Yes')
                    ?.count || 0,
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Working in creative industries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium'>
                Completed Courses
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatNumber(
                  data.enrollmentStatus.find(
                    item => item.status === 'Completed',
                  )?.count || 0,
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Participants who completed courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium'>
                Would Recommend
              </CardTitle>
              <ThumbsUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatNumber(
                  data.recommendations.find(item => item.value === true)
                    ?.count || 0,
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Participants who would recommend TAFTA
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue='courses' className='mb-8'>
          <TabsList className='mb-4'>
            <TabsTrigger value='courses'>Course Distribution</TabsTrigger>
            <TabsTrigger value='employment'>Employment Analysis</TabsTrigger>
            <TabsTrigger value='satisfaction'>
              Satisfaction & Ratings
            </TabsTrigger>
          </TabsList>

          {/* Course Distribution Tab */}
          <TabsContent value='courses'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Enrollment Status</CardTitle>
                  <CardDescription>
                    Distribution of participants by course enrollment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={enrollmentStatusData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {enrollmentStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.enrollment[entry.name] ||
                                colors.enrollment['Unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Course Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of assessments by course of study
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={courseBarData}
                        layout='vertical'
                        margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis type='number' />
                        <YAxis
                          type='category'
                          dataKey='name'
                          tick={{fontSize: 12}}
                          width={150}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey='count' fill={colors.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employment Analysis Tab */}
          <TabsContent value='employment'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Employment Status</CardTitle>
                  <CardDescription>
                    Current employment status of participants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={employmentStatusData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {employmentStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.employment[entry.name] ||
                                colors.employment['Unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Creative Sector Employment</CardTitle>
                  <CardDescription>
                    Participants working in creative industries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={creativeSectorData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {creativeSectorData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.creative[entry.name] ||
                                colors.creative['Unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Satisfaction & Ratings Tab */}
          <TabsContent value='satisfaction'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Satisfaction Levels</CardTitle>
                  <CardDescription>
                    How satisfied participants are with their work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={satisfactionLevelsData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {satisfactionLevelsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.satisfaction[entry.name] ||
                                colors.satisfaction['unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Would Recommend TAFTA</CardTitle>
                  <CardDescription>
                    Participants who would recommend the program to others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={recommendationsData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {recommendationsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === 'Yes'
                                  ? colors.success
                                  : entry.name === 'No'
                                  ? colors.danger
                                  : colors.secondary
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Platform Ratings</CardTitle>
                  <CardDescription>
                    How participants rate the TAFTA LMS platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={platformRatingsData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {platformRatingsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.rating[entry.name] ||
                                colors.rating['Unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Skill Ratings</CardTitle>
                  <CardDescription>
                    How participants rate their skills after the program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={skillRatingsData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({name, percent}) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'>
                          {skillRatingsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.skill[entry.name] ||
                                colors.skill['Unknown']
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Assessments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>
              The 5 most recently submitted assessment forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <div className='grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium'>
                <div>User</div>
                <div>Email</div>
                <div>Course</div>
                <div>Status</div>
                <div>Submitted</div>
              </div>
              {data.recentAssessments.map(assessment => (
                <div
                  key={assessment.id}
                  className='grid grid-cols-5 p-3 text-sm border-t hover:bg-muted/50'>
                  <div className='font-medium'>
                    {assessment.user.firstName} {assessment.user.lastName}
                  </div>
                  <div className='text-muted-foreground'>
                    {assessment.user.email}
                  </div>
                  <div>{assessment.courseOfStudy || 'N/A'}</div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        assessment.enrollmentStatus === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : assessment.enrollmentStatus === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {assessment.enrollmentStatus || 'Not Started'}
                    </span>
                  </div>
                  <div className='text-muted-foreground'>
                    {assessment.createdAt
                      ? format(new Date(assessment.createdAt), 'MMM d, yyyy')
                      : 'N/A'}
                  </div>
                </div>
              ))}

              {data.recentAssessments.length === 0 && (
                <div className='p-4 text-center text-muted-foreground'>
                  No assessment submissions found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

AssessmentOverviewPage.getLayout = page => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default AssessmentOverviewPage;
