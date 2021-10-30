import prisma from '../../lib/prisma';

const SABOTAGE_COOLDOWN = 120000;

export default async function handle(req, res) {
  let { code } = req.body;

  // TODO - Cache this query
  const gameData = await prisma.game.findUnique({
    where: { code },
    include: {
      current_session: {
        include: {
          user_sessions: {
            orderBy: {
              id: 'asc'
            },
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
          },
        }
      }
    }
  });

  let { sabotage, sabotage_end } = gameData;
  let sabotageTimer;

  const now = Date.now();

  if (sabotage_end) {
    sabotage_end = parseInt(sabotage_end);
  
    if (sabotage_end < now && sabotage) {
      await prisma.gameSession.update({
        where: {
          id: session
        },
        data: {
          loss: true,
          is_active: false
        }
      });
    }

    sabotageTimer = Math.ceil((sabotage_end - now) / 1000);
  }

  res.json({
    gameData,
    sabotageTimer,
  });
}
