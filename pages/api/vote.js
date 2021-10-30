import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // TODO - Auth - also currently all users can send this, lock it down to imposters?
  let { userSessionId, session, userId } = req.body;

  console.log('voted');

  if (!session || !userId) {
    res.status(400).json({error: "session or userId  not provided"});
  }

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

  res.json(result);
}
