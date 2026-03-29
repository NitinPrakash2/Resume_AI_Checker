const analyzeResume = (text, jd) => `You are an expert resume analyst and ATS system. Analyze this resume${jd ? ' against the job description' : ''} and return ONLY valid JSON, no markdown.

RESUME:
${text.slice(0, 3000)}
${jd ? `\nJOB DESCRIPTION:\n${jd.slice(0, 1000)}` : ''}

Return this exact JSON structure:
{"score":75,"atsScore":70,"summary":"2-3 sentence professional summary","strengths":["strength1","strength2","strength3"],"weaknesses":["weakness1","weakness2"],"suggestions":["suggestion1","suggestion2","suggestion3"],"keywords":["keyword1","keyword2","keyword3"],"missing":["missing1","missing2"],"questions":["question1","question2","question3","question4","question5"],"rejectionReasons":["reason1","reason2"]}`

const simulateATS = (text, jd) => `You are an ATS (Applicant Tracking System). Analyze this resume${jd ? ' against the job description' : ''} and return ONLY valid JSON, no markdown.

RESUME:
${text.slice(0, 3000)}
${jd ? `\nJOB DESCRIPTION:\n${jd.slice(0, 1000)}` : ''}

Return this exact JSON structure:
{"atsScore":75,"keywordMatches":["kw1","kw2"],"missingKeywords":["mk1","mk2"],"formatIssues":["issue1"],"recommendations":["rec1","rec2"],"passedATS":true}`

const generateInterviewQuestions = (text, jd) => `You are an expert interviewer. Generate interview questions based on this resume${jd ? ' and job description' : ''} and return ONLY valid JSON, no markdown.

RESUME:
${text.slice(0, 2000)}
${jd ? `\nJOB DESCRIPTION:\n${jd.slice(0, 800)}` : ''}

Return this exact JSON structure:
{"questions":["question1","question2","question3","question4","question5","question6","question7","question8"]}`

const rewriteResume = (text, jd) => `You are a professional resume writer. Rewrite and improve this resume${jd ? ' to better match the job description' : ''} and return ONLY valid JSON, no markdown.

RESUME:
${text.slice(0, 3000)}
${jd ? `\nJOB DESCRIPTION:\n${jd.slice(0, 1000)}` : ''}

Return this exact JSON structure:
{"rewrittenText":"full improved resume text here","improvements":["improvement1","improvement2","improvement3"]}`

const getAIAnswer = (question, context) => `You are an expert career coach helping someone prepare for a job interview. Provide a helpful, specific answer using the STAR method where applicable. Return ONLY valid JSON, no markdown.

QUESTION: ${question}
${context ? `CONTEXT: ${context}` : ''}

Return this exact JSON structure:
{"answer":"detailed suggested answer here","tips":["tip1","tip2","tip3"],"starMethod":{"situation":"describe situation","task":"describe task","action":"describe action","result":"describe result"}}`

module.exports = { analyzeResume, simulateATS, generateInterviewQuestions, rewriteResume, getAIAnswer }
