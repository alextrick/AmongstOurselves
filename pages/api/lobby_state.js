import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { code } = req.body;

  const result = await prisma.game.findUnique({
    where: { code },
    include: {
      users: {
        select: { user: true, owner: true },
      },
      current_session: {
        select: { is_active: true }
      }
    },
  });

  res.json(result);
}
