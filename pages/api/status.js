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
            select: {
              id: true,
              alive: true,
              user: {
                select: { user: true, owner: true },
              }
            },
          },
          meeting: {
            include: {
              votes: {
                select: {
                  voted_for: true,
                  voter: true
                }
              }
            }
          }
        }
      }
    }
  });

  const { current_session } = gameData;
  let { sabotage, sabotage_end, meeting } = current_session || {};

  let sabotageTimer;
  let meetingTimer;

  const aliveUsers = current_session?.user_sessions?.filter(user => user.alive) || [];

  const now = Date.now();

  if (sabotage_end) {
    sabotage_end = parseInt(sabotage_end);
  
    // Set game to loss if sabotage expires
    if (sabotage_end < now && sabotage) {
      await prisma.game.update({
        where: {
          code
        },
        data: {
          current_session: {
            update: {
              loss: true,
              is_active: false
            }
          }
        }
      });
    }

    sabotageTimer = Math.ceil((sabotage_end - now) / 1000);
  }

  if (meeting && meeting.meeting_end) {
    const meeting_end = parseInt(meeting.meeting_end);

    // TODO - Handle meeting summary
    // TODO - Check for votes.
    if (
      // Meeting has expired
      (meeting_end < now && meeting) ||
      // All votes have been cast
      (aliveUsers.length == meeting.votes?.length)
    ) {
      // console.log('meeting', meeting)
      await prisma.game.update({
        where: {
          code
        },
        data: {
          current_session: {
            update: {
              meeting: { disconnect: true }
            }
          }
        }
      })
    }

    meetingTimer = Math.ceil((meeting_end - now) / 1000);
  }

  res.json({
    gameData,
    sabotageTimer,
    meetingTimer
  });
}
