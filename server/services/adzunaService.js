const axios = require('axios')

const BASE = 'https://api.adzuna.com/v1/api/jobs'

const ALLOWED_COUNTRIES = new Set([
  'gb','us','au','at','be','br','ca','de','fr','in','it','mx','nl','nz','pl','ru','sg','za',
])

// Strip any character that is not alphanumeric, space, hyphen, comma, or period
function sanitizeText(str) {
  return String(str || '').replace(/[^\w\s,.-]/g, '').trim().replace(/\s+/g, ' ')
}

async function searchJobs({ keywords = '', location = '', page = 1, results = 10 }) {
  const appId   = process.env.ADZUNA_APP_ID
  const appKey  = process.env.ADZUNA_APP_KEY
  const rawCountry = (process.env.ADZUNA_COUNTRY || 'in').toLowerCase()

  if (!appId || !appKey || appId === 'your_adzuna_app_id') {
    return getMockJobs(keywords)
  }

  // Allowlist country to prevent path manipulation (CWE-918)
  const country = ALLOWED_COUNTRIES.has(rawCountry) ? rawCountry : 'in'

  // Sanitize page: must be a positive integer, capped at 10
  const safePage = Math.min(10, Math.max(1, parseInt(page, 10) || 1))

  // Sanitize free-text inputs before they reach the external request
  const cleanKeywords = sanitizeText(keywords) || 'developer'
  const cleanLocation = sanitizeText(location)

  // Build URL from validated, allowlisted segments only
  const apiUrl = `${BASE}/${country}/search/${safePage}`
  const params = { app_id: appId, app_key: appKey, results_per_page: results, what: cleanKeywords }
  if (cleanLocation) params.where = cleanLocation

  try {
    const { data } = await axios.get(apiUrl, { params, timeout: 15000 })
    const jobs = data.results || []

    if (jobs.length === 0) {
      const fallbackKeyword = cleanKeywords.split(' ')[0] || 'assistant'
      const { data: fb } = await axios.get(apiUrl, {
        params: { app_id: appId, app_key: appKey, results_per_page: results, what: fallbackKeyword },
        timeout: 15000,
      })
      return mapJobs(fb.results || [])
    }

    return mapJobs(jobs)
  } catch (err) {
    console.error('[Adzuna] API error:', err.message)
    return getMockJobs(keywords)
  }
}

function mapJobs(jobs) {
  return jobs.map(j => ({
    id:          j.id,
    title:       j.title,
    company:     j.company?.display_name || 'Unknown',
    location:    j.location?.display_name || '',
    salary:      formatSalary(j.salary_min, j.salary_max),
    url:         j.redirect_url,
    description: j.description,
    created:     j.created,
  }))
}

function formatSalary(min, max) {
  if (!min && !max) return null
  if (min && max) return `₹${Math.round(min / 1000)}k - ₹${Math.round(max / 1000)}k`
  if (min) return `From ₹${Math.round(min / 1000)}k`
  return `Up to ₹${Math.round(max / 1000)}k`
}

function getMockJobs(keywords) {
  const kw = (keywords || '').toLowerCase()
  const all = [
    { id: 'm1',  title: 'Senior React Developer',   company: 'TechCorp Inc',    location: 'Remote',           salary: '₹18L - ₹25L', url: 'https://example.com/job/1', description: 'React, Node.js, JavaScript, TypeScript, PostgreSQL, REST APIs, Git, agile.', created: new Date().toISOString() },
    { id: 'm2',  title: 'Full Stack Engineer',       company: 'StartupXYZ',      location: 'Bangalore, India', salary: '₹12L - ₹18L', url: 'https://example.com/job/2', description: 'TypeScript, React, Node.js, Express, AWS, Docker, MongoDB, CI/CD.', created: new Date().toISOString() },
    { id: 'm3',  title: 'Frontend Developer',        company: 'GlobalSoft',      location: 'Mumbai, India',    salary: '₹8L - ₹12L',  url: 'https://example.com/job/3', description: 'React, JavaScript, CSS, HTML, Vue, Git, REST API.', created: new Date().toISOString() },
    { id: 'm4',  title: 'Python Backend Developer',  company: 'DataSystems Ltd', location: 'Hyderabad, India', salary: '₹10L - ₹16L', url: 'https://example.com/job/4', description: 'Python, Django, Flask, PostgreSQL, SQL, REST, Docker, AWS.', created: new Date().toISOString() },
    { id: 'm5',  title: 'DevOps Engineer',           company: 'CloudBase',       location: 'Remote',           salary: '₹15L - ₹22L', url: 'https://example.com/job/5', description: 'AWS, Docker, Kubernetes, CI/CD, Linux, Git, Terraform.', created: new Date().toISOString() },
    { id: 'm6',  title: 'Data Scientist',            company: 'Analytics Co',    location: 'Pune, India',      salary: '₹14L - ₹20L', url: 'https://example.com/job/6', description: 'Python, machine learning, AI, data science, SQL, PostgreSQL.', created: new Date().toISOString() },
    { id: 'm7',  title: 'Java Backend Engineer',     company: 'EnterpriseWorks', location: 'Chennai, India',   salary: '₹12L - ₹18L', url: 'https://example.com/job/7', description: 'Java, Spring Boot, SQL, PostgreSQL, REST, Docker, AWS, microservices.', created: new Date().toISOString() },
    { id: 'm8',  title: 'UI/UX Designer',            company: 'DesignHub',       location: 'Bangalore, India', salary: '₹8L - ₹14L',  url: 'https://example.com/job/8', description: 'Figma, Sketch, CSS, HTML, JavaScript, React, user research.', created: new Date().toISOString() },
    { id: 'm9',  title: 'Node.js Developer',         company: 'APIFirst',        location: 'Remote',           salary: '₹10L - ₹15L', url: 'https://example.com/job/9', description: 'Node.js, Express, MongoDB, REST, GraphQL, JavaScript, TypeScript, Docker.', created: new Date().toISOString() },
    { id: 'm10', title: 'Cloud Solutions Architect', company: 'NimbusTech',      location: 'Delhi, India',     salary: '₹25L - ₹40L', url: 'https://example.com/job/10', description: 'AWS, Azure, Kubernetes, Docker, Terraform, CI/CD, Linux, microservices.', created: new Date().toISOString() },
  ]
  if (!kw) return all.slice(0, 5)
  const terms = kw.split(/\s+/).filter(Boolean)
  const filtered = all.filter(j => terms.some(t => j.description.toLowerCase().includes(t) || j.title.toLowerCase().includes(t)))
  return filtered.length > 0 ? filtered : all.slice(0, 5)
}

function calculateMatchScore(resumeKeywords, jobDescription) {
  if (!resumeKeywords.length || !jobDescription) return 0
  const desc = jobDescription.toLowerCase()
  const matched = resumeKeywords.filter(k => desc.includes(k.toLowerCase()))
  return Math.round((matched.length / resumeKeywords.length) * 100)
}

function extractJobSkills(description) {
  const techTerms = [
    'javascript','typescript','python','java','react','node','express','sql','postgresql',
    'mongodb','aws','docker','kubernetes','git','rest','graphql','css','html','vue','angular',
    'machine learning','ai','data science','figma','sketch','agile','scrum','ci/cd','linux',
    'django','flask','spring','kotlin','swift','php','ruby','rust','go','scala','next','nuxt',
    'tailwind','redux','firebase','supabase','prisma','mysql','redis','nginx','jenkins',
  ]
  const lower = description.toLowerCase()
  return techTerms.filter(t => lower.includes(t))
}

module.exports = { searchJobs, calculateMatchScore, extractJobSkills }
