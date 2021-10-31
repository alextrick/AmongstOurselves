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
      alive: false
    },
    include: {
      tasks: {
        select: { task: true, complete: true }
      }
    }
  });

  if (result) {
    const now = Date.now()
    const kill_cooldown_end = (now + KILL_COOLDOWN).toString();

    // Add kill cooldown
    await prisma.userGameSession.updateMany({
      where: { 
        session_id: session,
        user_id: userId
       },
      data: { kill_cooldown_end }
    });

    // TODO - Update all those tasks to 'hidden: false', once a meeting is called

    // Get all remaining alive users.
    const userSessions = await prisma.userGameSession.findMany({
      where: {
        session_id: session,
        game_id: code,
        alive: true,
        imposter: false
      }
    });

    const uncompleteTasks = result.tasks.filter(task => !task.complete);

    const averageTasksPerUser = Math.ceil(uncompleteTasks.length / userSessions.length)

    let currentUserSession = 0;

    // Create a random array of indices used to select random users for task assignment
    const randomSessionIndices = createArrayOfRandomIndices(
      Math.ceil(uncompleteTasks.length / averageTasksPerUser), userSessions.length, true
    );

    while (uncompleteTasks.length !== 0) {
      const tasks = [];

      // Get 'averageTasksPerUser' amount of tasks from the killed users remaining tasks.
      for (let count = 1; count <= averageTasksPerUser; count += 1) {
        const poppedTask = uncompleteTasks.pop();

        if (poppedTask) {
          tasks.push(poppedTask)
        }
      }
 
      // Assign those tasks to a random alive user.
      const randomSession = userSessions[randomSessionIndices[currentUserSession]]

      await prisma.userGameSession.update({
        where: {
          id: randomSession.id
        },
        data: {
          tasks: {
            create: tasks.map(task => ({ task: task.task, hidden: true }))
          }
        },
        include: {
          tasks: {
            select: {
              id: true,
              task: true
            }
          }
        }
      });

      currentUserSession += 1;
    }
  }

  res.json(result);
}
