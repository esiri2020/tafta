import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { Course } from "@prisma/client";
import { bigint_filter } from "./enrollments";

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
                course_list = cl?.map(c => ({id: c.id}))
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
            return res.status(400).send(err.message)
        }
    }
    
    try {
        const locations = await prisma.location.findMany({})
        return res.status(200).send(bigint_filter(locations))
    } catch (err) {
        console.error(err)
    }
}
