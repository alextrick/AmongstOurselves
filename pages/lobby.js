import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

// Lib
import { apiRequest } from '../lib/helpers';

// Styles
import { Button, Error } from '../styles/shared';

function Lobby() {
  const router = useRouter();
  const [ game, setGame ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);

  // Get any user details.
  let user;
  let code;
  let isOwner = false;

  if (router.query) {
    const { name, id } = router.query;
    
    user = { name, id: parseInt(id) };

    // Check if current user is game owner.
    if (game?.users) {
      for (let gameUser of game.users) {
        if (gameUser.owner && gameUser.user.id === user.id) {
          isOwner = true;
        }
      }
    }

    code = router.query.code;
  }

  async function handleStartGame() {
    setLoading(true);

    if (code) {
      await apiRequest('/api/start_game', { code });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    // Poll lobby state.
    if (code) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/lobby_state', { code });
  
        // Check if lobby state differs
        if (JSON.stringify(res) !== JSON.stringify(game)) {
          setGame(res);
        }
      }, 500);
  

      return () => clearInterval(interval);
    }
  }, [ code, game ]);

  useEffect(() => {
    if (game) {
      // Redirect to game page if current session.
      if (game.current_session?.is_active) {
        router.push(
          {
            pathname: '/game',
            query: {...router.query, session: game.current_session.id}
          },
        );
      }
    }
  }, [ game ]);

  return (
    <Layout>
      <Container>
          {game && (
            <>
              <h2>Lobby - {game.code}</h2>

              {game.users && (
                <UserList>
                  {game.users.map(({ user }) => (
                      <li key={`user-${user.id}`}>
                        {user.name}
                      </li>
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
            </>
          )}
      </Container>
    </Layout>
  )
}

export default Lobby;

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
