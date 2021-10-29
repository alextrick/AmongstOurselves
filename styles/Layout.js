import React from 'react';
import styled from 'styled-components';
import { Container } from 'styled-bootstrap-grid';

function Layout({ children, title, bg }) {
  return (
    <LayoutWrapper bg={bg}>
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
  padding: 1rem 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  background: ${props => props.bg || 'black'};
  color: white;
`;

const Header = styled.header`
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 3rem;
  text-align: center;
`;

