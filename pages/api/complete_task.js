import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // TODO - Auth
  let { taskId, userId, code } = req.body;

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

  if (result.count === 1) {
    const gameSession = await prisma.gameSession.update({
      where: {
        game_id: code
      },
      data: {
        tasks_complete: {
          increment: 1,
        },
      }
    });

    if (gameSession.tasks_complete === gameSession.total_tasks) {
      await prisma.gameSession.update({
        where: {
          game_id: code
        },
        data: {
          victory: true,
          is_active: false
        }
      });
    }
  }

  res.json(result);
}
