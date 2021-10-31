import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

import { addToQuery, apiRequest } from '../lib/helpers';
import { Button, Input, Error } from '../styles/shared';


function Index() {
  const router = useRouter();
  const [ name, setName] = useState('');
  const [ gameCode, setGameCode ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);

  // Get any user details.
  let user;

  if (router.query) {
    const { name, id } = router.query;

    if (name && id) {
      user = { name, id: parseInt(id) };
    }
  }

  async function handleCreateUser() {
    setLoading(true);

    try {
      const res = await apiRequest('/api/new_user', { name });
  
      if (res?.name && res?.id) {
        // Store user details in query params instead?
        addToQuery(router, res);
      } else {
        setError(true);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false)
  }

  async function handleNewGame() {
    setLoading(true);
    const userId = router?.query?.id;

    if (userId) {
      const res = await apiRequest('/api/new_game', { userId });
      // Get game code
      const { code } = res;

      // Navigate to game lobby
      router.push(
        {
          pathname: '/lobby',
          query: { ...router.query, code }
        },
      );
    } else {
      setError(true);
    }

    setLoading(false);
  }

  async function handleJoinGame() {
    setLoading(true);
    const userId = router?.query?.id;

    if (userId) {
      const res = await apiRequest('/api/join_game', { userId, code: gameCode });

      // Get game code
      const { code } = res;

      // Navigate to game lobby
      router.push(
        {
          pathname: '/lobby',
          query: { ...router.query, code }
        },
      );
    }

    setLoading(false);
  }

  return (
    <Layout>
      <Container>
        <Row>
          {user ? (
            <>
              <h2>Welcome {router.query.name}</h2>

                <Input
                  type="text"
                  placeholder="Game code"
                  value={gameCode}
                  onChange={e => setGameCode(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />

                <Button
                  onClick={handleJoinGame}
                  disabled={gameCode?.length !== 6 || loading}
                >
                  Join Game
                </Button>
                <Button
                  onClick={handleNewGame}
                  disabled={loading}
                >
                  New Game
                </Button>
            </>
          )
            : (
              <div>
                <h2>Enter your name</h2>

                <Input
                  type="text"
                  placeholder="George"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                />

                <Button
                  disabled={!name || loading}
                  onClick={handleCreateUser}
                >
                  Submit
                </Button>

                {error && <Error>Error!</Error>}
              </div>
            )
          }
        </Row>
      </Container>
    </Layout>
  )
}

export default Index;
