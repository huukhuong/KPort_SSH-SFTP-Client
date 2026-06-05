export const TERMINAL_INPUT_LEADING_SPACE = ' '

export function getMonospaceFont(element: HTMLElement): string {
  const style = window.getComputedStyle(element)
  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

export function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return 0
  }

  context.font = font
  return context.measureText(text).width
}

export function getCursorIndexFromClick(text: string, offsetX: number, font: string): number {
  if (offsetX <= 0) {
    return 0
  }

  for (let index = 0; index <= text.length; index += 1) {
    const width = measureTextWidth(text.slice(0, index), font)

    if (width > offsetX) {
      const prevWidth = index === 0 ? 0 : measureTextWidth(text.slice(0, index - 1), font)
      const mid = prevWidth + (width - prevWidth) / 2
      return offsetX < mid ? index - 1 : index
    }
  }

  return text.length
}

export function getInputCursorLeft(
  input: string,
  cursorIndex: number,
  font: string,
): number {
  const prefix = `${TERMINAL_INPUT_LEADING_SPACE}${input.slice(0, cursorIndex)}`
  return measureTextWidth(prefix, font)
}

function isWordChar(char: string): boolean {
  return char !== ' ' && char !== '\t'
}

/** Readline-style: jump to start of previous word */
export function prevWordIndex(text: string, cursor: number): number {
  let index = cursor

  while (index > 0 && isWordChar(text[index - 1])) {
    index -= 1
  }

  while (index > 0 && !isWordChar(text[index - 1])) {
    index -= 1
  }

  return index
}

/** Readline-style: jump to start of next word */
export function nextWordIndex(text: string, cursor: number): number {
  let index = cursor
  const length = text.length

  while (index < length && !isWordChar(text[index])) {
    index += 1
  }

  while (index < length && isWordChar(text[index])) {
    index += 1
  }

  return index
}
