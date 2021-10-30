import prisma from '../../lib/prisma';

const MEETING_LENGTH = 60000;

export default async function handle(req, res) {
  let { session } = req.body;

  if (!session) {
    res.status(400).json({error: "session not provided"});
  }

  const now = Date.now();

  await prisma.gameSession.update({
    where: {
      id: session
    },
    data: {
      meeting_end: (now + MEETING_LENGTH).toString()
    }
  });

  return res.json({});
}
