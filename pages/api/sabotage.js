import prisma from '../../lib/prisma';

const SABOTAGE_TIME = 45000;

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { session } = req.body;

  if (!session) {
    res.status(400).json({error: "session not provided"});
  }

  const now = new Date.now()

  // TODO - Get current time.

  // TODO - Set sabotage end time

  // TODO - Set sabotage cooldown

  // TODO - Remove a sabotage count?

  await prisma.gameSession.update({
    where: {
      id: session
    },
    data: {
      sabotage_end: now + sabotage_end
    }
  });

  return res.json({});
}
