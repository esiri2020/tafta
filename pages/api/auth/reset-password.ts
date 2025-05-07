import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { hash } from 'bcryptjs';
import prisma from "../../../lib/prismadb"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const token = await getToken({ req })
    if (!token) {
        return res.status(401).send({
            error: "Not Authenticated",
        })
    }
    if (req.method === "POST") {
        const body = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
        const { password }: { password: string | undefined } = body
        if (!password) {
            return res.status(400).send({ error: 'Invalid request' })
        }
        try {
            const user = await prisma.user.update({
                where: {
                    id: token.userData?.userId
                },
                data: {
                    password: await hash(password, 12)
                }
            })
            return res.send({ message: 'success' })
        } catch (error) {
            console.error(error)
            return res.status(400).send({ 
                error: error instanceof Error ? error.message : 'An unknown error occurred' 
            })
        }
    }
}