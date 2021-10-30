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
  const [ initialSetup, setInitialSetup ] = useState(false);
  const [ killVerbIndices, setKillVerbIndices ] = useState([]);
  const [ sabotage, setSabotage ] = useState();
  const [ sabotageCooldown, setSabotageCooldown] = useState();
  const [ meetingTimer, setMeetingTimer ] = useState();
  const [ voted, setVoted ] = useState();

  async function handleCompleteTask(taskId) {
    setLoading(true);

    if (user, taskId && code) {
      await apiRequest('/api/complete_task', {
        taskId,
        userId: user.id,
        session
      });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleKillUser(userSessionId) {
    setLoading(true);

    if (user && userSessionId && session && code) {
      await apiRequest('/api/kill_user', {
        userSessionId,
        userId: user.id,
        session,
        code
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

    if (session) {
      await apiRequest('/api/report', { session });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleSabotage() {
    setLoading(true);

    if (session) {
      await apiRequest('/api/sabotage', { session });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleVote(userSessionId) {
    setLoading(true);
    setVoted(true);

    if (user && userSessionId && session && code) {
      await apiRequest('/api/vote', {
        userSessionId,
        userId: user.id,
        session,
        code
      });
    } else {
      setError(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    // Poll game state.
    if (session) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/game_state', { session });
  
        const { gameData, sabotageTimer, sabotageCooldownTimer } = res; 
        // Check if game state differs
        if (JSON.stringify(gameData) !== JSON.stringify(game)) {
          setGame(gameData);
        }

        setSabotage(sabotageTimer);
        setSabotageCooldown(sabotageCooldownTimer);
        setMeetingTimer(res.meetingTimer);

        if (!res.meetingTimer) {
          setVoted(false);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [ session, game ]);

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
    if (game && !game.victory && !game.loss && !game.is_active) {
      const query = { ...router.query };
      delete query['session'];

      router.push(
        {
          pathname: '/lobby',
          query
        },
      );
    }
    
    if (game?.user_sessions) {
      if (!initialSetup) {
        for (let session of game?.user_sessions) {
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
                  game.user_sessions.length, randomKillVerb.length
                )
              );
            }
          }
        }

        setInitialSetup(true);
      } else {
        for (let session of game?.user_sessions) {
          // Get current users UserSession
          if (session.user_id === user.id) {
            setUserSession(session);
          }
        }
      }
    }
  }, [ game ]);

  return (
    <Layout title={code} bg={sabotage && '#AA0000'}>
      <Container>
          {game && (
            <>
              {userSession && !userSession.alive && (
                <h2>You have been killed.</h2>
              )}

              {userSession?.alive && (
                <>
                  <h2>Tasks</h2>

                  {imposter ? (
                    <TaskList>
                      {game.user_sessions?.map((session, index) => {
                        const sessionUser = session.user.user;
    
                        if (!session.imposter) {
                          return (
                            <li key={`user-${sessionUser.id}`} data-complete={!session.alive}>
                              <span className="task">{randomKillVerb[killVerbIndices[index]]} {sessionUser.name}</span>
        
                              <div className="controls">
                                {/* Disabled if there's a kill cooldown */}
                                <button disabled={userSession.killCooldown} onClick={() => handleKillUser(session.id)}>
                                  {userSession.killCooldown || 'COMPLETE' }
                                </button>
        
                                <span className="complete-icon">
                                  &#10003;
                                </span>
                              </div>
                            </li>
                          );
                        } else {
                          return (
                            <li key={`user-${sessionUser.id}`}>
                              <span className="task">Do not kill {sessionUser.name}</span>
        
                              <div className="controls">
                                <button>
                                  Imposter
                                </button>
                              </div>
                            </li>
                          );
                        }
                      })}
                    </TaskList>
                  ) : (
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
                </>
              )}

              <div className="controls">
                {sabotage ? (
                  <h2>SABOTAGE - {sabotage}</h2> 
                ) : (
                  <Button onClick={handleReport}>REPORT</Button>
                )}

                {imposter ? (
                  <Button
                    disabled={sabotageCooldown}
                    onClick={handleSabotage}
                  >{sabotageCooldown || 'SABOTAGE'}
                  </Button>
                ) : (
                  <Button onClick={() => setShowMap(true)}>SHOW MAP</Button>
                )}
              </div>          
            </>
          )}

          {isOwner && (
            <OwnerControls>
              <Button
                disabled={loading}
                onClick={handleEndGame}
              >
                End game
              </Button>

              {error && <Error>Error!</Error>}
            </OwnerControls>
          )}

          <Modal show={showMap}>
            <Container>
              {/* TODO - Add tasks to map. */}
              <p>ADD MAP HERE.</p>
              <Button onClick={() => setShowMap(false)}>Close map</Button>
            </Container>
          </Modal>

          {/* This is a mess but running out of time */}
          <Modal
            show={game?.meeting}
            bg={'darkcyan'}
          >
            <Container>
                <h2>
                  {meetingTimer ? 'VOTE!' : 'MEETING!'}
                </h2>

                {meetingTimer ? (
                  // Display vote list
                  <>
                    <TaskList>
                      {game.user_sessions?.filter(session => session.alive)
                      .map((session) => {
                        const sessionUser = session.user.user;
    
                        return (
                          <li key={`user-${sessionUser.id}`}>
                            <span className="task">{sessionUser.name}</span>
      
                            <div className="controls">
                              <button disabled={voted} onClick={() => handleVote(session.id)}>
                                Vote
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </TaskList>
                  </>
                ) : (
                  <p>Return to Electrical to confer with your crewmates.</p>
                )}

                {isOwner && (
                  <OwnerControls>
                    <Button
                      disabled={loading}
                      onClick={handleEndGame}
                    >
                      End game
                    </Button>

                    {error && <Error>Error!</Error>}
                  </OwnerControls>
                )}

                {/* TODO - Add map here showing location of sabotage? */}
            </Container>
          </Modal>

          <Modal show={game?.victory} bg={imposter ? "#AA0000" : "#71BC78"}>
            <Container>
              <h2>{imposter? 'YOU LOSE!' : 'VICTORY!'}</h2>
              <p>The crewmates completed all their tasks.</p>
              <Button onClick={handleBackToLobby}>Return to Lobby</Button>
            </Container>
          </Modal>

          <Modal show={game?.loss} bg={imposter ? '#71BC78' : "#AA0000"}>
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

      h2 {
        font-size: 5rem;
      }

      button {
        transition: opacity 0.4s ease;
        border: none;
        min-width: 6rem;

        &:disabled {
          background: white;
          opacity: 0.5;
        }

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

      button,
      button:disabled {
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

const OwnerControls = styled.div`
  margin-top: 4rem;
  opacity: 0.6;
`;

