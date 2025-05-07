import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { bigint_filter } from "./enrollments"

// Define our own types based on the schema
interface Course {
  id: bigint;
  name: string;
  active: boolean | null;
  description: string | null;
  created_at: Date;
  uid: string;
  course_capacity: number | null;
  course_colour: string | null;
  slug: string | null;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // If you don't have the NEXTAUTH_SECRET environment variable set,
    // you will have to pass your secret as `secret` to `getToken`
    // const token = await getToken({ req })
    // console.log(req.body)
    // if (!token) {
    //   return res.status(401).send({
    //     error: "You must be signed in to view the protected content on this page.",
    //   })
    // }
    if (req.method === "POST") {
        let course_list: { id: bigint }[] = []
        try {
            let {
                name,
                location,
                seats,
                courses
            } = typeof(req.body) === 'object' ? req.body : JSON.parse(req.body)

            if (courses?.length) {
                const cl = await prisma.course.findMany({
                    where: { 
                        id: {
                            in : courses
                        } 
                    }
                })
                course_list = cl?.map((c: Course) => ({id: c.id}))
            }

            const result = await prisma.location.create({
                data: {
                    name,
                    location,
                    seats,
                    // BUG: schema refactor caused error
                    // TODO: Update code
                    // courses: course_list.length? {
                    //     connect: course_list
                    // } : {}
                }
            })
            //Send success response
            return res.status(201).send(bigint_filter(result));
        } catch (err) {
            console.error(err)
            if (err instanceof Error) {
                return res.status(400).send(err.message)
            }
            return res.status(400).send('An error occurred')
        }
    }
    
    try {
        const locations = await prisma.location.findMany({})
        return res.status(200).send(bigint_filter(locations))
    } catch (err) {
        console.error(err)
    }
}
