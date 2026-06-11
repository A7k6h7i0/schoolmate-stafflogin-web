/**
 * Probes POST /students with different payload shapes against live API.
 * Usage: node scripts/probe-student-api.mjs <schoolId> <email> <password>
 */
import axios from 'axios'

const BASE = process.env.API_BASE ?? 'https://schoolmate.digitalleadpro.com/api/v1'
const [schoolId, email, password] = process.argv.slice(2)

if (!schoolId || !email || !password) {
  console.error('Usage: node scripts/probe-student-api.mjs <schoolId> <email> <password>')
  process.exit(1)
}

const client = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

async function login() {
  const { data } = await client.post('/auth/login', { email, password }, {
    headers: { 'X-School-ID': schoolId },
  })
  const token = data.accessToken ?? data.data?.accessToken
  if (!token) throw new Error('No access token: ' + JSON.stringify(data))
  client.defaults.headers.common.Authorization = `Bearer ${token}`
  client.defaults.headers.common['X-School-ID'] = schoolId
  return token
}

async function getClasses() {
  const { data } = await client.get('/classes')
  console.log('GET /classes response keys:', JSON.stringify(data).slice(0, 800))
  const items = data?.data ?? data?.classes ?? data
  return Array.isArray(items) ? items : []
}

async function tryCreate(label, payload) {
  try {
    const { data, status } = await client.post('/students', payload)
    console.log(`\n[OK ${label}] status=${status}`, JSON.stringify(data).slice(0, 300))
    return true
  } catch (e) {
    const res = e.response
    console.log(`\n[FAIL ${label}] status=${res?.status}`, JSON.stringify(res?.data))
    return false
  }
}

const token = await login()
console.log('Logged in, token length:', token.length)

const classes = await getClasses()
console.log('Classes count:', classes.length)
if (classes[0]) {
  console.log('First class sample:', JSON.stringify(classes[0]))
}

let classId = classes[0]?.id ?? classes[0]?._id
let sectionId = classes[0]?.sections?.[0]?.id ?? classes[0]?.sections?.[0]?._id

if (!sectionId && classId) {
  try {
    const { data } = await client.get(`/classes/${classId}/sections`)
    console.log('GET sections:', JSON.stringify(data).slice(0, 500))
    const secs = data?.data ?? data?.sections ?? data
    if (Array.isArray(secs) && secs[0]) {
      sectionId = secs[0].id ?? secs[0]._id
    }
  } catch (e) {
    console.log('GET sections failed:', e.response?.status, e.response?.data)
  }
}

if (!classId || !sectionId) {
  console.error('Need at least one class and section on this school. classId=', classId, 'sectionId=', sectionId)
  process.exit(1)
}

const base = {
  firstName: 'Probe',
  lastName: 'Student',
  gender: 'FEMALE',
  dateOfBirth: '2010-06-10',
  emergencyContact: '1234567890',
  classId: String(classId),
  sectionId: String(sectionId),
  fatherName: 'Father Probe',
  motherName: 'Mother Probe',
  primaryPhone: '9876543210',
  homeAddress: 'Test address',
}

await tryCreate('nested parentContact', {
  ...base,
  parentContact: {
    fatherName: base.fatherName,
    motherName: base.motherName,
    primaryPhone: base.primaryPhone,
    homeAddress: base.homeAddress,
  },
})

await tryCreate('flat parent fields', { ...base })

await tryCreate('nested only (no flat duplicates)', {
  firstName: base.firstName,
  lastName: base.lastName,
  gender: base.gender,
  dateOfBirth: base.dateOfBirth,
  emergencyContact: base.emergencyContact,
  classId: base.classId,
  sectionId: base.sectionId,
  parentContact: {
    fatherName: base.fatherName,
    motherName: base.motherName,
    primaryPhone: base.primaryPhone,
    homeAddress: base.homeAddress,
  },
})
