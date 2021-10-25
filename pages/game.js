import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

// Lib
import { apiRequest } from '../lib/helpers';

// Styles
import { Button, Error } from '../styles/shared';

function Game() {
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

  async function handleEndGame() {
    setLoading(true);
    // TODO - Finish this function
    let gameId;

    if (userId) {
      const res = await apiRequest('/api/end_game', { gameId });

      console.log('start game res', res);
    } else {
      setError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Poll game state.
    if (code) {
      const interval = setInterval(async () => {
        // TODO - Swap to game state. Include UserGameSession so all can be done in one query?
        const res = await apiRequest('/api/game_state', { code }, true);

        console.log(res);
        // 
  
        // Check if game state differs
        // TODO - TEST noJSON stuff.
        if (res !== JSON.stringify(game)) {
          setGame(await res.json());
        }
      }, 500);

      // TODO - Swap to sabotage screen if sabotage is active

      // TODO - Swap to meeting screen if active.

      // TODO - Swap to victory or loss screen on those states

      // TODO - Redirect back to lobby if game ends.
  
      return () => clearInterval(interval);
    }
  }, [ code, game ]);

  return (
    <Layout>
      <Container>
          {game && (
            <>
            {/* TODO - Add nav here with map? */}
              <h2>Tasks</h2>

              {game.users && (
                <TaskList>
                  {game.users.map(({ user }) => (
                      <li>{user.name}</li>
                  ))}
                </TaskList>
              )}


              {/* TODO - Add report / meeting buttons here? */}

              {isOwner && (
                <div>
                  <Button
                    disabled={loading}
                    onClick={handleEndGame}
                  >
                    End game
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

export default Game;

const TaskList = styled.ul`
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
