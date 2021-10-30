import { createArrayOfRandomIndices } from '../../lib/helpers';
import prisma from '../../lib/prisma';

const KILL_COOLDOWN = 30000;

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { userSessionId, code, session, userId } = req.body;

  if (!userSessionId || !session) {
    res.status(400).json({error: "code, session, or userSessionId not provided"});
  }

  const result = await prisma.userGameSession.update({
    where: { 
      id: userSessionId,
     },
    data: {
      voted_for: true
    },
  });

  if (result) {

    // TODO - End meeting early if it's the last vote.

    // TODO - Clear all 'voted_for' at end of meeting.

    // Get all remaining alive users.
  }

  res.json(result);
}
