import {
  createTheme,
  NavLink,
  Notification,
  Tabs,
  type MantineColor,
  type MantineColorsTuple,
} from '@mantine/core'

function getToastTone(color: MantineColor | undefined): 'success' | 'error' | 'info' {
  if (color === 'green') return 'success'
  if (color === 'red') return 'error'
  return 'info'
}

/** Generated from https://mantine.dev/colors-generator/?color=4C5897 */
const bluePalette: MantineColorsTuple = [
  '#ecf4ff',
  '#dce4f5',
  '#b9c7e2',
  '#94a8d0',
  '#748dc0',
  '#5f7cb7',
  '#5474b4',
  '#44639f',
  '#3a5890',
  '#2c4b80',
]

/** Dark blue-gray surfaces */
const darkPalette: MantineColorsTuple = [
  '#e8edf5',
  '#c8d2e2',
  '#9aa8be',
  '#6d7d96',
  '#4a5769',
  '#353f4f',
  '#2a3342',
  '#222a38',
  '#1b2230',
  '#151b26',
]

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'sm',
  colors: {
    blue: bluePalette,
    dark: darkPalette,
  },
  components: {
    NavLink: NavLink.extend({
      styles: {
        root: {
          borderRadius: 6,
          marginInline: 8,
          '&:hover': {
            backgroundColor: 'var(--app-hover)',
          },
          '&[data-active]': {
            backgroundColor: 'var(--app-active)',
            borderLeft: '2px solid var(--app-active-border)',
            paddingLeft: 'calc(var(--mantine-spacing-sm) - 2px)',
          },
        },
        description: {
          color: 'var(--mantine-color-dark-2)',
        },
      },
    }),
    Tabs: Tabs.extend({
      styles: {
        tab: {
          '&[data-active]': {
            color: 'var(--mantine-color-dark-0)',
            borderColor: 'var(--mantine-color-blue-6)',
            backgroundColor: 'var(--app-active)',
          },
          '&:hover:not([data-active])': {
            backgroundColor: 'var(--app-hover)',
          },
        },
      },
    }),
    Notification: Notification.extend({
      defaultProps: {
        withBorder: true,
      },
      styles: (_theme, props) => {
        const tone = getToastTone(props.color)

        return {
          root: {
            backgroundColor: `var(--app-toast-${tone}-bg)`,
            borderColor: `var(--app-toast-${tone}-border)`,
            '--notification-color': `var(--app-toast-${tone}-accent)`,
          },
        }
      },
    }),
  },
})
