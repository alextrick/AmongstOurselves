import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  const { name } = req.body;

  const result = await prisma.user.create({
    data: { name },
  });

  res.json(result);
}
