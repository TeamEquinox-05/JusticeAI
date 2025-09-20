const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.Gemini_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File paths
const responsesFilePath = path.join(__dirname, '../frontend/responses.json');

// Ensure responses file exists
const initializeResponsesFile = async () => {
  try {
    await fs.ensureFile(responsesFilePath);
    const exists = await fs.pathExists(responsesFilePath);
    if (exists) {
      const content = await fs.readFile(responsesFilePath, 'utf8');
      if (!content.trim()) {
        await fs.writeFile(responsesFilePath, JSON.stringify({ cases: [] }, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing responses file:', error);
    await fs.writeFile(responsesFilePath, JSON.stringify({ cases: [] }, null, 2));
  }
};

// Helper function to read responses
const readResponses = async () => {
  try {
    const data = await fs.readFile(responsesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading responses:', error);
    return { cases: [] };
  }
};

// Helper function to write responses
const writeResponses = async (data) => {
  try {
    await fs.writeFile(responsesFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing responses:', error);
    return false;
  }
};

// API Routes

// Submit initial case data and generate questions
app.post('/api/submit-case', async (req, res) => {
  try {
    const caseData = req.body;
    console.log('Received case data:', caseData);

    // Generate AI questions based on the case data
    const prompt = `
You are a legal assistant AI helping to gather complete case information. Based on the following case details, generate a list of important questions that would help complete the case file for legal proceedings.

Case Details:
- Case ID: ${caseData.caseId || 'Not provided'}
- Case Title: ${caseData.caseTitle || 'Not provided'}
- Case Description: ${caseData.caseDescription || 'Not provided'}
- Victim Age: ${caseData.victimAge || 'Not provided'}
- Victim Gender: ${caseData.victimGender || 'Not provided'}
- Victim Location: ${caseData.victimLocation || 'Not provided'}
- Incident Date: ${caseData.incidentDate || 'Not provided'}
- Incident Time: ${caseData.incidentTime || 'Not provided'}

Please generate 5-8 relevant follow-up questions that would be important for this case. For each question, specify the type of input needed (text, textarea, select, date, time, number, etc.) and if it's a select type, provide the options.

Format your response as a JSON array with objects containing:
- question: the question text
- type: input type (text, textarea, select, date, time, number, email, tel)
- placeholder: placeholder text (if applicable)
- options: array of options (only for select type)
- required: boolean

Example format:
[
  {
    "question": "What was the weather condition during the incident?",
    "type": "select",
    "placeholder": "",
    "options": ["Clear", "Rainy", "Cloudy", "Foggy", "Unknown"],
    "required": true
  },
  {
    "question": "Please provide additional details about the incident location",
    "type": "textarea",
    "placeholder": "Describe the exact location, landmarks, etc.",
    "options": [],
    "required": false
  }
]

Only return the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Raw AI response:', text);

    // Parse the AI response
    let questions;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback questions
      questions = [
        {
          question: "What was the weather condition during the incident?",
          type: "select",
          placeholder: "",
          options: ["Clear", "Rainy", "Cloudy", "Foggy", "Unknown"],
          required: true
        },
        {
          question: "Were there any witnesses to the incident?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Unknown"],
          required: true
        },
        {
          question: "Please provide additional details about the incident",
          type: "textarea",
          placeholder: "Describe any additional relevant information",
          options: [],
          required: false
        }
      ];
    }

    // Store the case with generated questions
    const responses = await readResponses();
    const newCase = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      basicInfo: caseData,
      questions: questions,
      answers: {},
      completed: false
    };

    responses.cases.push(newCase);
    await writeResponses(responses);

    res.json({
      success: true,
      caseId: newCase.id,
      questions: questions
    });

  } catch (error) {
    console.error('Error in submit-case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process case submission',
      details: error.message
    });
  }
});

// Submit answers to the generated questions
app.post('/api/submit-answers', async (req, res) => {
  try {
    const { caseId, answers } = req.body;

    if (!caseId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and answers are required'
      });
    }

    // Read current responses
    const responses = await readResponses();
    
    // Find the case
    const caseIndex = responses.cases.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    // Update the case with answers
    responses.cases[caseIndex].answers = answers;
    responses.cases[caseIndex].completed = true;
    responses.cases[caseIndex].completedAt = new Date().toISOString();

    // Write back to file
    const writeSuccess = await writeResponses(responses);

    if (writeSuccess) {
      res.json({
        success: true,
        message: 'Answers submitted successfully',
        case: responses.cases[caseIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save answers'
      });
    }

  } catch (error) {
    console.error('Error in submit-answers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answers',
      details: error.message
    });
  }
});

// Get all cases
app.get('/api/cases', async (req, res) => {
  try {
    const responses = await readResponses();
    res.json({
      success: true,
      cases: responses.cases
    });
  } catch (error) {
    console.error('Error in get cases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cases'
    });
  }
});

// Get specific case by ID
app.get('/api/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await readResponses();
    const case_data = responses.cases.find(c => c.id === id);

    if (!case_data) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    res.json({
      success: true,
      case: case_data
    });
  } catch (error) {
    console.error('Error in get case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'JusticeAI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeResponsesFile();
    app.listen(PORT, () => {
      console.log(`🚀 JusticeAI Backend server running on port ${PORT}`);
      console.log(`📁 Responses file: ${responsesFilePath}`);
      console.log(`🤖 Gemini AI model: gemini-1.5-flash`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
