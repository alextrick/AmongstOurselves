import { useState } from 'react';
import styled, { css } from 'styled-components'
import Layout from '../styles/Layout'
import { Container, Row, Col } from 'styled-bootstrap-grid';

// import prisma from '../lib/prisma';
import { apiRequest } from '../lib/helpers';

export default function Home() {
  const [ user, setUser ] = useState();
  const [ name, setName] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false)

  async function handleCreateUser() {
    const res = await apiRequest('/api/new_user', { name });

    console.log(res)
    if (res?.name && res?.id) {
      setUser(res);
    } else {
      setError(true);
    }
  }

  async function handleNewGame() {
    const user = user?.id
    const res = await apiRequest('/api/new_game', { user });
  }

  return (
    <Layout>
      <Container>
        <Row>
          {user ? (
            <>
              <h2>Welcome {name}</h2>

              <Col xs={6}>
                <Button onClick={handleNewGame}>
                  Join Game
                </Button>
              </Col>
              <Col xs={6}>
                <Button>
                  New Game
                </Button>
              </Col>
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
              </div>
            )
          }
        </Row>
      </Container>
    </Layout>
  )
}

const controlStyles = `
  border: 0.25rem solid white;
  background: black;
  padding: 1rem;
  font-size: 1.5rem;
  width: 100%;
  max-width: 100%;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: white;

  &:focus {
    outline: none;
  }
`
const Input = styled.input`
  ${controlStyles}
`;

const Button = styled.button`
  ${controlStyles}
`;

// export const getServerSideProps = async () => {
//   const feed = await prisma.post.findMany({
//     where: { published: true },
//     include: {
//       author: {
//         select: { name: true },
//       },
//     },
//   });
//   return { props: { feed } };
// };
