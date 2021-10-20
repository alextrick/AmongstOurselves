import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { Reset } from 'styled-reset'

const GlobalStyle = createGlobalStyle`
  html,
  body,
  * {
    box-sizing: border-box;
    font-family: monospace;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: monospace;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`

const theme = {
  colors: {
    primary: '#0070f3',
  },
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Reset />
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
