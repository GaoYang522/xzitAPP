const URL = 'https://oziywfhbpyfgcyhhzthm.supabase.co/rest/v1/user_data'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aXl3ZmhicHlmZ2N5aGh6dGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTQ2MDUsImV4cCI6MjEwODIzMDYwNX0.swAY3OHsQE7oHcDcDvclfYllDxqMjOvfUAIMwsR_HII'

async function test() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }
  console.log('1. 上传数据...')
  const upsertRes = await fetch(URL, { method: 'POST', headers, body: JSON.stringify({ user_id: 'testuser', data: { version: '2.0.0', test: true }, updated_at: new Date().toISOString() }) })
  console.log('   状态码:', upsertRes.status)
  console.log('2. 查询数据...')
  const selectRes = await fetch(URL + '?user_id=eq.testuser', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
  console.log('   状态码:', selectRes.status)
  const data = await selectRes.json()
  console.log('   数据:', JSON.stringify(data))
  console.log(upsertRes.status === 201 && selectRes.status === 200 ? '\n✅ 验证通过' : '\n❌ 验证失败')
}
test().catch(e => console.error('错误:', e.message))