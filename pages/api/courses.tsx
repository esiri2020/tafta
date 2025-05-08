import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { bigint_filter } from './enrollments'

interface ThinkificCourse {
    id: string;
    description: string;
    name: string;
    slug: string;
    reviews_enabled: boolean;
}

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
            // Check authentication
            const token = await getToken({ req });
            if (!token || !token.userData) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // First try to get courses from local database
            const localCourses = await prisma.course.findMany({
                where: {
                    active: true
                }
            });

            // If we have courses in local database, return them
            if (localCourses.length > 0) {
                return res.status(200).json({ courses: bigint_filter(localCourses) });
            }

            // If no local courses, try to fetch from Thinkific API
            try {
                const response = await api.get(`/courses?limit=1000`);
                if (response.status === 200) {
                    const { data: { items } } = response;
                    
                    await Promise.all(items.map(async (course: ThinkificCourse) => {
                        const { 
                            id,
                            description,
                            name,       
                            slug,
                            reviews_enabled
                        } = course;
                        
                        await prisma.course.upsert({
                            where: { id: BigInt(id) },
                            update: {
                                description,
                                name,       
                                slug,
                                active: reviews_enabled
                            },
                            create: {
                                id: BigInt(id),
                                description,
                                name,       
                                slug,
                                active: reviews_enabled
                            }
                        });
                    }));

                    const courses = await prisma.course.findMany({
                        where: {
                            active: true
                        }
                    });
                    return res.status(200).json({ courses: bigint_filter(courses) });
                }
            } catch (apiError) {
                console.error('Error fetching from Thinkific API:', apiError);
                // If API fails, return empty array instead of error
                return res.status(200).json({ courses: [] });
            }

            // If we get here, return empty array
            return res.status(200).json({ courses: [] });
        } catch (err) {
            console.error('Error in courses endpoint:', err);
            // Return empty array instead of error
            return res.status(200).json({ courses: [] });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}