import prisma from '../../lib/prisma';

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
                select: { user_id: true, user: true, owner: true },
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
  let meetingResult;

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

    if (
      // Meeting has expired
      (meeting_end < now && meeting) ||
      // All votes have been cast
      (aliveUsers.length == meeting.votes?.length)
    ) {
      const voteCounts = { 'skip': 0 };

      for (let vote of meeting.votes) {
        let { voted_for } = vote;

        if (!voted_for) voted_for = 'skip';

        if (voteCounts[voted_for]) {
          voteCounts[voted_for] += 1;
        } else {
          voteCounts[voted_for] = 1;
        }
      }

      // Add skips for any users who took no action
      voteCounts['skip'] += aliveUsers.length - meeting.votes.length;

      // Add to array, order array.
      let orderedVotes = [];

      for (let key of Object.keys(voteCounts)) {
        const count = voteCounts[key];

        orderedVotes.push({ key, count: count});
      }

      orderedVotes = orderedVotes.sort((a, b) => b.count - a.count);

      if (
        // Handle a draw
        (orderedVotes[0].count === orderedVotes[1].count) ||
        // Handle 'skip' winning
        (orderedVotes[0].key === 'skip')
      ) {
        meetingResult = "No one was ejected";
      } else {
        const votedId = parseInt(orderedVotes[0].key)
        const votedUserDetails = current_session.user_sessions.find(session => session.user.user_id === votedId)

        await prisma.game.update({
          where: {
            code
          },
          data: {
            current_session: {
              update: {
                user_sessions: {
                  updateMany: {
                    where: {
                      user_id: votedId
                    },
                    data: {
                      alive: false
                    }
                  }
                }
              }
            }
          },
        });
        
        meetingResult = `${votedUserDetails.user.user.name} ${votedUserDetails.imposter ? 'was' : 'was not'} an imposter`;
      }

      // TODO - Move 'winning by kills' logic here, instead of in 'kill_user'
      // TODO - Add logic to win by voting out all imposters

      // TODO - Test inactive votes.
      // TODO - Test draws

      // Delay disconnecting the meeting to display 'X was / was not an imposter'

      setTimeout(async () => {
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
        });
      }, 500)
    }

    meetingTimer = Math.ceil((meeting_end - now) / 1000);
  }

  res.json({
    gameData,
    sabotageTimer,
    meetingTimer,
    meetingResult
  });
}
