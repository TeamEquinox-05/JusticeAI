# JusticeAI Frontend Updates

## New Features Implemented

### 1. Environment Configuration
- **File**: `.env`
- **Purpose**: Stores the ngrok server URL for API endpoints
- **Content**: `VITE_API_BASE_URL=https://1729c7d01b18.ngrok-free.app`

### 2. Enhanced Case Submission Flow
- **File**: `src/components/NewCaseForm.jsx`
- **Updates**:
  - Form now submits to the configured server endpoint
  - Handles server response with `session_id` and analysis data
  - Stores analysis data and session info in localStorage
  - Displays comprehensive case analysis with recommended forms

### 3. Chat Integration
- **File**: `src/components/ChatModal.jsx`
- **Features**:
  - Chat interface for case-related questions
  - Uses session_id for context-aware conversations
  - Accessible via chat icon in the form header
  - Real-time messaging with loading states

### 4. Automatic Form Pre-filling
- **File**: `src/utils/FormAutoFill.js`
- **Capabilities**:
  - Parses server response and extracts relevant data
  - Pre-populates forms based on case analysis
  - Supports multiple form types (FIR, Charge Sheet, Victim Statement)
  - Generates recommended forms based on case type

### 5. Enhanced Case Analysis Display
- **File**: `src/components/CaseAnalysisWithForms.jsx`
- **Features**:
  - Shows legal process steps with timelines
  - Displays recommended forms with priority levels
  - Provides download options for pre-filled forms
  - Integrated chat functionality

### 6. Updated Form Components
- **Files**: 
  - `src/forms/ChargeSheetForm.jsx`
  - `src/forms/FIRForm.jsx`
  - `src/forms/VictimStatementForm.jsx`
- **Updates**:
  - Added auto-loading of pre-filled data from localStorage
  - Enhanced with useEffect hooks for data initialization

## Usage Flow

1. **Case Submission**:
   - User fills out the New Case Form
   - On submission, data is sent to the ngrok server endpoint
   - Server analyzes the case and returns structured data with session_id

2. **Analysis Display**:
   - Case analysis is displayed with:
     - Legal process steps and timelines
     - Recommended forms based on case type
     - Session information

3. **Form Auto-filling**:
   - Click "Open Form" on any recommended form
   - Form opens with pre-filled data based on case analysis
   - User can modify and complete the form

4. **Chat Assistance**:
   - Click the chat icon to open the assistant
   - Ask questions about the case using the session context
   - Get guidance on legal requirements and next steps

## API Integration

### Case Submission Endpoint
```
POST ${VITE_API_BASE_URL}/api/case
```
**Request Body**:
```json
{
  "formData": {
    "caseId": "string",
    "caseTitle": "string",
    "caseDescription": "string",
    "victimAge": "string",
    "victimGender": "string",
    "victimLocation": "string",
    "incidentDate": "string",
    "incidentTime": "string"
  }
}
```

**Expected Response**:
```json
{
  "message": "{\"form_details\":{\"form_name\":\"FORM IF5\",\"document_title\":\"FINAL FORM/REPORT (Under Section 173 CR. P.C.)\"},...}",
  "session_id": "uuid"
}
```

### Chat Endpoint
```
POST ${VITE_API_BASE_URL}/api/chat
```
**Request Body**:
```json
{
  "message": "string",
  "session_id": "uuid",
  "case_id": "string"
}
```

## File Structure Updates

```
frontend/
├── .env                              # Environment configuration
├── src/
│   ├── components/
│   │   ├── ChatModal.jsx             # New chat interface
│   │   ├── CaseAnalysisWithForms.jsx # New analysis display
│   │   └── NewCaseForm.jsx           # Updated form submission
│   ├── forms/
│   │   ├── ChargeSheetForm.jsx       # Updated with auto-fill
│   │   ├── FIRForm.jsx              # Updated with auto-fill
│   │   └── VictimStatementForm.jsx   # Updated with auto-fill
│   └── utils/
│       └── FormAutoFill.js           # New auto-fill utility
```

## Key Features Summary

✅ **Environment Configuration**: Server URL stored in `.env`  
✅ **Server Integration**: Form submits to ngrok endpoint  
✅ **Session Management**: Handles session_id from server response  
✅ **Case Analysis**: Displays legal steps and requirements  
✅ **Auto-filled Forms**: Pre-populates forms based on analysis  
✅ **Chat Integration**: Context-aware chat assistant  
✅ **Form Downloads**: Export pre-filled forms as JSON  

All forms now automatically populate with relevant data based on the case analysis, and users can interact with a chat assistant for guidance throughout the legal process.