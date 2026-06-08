import { Button, Code, Stack, Text, Title } from '@mantine/core'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[KPort] Renderer crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <Stack m="xl" gap="md" maw={720}>
        <Title order={3}>KPort hit a renderer error</Title>
        <Text size="sm" c="dimmed">
          The UI stopped rendering. Reload the app. If this keeps happening, share the message below.
        </Text>
        <Code block>{this.state.error.message}</Code>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </Stack>
    )
  }
}
