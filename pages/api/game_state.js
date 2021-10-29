import prisma from '../../lib/prisma';

const SABOTAGE_COOLDOWN = 120000;

export default async function handle(req, res) {
  let { session } = req.body;

  // TODO - Cache this query
  const gameData = await prisma.gameSession.findUnique({
    where: { id: session },
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
  });

  let { sabotage, sabotage_end } = gameData;
  let sabotageTimer;
  let sabotageCooldownTimer;

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

    // Add minute cooldown between sabotages
    const sabotageAllowedAt = sabotage_end + SABOTAGE_COOLDOWN;

    
    if (sabotageAllowedAt > now) {
      sabotageCooldownTimer = Math.ceil((sabotageAllowedAt - now) / 1000);
    }

    sabotageTimer = Math.ceil((sabotage_end - now) / 1000);
  }

  // Generate any kill cooldowns
  gameData.user_sessions.filter(userSession => userSession.imposter)
    .forEach(imposterSession => {
      if (imposterSession.kill_cooldown_end) {
        const killCooldownEnd = parseInt(imposterSession.kill_cooldown_end);

        if (killCooldownEnd > now) {
          imposterSession.killCooldown = Math.ceil((killCooldownEnd - now) / 1000);
        }
      }
    });

  res.json({
    gameData,
    sabotageTimer,
    sabotageCooldownTimer
  });
}
