import styled, { css } from 'styled-components';

const controlStyles = css`
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

  &:disabled {
    opacity: 0.5;
    cursor: initial;
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Button = styled.button`
  ${controlStyles}
  cursor: pointer;
`;

export const Error = styled.p`
  color: red;
  font-weight: 800;
  text-transform: uppercase;
`;
