import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col} from 'styled-bootstrap-grid';

// Lib
import { addToQuery, apiRequest } from '../lib/helpers';

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

  useEffect(() => {
    // Get any user details from query params.
    if (router.query) {
      setCode(router.query.code);
    }
  }, [ router.query ]);

  useEffect(() => {
    // Poll game state.
    if (code) {
      const interval = setInterval(async () => {
        const res = await apiRequest('/api/status', { code });
  
        const { gameData, sabotageTimer } = res; 
        // Check if game state differs
        if (JSON.stringify(gameData) !== JSON.stringify(game)) {
          setGame(gameData);
        }

        setSabotage(sabotageTimer);
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
      // TODO - Display user list if meeting is active.

      // TODO - Display sabotage screen if that is active?
      // TODO - Play some sort of siren in sabotage is active?
      // TODO - ADD TASK TO DISABLE SABOTAGE.
      // TWO USERS HAVE TO ADD THE CODE ON THEIR PHONES?.


      // TODO - Control lights if sabotage starts / ends

      // TODO - Control lights for meeting?

      // TODO - Display screen for victory / loss


      // TODO - MEETING

      // TODO - VOTING. VOTE ON PHONE

      // TODO - DISPLAY - X WAS / WAS NOT AN IMPOSTER


      // TODO - Play game start sound
      // Redirect to game page if current session.
  }, [ game ]);

  console.log(game?.current_session?.user_sessions)
  return (
    <Layout>
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

              {game?.current_session?.meeting && (
                <>
                  <UserList>
                    {game.current_session.user_sessions.map(( user ) => (
                        <li key={`user-${user.id}`}>
                          {user.user.user.name} - {user.alive ? 'ALIVE' : 'DEAD'}
                        </li>
                    ))}
                  </UserList>

                  {!game.meeting_end && (
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

    &:last-child {
      border: none;
    }
  }
`;
