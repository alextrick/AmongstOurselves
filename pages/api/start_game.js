import { createArrayOfRandomIndices } from '../../lib/helpers';
import prisma from '../../lib/prisma';

const IMPOSTER_COUNT = 1;
const TASK_COUNT = 8;
const TASKS = [
  'temp task test',
  'temp task test 2',
  'temp task test 3',
  'temp task test 4',
  'temp task test 5',
  'temp task test 6',
  'temp task test 7',
  'temp task test 8',
  'temp task test 9',
  'temp task test 10',
  'temp task test 11',
  'temp task test 12',
  'temp task test 13',
  'temp task test 14',
  'temp task test 15',
  'temp task test 16',
  'temp task test 17',
  'temp task test 18',
  'temp task test 19',
  'temp task test 20',
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
  // TODO - Redirect users to game page in there is a current game session

  // TODO - Play among us round start sound effect on start?

  // TODO - Change lights? Maybe all light changes should be set by the game loop page


  // TASKS UNRELATED TO THIS SPECIFIC FUNCTION
  // TODO - DISPLAY LIST OF TASKS
  // TODO - IMPOSTER GETS LOCATION OF RANDOM TASKS, BUT NO EXPLANATION?
  // TODO - KILL COOLDOWN
  // TODO - DISCUSSION TIME LIMIT
  // TODO - EMERGENCY MEETING COUNTER PER PERSON?
  // TODO - EMERGENCY COOLDOWN?
  // TODO - MEETING VOTING TO KICK. NOT ENTIRELY SURE HOW IT WORKS
  // TODO - ASSIGN TASKS TO MAP? X + Y PERCENTAGE CO-ORDS WILL DO
  // TODO - ALLOW USER TO COMPLETE TASKS / SEE LOCATION ON MAP
  // TODO - SABOTAGE - HIDE TASK LIST / PLAY CREEPY SOUND / CHANGE LIGHTS / PLAY SOUND FROM SPEAKERS? 
  // TODO - ALLOW USERS TO MARK THEMSELVES AS DEAD.
  // TODO - ALLOW USERS TO REPORT
  // TODO - ALLOW USERS TO CALL MEETING. SAME BUTTON?
  // TODO - ON MEETING / REPORT, HIDE TASK LIST / PLAY SOUND
  // TODO - WHEN ALL TASKS ARE COMPLETED, COMPLETE GAME.
  // TODO - WAY TO REMOVE USERS FROM GAME. KICK BUTTON FOR OWNER? LEAVE BUTTON FOR EVERYONE ELSE?

  // TODO - PAGE FOR COMPUTER THAT LOGS IN TO GAME AND PLAYS SOUNDS / MAKES API CALLS TO LIGHTS / ALLOWS DISABLING OF SABOTAGE

}
