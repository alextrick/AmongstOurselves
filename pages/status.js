import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col} from 'styled-bootstrap-grid';

// Lib
import { addToQuery, apiRequest, HUE_USERNAME, lightsControl, LOCAL_IP } from '../lib/helpers';

// Styles
import { Button, Error, Input } from '../styles/shared';

function Status() {
  const router = useRouter()
  const [ game, setGame ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ code, setCode ] = useState('')
  const [ codeInput, setCodeInput ] = useState('')
  const [ sabotage, setSabotage ] = useState();
  const [ meetingTimer, setMeetingTimer ] = useState();
  const [ lights, setLights ] = useState();
  const [ lightsIntervalClear, setLightsIntervalClear ] = useState();

  useEffect(() => {
    // Get any user details from query params.
    if (router.query) {
      setCode(router.query.code);
    }
  }, [ router.query ]);

  useEffect(() => {
    (async function() {
      const res = await fetch(
        `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/`,
      )
      const lightIds = Object.keys(await res.json());
  
      setLights(lightIds);
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
      }, 500);

      return () => clearInterval(interval);
    }
  }, [ code, game ]);

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
      if (sabotage) {
        if (lightsIntervalClear) await lightsIntervalClear();
        const intervalClear = lightsControl(lights, { hue: 0, sat: 254 }, true);
  
        setLightsIntervalClear(intervalClear);
      } else if (meeting) {
        if (lightsIntervalClear) await lightsIntervalClear();
        const intervalClear = lightsControl(lights, { hue: 180, sat: 100 });
  
        setLightsIntervalClear(intervalClear);
        // TODO - Add loss lights
        // TODO - Add victory lights
      } else if (game.current_session) {
        if (lightsIntervalClear) await lightsIntervalClear();
        const intervalClear = lightsControl(lights, { }, false, true, true);
  
        setLightsIntervalClear(intervalClear);
      } else {
        // TODO - Set all lights to random
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
      // Redirect to game page if current session.
  }, [ game ]);

  const meeting = game?.current_session?.meeting;

  const bg = meeting ? 'darkcyan' : sabotage ? '#AA0000' : null;

  // console.log(meeting?.votes)
  // console.log(game?.current_session.user_sessions);
  return (
    <Layout bg={bg}>
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
              <h2>{game.code}</h2>

              {game && !game.current_session && (
                <p>Status - In Lobby</p>
              )}

              {meeting && (
                <>
                  <UserList>
                    {game.current_session.user_sessions.map(( user ) => (
                        <li key={`user-${user.id}`} data-complete={!user.alive}>
                          <div className="task">{user.user.user.name} - {user.alive ? 'ALIVE' : 'DEAD'}</div>

                          {meeting && (
                            <>
                              <div className="voted-check">
                                VOTED: {meeting.votes.filter(vote => vote.voter == user.id).length ? 
                                  `&#10003;` : `&#10060;`
                                }
                              </div>
                              <div className="vote-count">
                                VOTES: {meeting.votes.filter(vote => vote.voted_for == user.id).length}
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
      </Container>
    </Layout>
  )
}

export default Status;

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
