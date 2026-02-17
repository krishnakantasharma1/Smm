/**
 * Persistent device identifier for order tracking without login.
 * Stored in localStorage so it survives browser close/restart.
 * Used to link Razorpay orders back to this device.
 */

const DEVICE_ID_KEY = "htg_device_id"

export function getDeviceId(): string {
  if (typeof window === "undefined") return ""

  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (id) return id

  // Generate a unique device ID using crypto API + timestamp
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  id = `dev_${Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")}_${Date.now().toString(36)}`

  localStorage.setItem(DEVICE_ID_KEY, id)
  return id
}

