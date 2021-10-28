import React from 'react';
import styled from 'styled-components';
import { Container, Row, Col } from 'styled-bootstrap-grid';

function Layout({ children, title }) {
  return (
    <LayoutWrapper>
      <Container>
        <Header>
          {title || 'AMONGST OURSELVES!'}
        </Header>
      </Container>

      <div>
        {children}
      </div>
    </LayoutWrapper>
  );
}

export default Layout;

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  background-color: black;
  color: white;
`;

const Header = styled.header`
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 3rem;
  text-align: center;
`;

