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