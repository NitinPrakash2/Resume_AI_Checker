const ai = require('./aiService')

async function benchmarkResume(resumeText, jobs, aiConfig) {
  const jobList = jobs.slice(0, 3).map((j, i) =>
    `${i + 1}. ${j.title} @ ${j.company}: ${(j.description || '').slice(0, 150)}`
  ).join('\n')

  const prompt = `Senior tech recruiter. Compare this resume vs top 10% candidates for these roles. Be direct and specific.

RESUME:
${resumeText.slice(0, 1800)}

ROLES:
${jobList}

Reply ONLY valid JSON, no markdown:
{"recruiterVerdict":"gut reaction sentence","ranking":{"percentile":50,"tier":"Average","vsTopCandidates":"2 sentences vs top 10%"},"weaknesses":[{"area":"label","detail":"critique"},{"area":"label","detail":"critique"},{"area":"label","detail":"critique"}],"suggestions":[{"priority":"High","action":"do this","impact":"why it matters"},{"priority":"High","action":"do this","impact":"why it matters"},{"priority":"Medium","action":"do this","impact":"why it matters"}],"missingSkills":["skill1","skill2","skill3","skill4"],"hiringChance":50,"marketInsights":{"demandLevel":"Medium","salaryRange":"range","topRoles":["role1","role2"],"standoutTip":"tip"}}`

  const result = await ai.callAI(prompt, aiConfig)

  return {
    recruiterVerdict: result.recruiterVerdict || '',
    ranking: {
      percentile: Math.min(100, Math.max(1, Number(result.ranking?.percentile) || 50)),
      tier: result.ranking?.tier || 'Average',
      vsTopCandidates: result.ranking?.vsTopCandidates || ''
    },
    weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses.slice(0, 5) : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 5) : [],
    missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills.slice(0, 6) : [],
    hiringChance: Math.min(100, Math.max(0, Number(result.hiringChance) || 50)),
    marketInsights: result.marketInsights || { demandLevel: 'Medium', salaryRange: '', topRoles: [], standoutTip: '' }
  }
}

module.exports = { benchmarkResume }
