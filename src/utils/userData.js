import { exportAllData, importAllData, clearAll } from './exportImport.js'

function getUserDataKey(username) {
  return `xzitapp_user_${username}`
}

export function saveUserData(username) {
  const data = exportAllData()
  localStorage.setItem(getUserDataKey(username), JSON.stringify(data))
}

export function loadUserData(username) {
  const raw = localStorage.getItem(getUserDataKey(username))
  if (raw) {
    try {
      const data = JSON.parse(raw)
      clearAll()
      importAllData(data)
    } catch (e) {
      clearAll()
    }
  } else {
    clearAll()
  }
}

export function deleteUserData(username) {
  localStorage.removeItem(getUserDataKey(username))
}

export function hasUserData(username) {
  return !!localStorage.getItem(getUserDataKey(username))
}