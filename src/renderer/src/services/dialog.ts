function getDialogApi() {
  if (!window.kport?.dialog) {
    throw new Error('KPort dialog API is not available')
  }

  return window.kport.dialog
}

export async function pickLocalFile(): Promise<string | null> {
  return getDialogApi().openFile()
}

export async function pickLocalDirectory(): Promise<string | null> {
  return getDialogApi().openDirectory()
}
