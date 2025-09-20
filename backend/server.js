const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import authentication routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.Gemini_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'));
    }
  }
});

// Authentication routes
app.use('/api/auth', authRoutes);

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

// Text extraction endpoint
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    let extractedText = '';

    console.log(`Processing file: ${file.originalname}, MIME type: ${file.mimetype}`);

    // Extract text based on file type
    switch (file.mimetype) {
      case 'application/pdf':
        try {
          console.log('Processing PDF file...');
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
          
          // If no text found or very little text, it might be an image-based PDF
          if (!extractedText || extractedText.trim().length < 50) {
            console.log('PDF has minimal text, attempting OCR on PDF content...');
            
            try {
              // Use Tesseract to extract text from the PDF as if it's an image
              const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng', {
                logger: m => console.log('OCR Progress:', m.status, m.progress)
              });
              
              if (text && text.trim().length > extractedText.length) {
                extractedText = text;
                console.log('OCR extracted more text than PDF parsing');
              }
            } catch (ocrError) {
              console.log('OCR on PDF failed, using text-based extraction result:', ocrError.message);
            }
          }
          
          // If still no meaningful text, inform user
          if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('No readable text found in PDF. The document may be encrypted, corrupted, or contain only non-text elements.');
          }
          
        } catch (error) {
          console.error('PDF parsing error:', error);
          throw new Error('Failed to extract text from PDF: ' + error.message);
        }
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } catch (error) {
          console.error('Word document parsing error:', error);
          throw new Error('Failed to extract text from Word document');
        }
        break;

      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/bmp':
      case 'image/tiff':
        try {
          console.log('Processing image file with OCR...');
          const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          extractedText = text;
          
          if (!extractedText || extractedText.trim().length < 5) {
            throw new Error('No readable text found in the image. The image may be too blurry, low quality, or contain no text.');
          }
          
        } catch (error) {
          console.error('OCR processing error:', error);
          throw new Error('Failed to extract text from image: ' + error.message);
        }
        break;

      default:
        throw new Error('Unsupported file type');
    }

    // Clean up the extracted text
    extractedText = extractedText.trim();
    
    if (!extractedText) {
      return res.status(400).json({ error: 'No text could be extracted from the document' });
    }

    res.json({
      success: true,
      text: extractedText,
      filename: file.originalname,
      fileType: file.mimetype
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract text from document'
    });
  }
});

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

// Submit victim case (direct submission without AI questions)
app.post('/api/submit-victim-case', async (req, res) => {
  try {
    const caseData = req.body;
    console.log('Received victim case data:', caseData);

    // Validate required fields
    const requiredFields = ['name', 'age', 'gender', 'incidentDate', 'location', 'description', 'offenceType'];
    const missingFields = requiredFields.filter(field => !caseData[field] || caseData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate contact information (either phone or email required)
    if (!caseData.phone?.trim() && !caseData.email?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Either phone number or email is required'
      });
    }

    // Store the victim case
    const responses = await readResponses();
    const newCase = {
      id: caseData.caseId || `VIC-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      submissionType: 'victim_input',
      status: 'Pending IO Assignment',
      basicInfo: {
        caseId: caseData.caseId,
        caseTitle: caseData.caseTitle,
        caseDescription: caseData.description,
        victimAge: caseData.age,
        victimGender: caseData.gender,
        victimLocation: caseData.location,
        incidentDate: caseData.incidentDate,
        incidentTime: caseData.incidentTime || null
      },
      victimDetails: {
        name: caseData.name,
        age: caseData.age,
        gender: caseData.gender,
        phone: caseData.phone || null,
        email: caseData.email || null
      },
      incidentDetails: {
        date: caseData.incidentDate,
        time: caseData.incidentTime || null,
        location: caseData.location,
        description: caseData.description,
        offenceType: caseData.offenceType
      },
      evidence: {
        files: caseData.evidenceFiles || [],
        fileCount: (caseData.evidenceFiles || []).length
      },
      completed: true,
      requiresIOAssignment: true
    };

    responses.cases.push(newCase);
    const writeSuccess = await writeResponses(responses);

    if (writeSuccess) {
      res.json({
        success: true,
        message: 'Victim case submitted successfully',
        caseId: newCase.id,
        case: newCase
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save case data'
      });
    }

  } catch (error) {
    console.error('Error in submit-victim-case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit victim case',
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
