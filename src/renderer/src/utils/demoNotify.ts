import { notifications } from '@mantine/notifications'

export function demoAction(label: string, detail?: string) {
  notifications.show({
    title: label,
    message: detail ?? 'Mock action — available in a later phase',
    color: 'blue',
    autoClose: 2800,
  })
}
