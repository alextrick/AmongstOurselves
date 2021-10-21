import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { userId, code } = req.body;

  if (!userId && !code) {
    res.status(400).json({error: "userId or game code not provided"});
  } else {
    userId = parseInt(userId);
  }

  // Update game

  // TODO - Check if user already has game session?
  const result = await prisma.game.update({
    where: {
      code,
    },
    data: {
      // Create a UserGameSession for the user and add to game.
      users: {
        create: [
          {
            user: { connect: { id: userId }}
          }
        ]
      }
    },
  });
  
  res.json(result);
}
