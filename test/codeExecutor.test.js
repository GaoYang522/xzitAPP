import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  executeCode,
  executeOctave,
  executeC,
  checkVerilog,
  convertMatlabToOctave,
} from '../src/utils/codeExecutor.js'

function mockFetchResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('convertMatlabToOctave', () => {
  test('注释 % 转为 #', () => {
    expect(convertMatlabToOctave('x = 1; % 这是注释')).toContain('# 这是注释')
  })

  test('fprintf 转为 printf', () => {
    expect(convertMatlabToOctave('fprintf("hello")')).toBe('printf("hello")')
  })

  test('figure() 转为 figure(1)', () => {
    expect(convertMatlabToOctave('figure()')).toBe('figure(1)')
  })
})

describe('executeOctave', () => {
  test('正常提交返回 stdout', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      stdout: 'hello\n',
      status: { id: 3, description: 'Accepted' },
    }))
    const result = await executeOctave('disp("hello")', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.stdout).toBe('hello\n')
    expect(result.exitCode).toBe(3)
  })

  test('API URL 缺失返回错误', async () => {
    const result = await executeOctave('disp("test")', {})
    expect(result.error).toBe('MISSING_API_URL')
  })

  test('网络错误返回 NETWORK_ERROR', async () => {
    fetch.mockRejectedValue(new Error('timeout'))
    const result = await executeOctave('disp("test")', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.error).toBe('NETWORK_ERROR')
  })
})

describe('executeC', () => {
  test('正常提交 C 代码返回结果', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      stdout: 'hello\n',
      stderr: '',
      status: { id: 3, description: 'Accepted' },
    }))
    const result = await executeC('#include <stdio.h>\nint main(){printf("hello\\n");return 0;}', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.stdout).toBe('hello\n')
    expect(result.stderr).toBe('')
  })

  test('编译错误返回 stderr', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      stdout: '',
      stderr: 'error: expected ;',
      compile_output: 'error: expected ;',
      status: { id: 6, description: 'Compilation Error' },
    }))
    const result = await executeC('int main(){ broken }', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.stderr).toContain('error')
  })
})

describe('checkVerilog', () => {
  test('合法 Verilog 返回 valid=true', () => {
    const code = `module test(input a, output b);
  assign b = a;
endmodule`
    const result = checkVerilog(code)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('缺少 module 返回错误', () => {
    const result = checkVerilog('assign b = a;')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('module'))).toBe(true)
  })

  test('缺少 endmodule 返回错误', () => {
    const code = 'module test(input a, output b);\nassign b = a;'
    const result = checkVerilog(code)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('endmodule'))).toBe(true)
  })

  test('begin/end 不匹配返回错误', () => {
    const code = `module test(input clk, output reg q);
  always @(posedge clk) begin
    q <= 1;
endmodule`
    const result = checkVerilog(code)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('begin/end'))).toBe(true)
  })
})

describe('executeCode 统一入口', () => {
  test('matlab 语言路由到 executeOctave', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      stdout: '42\n',
      status: { id: 3 },
    }))
    const result = await executeCode('matlab', 'disp(42)', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.stdout).toBe('42\n')
  })

  test('c 语言路由到 executeC', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      stdout: 'ok\n',
      status: { id: 3 },
    }))
    const result = await executeCode('c', 'int main(){return 0;}', {
      apiUrl: 'https://judge0.example.com',
    })
    expect(result.stdout).toBe('ok\n')
  })

  test('verilog 语言路由到 checkVerilog', async () => {
    const result = await executeCode('verilog', 'module a; endmodule')
    expect(result.valid).toBe(true)
  })

  test('不支持的语言返回错误', async () => {
    const result = await executeCode('python', 'print(1)')
    expect(result.error).toBe('UNSUPPORTED_LANGUAGE')
  })
})