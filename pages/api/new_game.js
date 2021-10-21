import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { userId } = req.body;

  if (!userId) {
    res.status(400).json({error: "userId not provided"});
  } else {
    userId = parseInt(userId);
  }

  // Create random game code
  // There's no protection against collision of this unique
  // 'code' field but it's unlikely to a be a problem for now
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  const code = [1,2,3,4,5,6].map(
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');

  const result = await prisma.game.create({
    data: {
      code,
      // Connect User to Game
      users: {
        create: [{
          user: { connect: { id: userId } },
          owner: true
        }]
      }
    }
  });

  res.json(result);
}
