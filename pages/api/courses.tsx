import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { Course } from "@prisma/client";
import { bigint_filter } from './enrollments'

async function asyncForEach(array: any[], callback: (arg0: any, arg1: number, arg2: any) => any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET'){
        try {
            const response = await api.get(`/courses?limit=1000`)
            if(response.status === 200 ) {
                const {data : {items}} = response
                const course_list: Course[] = []
                items.forEach( async (course: any) => {
                    const { id,
                            description,
                            name,       
                            slug,
                            reviews_enabled
                        } = course     
                    const active = true    
                    const c = await prisma.course.upsert({
                        where: {
                        id
                        },
                        update: {
                            id,
                            description,
                            name,       
                            slug,
                            active: reviews_enabled
                        },
                        create: {
                            id,
                            description,
                            name,       
                            slug,
                            active: reviews_enabled
                        }
                    })
                    course_list.push(c)
                })
                const courses =  await prisma.course.findMany({
                    where: {
                        active: true
                    }
                })
                return res.send({courses: bigint_filter(courses)})
            }
            return res.status(400).send(response.status)
        } catch (err) {
            console.error(err)
<<<<<<< HEAD
            return res.send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
            if (err instanceof Error) {
                return res.send(err.message)
            }
            return res.send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
        }
    }
}