const LANGUAGE_IDS = {
  octave: 124,
  c: 50,
  cpp: 54,
}

const VERILOG_KEYWORDS = ['module', 'endmodule', 'always', 'assign', 'begin', 'end', 'if', 'else', 'case', 'endcase', 'wire', 'reg', 'input', 'output', 'inout', 'posedge', 'negedge', 'initial', 'function', 'endfunction', 'task', 'endtask', 'parameter', 'localparam', 'generate', 'endgenerate', 'for', 'while', 'forever', 'wait', 'disable', 'fork', 'join']

export function convertMatlabToOctave(matlabCode) {
  let code = matlabCode
  code = code.replace(/;\s*%/g, ';\n#')
  code = code.replace(/%\s/g, '# ')
  code = code.replace(/%$/gm, '#')
  code = code.replace(/disp\(([^)]+)\)/g, 'disp($1)')
  code = code.replace(/fprintf\(([^)]+)\)/g, 'printf($1)')
  code = code.replace(/figure\s*\(\s*\)/g, 'figure(1)')
  return code
}

async function submitToJudge0(sourceCode, languageId, options) {
  const { apiUrl, apiKey } = options
  if (!apiUrl) {
    return { error: 'MISSING_API_URL', message: '在线编译 API URL 未配置' }
  }

  const submitUrl = `${apiUrl.replace(/\/$/, '')}/submissions?base64_encoded=false&wait=true`
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey
  }

  let response
  try {
    response = await fetch(submitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: '',
      }),
    })
  } catch (e) {
    return { error: 'NETWORK_ERROR', message: `编译服务请求失败: ${e.message}` }
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    return { error: 'API_ERROR', message: `编译服务返回错误 ${response.status}: ${errText}` }
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    return { error: 'PARSE_ERROR', message: `编译结果解析失败: ${e.message}` }
  }

  const stdout = data.stdout || ''
  const stderr = data.stderr || data.compile_output || ''
  const exitCode = data.status?.id ?? null
  const statusDescription = data.status?.description || ''

  return { stdout, stderr, exitCode, statusDescription }
}

export async function executeOctave(matlabCode, options = {}) {
  const octaveCode = convertMatlabToOctave(matlabCode)
  return submitToJudge0(octaveCode, LANGUAGE_IDS.octave, options)
}

export async function executeC(cCode, options = {}) {
  return submitToJudge0(cCode, LANGUAGE_IDS.c, options)
}

export async function executeCpp(cppCode, options = {}) {
  return submitToJudge0(cppCode, LANGUAGE_IDS.cpp, options)
}

export function checkVerilog(verilogCode) {
  const errors = []
  const lines = verilogCode.split('\n')

  const hasModule = lines.some((l) => /\bmodule\b/.test(l))
  if (!hasModule) {
    errors.push({ line: 0, message: '缺少 module 声明' })
  }

  const hasEndmodule = lines.some((l) => /\bendmodule\b/.test(l))
  if (!hasEndmodule) {
    errors.push({ line: lines.length, message: '缺少 endmodule 结束声明' })
  }

  let moduleCount = 0
  let endmoduleCount = 0
  let beginCount = 0
  let endCount = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const moduleMatches = line.match(/\bmodule\b/g)
    const endmoduleMatches = line.match(/\bendmodule\b/g)
    const beginMatches = line.match(/\bbegin\b/g)
    const endMatches = line.match(/\bend\b/g)
    if (moduleMatches) moduleCount += moduleMatches.length
    if (endmoduleMatches) endmoduleCount += endmoduleMatches.length
    if (beginMatches) beginCount += beginMatches.length
    if (endMatches) endCount += endMatches.length
  }
  if (moduleCount !== endmoduleCount) {
    errors.push({ line: 0, message: `module/endmodule 不匹配: ${moduleCount} module vs ${endmoduleCount} endmodule` })
  }
  if (beginCount !== endCount) {
    errors.push({ line: 0, message: `begin/end 不匹配: ${beginCount} begin vs ${endCount} end` })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      const tokens = line.split(/[\s,;:()\[\]{}=<>+\-*/&|^~!]+/).filter(Boolean)
      for (const token of tokens) {
        if (VERILOG_KEYWORDS.includes(token)) continue
        if (/^\d/.test(token)) continue
        if (/^[a-zA-Z_]\w*$/.test(token)) continue
        if (/^[$]/.test(token)) continue
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export async function executeCode(language, code, options = {}) {
  switch (language.toLowerCase()) {
    case 'matlab':
    case 'octave':
      return executeOctave(code, options)
    case 'c':
    case 'c99':
    case 'c11':
      return executeC(code, options)
    case 'cpp':
    case 'c++':
    case 'cpp17':
      return executeCpp(code, options)
    case 'verilog':
    case 'vhdl':
      return checkVerilog(code)
    default:
      return { error: 'UNSUPPORTED_LANGUAGE', message: `不支持的语言: ${language}` }
  }
}