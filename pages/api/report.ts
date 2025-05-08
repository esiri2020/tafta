import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"
import { createWriteStream } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import prisma from "../../lib/prismadb"

type File = {
    filename: string
    path: string
}
// http://your-domain.com/delete.php?path=uploads/example.pdf

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const token = await getToken({ req })
    const userInfo = {
        user: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
            }
        },
        cohort: true
    }

    if (!token || token.userData?.role === 'APPLICANT') {
        return res.status(401).send({
            error: "You must be signed in to view the protected content on this page.",
        })
    }

    if (req.method === "POST") {
        const { title, description, cohortId, files }:
            { title?: string, description?: string, cohortId?: string, files?: string[] }
            = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)

        if (!title || !description || !cohortId) {
            res.status(400).json({ error: 'Missing required fields' })
            return
        }
        try {
            const user_email = token.email!
            // const safeFilename = title.replace(/\s+/g, '_') + '_' + Date.now() + '_' + name

            const report = await prisma.report.create({
                data: {
                    title,
                    description,
                    cohortId,
                    files,
                    user_email
                }
            })

            return res.status(201).send({ message: 'success', report })
        } catch (err) {
            console.error(err)
<<<<<<< HEAD
            return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
            if (err instanceof Error) {
                return res.status(400).send(err.message)
            }
            return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
        }
    }
    if (req.method === 'DELETE') {
        const { id }: { id: string } = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
        try {
            const report = await prisma.report.findFirst({
                where: {
                    id
                },
                select: {
                    id: true,
                    files: true,
                    user: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            if (!report) {
                return res.status(404).json({ error: "Report not found" });
            }
            if (
                token?.userData?.role !== 'ADMIN'
                && token?.userData?.role !== 'SUPERADMIN'
                && token?.userData?.userId !== report?.user.id
            ) {
                return res.status(403).json({ message: "Unauthorized" });
            }
            if (report.files.length) {
                const promises: Promise<Response>[] = []
                for (let file of report.files) {
                    promises.push(fetch(`https://files.terraacademyforarts.com/delete.php?url=uploads/${file.split('/').at(-1)}`))
                }
                const deleteFileResponse = await Promise.allSettled(promises)
            }
            const result = await prisma.report.delete({
                where: {
                    id: report.id
                }
            })
            return res.send({ message: 'success', report: result })
        } catch (err) {
            console.error(err)
<<<<<<< HEAD
            return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
            if (err instanceof Error) {
                return res.status(400).send(err.message)
            }
            return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
        }
    }
    try {
        const { page, limit, cohort, query }: {
            page?: string,
            limit?: string,
            cohort?: string,
            query?: string
        } = req.query;
        const cohorts = cohort ? cohort.split(',') : []
        const take = parseInt(typeof (limit) == 'string' && limit ? limit : '10')
        const skip = take * parseInt(typeof (page) == 'string' ? page : '0')
        let where = {}        

        if (cohorts?.length) {
            where = {
                ...where,
                cohortId: {
                    in: cohorts
                }
            }
        }
        let count, reports
        if (token.userData?.role === 'SUPERADMIN' || token.userData?.role === 'ADMIN') {
            count = await prisma.report.count({
                where: {
                    ...where,
                    user_email: query === 'undefined' ? undefined : {
                        contains: query
                    } 
                }
            })
            reports = await prisma.report.findMany({
                where: {
                    ...where,
                    user_email: query === 'undefined' ? undefined : {
                        contains: query
                    } 
                },
                include: {
                    ...userInfo
                },
                orderBy: {
                    id: 'desc'
                },
                take,
                skip
            })
        } else {
            count = await prisma.report.count({
                where: {
                    user_email: token.email!,
                    ...where
                }
            })
            reports = await prisma.report.findMany({
                where: {
                    user_email: token.email!,
                    ...where
                },
                include: {
                    ...userInfo
                },
                orderBy: {
                    id: 'desc'
                },
                take,
                skip
            })
        }
        return res.status(200).send({ message: 'success', reports, count })
    } catch (err) {
        console.error(err)
<<<<<<< HEAD
        return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
        if (err instanceof Error) {
            return res.status(400).send(err.message)
        }
        return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
}