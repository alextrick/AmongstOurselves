import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code } = req.body;

  // Perhaps I should just pass the 'game session' into the url params?

  // TODO - Reverse this? Query via UserGameSession instead and pass that id from the lobby_state query

  // TODO - Or maybe get 'UserGameConnection from the 'join game' request and add it to params there.

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
    // TODO - This probably won't work. Look into include vs select.
  });

  res.json(result);
}
