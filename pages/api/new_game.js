import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  const { user } = req.body;

  // Create random game code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const code = new Array(6).map(
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join();

  console.log(code)
  // TODO - Check code works

  // TODO - Add owner to schema

  const result = await prisma.game.create({
    data: {
      code,
      owner: { connect: { id: user } },
      // TODO - Create a UserGameSession for the owner
    },
  });
  res.json(result);
}