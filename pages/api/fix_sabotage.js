import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { session } = req.body;

  if (!session) {
    res.status(400).json({error: "session not provided"});
  }


  await prisma.gameSession.updateMany({
    where: {
      AND: [
        { id: session },
      ]
    },
    data: {
      sabotage: false,
      sabotage_end: null
    }
  });

  return res.json({});
}
