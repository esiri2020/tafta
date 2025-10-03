import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CREATE cohort
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
      
      // Handle nested structure from the form
      let cohortData;
      if (body.values) {
        // Form sends: { cohortCourses: [...], centers: [...], values: { name, color, start_date, end_date, active } }
        const { name, start_date, end_date, active = true, color = '#FF7A00' } = body.values;
        cohortData = { name, start_date, end_date, active, color };
      } else {
        // Direct structure: { name, start_date, end_date, active, color }
        const { name, start_date, end_date, active = true, color = '#FF7A00' } = body || {};
        cohortData = { name, start_date, end_date, active, color };
      }

      const { name, start_date, end_date, active, color } = cohortData;

      if (!name || !start_date || !end_date) {
        return res.status(400).json({ message: 'Missing required fields: name, start_date, end_date' });
      }

      const cohort = await prisma.cohort.create({
        data: {
          name: String(name),
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          active: Boolean(active),
          color: String(color),
        },
        select: {
          id: true,
          name: true,
          start_date: true,
          end_date: true,
          active: true,
          color: true,
        },
      });

      // Handle cohort courses and centers if provided
      const { cohortCourses = [], centers = [] } = body;
      
      if (cohortCourses.length > 0 || centers.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Create cohort courses
          if (cohortCourses.length > 0) {
            await tx.cohortCourse.createMany({
              data: cohortCourses.map((cc: any) => ({
                cohortId: cohort.id,
                courseId: String(cc.course_id),
                course_id: BigInt(cc.course_id),
                course_limit: parseInt(cc.course_limit) || 0,
              })),
            });
          }

          // Create locations  
          if (centers.length > 0) {
            await tx.location.createMany({
              data: centers.map((center: any) => ({
                name: center.centerName,
                location: center.location,
                seats: parseInt(center.numberOfSeats) || 0,
              })),
            });
          }
        });
      }

      return res.status(201).json({ message: 'success', cohort });
    } catch (error) {
      console.error('❌ Error creating cohort:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // UPDATE cohort (PUT/PATCH)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
      const { cohortCourses = [], centers = [], values } = body;
      
      if (!values || !values.id) {
        return res.status(400).json({ message: 'Missing cohort ID for update' });
      }

      const { id, name, start_date, end_date, active, color } = values;

      // Start transaction to update cohort and related data
      const result = await prisma.$transaction(async (tx) => {
        // Update the cohort
        const updatedCohort = await tx.cohort.update({
          where: { id },
          data: {
            name: String(name),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            active: Boolean(active),
            color: String(color),
          },
        });

        // Handle cohort courses
        if (Array.isArray(cohortCourses)) {
          // Delete existing cohort courses
          await tx.cohortCourse.deleteMany({
            where: { cohortId: id }
          });

          // Create new cohort courses
          if (cohortCourses.length > 0) {
            await tx.cohortCourse.createMany({
              data: cohortCourses.map((cc: any) => ({
                cohortId: id,
                courseId: String(cc.course_id),
                course_id: BigInt(cc.course_id),
                course_limit: parseInt(cc.course_limit) || 0,
              })),
            });
          }
        }

        // Handle locations (centers)
        if (Array.isArray(centers)) {
          // For now, just create new locations - they're not directly linked to cohorts in our schema
          // In the future, you might want to create CohortToLocation relationships
          if (centers.length > 0) {
            await tx.location.createMany({
              data: centers.map((center: any) => ({
                name: center.centerName,
                location: center.location,
                seats: parseInt(center.numberOfSeats) || 0,
              })),
            });
          }
        }

        return updatedCohort;
      });

      return res.status(200).json({ message: 'success', cohort: result });
    } catch (error) {
      console.error('❌ Error updating cohort:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { page = 0, limit = 100, filter, query } = req.query;
    
    console.log('🔍 Cohorts API Debug:', {
      page,
      limit,
      filter,
      query,
      timestamp: new Date().toISOString()
    });

    // Build where clause
    const where: any = {};
    
    if (filter && filter !== 'undefined') {
      // Handle both 'true'/'false' strings and boolean values
      const filterValue = Array.isArray(filter) ? filter[0] : filter;
      if (filterValue === 'true') {
        where.active = true;
      } else if (filterValue === 'false') {
        where.active = false;
      }
    }
    
    if (query) {
      where.name = { contains: query as string, mode: 'insensitive' };
    }

    // Get cohorts with pagination
    const cohorts = await prisma.cohort.findMany({
      where,
      orderBy: { start_date: 'desc' },
      skip: Number(page) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
        active: true,
        color: true,
        cohortCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
              }
            }
          }
        }
      }
    });

    // Get total count
    const total = await prisma.cohort.count({ where });

    console.log('✅ Cohorts fetched:', {
      count: cohorts.length,
      total,
      page: Number(page),
      limit: Number(limit)
    });

    res.status(200).json({
      message: 'success',
      cohorts,
      count: total, // Frontend expects count directly
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching cohorts:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  }
}
