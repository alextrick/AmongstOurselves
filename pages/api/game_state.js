import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code, userId } = req.body;

  // Perhaps I should just pass the 'game session' into the url params?

  const result = await prisma.game.findUnique({
    where: { code },
    include: {
      users: {
        select: { user: true, owner: true },
      },
    },
    // TODO - This probably won't work. Look into include vs select.
    select: {
      gameSession: {
        select: {
          userSessions: {
            where: {
              user_id
            },
            include: {
              tasks: {
                task: true,
                complete: true
              },
            }
          }
        }
      }
    }
  });

  res.json(result);
}
