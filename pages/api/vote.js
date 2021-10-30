import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { userSessionId, session, userId } = req.body;

  if (!session || !userId) {
    res.status(400).json({error: "session or userId  not provided"});
  }

  console.log('userId', userId, 'userSessionId', userSessionId)

  const result = await prisma.gameSession.update({
    where: { 
      id: session,
     },
    data: {
      meeting: {
        update: {
          votes: {
            create: [{
              voted_for: userSessionId,
              voter: userId
            }]
          }
        }
      }
    },
  });

  if (result) {

    // TODO - End meeting early if it's the last vote.

    // TODO - Clear all 'voted_for' at end of meeting.

    // Get all remaining alive users.
  }

  res.json(result);
}
