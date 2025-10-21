import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import {env} from 'process';
import {DashboardData, LocationData} from '../types';
import {RootState} from '../store';
import {getSession} from 'next-auth/react';
import type {Session, UserData} from 'next-auth';
import type {Notification} from '../components/dashboard/notifications/notification-panel';

// No need to extend Session type as it's already defined in next-auth.d.ts

interface ResultData {
  id: string;
}

function providesList<
  R extends {id: string | number}[],
  T extends string,
  E extends FetchBaseQueryError,
>(resultsWithIds: R | undefined, tagType: T, error: E | undefined) {
  return resultsWithIds
    ? [
        {type: tagType, id: 'PARTIAL-LIST'},
        ...resultsWithIds.map(({id}) => ({type: tagType, id})),
      ]
    : error?.status === 401
    ? ['UNAUTHORIZED']
    : error?.status === 403
    ? ['NOT ALLOWED']
    : ['UNKNOWN_ERROR'];
}

//testing
const url: string =
  process.env.NODE_ENV === 'production'
    ? 'https://reg.terraacademyforarts.com/api/'
    : 'http://localhost:3000/api/';

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: async headers => {
      const session = (await getSession()) as Session & {userData?: UserData};
      if (session?.userData?.userId) {
        headers.set('authorization', `Bearer ${session.userData.userId}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Applicants',
    'Enrollments',
    'Users',
    'SeatBookings',
    'Cohorts',
    'Courses',
    'CohortCourses',
    'Reports',
    'Notifications',
    'ProfileChanges',
    'Assessments',
    'Mobilizer',
    'UNAUTHORIZED',
    'NOT ALLOWED',
    'UNKNOWN_ERROR',
    'Dashboard',
  ],
  endpoints: builder => ({
    login: builder.mutation({
      query: body => ({
        url: 'auth/callback/credentials',
        method: 'POST',
        body,
      }),
      invalidatesTags: result => (result ? ['UNAUTHORIZED'] : []),
    }),
    resetPassword: builder.mutation({
      query: ({password}: {password: string}) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body: {password},
      }),
    }),
    getDashboardData: builder.query<DashboardData, {cohortId?: string}>({
      query: ({cohortId}) =>
        cohortId ? `dashboard?cohortId=${cohortId}` : `dashboard`,
      providesTags: ['Dashboard'],
    }),
    getLocationBreakdown: builder.query<LocationData, {cohortId?: string}>({
      query: ({cohortId}) =>
        cohortId
          ? `dashboard/location-breakdown?cohortId=${cohortId}`
          : `dashboard/location-breakdown`,
      providesTags: ['Dashboard'],
    }),
    getEnrollments: builder.query({
      query: ({
        page,
        limit,
        course,
        status,
        cohort,
        gender,
        search,
        dateFrom,
        dateTo,
      }) => {
        // Build the query string with all parameters
        let queryString = `enrollments/cached?page=${page}&limit=${limit}`;

        if (course && course.length) {
          queryString += `&course=${course}`;
        }

        if (status) {
          queryString += `&status=${status}`;
        }

        if (cohort) {
          queryString += `&cohort=${cohort}`;
        }

        if (gender) {
          queryString += `&gender=${gender}`;
        }

        if (search) {
          queryString += `&search=${search}`;
        }

        if (dateFrom) {
          queryString += `&dateFrom=${dateFrom}`;
        }

        if (dateTo) {
          queryString += `&dateTo=${dateTo}`;
        }

        return queryString;
      },
      providesTags: result =>
        result
          ? [
              ...result.enrollments?.map(({id}: ResultData) => ({
                type: 'Enrollments',
                id,
              })),
              {type: 'Enrollments', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'Enrollments', id: 'PARTIAL-LIST'}],
    }),
    createEnrollment: builder.mutation({
      query: ({body}) => ({
        url: `enrollments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Enrollments', id: result.id}] : ['Enrollments'],
    }),
    getApplicants: builder.query({
      query: ({page, limit, filter, query, cohortId, mobilizerId, sort}) => {
        // Build query parameters dynamically
        const params = new URLSearchParams();
        
        if (page !== undefined) params.append('page', page.toString());
        if (limit !== undefined) params.append('limit', limit.toString());
        if (filter !== undefined && filter !== null) params.append('filter', filter);
        if (query !== undefined && query !== null) params.append('query', query);
        if (cohortId !== undefined && cohortId !== null) params.append('cohortId', cohortId);
        if (mobilizerId !== undefined && mobilizerId !== null) params.append('mobilizerId', mobilizerId);
        if (sort !== undefined && sort !== null) params.append('sort', sort);
        
        return `applicants?${params.toString()}`;
      },
      providesTags: (result, args, error) =>
        result
          ? [
              ...result.applicants.map(({id}: ResultData) => ({
                type: 'Applicants',
                id,
              })),
              {type: 'Applicants', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'Applicants', id: 'PARTIAL-LIST'}],
    }),
    getApplicant: builder.query({
      query: id => `applicants/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: arg.id}] : ['Applicants'],
    }),
    createApplicant: builder.mutation({
      query: ({body}) => ({
        url: 'auth/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: result.id}] : ['Applicants'],
    }),
    editApplicant: builder.mutation({
      query: ({id, body}) => ({
        url: `applicants/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: arg.id}] : ['Applicants'],
    }),
    deleteApplicant: builder.mutation({
      query: id => ({
        url: `applicants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: arg.id}] : ['Applicants'],
    }),
    deleteApplicants: builder.mutation({
      query: ({ids}) => ({
        url: `applicants`,
        method: 'DELETE',
        body: {ids},
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: arg.id}] : ['Applicants'],
    }),
    approveApplicants: builder.mutation({
      query: ({ids}) => ({
        url: `applicants`,
        method: 'PATCH',
        body: {ids},
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Applicants', id: result.user?.id}] : ['Applicants'],
    }),
    getUsers: builder.query({
      query: ({page, limit, filter, query}) => {
        // Build query parameters dynamically
        const params = new URLSearchParams();
        
        if (page !== undefined) params.append('page', page.toString());
        if (limit !== undefined) params.append('limit', limit.toString());
        if (filter !== undefined && filter !== null) params.append('filter', filter);
        if (query !== undefined && query !== null) params.append('query', query);
        
        return `users?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.users.map(({id}: ResultData) => ({
                type: 'Users',
                id,
              })),
              {type: 'Users', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'Users', id: 'PARTIAL-LIST'}],
    }),
    getUser: builder.query({
      query: id => `users/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'Users', id: arg.id}] : ['Users'],
    }),
    createUser: builder.mutation({
      query: ({body}) => ({
        url: 'auth/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Users', id: 'PARTIAL-LIST'}] : ['Users'],
    }),
    editUser: builder.mutation({
      query: ({id, body}) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Users', id: arg.id}] : ['Users'],
    }),
    deleteUser: builder.mutation({
      query: id => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Users', id: 'PARTIAL-LIST'}] : ['Users'],
    }),
    getCohorts: builder.query({
      query: ({page = 0, limit = 100, filter, query}) => {
        // Build query parameters dynamically
        const params = new URLSearchParams();
        
        if (page !== undefined) params.append('page', page.toString());
        if (limit !== undefined) params.append('limit', limit.toString());
        if (filter !== undefined && filter !== null && filter !== 'undefined') params.append('filter', filter);
        if (query !== undefined && query !== null) params.append('query', query);
        
        return `cohort?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.cohorts?.map(({id}: ResultData) => ({
                type: 'Cohorts',
                id,
              })),
              {type: 'Cohorts', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'Cohorts'}],
    }),
    getCohortCourses: builder.query({
      query: ({id}) =>
        id && id !== 'default' ? `cohort/${id}/courses?includeAll=1` : `courses`,
      providesTags: result =>
        result
          ? [
              ...(result.cohortCourses?.map(({id}: ResultData) => ({
                type: 'Cohorts',
                id,
              })) || []),
              {type: 'CohortCourses', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'CohortCourses', id: 'PARTIAL-LIST'}],
    }),
    deleteCohortCourses: builder.mutation({
      query: ({id, cohortCourseId}) => ({
        url: `cohort/${id}/courses?cohortCourseId=${cohortCourseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Cohorts', id: 'PARTIAL-LIST'}] : ['Cohorts'],
    }),
    createCohort: builder.mutation({
      query: ({body}) => ({
        url: 'cohort',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Cohorts', id: result.id}] : ['Cohorts'],
    }),
    editCohort: builder.mutation({
      query: ({id, body}) => ({
        url: `cohort/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Cohorts', id: arg.id}] : ['Cohorts'],
    }),
    deleteCohort: builder.mutation({
      query: id => ({
        url: `cohort/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Cohorts', id: 'PARTIAL-LIST'}] : ['Cohorts'],
    }),
    getCourses: builder.query({
      query: () => `courses`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.courses.map((course: ResultData) => ({
                type: 'Courses',
                id: course.id,
              })),
            ]
          : ['Courses'],
    }),
    getCohortCoursesForEnrollments: builder.query({
      query: (cohortId: string) => `cohorts/${cohortId}/courses`,
      providesTags: (result, error, arg) =>
        result && result.courses && Array.isArray(result.courses)
          ? [
              ...result.courses.map((course: ResultData) => ({
                type: 'Courses',
                id: course.id,
              })),
            ]
          : ['Courses'],
    }),
    getEnrollmentCourses: builder.query({
      query: (cohortId?: string) => `enrollments/courses${cohortId ? `?cohortId=${cohortId}` : ''}`,
      providesTags: (result, error, arg) =>
        result && result.courses && Array.isArray(result.courses)
          ? [
              ...result.courses.map((course: ResultData) => ({
                type: 'Courses',
                id: course.id,
              })),
            ]
          : ['Courses'],
    }),
    getSeatBookings: builder.query({
      query: ({
        page,
        limit,
      }: {
        page?: number | string;
        limit: number | string;
      }) =>
        page ? `seat-booking?page=${page}&limit=${limit}` : 'seat-booking',
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.seatBookings.map((booking: ResultData) => ({
                type: 'SeatBookings',
                id: booking.id,
              })),
            ]
          : ['SeatBookings'],
    }),
    createSeatBooking: builder.mutation({
      query: ({body}) => ({
        url: 'seat-booking',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result
          ? [{type: 'SeatBookings', id: result.seatBooking.id}]
          : ['SeatBookings'],
    }),
    deleteSeatBooking: builder.mutation({
      query: ({id}) => ({
        url: 'seat-booking',
        method: 'DELETE',
        body: {id},
      }),
      invalidatesTags: (result, error, arg) =>
        result
          ? [{type: 'SeatBookings', id: result.seatBooking.id}]
          : ['SeatBookings'],
    }),
    getReports: builder.query({
      query: ({
        page,
        limit,
        cohort,
        query,
      }: {
        page?: number | string;
        limit: number | string;
        cohort?: string[];
        query?: string;
      }) =>
        `report?page=${page}&limit=${limit}&cohort=${cohort}&query=${query}`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.reports.map((report: ResultData) => ({
                type: 'Reports',
                id: report.id,
              })),
            ]
          : ['Reports'],
    }),
    createReport: builder.mutation({
      query: ({body}) => ({
        url: 'report',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Reports', id: result.report.id}] : ['Reports'],
    }),
    deleteReport: builder.mutation({
      query: ({id}) => ({
        url: 'report',
        method: 'DELETE',
        body: {id},
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Reports', id: result.report.id}] : ['Reports'],
    }),
    refetchErroredQueries: builder.mutation<null, void>({
      queryFn: () => ({data: null}),
      invalidatesTags: ['UNKNOWN_ERROR'],
    }),
    // New endpoint for auto enrollment
    autoEnrollment: builder.mutation({
      query: ({applicants}) => ({
        url: 'automaticEnrollments',
        method: 'PATCH',
        body: {applicants},
      }),
      invalidatesTags: ['Enrollments'],
    }),
    // Notification endpoints
    getNotifications: builder.query({
      query: ({page, limit, search, status, type, tag}) => {
        let queryString = `notifications?page=${page}&limit=${limit}`;

        if (search) {
          queryString += `&search=${search}`;
        }

        if (status) {
          queryString += `&status=${status}`;
        }

        if (type) {
          queryString += `&type=${type}`;
        }

        if (tag) {
          queryString += `&tag=${tag}`;
        }

        return queryString;
      },
      providesTags: result =>
        result
          ? [
              ...result.notifications?.map(({id}: {id: string}) => ({
                type: 'Notifications',
                id,
              })),
              {type: 'Notifications', id: 'PARTIAL-LIST'},
            ]
          : [{type: 'Notifications', id: 'PARTIAL-LIST'}],
    }),
    sendNotification: builder.mutation({
      query: body => {
        console.log('RTK Query sending notification:', body);
        return {
          url: 'notifications',
          method: 'POST',
          body,
        };
      },
      // Transform the response to handle errors better
      transformResponse: (response, meta, arg) => {
        console.log('Notification response:', response);
        return response;
      },
      // Transform errors for better debugging
      transformErrorResponse: (response, meta, arg) => {
        console.error('Notification error:', response);
        return response;
      },
      invalidatesTags: [{type: 'Notifications', id: 'PARTIAL-LIST'}],
    }),

    sendCohortNotification: builder.mutation({
      query: body => ({
        url: 'notifications/cohort',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{type: 'Notifications', id: 'PARTIAL-LIST'}],
    }),

    markNotificationsAsRead: builder.mutation({
      query: body => ({
        url: 'notifications',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        arg.markAllAsRead
          ? [{type: 'Notifications' as const, id: 'PARTIAL-LIST'}]
          : arg.notificationIds?.map((id: string) => ({
              type: 'Notifications' as const,
              id,
            })) || [],
    }),

    deleteNotifications: builder.mutation({
      query: body => ({
        url: 'notifications',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        arg.notificationIds?.map((id: string) => ({
          type: 'Notifications' as const,
          id,
        })) || [],
    }),

    // Assessment endpoints
    getUserAssessment: builder.query({
      query: userId => `assessment/${userId}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'Assessments', id: result.id}] : ['Assessments'],
    }),

    createAssessment: builder.mutation({
      query: ({body}) => ({
        url: 'assessment',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Assessments', id: result.id}] : ['Assessments'],
    }),

    updateAssessment: builder.mutation({
      query: ({id, body}) => ({
        url: `assessment/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Assessments', id: arg.id}] : ['Assessments'],
    }),

    // New endpoint for assessment metrics
    getAssessmentMetrics: builder.query({
      query: ({cohortId}) =>
        cohortId
          ? `assessment/metrics?cohortId=${cohortId}`
          : `assessment/metrics`,
      providesTags: ['Assessments'],
    }),

    archiveNotification: builder.mutation<Notification, string>({
      query: id => ({
        url: `/api/notifications/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Add these endpoints to the existing API service
    getCohortAlerts: builder.query({
      query: ({page = 1, limit = 10, cohortId}) => ({
        url: '/api/notifications/cohort-alerts',
        method: 'GET',
        params: {page, limit, cohortId},
      }),
      providesTags: ['Notifications'],
    }),

    triggerCohortAlert: builder.mutation({
      query: data => ({
        url: '/api/notifications/cohort-alerts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),

    getSeatBooking: builder.query({
      query: id => `seat-bookings/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'SeatBookings', id: arg.id}] : ['SeatBookings'],
    }),
    editSeatBooking: builder.mutation({
      query: ({id, body}) => ({
        url: `seat-bookings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'SeatBookings', id: arg.id}] : ['SeatBookings'],
    }),
    getCohort: builder.query({
      query: id => `cohorts/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'Cohorts', id: arg.id}] : ['Cohorts'],
    }),
    getCourse: builder.query({
      query: id => `courses/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'Courses', id: arg.id}] : ['Courses'],
    }),
    createCourse: builder.mutation({
      query: ({body}) => ({
        url: 'courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Courses'],
    }),
    editCourse: builder.mutation({
      query: ({id, body}) => ({
        url: `courses/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Courses', id: arg.id}] : ['Courses'],
    }),
    deleteCourse: builder.mutation({
      query: id => ({
        url: `courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{type: 'Courses', id: arg.id}] : ['Courses'],
    }),
    getCohortCourse: builder.query({
      query: id => `cohort-courses/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{type: 'CohortCourses', id: arg.id}] : ['CohortCourses'],
    }),

    // Mobilizer endpoints
    getAllMobilizerCodes: builder.query<{ mobilizers: any[]; total: number }, { cohortId?: string }>({
      query: ({ cohortId }) => ({
        url: '/mobilizers/all-codes',
        method: 'GET',
        params: cohortId ? { cohortId } : {},
      }),
      providesTags: ['Mobilizer'],
    }),

    getMobilizerById: builder.query<any, string>({
      query: (id) => ({
        url: `/mobilizers/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Mobilizer', id }],
    }),

    createMobilizer: builder.mutation<any, any>({
      query: (data) => ({
        url: '/mobilizers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mobilizer'],
    }),

    updateMobilizer: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/mobilizers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Mobilizer', id }],
    }),

    deleteMobilizer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/mobilizers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mobilizer'],
    }),

    registerMobilizer: builder.mutation<any, any>({
      query: (data) => ({
        url: '/mobilizers/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mobilizer'],
    }),

    getMobilizerStats: builder.query<any, string>({
      query: (id) => ({
        url: `/mobilizers/${id}/stats`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Mobilizer', id: `${id}-stats` }],
    }),
  }),
});

// Export all hooks
export const {
  useGetDashboardDataQuery,
  useGetLocationBreakdownQuery,
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useGetApplicantsQuery,
  useGetApplicantQuery,
  useCreateApplicantMutation,
  useEditApplicantMutation,
  useDeleteApplicantMutation,
  useDeleteApplicantsMutation,
  useApproveApplicantsMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
  useGetSeatBookingsQuery,
  useCreateSeatBookingMutation,
  useDeleteSeatBookingMutation,
  useGetCohortsQuery,
  useCreateCohortMutation,
  useEditCohortMutation,
  useDeleteCohortMutation,
  useGetCoursesQuery,
  useGetCohortCoursesQuery,
  useGetCohortCoursesForEnrollmentsQuery,
  useGetEnrollmentCoursesQuery,
  useDeleteCohortCoursesMutation,
  useGetReportsQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useAutoEnrollmentMutation,
  useGetNotificationsQuery,
  useSendNotificationMutation,
  useSendCohortNotificationMutation,
  useMarkNotificationsAsReadMutation,
  useDeleteNotificationsMutation,
  useGetUserAssessmentQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useGetAssessmentMetricsQuery,
  useArchiveNotificationMutation,
  useGetCohortAlertsQuery,
  useTriggerCohortAlertMutation,
  useResetPasswordMutation,
  useGetAllMobilizerCodesQuery,
  useGetMobilizerByIdQuery,
  useCreateMobilizerMutation,
  useUpdateMobilizerMutation,
  useDeleteMobilizerMutation,
  useRegisterMobilizerMutation,
  useGetMobilizerStatsQuery,
} = apiService;
