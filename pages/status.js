import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col} from 'styled-bootstrap-grid';

// Lib
import { addToQuery, apiRequest, hsbToHue, HUE_USERNAME, lightsControl, LOCAL_IP } from '../lib/helpers';

// Styles
import { Button, Error, Input } from '../styles/shared';
import { Modal } from './game';

function Status() {
  const router = useRouter()
  const [ game, setGame ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ code, setCode ] = useState('')
  const [ codeInput, setCodeInput ] = useState('')
  const [ sabotage, setSabotage ] = useState();
  const [ meetingTimer, setMeetingTimer ] = useState();
  const [ meetingResult, setMeetingResult ] = useState();
  const [ lights, setLights ] = useState();
  const [ gameMode, setGameMode ] = useState();

  useEffect(() => {
    // Get any user details from query params.
    if (router.query) {
      setCode(router.query.code);
    }
  }, [ router.query ]);

  useEffect(() => {
    (async function() {
      try {
        const res = await fetch(
          `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/`,
        )
        const lightIds = Object.keys(await res.json());
    
        setLights(lightIds);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // Poll game state.
    if (code) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/status', { code });
  
        const { gameData, sabotageTimer, meetingTimer } = res; 
        // Check if game state differs
        if (JSON.stringify(gameData) !== JSON.stringify(game)) {
          setGame(gameData);
        }

        setSabotage(sabotageTimer);
        setMeetingTimer(res.meetingTimer);
        setMeetingResult(res.meetingResult);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [ code, game ]);

  useEffect(() => {
    // Display meeting result for 10 seconds;
    if (meetingResult) {
      const timeout = setTimeout(() => {
        setMeetingResult(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [meetingResult]);

  async function handleStartMeeting() {
    setLoading(true);

    if (game) {
      await apiRequest('/api/start_meeting', { session: game.current_session.id });
    } else {
      setError(true);
    }

    setLoading(false);
  }


  useEffect(() => {
    if (game) {
      if (!game.current_session) {
        setSabotage(false);
        setMeetingTimer(false);
        setGameMode('lobby');
      } else if (game.current_session.loss) {
        setGameMode('loss');
      } else if (game.current_session.victory) {
        setGameMode('victory')
      } else if (sabotage) {
        setGameMode('sabotage')
      } else if (meeting) {
        setGameMode('meeting')
      } else if (game.current_session) {
        setGameMode('tasks')
      }
    }
      // TODO - Display sabotage screen if that is active?
      // TODO - Play some sort of siren in sabotage is active?
      // TODO - ADD TASK TO DISABLE SABOTAGE.
      // TWO USERS HAVE TO ADD THE CODE ON THEIR PHONES?.


      // TODO - Control lights if sabotage starts / ends

      // TODO - Control lights for meeting?

      // TODO - Display screen for victory / loss

      // TODO - VOTING. VOTE ON PHONE

      // TODO - DISPLAY - X WAS / WAS NOT AN IMPOSTER


      // TODO - Play game start sound
      // Redirect to game page if current session
      
  }, [ game ]);

  useEffect(() => {
    let lightsInterval;

    // TODO - Add sounds to all of these.
    if (lights) {
      switch (gameMode) {
        case 'lobby':
          lightsControl(lights, { hue: hsbToHue(20), sat: 20, bri: 120 });
          break;
        case 'loss':
          lightsControl(lights, { hue: 0, sat: 255, bri: 150 });
          break
        case 'victory':
          lightsControl(lights, { hue: hsbToHue(126), sat: 150, bri: 150 });
          break
        case 'sabotage':
          let on = false;
  
          lightsInterval = setInterval(() => {
            on = !on;
  
            lightsControl(lights, { hue: 0, sat: 254, bri: 127, on });
          }, 2000);
          break;
        case 'meeting':
          lightsControl(lights, { hue: hsbToHue(165), sat: 180, bri: 150 });
          break;
        case 'tasks':
          lightsControl(lights, { }, true);
          break
        default:
          lightsControl(lights, { hue: 172, sat: 49, bri: 80});
      }
    }

    if (lightsInterval) {
      return () => clearInterval(lightsInterval)
    }
  }, [ gameMode, lights ]);

  const current_session = game?.current_session || {};
  const { meeting } = current_session

  let bg;

  if (meeting) {
    bg = 'darkcyan'
  } else if (current_session.victory) {
    bg = '#71BC78'
  } else if (sabotage || current_session.loss) {
    bg = '#AA0000'
  }

  let status;

  // TODO - Swap this to gameMode
  if (game && !game.current_session) {
    status = 'In Lobby';
  } else if (current_session.victory) {
    status = 'VICTORY!';
  } else if (current_session.loss) {
    status = 'LOSS!';
  } else if (sabotage) {
    status = 'SABOTAGE';
  } else {
    status = 'DO YOUR TASKS';
  }

  return (
    <Layout bg={bg} noTitle={true}>
      <Container>
          {!code && (
            <Row>
              <Col sm={8}>
                <Input
                  placeholder="Enter game code"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                />
              </Col>

              <Col sm={4}>
                <Button onClick={() => addToQuery(router, { code: codeInput })}>Submit</Button>
              </Col>
            </Row>
          )}
          {game && (
            <>
              <h2>{game.code} - Tasks {current_session.tasks_complete} / {current_session.total_tasks}</h2>

              <GameStatus>Status - {status}</GameStatus>

              {meeting && (
                <>
                  <UserList>
                    {current_session.user_sessions.map(( user ) => (
                        <li key={`user-${user.id}`} data-complete={!user.alive}>
                          <div className="task">{user.user.user.name} - {user.alive ? 'ALIVE' : 'DEAD'}</div>

                          {meeting && (
                            <>
                              <div className="voted-check">
                                VOTED: {meeting.votes.filter(vote => vote.voter == user.user.user_id).length ? 
                                  '\u2713' : 'X'
                                }
                              </div>
                              <div className="vote-count">
                                VOTES: {meeting.votes.filter(vote => vote.voted_for == user.user.user_id).length}
                              </div>
                            </>
                          )}
                        </li>
                    ))}
                  </UserList>

                  {meeting.meeting_end ? (
                    <MeetingStatus>
                      <h2>Meeting in progress</h2>
                      <h3>{meetingTimer}</h3>
                    </ MeetingStatus>
                  ) : (
                    <div>
                      <Button
                        disabled={loading}
                        onClick={handleStartMeeting}
                      >
                        Start Meeting
                      </Button>

                      {error && <Error>Error!</Error>}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <Modal show={meetingResult}>
            <Container>
              <h2>{meetingResult}</h2>
            </Container>
          </Modal>
      </Container>
    </Layout>
  )
}

export default Status;

const GameStatus = styled.h1`
  font-size: 6rem;
  text-align: center;
`;

const UserList = styled.ul`
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

    .voted-check {
      margin: 0 2rem 0 auto;
    }

    .vote-count {
      font-weight: bold;
    }

    &[data-complete="true"] {
      .task { 
        text-decoration: line-through;
      }
    }
  }
`;

const MeetingStatus = styled.div`
  text-align: center;

  h3 {
    font-size: 6rem;
  }
`;
