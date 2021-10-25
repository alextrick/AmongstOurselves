import prisma from '../../lib/prisma';

const IMPOSTER_COUNT = 1;
const TASK_COUNT = 8;

export default async function handle(req, res) {
  let { code } = req.body;

  if (!userId && !code) {
    res.status(400).json({error: "Game code not provided"});
  } else {
    userId = parseInt(userId);
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

  const tasks = [
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
  ]

  function createArrayOfRandomIndices(totalIndices, arrayLength) {
    const randomIndices = [];

    while (randomIndices.length < TASK_COUNT) {
      randomIndices.push(Math.floor(Math.random * tasks.length))
    }

    return randomIndices;
  }

  // TODO - Get random ints for imposters
  // TODO - Check this works
  const imposterIndices = createArrayOfRandomIndices(IMPOSTER_COUNT, game.users.length);

  console.log('imposterIndices', imposterIndices)
  
  const userSessions = game.users.map(({ user }, index) => {
    // TODO - Create random set of tasks
    // TODO - Create copy of tasks? Or just create an array of random numbers
    const taskIndices = createArrayOfRandomIndices(TASK_COUNT, tasks.length);

    console.log('taskIndices', imposterIndices)
    const taskSessions = taskIndices.map(index => (
      { task: tasks[index] }
    ));

    console.log(taskSessions);
    return {
      user: { connect: { id: user.id }},
      tasks: {
        create: [
          ...taskSessions
        ]
      },
      imposter: (imposterIndeces.indexOf(index) !== -1),
    }
  })

  console.log('userSessions', userSessions);

  const result = await prisma.gameSession.create({
    data: {
      // Create a UserGameConnection for the user and add to game.
      game: { connect: { code }},
      is_active: true,
      users_sessions: {
        create: [ ...userSessions ]
      }
    },
  });

  console.log(result)

  // TODO - Create a game session

  // TODO - Assign a random user as imposter.

  // TODO - Get all Tasks

  // TODO - Assign all users a certain amount of random tasks (Attached via TaskGameSession)

  // TODO - Connect game session to game

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
