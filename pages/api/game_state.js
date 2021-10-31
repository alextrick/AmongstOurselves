import { lights } from '../../lib/helpers';
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
              complete: true,
              hidden: true
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
      meeting: {
        include: {
          votes: {
            select: { voted_for: true, voter: true }
          }
        }
      }
    }
  });

  let {
    sabotage,
    sabotage_end,
    meeting
  } = gameData;

  let sabotageTimer;
  let meetingTimer;
  let sabotageCooldownTimer;

  const now = Date.now();

  if (sabotage && sabotage_end) {
    sabotage_end = parseInt(sabotage_end);

    // Add minute cooldown between sabotages
    const sabotageAllowedAt = sabotage_end + SABOTAGE_COOLDOWN;

    
    if (sabotageAllowedAt > now) {
      sabotageCooldownTimer = Math.ceil((sabotageAllowedAt - now) / 1000);
    }

    sabotageTimer = Math.ceil((sabotage_end - now) / 1000);
  }

  if (meeting && meeting.meeting_end) {
    const meeting_end = parseInt(meeting.meeting_end);
    meetingTimer = Math.ceil((meeting_end - now) / 1000);
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
    sabotageCooldownTimer,
    meetingTimer
  });
}
