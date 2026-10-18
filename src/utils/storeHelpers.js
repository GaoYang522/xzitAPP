export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function makeActions(stateKey, singularName) {
  const cap = singularName.charAt(0).toUpperCase() + singularName.slice(1)
  return {
    [`add${cap}`](item) {
      this[stateKey].push({ ...item, id: genId() })
    },
    [`update${cap}`](id, updates) {
      const item = this[stateKey].find((i) => i.id === id)
      if (item) Object.assign(item, updates)
    },
    [`remove${cap}`](id) {
      this[stateKey] = this[stateKey].filter((i) => i.id !== id)
    },
    [`get${cap}`](id) {
      return this[stateKey].find((i) => i.id === id)
    },
  }
}