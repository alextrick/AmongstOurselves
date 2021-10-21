import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { userId } = req.body;

  if (!userId) {
    res.status(400).json({error: "userId not provided"});
  } else {
    userId = parseInt(userId);
  }

  let gameCreated = false;

  while (gameCreated === false) {
    try {
      // Create random game code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
      const code = [1,2,3,4,5,6].map(
        () => characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');
    
      const result = await prisma.game.create({
        data: {
          code,
          owner: { connect: { id: userId } },
          // TODO - Create a Game for the owner
          users: [
            { connect: { id: userId }}
          ]
          }
        },
      });
      gameCreated = true;
  
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  }
}
