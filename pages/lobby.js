import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

// Lib
import prisma from '../lib/prisma';
import { apiRequest } from '../lib/helpers';

// Styles
import { Button, Error } from '../styles/shared';

function Lobby({ game }) {
  const router = useRouter();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);

  // Get any user details.
  let user;
  let isOwner = false;

  if (router.query) {
    const { name, id } = router.query;

    user = { name, id: parseInt(id) };
    // Check if current user is game owner.

    if (game.owner_id === user.id) {
      isOwner = true;
    }
  }

  async function handleStartGame() {
    setLoading(true);
    // TODO - Get game id?
    let gameId;

    if (userId) {
      const res = await apiRequest('/api/start_game', { gameId });

    } else {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <Layout>
      <Container>
          <h2>Lobby - {game.code}</h2>

          {game.users && (
            <UserList>
              {game.users.map(({ user }) => (
                  <li>{user.name}</li>
              ))}
            </UserList>
          )}

          {isOwner && (
            <div>
              <Button
                disabled={loading}
                onClick={handleStartGame}
              >
                Start game
              </Button>

              {error && <Error>Error!</Error>}
            </div>
            )
          }
      </Container>
    </Layout>
  )
}

export default Lobby;

export const getServerSideProps = async ({ query }) => {
  // TODO - Move this to polling api request.
  // lobby_state?

  const game = await prisma.game.findUnique({
    where: { code: query.code },
    include: {
      users: {
        select: { user: true },
      },
    },
  });

  return { props: { game } };
};

const UserList = styled.ul`
  border: 0.25rem solid white;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  display: block;

  li {
    padding: 1rem;
    border-bottom: 2px dashed white;

    &:last-child {
      border: none;
    }
  }
`;
