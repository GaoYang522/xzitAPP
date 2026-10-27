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

// CMap 和字体路径：优先使用本地 public 目录，Capacitor 环境回退到 CDN
function getCMapUrl() {
  if (typeof window !== 'undefined' && window.capacitor) {
    return `${CDN_BASE}/cmaps/`
  }
  return '/cmaps/'
}

function getStandardFontDataUrl() {
  if (typeof window !== 'undefined' && window.capacitor) {
    return `${CDN_BASE}/standard_fonts/`
  }
  return '/standard_fonts/'
}

export { pdfjsLib, CDN_BASE as PDF_CDN_BASE, ensureWorker, getCMapUrl, getStandardFontDataUrl }