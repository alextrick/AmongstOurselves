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
  const [ userSession, setUserSession ] = useState();
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

  async function handleCompleteTask(taskId) {
    setLoading(true);

    if (user) {
      await apiRequest('/api/complete_task', { taskId, userId: user.id });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleEndGame() {
    setLoading(true);

    if (code) {
      await apiRequest('/api/end_game', { code });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    // Poll game state.
    if (code) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/game_state', { code, userId: user.id });
  
        // Check if game state differs
        if (JSON.stringify(res) !== JSON.stringify(game)) {
          setGame(res);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [ code, game ]);

  useEffect(() => {
    if (game) {
      setUserSession(game.current_session.user_sessions[0]);
      // Redirect back to lobby if game ends.

      if (!game.current_session) {
        router.push(
          {
            pathname: '/lobby',
            query: router.query
          },
        );
      }
      // TODO - Swap to sabotage screen if sabotage is active

      // TODO - Swap to meeting screen if active.

      // TODO - Swap to victory or loss screen on those states

      // TODO - Redirect back to lobby if game ends.
    }
  }, [ game ]);

  return (
    <Layout>
      <Container>
          {game && (
            <>
            {/* TODO - Add nav here with map? */}
              <h2>Tasks</h2>

              {userSession && (
                <TaskList>
                  {userSession.tasks.map(task => (
                    <li key={`task-${task.id}`} data-complete={task.complete}>
                      <span className="task">{task.task}</span>

                      <div className="controls">
                        <button onClick={() => handleCompleteTask(task.id)}>
                          COMPLETE
                        </button>

                        <span className="complete-icon">
                          &#10003;
                        </span>
                      </div>
                    </li>
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
    display: flex;
    justify-content: space-between;

    &:last-child {
      border: none;
    }

    .controls {
      font-size: 1rem;
      display: flex;
      position: relative;
      align-items: center;

      button {
        transition: opacity 0.4s ease;
        border: none;
      }

      .complete-icon {
        opacity: 0;
        position: absolute;
        right: 0;
        transition: opacity 0.4s ease;
        font-size: 2rem;
        min-width: 1rem;
        margin-left: 1rem;
        pointer-events: none;
      }
    }

    &[data-complete="true"] {

      button {
        opacity: 0;
        pointer-events: none;
      }

      .task { 
        text-decoration: line-through;
      }

      .complete-icon {
        opacity: 1;
      }
    }
  }
`;
