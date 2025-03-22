import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "process";
import { DashboardData } from "../types";

interface ResultData {
  id: string;
}

function providesList<
  R extends { id: string | number }[],
  T extends string,
  E extends FetchBaseQueryError
>(resultsWithIds: R | undefined, tagType: T, error: E | undefined) {
  return resultsWithIds
    ? [
        { type: tagType, id: "PARTIAL-LIST" },
        ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
      ]
    : error?.status === 401
    ? ["UNAUTHORIZED"]
    : error?.status === 403
    ? ["NOT ALLOWED"]
    : ["UNKNOWN_ERROR"];
}

// const url: string = env["API"] ? env["API"] : "https://reg.terraacademyforarts.com/api/";
const url: string = env["API"] ? env["API"] : "http://localhost:3000/api/";


export const apiService = createApi({
  reducerPath: "apiService",
  baseQuery: fetchBaseQuery({ baseUrl: url }),
  tagTypes: [
    "Applicants",
    "Enrollments",
    "Users",
    "SeatBookings",
    "Cohorts",
    "Courses",
    "CohortCourses",
    "Reports",
    "UNAUTHORIZED",
    "NOT ALLOWED",
    "UNKNOWN_ERROR",
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "auth/callback/credentials",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => (result ? ["UNAUTHORIZED"] : []),
    }),
    resetPassword: builder.mutation({
      query: ({ password }: { password: string }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { password },
      }),
    }),
    getDashboardData: builder.query<DashboardData, string | undefined | any>({
      query: ({ cohortId }) => `dashboard?cohortId=${cohortId}`,
    }),
    getEnrollments: builder.query({
      query: ({ page, limit, course, status, cohort }) =>
        `enrollments?page=${page}&limit=${limit}&course=${course}&status=${status}&cohort=${cohort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.enrollments?.map(({ id }: ResultData) => ({
                type: "Enrollments",
                id,
              })),
              { type: "Enrollments", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Enrollments", id: "PARTIAL-LIST" }],
    }),
    createEnrollment: builder.mutation({
      query: ({ body }) => ({
        url: `enrollments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Enrollments", id: result.id }] : ["Enrollments"],
    }),
    getApplicants: builder.query({
      query: ({ page, limit, filter, query, cohortId }) =>
        cohortId
          ? `applicants?page=${page}&limit=${limit}&filter=${filter}&query=${query}&cohortId=${cohortId}`
          : `applicants?page=${page}&limit=${limit}&filter=${filter}&query=${query}`,
      providesTags: (result, args, error) =>
        result
          ? [
              ...result.applicants.map(({ id }: ResultData) => ({
                type: "Applicants",
                id,
              })),
              { type: "Applicants", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Applicants", id: "PARTIAL-LIST" }],
    }),
    getApplicant: builder.query({
      query: (id) => `applicants/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{ type: "Applicants", id: arg.id }] : ["Applicants"],
    }),
    createApplicant: builder.mutation<
      { message: string; user: any },
      {
        body: {
          email: string;
          password: string;
          firstName: string;
          lastName: string;
          middleName?: string;
          type?: 'individual' | 'enterprise';
          // Temporary profile data for registration type
          profile?: {
            type: 'individual' | 'enterprise';
            // Individual fields
            employmentStatus?: string;
            salaryExpectation?: string | number;
            // Enterprise fields
            businessName?: string;
            businessType?: 'STARTUP' | 'EXISTING';
            revenueRange?: string;
            registrationType?: 'CAC' | 'SMEDAN';
            businessSupportNeeds?: string[];
          };
          cohortId?: string;
        };
      }
    >({
      query: ({ body }) => ({
        url: 'auth/signup',
        method: 'POST',
        body,
      }),
    }),
    editApplicant: builder.mutation({
      query: ({ id, body }) => ({
        url: `applicants/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Applicants", id: arg.id }] : ["Applicants"],
    }),
    deleteApplicant: builder.mutation({
      query: (id) => ({
        url: `applicants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Applicants", id: arg.id }] : ["Applicants"],
    }),
    deleteApplicants: builder.mutation({
      query: ({ ids }) => ({
        url: `applicants`,
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Applicants", id: arg.id }] : ["Applicants"],
    }),
    approveApplicants: builder.mutation({
      query: ({ ids }) => ({
        url: `applicants`,
        method: "PATCH",
        body: { ids },
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Applicants", id: result.user?.id }] : ["Applicants"],
    }),
    getUsers: builder.query({
      query: ({ page, limit, filter, query }) =>
        `users?page=${page}&limit=${limit}&filter=${filter}&query=${query}`,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }: ResultData) => ({
                type: "Users",
                id,
              })),
              { type: "Users", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Users", id: "PARTIAL-LIST" }],
    }),
    getUser: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, arg) =>
        result ? [{ type: "Users", id: arg.id }] : ["Users"],
    }),
    createUser: builder.mutation({
      query: ({ body }) => ({
        url: "auth/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Users", id: "PARTIAL-LIST" }] : ["Users"],
    }),
    editUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Users", id: arg.id }] : ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Users", id: "PARTIAL-LIST" }] : ["Users"],
    }),
    getCohorts: builder.query({
      query: ({ page = 0, limit = 100, filter = "undefined", query }) =>
        `cohort?page=${page}&limit=${limit}&filter=${filter}&query=${query}`,
      providesTags: (result) =>
        result
          ? [
              ...result.cohorts?.map(({ id }: ResultData) => ({
                type: "Cohorts",
                id,
              })),
              { type: "Cohorts", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Cohorts" }],
    }),
    getCohortCourses: builder.query({
      query: ({ id }) => `cohort/${id}/courses`,
      providesTags: (result) =>
        result
          ? [
              ...result.cohortCourses?.map(({ id }: ResultData) => ({
                type: "Cohorts",
                id,
              })),
              { type: "CohortCourses", id: "PARTIAL-LIST" },
            ]
          : [{ type: "CohortCourses", id: "PARTIAL-LIST" }],
    }),
    deleteCohortCourses: builder.mutation({
      query: ({ id, cohortCourseId }) => ({
        url: `cohort/${id}/courses?cohortCourseId=${cohortCourseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Cohorts", id: "PARTIAL-LIST" }] : ["Cohorts"],
    }),
    createCohort: builder.mutation({
      query: ({ body }) => ({
        url: "cohort",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Cohorts", id: result.id }] : ["Cohorts"],
    }),
    editCohort: builder.mutation({
      query: ({ id, body }) => ({
        url: `cohort/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Cohorts", id: arg.id }] : ["Cohorts"],
    }),
    deleteCohort: builder.mutation({
      query: (id) => ({
        url: `cohort/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Cohorts", id: "PARTIAL-LIST" }] : ["Cohorts"],
    }),
    getCourses: builder.query({
      query: () => `courses`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.courses.map((course: ResultData) => ({
                type: "Courses",
                id: course.id,
              })),
            ]
          : ["Courses"],
    }),
    getSeatBookings: builder.query({
      query: ({
        page,
        limit,
      }: {
        page?: number | string;
        limit: number | string;
      }) =>
        page ? `seat-booking?page=${page}&limit=${limit}` : "seat-booking",
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.seatBookings.map((booking: ResultData) => ({
                type: "SeatBookings",
                id: booking.id,
              })),
            ]
          : ["SeatBookings"],
    }),
    createSeatBooking: builder.mutation({
      query: ({ body }) => ({
        url: "seat-booking",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result
          ? [{ type: "SeatBookings", id: result.seatBooking.id }]
          : ["SeatBookings"],
    }),
    deleteSeatBooking: builder.mutation({
      query: ({ id }) => ({
        url: "seat-booking",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) =>
        result
          ? [{ type: "SeatBookings", id: result.seatBooking.id }]
          : ["SeatBookings"],
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
                type: "Reports",
                id: report.id,
              })),
            ]
          : ["Reports"],
    }),
    createReport: builder.mutation({
      query: ({ body }) => ({
        url: "report",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Reports", id: result.report.id }] : ["Reports"],
    }),
    deleteReport: builder.mutation({
      query: ({ id }) => ({
        url: "report",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: "Reports", id: result.report.id }] : ["Reports"],
    }),
    refetchErroredQueries: builder.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["UNKNOWN_ERROR"],
    }),
    // New endpoint for auto enrollment
    autoEnrollment: builder.mutation({
      query: ({ applicants }) => ({
        url: "automaticEnrollments",
        method: "PATCH",
        body: { applicants },
      }),
      invalidatesTags: ["Enrollments"],
    }),
    getVerificationStatus: builder.query<
      { verified: boolean },
      { email: string }
    >({
      query: ({ email }) => ({
        url: `/auth/verify-status`,
        method: 'GET',
        params: { email }
      }),
    }),
    resendVerification: builder.mutation<
      { success: boolean },
      { email: string }
    >({
      query: ({ email }) => ({
        url: `/auth/resend-verification`,
        method: 'POST',
        body: { email }
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useResetPasswordMutation,
  useGetDashboardDataQuery,
  useGetApplicantsQuery,
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
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
  useGetCohortsQuery,
  useGetCohortCoursesQuery,
  useDeleteCohortCoursesMutation,
  useCreateCohortMutation,
  useEditCohortMutation,
  useDeleteCohortMutation,
  useGetCoursesQuery,
  useGetSeatBookingsQuery,
  useCreateSeatBookingMutation,
  useDeleteSeatBookingMutation,
  useGetReportsQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useAutoEnrollmentMutation,
  useGetVerificationStatusQuery,
  useResendVerificationMutation,
} = apiService;
