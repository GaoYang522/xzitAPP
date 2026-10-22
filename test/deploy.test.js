import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Vercel 部署配置', () => {
  test('vercel.json存在且配置正确', () => {
    const configPath = resolve(process.cwd(), 'vercel.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    expect(config.framework).toBe('vite')
    expect(config.buildCommand).toBe('npm run build')
    expect(config.outputDirectory).toBe('dist')
  })

  test('SPA路由重写规则存在', () => {
    const configPath = resolve(process.cwd(), 'vercel.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    expect(config.rewrites).toBeDefined()
    expect(config.rewrites[0].source).toBe('/(.*)')
    expect(config.rewrites[0].destination).toBe('/index.html')
  })
})