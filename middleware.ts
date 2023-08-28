import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const admin_regex = /admin-dashboard/gi
      // `/admin` requires admin role
      if (req.nextUrl.pathname.match(admin_regex)) {
        return token?.userData?.role === "SUPERADMIN" || token?.userData?.role === "ADMIN" || token?.userData?.role === "SUPPORT"
      }
      // `/me` only requires the user to be logged in
      return !!token
    },
  },
})

export const config = { 
  matcher: [
    "/admin-dashboard/:path*", 
    "/admin-dashboard", 
    "/dashboard/:path*",
    "/dashboard",
    "/me",
    "/reset-password",
    "/verify-email",
  ] 
}
