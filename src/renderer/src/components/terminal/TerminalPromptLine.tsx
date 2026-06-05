import type { Ref } from 'react'
import classes from '../../styles/layout.module.css'

interface TerminalPromptLineProps {
  cwd?: string
  command?: string
  input?: string
  cursorLeft?: number
  showCursor?: boolean
  inputRef?: Ref<HTMLSpanElement>
  onInputClick?: (event: React.MouseEvent<HTMLSpanElement>) => void
}

function formatPromptPath(cwd: string): string {
  if (cwd.startsWith('/var/www/')) return `~${cwd.slice('/var/www'.length)}`
  if (cwd.startsWith('/var/www')) return '~'
  return cwd
}

export function TerminalPromptLine({
  cwd = '/var/www/api',
  command,
  input,
  cursorLeft = 0,
  showCursor = false,
  inputRef,
  onInputClick,
}: TerminalPromptLineProps) {
  return (
    <div className={classes.terminalLine}>
      <span className={classes.terminalUser}>deploy@prod</span>
      <span className={classes.terminalSep}>:</span>
      <span className={classes.terminalPath}>{formatPromptPath(cwd)}</span>
      <span className={classes.terminalSymbol}> $</span>
      {command !== undefined ? (
        <span className={classes.terminalCmd}> {command}</span>
      ) : (
        <span className={classes.terminalInputArea}>
          <span ref={inputRef} className={classes.terminalCmd} onClick={onInputClick}>
            {' '}
            {input}
          </span>
          {showCursor && (
            <span
              className={classes.terminalCursorOverlay}
              style={{ left: cursorLeft }}
              aria-hidden
            />
          )}
        </span>
      )}
    </div>
  )
}
