let eyeDropperInstance: EyeDropper | null = null

export async function openEyeDropper() {
  if (!eyeDropperInstance) {
    eyeDropperInstance = new window.EyeDropper()
  }
  const color = await eyeDropperInstance.open()

  return color.sRGBHex
}
