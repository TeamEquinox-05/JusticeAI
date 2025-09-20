# JusticeAI Backend - Dynamic Questioning System

## Overview
This backend server provides AI-powered dynamic questioning functionality for the JusticeAI legal case management system. It uses Google's Gemini AI to generate contextual questions based on initial case information.

## Features
- **AI-Powered Question Generation**: Uses Gemini AI to generate relevant legal questions based on case details
- **Dynamic Form Creation**: Creates different input types (text, select, date, etc.) based on question requirements
- **Response Storage**: Stores all case data and responses in JSON format
- **RESTful API**: Clean API endpoints for frontend integration

## Environment Setup

1. **Environment Variables**: Create a `.env` file in the backend directory:
```
Gemini_API=your_gemini_api_key_here
```

2. **Install Dependencies**:
```bash
cd backend
npm install
```

3. **Start Server**:
```bash
npm start
# or
node server.js
```

The server will run on `http://localhost:3001`

## API Endpoints

### 1. Submit Case Data
**POST** `/api/submit-case`

Submits initial case information and receives AI-generated questions.

**Request Body**:
```json
{
  "caseId": "FIR001/2025",
  "caseTitle": "Case Title",
  "caseDescription": "Detailed description",
  "victimAge": "25",
  "victimGender": "Male",
  "victimLocation": "City, State",
  "incidentDate": "2025-01-01",
  "incidentTime": "14:30",
  "evidenceFiles": [],
  "previousCaseRef": "",
  "previousCasePdf": null
}
```

**Response**:
```json
{
  "success": true,
  "caseId": "unique_case_id",
  "questions": [
    {
      "question": "What was the weather condition during the incident?",
      "type": "select",
      "placeholder": "",
      "options": ["Clear", "Rainy", "Cloudy", "Foggy", "Unknown"],
      "required": true
    }
  ]
}
```

### 2. Submit Answers
**POST** `/api/submit-answers`

Submits answers to the generated questions.

**Request Body**:
```json
{
  "caseId": "unique_case_id",
  "answers": {
    "0": "Clear",
    "1": "Additional details about the incident"
  }
}
```

### 3. Submit Victim Case
**POST** `/api/submit-victim-case`

Direct submission for victim input mode (no AI questions generated).

**Request Body**:
```json
{
  "name": "Victim Name",
  "age": "25",
  "gender": "Female",
  "phone": "+1234567890",
  "email": "victim@example.com",
  "incidentDate": "2025-01-01",
  "incidentTime": "14:30",
  "location": "City, State",
  "description": "Detailed incident description",
  "offenceType": "Sexual Assault",
  "evidenceFiles": [],
  "caseId": "VIC-123456789",
  "caseTitle": "Sexual Assault - Victim Name"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Victim case submitted successfully",
  "caseId": "VIC-123456789",
  "case": {
    "id": "VIC-123456789",
    "status": "Pending IO Assignment",
    "submissionType": "victim_input",
    "submittedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### 4. Get All Cases
**GET** `/api/cases`

Returns all submitted cases.

### 5. Get Specific Case
**GET** `/api/cases/:id`

Returns a specific case by ID.

### 6. Health Check
**GET** `/api/health`

Returns server status.

## Question Types Supported

The AI can generate various question types:

- **text**: Single-line text input
- **textarea**: Multi-line text input
- **select**: Dropdown with predefined options
- **date**: Date picker
- **time**: Time picker
- **number**: Numeric input
- **email**: Email input
- **tel**: Phone number input

## Data Storage

All case data and responses are stored in `../frontend/responses.json` with the following structure:

```json
{
  "cases": [
    {
      "id": "unique_id",
      "submittedAt": "2025-01-01T12:00:00.000Z",
      "basicInfo": { /* original case data */ },
      "questions": [ /* AI generated questions */ ],
      "answers": { /* user responses */ },
      "completed": true,
      "completedAt": "2025-01-01T12:05:00.000Z"
    }
  ]
}
```

## Frontend Integration

The backend integrates with the React frontend through:

1. **NewCaseForm.jsx**: Submits initial case data and triggers dynamic questioning
2. **DynamicQuestionForm.jsx**: Renders AI-generated questions dynamically
3. **Axios HTTP Client**: Handles API communication

## Error Handling

The server includes comprehensive error handling:
- Invalid API responses from Gemini AI
- File system errors
- Missing required fields
- Network connectivity issues

## Security Considerations

- Environment variables for sensitive API keys
- CORS configuration for frontend-backend communication
- Input validation and sanitization
- Error message sanitization to prevent information leakage

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **@google/generative-ai**: Google Gemini AI integration
- **fs-extra**: Enhanced file system operations
- **body-parser**: Request body parsing