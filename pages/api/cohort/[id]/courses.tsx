import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import prisma from "../../../../lib/prismadb"
import { bigint_filter } from '../../enrollments'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id }: { id?: string } = req.query
    if (!id) return res.status(400).json({ message: "ID not supplied" });
    if (req.method === "DELETE") {
        const token = await getToken({ req })
        if (!token || !token.userData || token.userData.role !== "SUPERADMIN") {
            return res.status(401).send({
                error: "Unauthorized.",
            })
        }
        try {
            const { cohortCourseId }: { cohortCourseId?: string } = req.query
            if (!cohortCourseId) return res.status(400).json({ message: "cohortCourseId not supplied" });

            const deletedCourses = await prisma.cohortCourse.delete({
                where: {
                    id: cohortCourseId
                }
            })
            return res.status(200).send({ message: 'Cohort Deleted', deletedCourses: bigint_filter(deletedCourses) })
        } catch (err) {
            console.error(err)
            if (err instanceof Error) {
                return res.status(400).send(err.message)
            }
            return res.status(400).send('An error occurred')
        }
    }
    try {
        const cohortCourses = await prisma.cohortCourse.findMany({
            where: {
                cohortId: id
            },
            include: {
                course: true
            }
        })

        return res.status(200).send(bigint_filter({ message: 'success', cohortCourses }))
    } catch (error) {
        console.error(error);
        res.status(400).send({ 
            message: "Something went wrong", 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
        });
    }
}