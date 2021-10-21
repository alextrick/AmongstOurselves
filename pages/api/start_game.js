import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code } = req.body;

  if (!userId && !code) {
    res.status(400).json({error: "Game code not provided"});
  } else {
    userId = parseInt(userId);
  }

  // TODO - Create a game session

  // TODO - Assign a random user as imposter.

  // TODO - Get all Tasks

  // TODO - Assign all users a certain amount of random tasks (Attached via TaskGameSession)

  // TODO - Connect game session to game

  // TODO - Redirect users to game page in there is a current game session


  // TASKS UNRELATED TO THIS SPECIFIC FUNCTION
  // TODO - DISPLAY LIST OF TASKS
  // TODO - IMPOSTER GETS LOCATION OF RANDOM TASKS, BUT NO EXPLANATION?
  // TODO - ASSIGN TASKS TO MAP? X + Y PERCENTAGE CO-ORDS WILL DO
  // TODO - ALLOW USER TO COMPLETE TASKS / SEE LOCATION ON MAP
  // TODO - SABOTAGE - HIDE TASK LIST / PLAY CREEPY SOUND / CHANGE LIGHTS / PLAY SOUND FROM SPEAKERS? 
  // TODO - ALLOW USERS TO MARK THEMSELVES AS DEAD.
  // TODO - ALLOW USERS TO REPORT
  // TODO - ALLOW USERS TO CALL MEETING. SAME BUTTON?
  // TODO - ON MEETING / REPORT, HIDE TASK LIST / PLAY SOUND
  // TODO - WHEN ALL TASKS ARE COMPLETED, COMPLETE GAME.

  // TODO - PAGE FOR COMPUTER THAT LOGS IN TO GAME AND PLAYS SOUNDS / MAKES API CALLS TO LIGHTS / ALLOWS DISABLING OF SABOTAGE

}
