import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code } = req.body;

  const result = await prisma.game.findUnique({
    where: { code },
    include: {
      current_session: {
        include: {
          user_sessions: {
            include: {
              tasks: {
                select: {
                  id: true,
                  task: true,
                  complete: true
                },
                orderBy: {
                  id: 'asc'
                }
              },
              user: {
                select: { user: true, owner: true },
              }
            }
          }
        }
      }
    },
  });

  res.json(result);
}
