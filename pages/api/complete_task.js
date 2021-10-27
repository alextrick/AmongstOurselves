import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // TODO - Auth
  let { taskId, userId } = req.body;

  if (!userId || !taskId) {
    res.status(400).json({error: "userId or taskId not provided"});
  }

  // Get game from code
  const result = await prisma.taskGameSession.updateMany({
    where: { 
        id: taskId,
        user: {
          user_id: userId
        }
     },
    data: {
      complete: true
    },
  });

  res.json(result);
}
