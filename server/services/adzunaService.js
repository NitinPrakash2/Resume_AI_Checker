const axios = require('axios')

const BASE = 'https://api.adzuna.com/v1/api/jobs'

async function searchJobs({ keywords = '', location = '', page = 1, results = 10 }) {
  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  const country = process.env.ADZUNA_COUNTRY || 'in'

  console.log('[Adzuna] Search params:', { keywords, location, page, results })

  // Check if API keys are configured
  if (!appId || !appKey || appId === 'your_adzuna_app_id') {
    console.warn('[Adzuna] ⚠️  API keys not configured - using mock data')
    console.warn('[Adzuna] To use real-time jobs, add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env')
    return getMockJobs(keywords)
  }

  try {
    // Clean and format keywords for API
    const cleanKeywords = keywords ? keywords.trim().replace(/\s+/g, ' ') : 'developer'
    const apiUrl = `${BASE}/${country}/search/${page}`
    
    console.log('[Adzuna] 🌐 Calling real-time API:', apiUrl)
    console.log('[Adzuna] Query:', cleanKeywords)
    
    const params = {
      app_id: appId,
      app_key: appKey,
      results_per_page: results,
      what: cleanKeywords,
    }
    
    // Only add location if provided
    if (location && location.trim()) {
      params.where = location.trim()
    }
    
    const { data } = await axios.get(apiUrl, {
      params,
      timeout: 15000,
    })

    const jobCount = data.results?.length || 0
    console.log(`[Adzuna] ✅ Real-time API returned ${jobCount} jobs`)
    
    if (jobCount === 0) {
      console.log('[Adzuna] No jobs found, trying broader search...')
      const { data: fallbackData } = await axios.get(apiUrl, {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: results,
          what: 'software developer',
        },
        timeout: 15000,
      })
      
      const fallbackJobs = (fallbackData.results || []).map(job => ({
        id:          job.id,
        title:       job.title,
        company:     job.company?.display_name || 'Unknown',
        location:    job.location?.display_name || '',
        salary:      formatSalary(job.salary_min, job.salary_max),
        url:         job.redirect_url,
        description: job.description,
        created:     job.created,
      }))
      
      console.log(`[Adzuna] ✅ Fallback search returned ${fallbackJobs.length} jobs`)
      return fallbackJobs
    }
    
    return (data.results || []).map(job => ({
      id:          job.id,
      title:       job.title,
      company:     job.company?.display_name || 'Unknown',
      location:    job.location?.display_name || '',
      salary:      formatSalary(job.salary_min, job.salary_max),
      url:         job.redirect_url,
      description: job.description,
      created:     job.created,
    }))
  } catch (err) {
    console.error('[Adzuna] ❌ Real-time API error:', err.message)
    if (err.response) {
      console.error('[Adzuna] Status:', err.response.status, err.response.statusText)
      console.error('[Adzuna] Error details:', JSON.stringify(err.response.data, null, 2))
      console.error('[Adzuna] Request URL:', err.config?.url)
      console.error('[Adzuna] Request params:', JSON.stringify(err.config?.params, null, 2))
    }
    console.log('[Adzuna] ⚠️  Falling back to mock data')
    return getMockJobs(keywords)
  }
}

function formatSalary(min, max) {
  if (!min && !max) return null
  if (min && max) return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`
  if (min) return `From $${Math.round(min / 1000)}k`
  return `Up to $${Math.round(max / 1000)}k`
}

// Calculate match % between resume keywords and job description
function calculateMatchScore(resumeKeywords = [], jobDescription = '') {
  if (!resumeKeywords.length || !jobDescription) return 0
  const jdLower = jobDescription.toLowerCase()
  const matched = resumeKeywords.filter(k => jdLower.includes(k.toLowerCase()))
  return Math.round((matched.length / resumeKeywords.length) * 100)
}

// Extract skills from job description for gap analysis
function extractJobSkills(description = '') {
  const techSkills = [
    'javascript','typescript','python','java','react','node','express','sql','postgresql',
    'mongodb','aws','docker','kubernetes','git','rest','graphql','css','html','vue','angular',
    'machine learning','ai','data science','figma','sketch','agile','scrum','ci/cd','linux',
  ]
  const lower = description.toLowerCase()
  return techSkills.filter(s => lower.includes(s))
}

function getMockJobs(keywords) {
  console.log('[Adzuna] Using mock/fallback data')
  const kw = (keywords || '').toLowerCase()
  const all = [
    { id: 'm1',  title: 'Senior React Developer',        company: 'TechCorp Inc',      location: 'Remote',           salary: '₹18L - ₹25L', url: 'https://example.com/job/1', description: 'Looking for a senior react developer with 5+ years experience in React, Node.js, JavaScript, TypeScript, PostgreSQL, REST APIs, Git, and agile methodologies.', created: new Date().toISOString() },
    { id: 'm2',  title: 'Full Stack Engineer',            company: 'StartupXYZ',        location: 'Bangalore, India', salary: '₹12L - ₹18L', url: 'https://example.com/job/2', description: 'Full stack engineer needed with strong TypeScript, React, Node.js, Express, AWS, Docker, MongoDB, and CI/CD skills.', created: new Date().toISOString() },
    { id: 'm3',  title: 'Frontend Developer',             company: 'GlobalSoft',        location: 'Mumbai, India',    salary: '₹8L - ₹12L',  url: 'https://example.com/job/3', description: 'Frontend developer position requiring React, JavaScript, CSS, HTML, Vue, Git, and REST API integration experience.', created: new Date().toISOString() },
    { id: 'm4',  title: 'Python Backend Developer',       company: 'DataSystems Ltd',   location: 'Hyderabad, India', salary: '₹10L - ₹16L', url: 'https://example.com/job/4', description: 'Python developer with Django, Flask, PostgreSQL, SQL, REST, Docker, AWS, machine learning basics, and Git.', created: new Date().toISOString() },
    { id: 'm5',  title: 'DevOps Engineer',                company: 'CloudBase',         location: 'Remote',           salary: '₹15L - ₹22L', url: 'https://example.com/job/5', description: 'DevOps engineer with AWS, Docker, Kubernetes, CI/CD, Linux, Git, Terraform, and scripting skills.', created: new Date().toISOString() },
    { id: 'm6',  title: 'Data Scientist',                 company: 'Analytics Co',      location: 'Pune, India',      salary: '₹14L - ₹20L', url: 'https://example.com/job/6', description: 'Data scientist with Python, machine learning, AI, data science, SQL, PostgreSQL, and statistical analysis skills.', created: new Date().toISOString() },
    { id: 'm7',  title: 'Java Backend Engineer',          company: 'EnterpriseWorks',   location: 'Chennai, India',   salary: '₹12L - ₹18L', url: 'https://example.com/job/7', description: 'Java developer with Spring Boot, SQL, PostgreSQL, REST, Docker, AWS, Git, and microservices experience.', created: new Date().toISOString() },
    { id: 'm8',  title: 'UI/UX Designer',                 company: 'DesignHub',         location: 'Bangalore, India', salary: '₹8L - ₹14L',  url: 'https://example.com/job/8', description: 'UI/UX designer with Figma, Sketch, CSS, HTML, JavaScript, React, and user research skills.', created: new Date().toISOString() },
    { id: 'm9',  title: 'Node.js Developer',              company: 'APIFirst',          location: 'Remote',           salary: '₹10L - ₹15L', url: 'https://example.com/job/9', description: 'Node.js developer with Express, MongoDB, REST, GraphQL, JavaScript, TypeScript, Docker, and Git.', created: new Date().toISOString() },
    { id: 'm10', title: 'Cloud Solutions Architect',      company: 'NimbusTech',        location: 'Delhi, India',     salary: '₹25L - ₹40L', url: 'https://example.com/job/10', description: 'Cloud architect with AWS, Azure, Kubernetes, Docker, Terraform, CI/CD, Linux, and microservices expertise.', created: new Date().toISOString() },
  ]
  
  if (!kw || kw.trim() === '') {
    console.log('[Adzuna] Returning 10 general mock jobs')
    return all.slice(0, 10)
  }
  
  const terms = kw.split(/\s+/).filter(Boolean)
  const filtered = all.filter(j => terms.some(t => j.description.toLowerCase().includes(t) || j.title.toLowerCase().includes(t)))
  
  console.log(`[Adzuna] Filtered mock jobs: ${filtered.length} matches`)
  return filtered.length > 0 ? filtered : all.slice(0, 10)
}

module.exports = { searchJobs, calculateMatchScore, extractJobSkills }
