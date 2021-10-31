import { createArrayOfRandomIndices } from '../../lib/helpers';
import prisma from '../../lib/prisma';

const IMPOSTER_COUNT = 2;
const TASK_COUNT = 8;
const TASKS = [
  '1 - Cafeteria',
  '2 - Navigation',
  '3 - Kitchen',
  '4 - Kitchen',
  '5 - Upper passageway',
  '6 - Electrical',
  '8 - Fuel indoor engines',
  '7 - Lower passageway',
  '11 - Med bay',
  '12 - Launch pad',
  '13 - Storage',
  '14 - Launch pad',
  '15 - Security',
  '16 - Storage',
  '17 - Cafeteria',
  '18 - Navigation',
  '10 - Electrical',
];


export default async function handle(req, res) {
  // LATER TODO - Currently anyone can start any game. Lock it down to the owner.
  let { code } = req.body;

  if (!code) {
    res.status(400).json({error: "Game code not provided"});
  }

  // Get game from code
  const game = await prisma.game.findUnique({
    where: { code },
    include: {
      users: {
        select: { user: true, owner: true },
      },
    },
  });

  // Get an array of random indexes of the users to select as the imposter(s)
  const imposterIndices = createArrayOfRandomIndices(IMPOSTER_COUNT, game.users.length, true);
  
  const userSessions = game.users.map(({ user }, index) => {
    const imposter = (imposterIndices.indexOf(index) !== -1)

    let tasks;

    // Create tasks if not an imposter
    if (!imposter) {
      // Create array of indexes for random tasks.
      const taskIndices = createArrayOfRandomIndices(TASK_COUNT, TASKS.length, true);

      const taskSessions = taskIndices.map(index => (
        { task: TASKS[index] }
      ));

      tasks = {
        create: taskSessions
      }
    }

    return {
      user: { connect: {
        user_id_game_id: {
          user_id: user.id,
          game_id: game.code
        }
      }},
      tasks,
      imposter,
    }
  })


  const result = await prisma.gameSession.create({
    data: {
      // Create a UserGameConnection for the user and add to game.
      game: { connect: { code }},
      is_active: true,
      user_sessions: {
        create: [ ...userSessions ]
      },
      total_tasks: TASK_COUNT * (userSessions.length - IMPOSTER_COUNT),
    },
  });

  res.json(result);

  // TODO - Play among us round start sound effect on start?

  // TODO - Change lights? Maybe all light changes should be set by the game loop page


  // TASKS UNRELATED TO THIS SPECIFIC FUNCTION
  // TODO - KILL COOLDOWN
  // TODO - DISCUSSION TIME LIMIT
  // TODO - EMERGENCY MEETING COUNTER PER PERSON?
  // TODO - EMERGENCY COOLDOWN?
  // TODO - MEETING VOTING TO KICK. NOT ENTIRELY SURE HOW IT WORKS
  // TODO - ASSIGN TASKS TO MAP? X + Y PERCENTAGE CO-ORDS WILL DO
  // TODO - ALLOW USER TO SEE TASK LOCATION ON MAP
  // TODO - SABOTAGE - HIDE TASK LIST / PLAY CREEPY SOUND / CHANGE LIGHTS / PLAY SOUND FROM SPEAKERS? 
  // TODO - ALLOW USERS TO MARK THEMSELVES AS DEAD.
  // TODO - ALLOW USERS TO REPORT
  // TODO - ALLOW USERS TO CALL MEETING. SAME BUTTON?
  // TODO - ON MEETING / REPORT, HIDE TASK LIST / PLAY SOUND
  // TODO - WAY TO REMOVE USERS FROM GAME. KICK BUTTON FOR OWNER? LEAVE BUTTON FOR EVERYONE ELSE?

  // TODO - PAGE FOR COMPUTER THAT LOGS IN TO GAME AND PLAYS SOUNDS / MAKES API CALLS TO LIGHTS / ALLOWS DISABLING OF SABOTAGE
}
