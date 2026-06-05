import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@xterm/xterm/css/xterm.css'
import './styles/variables.css'
import './styles/global.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { IconThemeProvider } from 'react-material-icon-theme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <IconThemeProvider initialConfig={{ folderTheme: 'specific' }}>
        <Notifications position="top-right" />
        <App />
      </IconThemeProvider>
    </MantineProvider>
  </StrictMode>,
)
