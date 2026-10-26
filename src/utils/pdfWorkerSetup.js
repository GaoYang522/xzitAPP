import * as pdfjsLib from 'pdfjs-dist'

const PDFJS_VERSION = pdfjsLib.version || '6.4.4'
const CDN_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`

let initialized = false

async function ensureWorker() {
  if (initialized) return
  initialized = true

  if (typeof window !== 'undefined' && window.capacitor) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.min.mjs`
  } else {
    try {
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.min.mjs`
    }
  }
}

export { pdfjsLib, CDN_BASE as PDF_CDN_BASE, ensureWorker }