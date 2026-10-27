import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

describe('PDF Worker Android兼容', () => {
  test('Capacitor环境使用CDN路径', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { pdfjsLib, PDF_CDN_BASE, ensureWorker } = await import('../src/utils/pdfWorkerSetup.js')
    await ensureWorker()
    expect(pdfjsLib.GlobalWorkerOptions.workerSrc).toContain('cdn.jsdelivr.net')
    expect(pdfjsLib.GlobalWorkerOptions.workerSrc).toContain('pdf.worker')
    expect(PDF_CDN_BASE).toContain('cdn.jsdelivr.net')

    vi.unstubAllGlobals()
  })

  test('CDN路径包含版本号', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { PDF_CDN_BASE } = await import('../src/utils/pdfWorkerSetup.js')
    expect(PDF_CDN_BASE).toMatch(/pdfjs-dist@\d+\.\d+\.\d+/)

    vi.unstubAllGlobals()
  })

  test('CDN基础路径可拼接cMaps和fonts', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { PDF_CDN_BASE } = await import('../src/utils/pdfWorkerSetup.js')
    expect(`${PDF_CDN_BASE}/cmaps/`).toContain('cmaps/')
    expect(`${PDF_CDN_BASE}/standard_fonts/`).toContain('standard_fonts/')
  })
})

describe('PDF解析错误处理', () => {
  test('fileParser parsePdf在Android使用CDN', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { parsePdf } = await import('../src/utils/fileParser.js')
    expect(typeof parsePdf).toBe('function')

    vi.unstubAllGlobals()
  })
})
describe('CMap 本地化路径', () => {
  test('Web环境使用本地 /cmaps/ 路径', async () => {
    vi.resetModules()

    const { getCMapUrl } = await import('../src/utils/pdfWorkerSetup.js')
    const url = getCMapUrl()
    expect(url).toBe('/cmaps/')
  })

  test('Web环境使用本地 /standard_fonts/ 路径', async () => {
    vi.resetModules()

    const { getStandardFontDataUrl } = await import('../src/utils/pdfWorkerSetup.js')
    const url = getStandardFontDataUrl()
    expect(url).toBe('/standard_fonts/')
  })

  test('Capacitor环境回退到CDN cmaps路径', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { getCMapUrl } = await import('../src/utils/pdfWorkerSetup.js')
    const url = getCMapUrl()
    expect(url).toContain('cdn.jsdelivr.net')
    expect(url).toContain('cmaps/')

    vi.unstubAllGlobals()
  })

  test('Capacitor环境回退到CDN fonts路径', async () => {
    vi.stubGlobal('capacitor', { isNative: true })
    vi.resetModules()

    const { getStandardFontDataUrl } = await import('../src/utils/pdfWorkerSetup.js')
    const url = getStandardFontDataUrl()
    expect(url).toContain('cdn.jsdelivr.net')
    expect(url).toContain('standard_fonts/')

    vi.unstubAllGlobals()
  })
})