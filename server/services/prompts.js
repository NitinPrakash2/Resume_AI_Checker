const analyzeResume = (resumeText, jobDesc = '') => `
You are a senior technical recruiter. Analyze the resume and return ONLY valid JSON (no markdown):
{
  "score": <0-100 job match %>,
  "atsScore": <0-100 ATS readability>,
  "summary": "<2 sentence overall feedback>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["improvement 1", "improvement 2", "improvement 3"],
  "keywords": ["keyword1", "keyword2"],
  "missing": ["missing1", "missing2"],
  "questions": ["question 1", "question 2", "question 3"],
  "rejectionReasons": ["reason 1", "reason 2"]
}
${jobDesc ? `\nJob Description:\n${jobDesc}\n` : ''}
Resume:
${resumeText}`

const simulateATS = (resumeText, jobDesc = '') => `
You are an ATS simulator. Return ONLY valid JSON (no markdown):
{
  "atsScore": <0-100>,
  "passedKeywords": ["keyword1"],
  "missingKeywords": ["missing1"],
  "rejectionReasons": ["reason1"],
  "formatIssues": ["issue1"],
  "recommendations": ["fix1"]
}
${jobDesc ? `Job Description:\n${jobDesc}\n` : ''}
Resume:
${resumeText}`

const generateInterviewQuestions = (resumeText, jobDesc = '') => `
You are an expert interviewer. Generate interview questions and return ONLY valid JSON (no markdown):
{
  "hr": [{ "question": "HR question", "category": "HR", "difficulty": "Medium" }],
  "technical": [{ "question": "technical question", "category": "Technical", "difficulty": "Hard" }],
  "situational": [{ "question": "situational question", "category": "Situational", "difficulty": "Medium" }]
}
Generate 5 HR, 5 Technical, 3 Situational questions.
${jobDesc ? `Job Description:\n${jobDesc}\n` : ''}
Resume:
${resumeText}`

const rewriteResume = (resumeText, jobDesc = '') => `
You are a professional resume writer. Rewrite and improve this resume. Return ONLY valid JSON (no markdown):
{
  "rewrittenText": "<full improved resume with stronger action verbs and quantified achievements>",
  "improvements": ["improvement 1", "improvement 2"],
  "scoreImprovement": <number>
}
${jobDesc ? `Target Job:\n${jobDesc}\n` : ''}
Original Resume:
${resumeText}`

const getAIAnswer = (question, context = '') => `
You are an expert career coach. Give a STAR method interview answer under 150 words.
${context ? `Candidate context: ${context}\n` : ''}
Question: "${question}"
Return ONLY valid JSON (no markdown): { "answer": "...", "tips": ["tip1", "tip2"] }`

module.exports = { analyzeResume, simulateATS, generateInterviewQuestions, rewriteResume, getAIAnswer }
