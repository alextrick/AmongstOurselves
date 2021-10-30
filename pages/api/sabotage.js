import prisma from '../../lib/prisma';

const SABOTAGE_TIME = 45000;

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { session } = req.body;

  if (!session) {
    res.status(400).json({error: "session not provided"});
  }

  const now = Date.now()
  const sabotage_end = (now + SABOTAGE_TIME).toString();

  await prisma.gameSession.updateMany({
    where: {
      AND: [
        { id: session },
        { meeting: null}
      ]
    },
    data: {
      sabotage: true,
      sabotage_end
    }
  });

  return res.json({});
}
