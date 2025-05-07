import { getToken } from "next-auth/jwt"
// import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prismadb"
import type { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const token = await getToken({ req })
    if (!token) {
      return res.status(401).send({
        error: "You must be signed in to view the protected content on this page.",
      })
    }
    if(token?.userData?.role !== "SUPERADMIN"){
        return res.status(403).send({
            error: "Unauthorized.",
        })
    }
    const { page, limit, filter, query }: {
        page?: string,
        limit?: string,
        filter?: Role,
        query?: string
    } = req.query;
    const take = parseInt(typeof(limit) == 'string' && limit ? limit : '10')
    const skip = take * parseInt(typeof(page) == 'string' ? page : '0')
    let count, users;
    try {
        if (filter){
            count = await prisma.user.count({
                where: {
                    role: filter
                }
            })
            users = await prisma.user.findMany({
                where: {
                    role: filter
                },
                include: {
                    profile: {
                        select: {
                            id: true
                        }
                    }
                },
                take,
                skip        
            })
        }
        else {
            count = await prisma.user.count({
                where: {
                    NOT: {
                        role: 'APPLICANT'
                    }
                }
            })
            users = await prisma.user.findMany({
                where: {
                    NOT: {
                        role: 'APPLICANT'
                    }
                },
                include: {
                    profile: {
                        select: {
                            id: true
                        }
                    }
                },
                take,
                skip
            })            
        }
        return res.status(200).json({users, count})
    } catch (error: unknown) {
        console.error(error)
        if (error instanceof Error) {
            return res.status(400).send(error.message)
        }
        return res.status(400).send('An error occurred')
    }
}