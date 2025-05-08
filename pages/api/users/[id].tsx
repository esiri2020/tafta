import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import prisma from "../../../lib/prismadb"

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
    if (token.userData?.role !== 'SUPERADMIN') {
      return res.status(403).send({
        error: "Unauthorized.",
      })
    }

    const { id }: {id?: string} = req.query
    if(!id) return res.status(400).json({ message: "Email or ID not supplied" });

    if (req.method === 'PATCH') {
      const keys = [ 'firstName', 'lastName', 'role']
      const body = typeof(req.body) === 'object' ? req.body : JSON.parse(req.body)
      let data = {}
      for (const key of keys){
        if (body.hasOwnProperty(key)) {
          data = { [key] : body[key], ...data} 
        }
      }
      const {profile} = body
      try {
        const user = await prisma.user.update({
          where: {
            id: id
          },
          data: {
            ...data,
            profile: profile ? {
              upsert: {
                update: {
                  ...profile
                },
                create: {
                  ...profile
                }
              }
            } : {}
          }
        })
        return res.status(202).send(user)
<<<<<<< HEAD
      } catch (err) {
        console.error(err)
        return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      } catch (error: unknown) {
        console.error(error)
        if (error instanceof Error) {
          return res.status(400).send(error.message)
        }
        return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await prisma.user.delete({
          where: { id }
        })
        return res.status(200).send({message: 'User Deleted', result})
<<<<<<< HEAD
      } catch (err) {
        console.error(err)
        return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      } catch (error: unknown) {
        console.error(error)
        if (error instanceof Error) {
          return res.status(400).send(error.message)
        }
        return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
      }
    }

    try {
        const user = await prisma.user.findFirst({
          where: {
           OR: [
                {email: id},
                {id: id}
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            profile: true
          },
        });
    
        if (!user) {
          return res.status(404).json({message: "Invalid Credientials" });
        }
    
        res.json({ message: "success", user });
    } catch (error: unknown) {
        console.error(error);
<<<<<<< HEAD
        res.status(400).json({ 
          message: "Something went wrong",
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
=======
        if (error instanceof Error) {
          return res.status(400).json({ message: error.message });
        }
        return res.status(400).json({ message: "Something went wrong" });
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
}