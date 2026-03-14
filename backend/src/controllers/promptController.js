const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// @route   POST /api/v1/prompts/score
exports.scorePrompt = async (req, res) => {
  try {
    const { prompt_text } = req.body;
    
    if (!prompt_text || prompt_text.trim() === '') {
        return res.json({ success: true, data: { scores: { role: 0, task: 0, context: 0, constraints: 0 }, suggestions: [] } });
    }

    const systemPrompt = `Evaluate the following user prompt on four axes (0-10):
1. Role Definition: Is the AI given a specific persona?
2. Task Clarity: Is the exact action to be taken unambiguous?
3. Constraints: Are the boundaries and negative constraints clear?
4. Output Format: Is the desired output structure explicitly defined?

Return strictly valid JSON: { "scores": { "role": Number, "task": Number, "context": Number, "constraints": Number }, "suggestions": [String] }`;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast model for scoring
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt_text }
      ],
      response_format: { type: "json_object" }
    });

    const mockScore = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, data: mockScore });
  } catch (error) {
    console.error("Groq API Error in scorePrompt:", error.message);
    // Fallback Mock for UI Testing
    return res.json({
      success: true,
      data: {
        scores: { role: 7, task: 8, context: 6, constraints: 5 },
        suggestions: ["Add a specific persona.", "Clarify constraints."]
      },
      fallback: true
    });
  }
};

// @route   POST /api/v1/prompts/auto-fix
exports.autoFixPrompt = async (req, res) => {
  try {
    const { raw_prompt } = req.body;
    
    const systemPrompt = `You are an expert prompt engineer. Restructure the following user prompt into the RTCCO framework: Role, Task, Context, Constraints, Output Format.
If a section is missing from the user's intent, deduce the best possible addition.
Return strictly valid JSON corresponding to this schema:
{
  "blocks": {
    "role": "string",
    "task": "string",
    "context": "string",
    "constraints": "string",
    "output_format": "string"
  }
}`;

    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Strong model for reasoning
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: raw_prompt }
        ],
        response_format: { type: "json_object" }
    });
    
    const fixedBlocks = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, data: fixedBlocks });
  } catch (error) {
    console.error("Groq API Error in autoFixPrompt:", error.message);
    // Fallback Mock for UI Testing
    return res.json({
      success: true,
      data: {
        blocks: {
          role: "Act as an expert software engineer.",
          task: "Write a python script to sort an array.",
          context: "The array will contain integers.",
          constraints: "Do not use built-in functions like sort().",
          output_format: "Provide only the code and a brief explanation."
        }
      },
      fallback: true
    });
  }
};

// @route   POST /api/v1/prompts/execute
exports.executePrompt = async (req, res) => {
  try {
    const { prompt_text } = req.body;
    if (!prompt_text) return res.status(400).json({ success: false, error: "Missing prompt_text" });
    
    // For now we default to a Groq model, but later this could take a top-level model param
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "user", content: prompt_text }
      ]
    });

    const aiResponse = response.choices[0].message.content;
    res.json({ success: true, data: { response: aiResponse } });
  } catch (error) {
    console.error("Groq API Error in executePrompt:", error.message);
    // Fallback Mock for UI Testing
    return res.json({
      success: true,
      data: { response: "This is a mocked AI response because the Groq API key ran out of quota. Real response would be here." },
      fallback: true
    });
  }
};
// @route   POST /api/v1/prompts/autocomplete
exports.autocompletePrompt = async (req, res) => {
  try {
    const { block_type, current_text } = req.body;
    
    if (!current_text || current_text.trim() === '') {
      return res.json({ success: true, data: { suggestion: '' } });
    }

    const systemPrompt = `You are an AI autocomplete engine for a prompt builder. 
The user is currently typing in the "${block_type}" section of their prompt.
Your goal is to suggest the NEXT few logical words or sentence completion. 
DO NOT repeat what the user already typed. ONLY output the continuation.
Keep it extremely concise (1-5 words max). For example, if the user types "Act as an expert", you output " software engineer."`;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Blazing fast for autocomplete
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: current_text }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const suggestion = response.choices[0].message.content.trim();
    res.json({ success: true, data: { suggestion } });
  } catch (error) {
    console.error("Groq API Error in autocompletePrompt:", error.message);
    return res.json({ success: false, data: { suggestion: '' }, fallback: true });
  }
};
