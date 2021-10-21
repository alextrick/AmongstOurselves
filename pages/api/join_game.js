import prisma from '../../lib/prisma';

export default async function handle(req, res) {
  let { userId, code } = req.body;

  if (!userId && !code) {
    res.status(400).json({error: "userId or game code not provided"});
  } else {
    userId = parseInt(userId);
  }

  // TODO - Check if user already has game session?
  // TODO - Check if game is_active
  try {
    const result = await prisma.game.update({
      where: {
        code,
      },
      data: {
        // Create a UserGameConnection for the user and add to game.
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
  } catch(err) {
    // Hopefully failing as the UserGameConnection already exists, so return code.
    // A bit of a hack but will do for now, would be better to check for existing
    // UserGameConnection first, or see if there's a analog for 'getOrCreate'
    if (err.message.indexOf('PrismaClientValidationError')) {
      res.json({ code });
    }
  }
}
