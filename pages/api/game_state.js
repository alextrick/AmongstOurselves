import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code, userId } = req.body;

  // Perhaps I should just pass the 'game session' into the url params?

  // TODO - Reverse this? Query via UserGameSession instead and pass that id from the lobby_state query

  // TODO - Or maybe get 'UserGameConnection from the 'join game' request and add it to params there.

  const result = await prisma.game.findUnique({
    where: { code },
    include: {
      users: {
        select: { user: true, owner: true },
      },
      current_session: {
        include: {
          user_sessions: {
            where: {
              user: {
                user_id: userId,
                game_id: code
              }
            },
            include: {
              tasks: {
                select: {
                  task: true,
                  complete: true
                }
              },
            }
          }
        }
      }
    },
    // TODO - This probably won't work. Look into include vs select.
  });

  res.json(result);
}
