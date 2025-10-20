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
    console.log('Incoming request:', req.method, req.url);
    if (req.method === 'GET'){
        try {
            // Check authentication
            const token = await getToken({ req });
            console.log('Token:', token);
            if (!token || !token.userData) {
                console.log('Unauthorized access attempt');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Always fetch from Thinkific API and update local DB
            try {
                let allCourses: ThinkificCourse[] = [];
                let page = 1;
                let hasMore = true;
                const limit = 250; // Thinkific's max per page is usually 250
                while (hasMore) {
                    const response = await api.get(`/courses?limit=${limit}&page=${page}`);
                    console.log(`Thinkific API response page ${page}:`, response.status, response.data);
                    if (response.status === 200) {
                        const { data: { items, meta } } = response;
                        allCourses = allCourses.concat(items);
                        // Check if there are more pages
                        if (items.length < limit) {
                            hasMore = false;
                        } else {
                            page += 1;
                        }
                    } else {
                        hasMore = false;
                    }
                }
                await Promise.all(allCourses.map(async (course: ThinkificCourse) => {
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
                // Return all courses from DB (active and inactive) so the UI can select from full LMS catalog
                const courses = await prisma.course.findMany();
                return res.status(200).json({ courses: bigint_filter(courses) });
            } catch (apiError) {
                if (typeof apiError === 'object' && apiError !== null && 'response' in apiError) {
                    const err = apiError as any;
                    console.error('Error fetching from Thinkific API:', err.response?.status, err.response?.data, err);
                } else {
                    console.error('Error fetching from Thinkific API:', apiError);
                }
                // If API fails, return empty array instead of error
                return res.status(200).json({ courses: [] });
            }
        } catch (err) {
            console.error('Error in courses endpoint:', err);
            // Return empty array instead of error
            return res.status(200).json({ courses: [] });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}