import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

// Lib
import { apiRequest, createArrayOfRandomIndices } from '../lib/helpers';

// Styles
import { Button, Error } from '../styles/shared';


const randomKillVerb = [
  'Kill',
  'Murder',
  'End the life of',
  'Execute',
  'Dismember',
  'Exsanguinate',
  'Quickly dispatch',
  'Remove',
  'Exterminate',
  'Do away with',
  'Clean up',
  'Take out'
]


function Game() {
  const router = useRouter();
  const [ game, setGame ] = useState();
  const [ user, setUser ] = useState({});
  const [ session, setSession ] = useState();
  const [ isOwner, setIsOwner] = useState(false)
  const [ code, setCode] = useState()
  const [ imposter, setImposter ] = useState(false);
  const [ userSession, setUserSession ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ showMap, setShowMap ] = useState(false);
  const [ victory, setVictory ] = useState(false);
  const [ loss, setLoss ] = useState(false);
  const [ initialSetup, setInitialSetup ] = useState(false);
  const [ killVerbIndices, setKillVerbIndices ] = useState([]);

  async function handleCompleteTask(taskId) {
    setLoading(true);

    if (user, taskId && code) {
      await apiRequest('/api/complete_task', {
        taskId,
        userId: user.id,
        code
      });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleKillUser(userSessionId) {
    setLoading(true);

    if (user, userSessionId, code) {
      await apiRequest('/api/kill_user', {
        userSessionId,
        userId: user.id,
        code,
        session
      });
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

  async function handleBackToLobby() {
    if (isOwner) {
      await handleEndGame();
    }

    router.push(
      {
        pathname: '/lobby',
        query: router.query
      },
    );
  }

  async function handleReport() {
    setLoading(true);

    if (code) {
      await apiRequest('/api/handleSabotage', { code });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleSabotage() {
    setLoading(true);

    if (code) {
      await apiRequest('/api/handleSabotage', { code });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    // Poll game state.
    if (code) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/game_state', { code });
  
        // Check if game state differs
        if (JSON.stringify(res) !== JSON.stringify(game)) {
          setGame(res);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [ code, game ]);

  useEffect(() => {
    // Get any user details from query params.
    if (router.query) {
      const { name, id } = router.query;
      
      setUser({ name, id: parseInt(id) });
      setCode(router.query.code);
      router.query.session && setSession(parseInt(router.query.session));
    }
  }, [ router.query ]);

  useEffect(() => {
    // Redirect back to lobby if game ends.
    if (game && !game.current_session) {
      const query = { ...router.query };
      delete query['session'];

      router.push(
        {
          pathname: '/lobby',
          query
        },
      );
    }
    
    if (game?.current_session?.user_sessions) {
      if (!initialSetup) {
        for (let session of game?.current_session?.user_sessions) {
          // Check if current user is game owner.
          if (session.user.owner && session.user_id === user.id) {
            setIsOwner(true);
          }
          
          // Get current users UserSession
          if (session.user_id === user.id) {
            setUserSession(session);

            // Check if current user is imposter
            if (session.imposter) {
              setImposter(true);
              
              // Create a random array of indexes for selecting kill verbs
              setKillVerbIndices(
                createArrayOfRandomIndices(
                  game.current_session.user_sessions.length, randomKillVerb.length
                )
              );
            }
          }
        }

        setInitialSetup(true);
      } else {
        for (let session of game?.current_session?.user_sessions) {
          // Get current users UserSession
          if (session.user_id === user.id) {
            setUserSession(session);
          }
        }
      }

      // TODO - Swap to sabotage screen if sabotage is active

      // TODO - Swap to meeting screen if active.

      // TODO - Update kill cooldown. Set a datetime when a user is killed and wait for that.
      // Can use similar logic for meetings / sabotages.

      if (game.current_session.victory) {
        setVictory(true);
      } else if (game.current_session.loss) {
        setLoss(true);
      }
    }
  }, [ game ]);

  return (
    <Layout title={code}>
      <Container>
          {game && (
            <>
            {/* TODO - Add nav here with map? */}
              {userSession && !userSession.alive && (
                <h2>You have been killed.</h2>
              )}

              {userSession?.alive && (
                <>
                  <h2>Tasks</h2>

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
                </>
              )}

              {imposter && (
                <TaskList>
                  {game.current_session?.user_sessions?.map((session, index) => {
                    const sessionUser = session.user.user;

                    if (!session.imposter) {
                      return (
                        // TODO - Swap complete to alive status
                        <li key={`user-${sessionUser.id}`} data-complete={!session.alive}>
                          <span className="task">{randomKillVerb[killVerbIndices[index]]} {sessionUser.name}</span>
    
                          <div className="controls">
                            <button onClick={() => handleKillUser(session.id)}>
                              COMPLETE
                            </button>
    
                            <span className="complete-icon">
                              &#10003;
                            </span>
                          </div>
                        </li>
                      );
                    }
                  })}
                </TaskList>
              )}

              <div className="controls">
                <Button onClick={handleReport}>REPORT</Button>

                {imposter ? (
                  <Button onClick={handleSabotage}>SABOTAGE</Button>
                ) : (
                  <Button onClick={() => setShowMap(true)}>SHOW MAP</Button>
                )}
              </div>

              {/* TODO - Add report / meeting buttons here? */}
          
            </>
          )}

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
          )}

          <Modal show={victory}>
            <Container>
              <h2>CREWMATE</h2>
              <Button onClick={handleBackToLobby}>Return to Lobby</Button>
            </Container>
          </Modal>

          <Modal show={showMap}>
            <Container>
              {/* TODO - Add tasks to map. */}
              <p>ADD MAP HERE.</p>
              <Button onClick={() => setShowMap(false)}>Close map</Button>
            </Container>
          </Modal>

          <Modal show={victory} bg={imposter ? "#AA0000" : "#71BC78"}>
            <Container>
              <h2>{imposter? 'YOU LOSE!' : 'VICTORY!'}</h2>
              <p>The crewmates completed all their tasks.</p>
              <Button onClick={handleBackToLobby}>Return to Lobby</Button>
            </Container>
          </Modal>

          <Modal show={loss} bg={imposter ? '#71BC78' : "#AA0000"}>
            <h2>{imposter ? 'VICTORY!' : 'YOU LOSE!'}</h2>
            <p>The imposter(s) killed all the crewmates.</p>

            <Container>
              <Button onClick={handleBackToLobby}>Return to Lobby</Button>
            </Container>
          </Modal>
      </Container>
    </Layout>
  )
}

export default Game;


const Modal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.4s ease, visibility 0.4s;
  z-index: -1;
  visibility: none;
  background: ${props => props.bg || 'black'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  h2 {
    font-size: 4rem;
  }

  p {
    font-size: 2rem;
    margin: 2rem 0;
  }

  ${props => props.show && `
    transition: opacity 0.4s ease, visibility 0s;
    visibility: visible;
    opacity: 1;
    z-index: 1000;
  `}
`;

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

        &:focus {
          opacity: 0;
        }
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
