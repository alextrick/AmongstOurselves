import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  // LATER TODO - Currently anyone can end any game. Lock it down to the owner.
  let { code } = req.body;

  if (!code) {
    res.status(400).json({error: "Game code not provided"});
  }

  // Get game from code
  const result = await prisma.game.update({
    where: { code },
    data: {
      current_session: { disconnect: true }
    },
  });

  res.json(result);
}
