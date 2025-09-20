const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse'); // You'll need to install this package with: npm install pdf-parse

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

// Function to extract text content from a PDF file
const extractPdfContent = async (pdfPath) => {
  try {
    // Read the PDF file as a buffer
    const dataBuffer = await fs.readFile(pdfPath);
    
    // Parse the PDF file
    const data = await pdf(dataBuffer);
    
    // Return the text content
    return data.text;
  } catch (error) {
    console.error(`Error extracting content from PDF ${pdfPath}:`, error);
    return null;
  }
};

// Advanced function to extract relevant sections from PDF content based on keywords
const extractRelevantPdfSections = (pdfContent, keywords, contextSize = 30) => {
  if (!pdfContent) return '';
  
  // Split content into lines for analysis
  const lines = pdfContent.split('\n');
  let relevantExcerpts = [];
  
  // For each line, check if it contains any of the keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line contains any of our keywords
    if (keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
      // We found a match! Now extract a block of text around this line for context
      const startIndex = Math.max(0, i - Math.floor(contextSize/2));
      const endIndex = Math.min(lines.length - 1, i + Math.floor(contextSize/2));
      
      // Join the lines in this section
      const excerpt = lines.slice(startIndex, endIndex + 1).join('\n');
      
      // Add to our collection if it's substantial (avoid tiny excerpts)
      if (excerpt.length > 100) {
        relevantExcerpts.push({
          excerpt,
          matchPosition: i - startIndex, // Position of the matching line within the excerpt
          // Calculate a relevance score based on how many keywords match
          relevanceScore: keywords.filter(keyword => 
            excerpt.toLowerCase().includes(keyword.toLowerCase())).length
        });
      }
      
      // Skip ahead to avoid overlapping excerpts
      i = endIndex;
    }
  }
  
  // Sort excerpts by relevance score (most relevant first)
  relevantExcerpts.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Return the top excerpts (limit to avoid too much content)
  return relevantExcerpts
    .slice(0, 5)
    .map(item => item.excerpt)
    .join('\n\n---\n\n');
};

// Function to load legal reference documents
const loadLegalReferences = async () => {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const refsMap = {};
    
    // Check if the data directory exists
    if (await fs.pathExists(dataDir)) {
      // BNS PDF
      const bnsPath = path.join(dataDir, '250883_english_01042024-BNS.pdf');
      if (await fs.pathExists(bnsPath)) {
        console.log('Loading BNS PDF...');
        refsMap.bns = await extractPdfContent(bnsPath);
      }
      
      // SOP for Investigation PDF
      const sopPath = path.join(dataDir, 'SOP for Investigation and Prosecution of Rape against Women -Final submitted (Revised) to JS WS MHA.pdf');
      if (await fs.pathExists(sopPath)) {
        console.log('Loading SOP for Investigation PDF...');
        refsMap.sop = await extractPdfContent(sopPath);
      }
      
      // Delhi Police PDF
      const delhiPolicePath = path.join(dataDir, '303-delhi police.pdf');
      if (await fs.pathExists(delhiPolicePath)) {
        console.log('Loading Delhi Police PDF...');
        refsMap.delhiPolice = await extractPdfContent(delhiPolicePath);
      }
      
      // Hackathon datasets PDF
      const datasetsPath = path.join(dataDir, 'Hackathon datasets 2025 PDF file.pdf');
      if (await fs.pathExists(datasetsPath)) {
        console.log('Loading Hackathon datasets PDF...');
        refsMap.datasets = await extractPdfContent(datasetsPath);
      }
    }
    
    return refsMap;
  } catch (error) {
    console.error('Error loading legal references:', error);
    return {};
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

// Resolve compliance alert
app.post('/api/case/:caseId/resolve-alert', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { alertId } = req.body;
    
    if (!caseId || !alertId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and alert ID are required'
      });
    }
    
    // Read responses
    const responses = await readResponses();
    
    // Find the case
    const caseIndex = responses.cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    // Check if the case has analysis data
    if (!responses.cases[caseIndex].analysis) {
      return res.status(400).json({
        success: false,
        error: 'No analysis found for this case'
      });
    }
    
    // Remove the alert from the compliance alerts
    const complianceAlerts = responses.cases[caseIndex].analysis.complianceAlerts || [];
    responses.cases[caseIndex].analysis.complianceAlerts = complianceAlerts.filter(
      alert => alert.id !== alertId
    );
    
    // Update the compliance score
    const totalSteps = responses.cases[caseIndex].analysis.investigationSteps.length;
    const completedSteps = responses.cases[caseIndex].analysis.investigationSteps.filter(
      step => step.status === 'completed'
    ).length;
    
    responses.cases[caseIndex].analysis.complianceScore = Math.round(
      (completedSteps / totalSteps) * 100
    );
    
    // Write back to file
    await writeResponses(responses);
    
    res.json({
      success: true,
      message: 'Alert resolved successfully',
      updatedAnalysis: responses.cases[caseIndex].analysis
    });
    
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      details: error.message
    });
  }
});

// Update investigation step status
app.post('/api/case/:caseId/update-step', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { stepId, status } = req.body;
    
    if (!caseId || !stepId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Case ID, step ID, and status are required'
      });
    }
    
    if (!['pending', 'completed', 'not-required'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "pending", "completed", or "not-required"'
      });
    }
    
    // Read responses
    const responses = await readResponses();
    
    // Find the case
    const caseIndex = responses.cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    // Check if the case has analysis data
    if (!responses.cases[caseIndex].analysis) {
      return res.status(400).json({
        success: false,
        error: 'No analysis found for this case'
      });
    }
    
    // Update the investigation step status
    const steps = responses.cases[caseIndex].analysis.investigationSteps || [];
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Step not found'
      });
    }
    
    responses.cases[caseIndex].analysis.investigationSteps[stepIndex].status = status;
    
    // Update the compliance score
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    
    responses.cases[caseIndex].analysis.complianceScore = Math.round(
      (completedSteps / totalSteps) * 100
    );
    
    // Write back to file
    await writeResponses(responses);
    
    res.json({
      success: true,
      message: 'Step status updated successfully',
      updatedAnalysis: responses.cases[caseIndex].analysis
    });
    
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update step status',
      details: error.message
    });
  }
});

// Generate document template (FIR or charge sheet)
app.post('/api/case/:caseId/generate-document', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { documentType } = req.body;
    
    if (!caseId || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and document type are required'
      });
    }
    
    if (!['fir', 'chargesheet'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type. Must be "fir" or "chargesheet"'
      });
    }
    
    // Read responses
    const responses = await readResponses();
    
    // Find the case
    const caseIndex = responses.cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    // Check if case has necessary data
    const caseData = responses.cases[caseIndex];
    if (!caseData.basicInfo) {
      return res.status(400).json({
        success: false,
        error: 'Case is missing basic information'
      });
    }
    
    // If partial answers were provided in the request (for live preview), merge them
    if (req.body.answers) {
      caseData.partialAnswers = req.body.answers;
    }
    
    // Load legal references for document generation
    const legalReferences = await loadLegalReferences();
    
    // Get relevant content from legal documents for this case type
    const victimAge = caseData.basicInfo?.victimAge;
    const isPocsoCase = victimAge && parseInt(victimAge) < 18;
    const incidentDescription = caseData.basicInfo?.caseDescription || '';
    const isDigitalOffense = incidentDescription.toLowerCase().includes('online') || 
                           incidentDescription.toLowerCase().includes('cyber') || 
                           incidentDescription.toLowerCase().includes('internet');
    
    // Create specific keywords for document type
    let documentKeywords = [];
    
    if (documentType === 'fir') {
      documentKeywords = [
        'fir', 'first information report', 'complaint registration',
        'section 154', 'police report', 'initial complaint'
      ];
    } else if (documentType === 'chargesheet') {
      documentKeywords = [
        'charge sheet', 'charges', 'prosecution', 'section 173',
        'final report', 'investigation report', 'trial'
      ];
    }
    
    // Add case-specific keywords
    if (isPocsoCase) {
      documentKeywords.push('pocso', 'minor victim', 'child protection');
    }
    
    if (isDigitalOffense) {
      documentKeywords.push('cyber crime', 'digital evidence', 'electronic');
    }
    
    // Extract relevant content from legal references
    let relevantContent = '';
    
    if (legalReferences.sop) {
      const sopExcerpt = extractRelevantPdfSections(legalReferences.sop, documentKeywords, 30);
      if (sopExcerpt) relevantContent += sopExcerpt + '\n\n';
    }
    
    if (legalReferences.delhiPolice) {
      const guidelinesExcerpt = extractRelevantPdfSections(legalReferences.delhiPolice, documentKeywords, 30);
      if (guidelinesExcerpt) relevantContent += guidelinesExcerpt + '\n\n';
    }
    
    // Get applicable sections if available
    let applicableSections = [];
    if (caseData.analysis && caseData.analysis.applicableSections) {
      applicableSections = caseData.analysis.applicableSections;
    }
    
    // Generate AI prompt based on document type and case details
    let prompt;
    
    if (documentType === 'fir') {
      prompt = `
You are a legal document drafting assistant. Create a well-structured First Information Report (FIR) based on the following case details. The FIR should follow standard Indian legal format.

Case Details:
- Case Title: ${caseData.basicInfo?.caseTitle || 'Not provided'}
- Victim: ${caseData.basicInfo?.victimGender || 'Unknown'}, Age ${caseData.basicInfo?.victimAge || 'Unknown'}
- Location: ${caseData.basicInfo?.victimLocation || 'Unknown'}
- Incident Date: ${caseData.basicInfo?.incidentDate || 'Unknown'}
- Incident Time: ${caseData.basicInfo?.incidentTime || 'Unknown'}
- Description: ${caseData.basicInfo?.caseDescription || 'Not provided'}

${caseData.answers ? 'Additional Details:\n' + Object.entries(caseData.answers).map(([key, value]) => `- ${key}: ${value}`).join('\n') : ''}

Applicable Legal Sections:
${applicableSections.map(section => `- ${section.act} Section ${section.section}: ${section.title}`).join('\n')}

Reference Content from Legal Guidelines:
${relevantContent || 'Standard FIR format should be followed.'}

Follow these guidelines:
1. The FIR should be in formal, official language suitable for legal documentation.
2. Include all relevant details from the case, formatted properly for an FIR.
3. Include proper sections for date, time, place of occurrence, nature of offense, details of the complainant, etc.
4. Mention all applicable legal sections correctly.
5. Keep the language factual and objective, avoiding any subjective interpretations.
6. Follow the standard format used by Indian police departments for FIRs.

Generate the complete FIR text:`;
    } else if (documentType === 'chargesheet') {
      prompt = `
You are a legal document drafting assistant. Create a well-structured Charge Sheet based on the following case details. The Charge Sheet should follow standard Indian legal format.

Case Details:
- Case Title: ${caseData.basicInfo?.caseTitle || 'Not provided'}
- Victim: ${caseData.basicInfo?.victimGender || 'Unknown'}, Age ${caseData.basicInfo?.victimAge || 'Unknown'}
- Location: ${caseData.basicInfo?.victimLocation || 'Unknown'}
- Incident Date: ${caseData.basicInfo?.incidentDate || 'Unknown'}
- Incident Time: ${caseData.basicInfo?.incidentTime || 'Unknown'}
- Description: ${caseData.basicInfo?.caseDescription || 'Not provided'}

${caseData.answers ? 'Additional Details:\n' + Object.entries(caseData.answers).map(([key, value]) => `- ${key}: ${value}`).join('\n') : ''}

${caseData.analysis && caseData.analysis.investigationSteps ? 'Investigation Steps Completed:\n' + caseData.analysis.investigationSteps.filter(step => step.status === 'completed').map(step => `- ${step.title}`).join('\n') : ''}

Applicable Legal Sections:
${applicableSections.map(section => `- ${section.act} Section ${section.section}: ${section.title}`).join('\n')}

Reference Content from Legal Guidelines:
${relevantContent || 'Standard Charge Sheet format should be followed.'}

Follow these guidelines:
1. The Charge Sheet should be in formal, official language suitable for legal documentation.
2. Include all relevant details from the case, formatted properly for a Charge Sheet.
3. Include proper sections for accused details, offense particulars, list of witnesses, list of evidence, etc.
4. Mention all applicable legal sections correctly.
5. Include details of the investigation conducted.
6. Keep the language factual and objective, avoiding any subjective interpretations.
7. Follow the standard format used by Indian police departments for Charge Sheets.

Generate the complete Charge Sheet text:`;
    }
    
    // Generate document using AI
    console.log(`Generating ${documentType} for case ${caseId}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedContent = response.text();
    
    // Initialize documents object if it doesn't exist in analysis
    if (!caseData.analysis) {
      caseData.analysis = {};
    }
    
    if (!caseData.analysis.documents) {
      caseData.analysis.documents = {};
    }
    
    // Update the document content
    if (documentType === 'fir') {
      caseData.analysis.firDraft = generatedContent;
      
      // Update documents object as well (for the new component)
      if (!caseData.analysis.documents.fir) {
        caseData.analysis.documents.fir = {};
      }
      caseData.analysis.documents.fir.content = generatedContent;
      caseData.analysis.documents.fir.generatedAt = new Date().toISOString();
      caseData.analysis.documents.fir.updatedAt = new Date().toISOString();
      
    } else if (documentType === 'chargesheet') {
      caseData.analysis.chargesheetDraft = generatedContent;
      
      // Update documents object as well (for the new component)
      if (!caseData.analysis.documents.chargesheet) {
        caseData.analysis.documents.chargesheet = {};
      }
      caseData.analysis.documents.chargesheet.content = generatedContent;
      caseData.analysis.documents.chargesheet.generatedAt = new Date().toISOString();
      caseData.analysis.documents.chargesheet.updatedAt = new Date().toISOString();
    }
    
    // Write back to file
    await writeResponses(responses);
    
    res.json({
      success: true,
      message: `${documentType === 'fir' ? 'FIR' : 'Charge Sheet'} generated successfully`,
      documentContent: generatedContent
    });
    
  } catch (error) {
    console.error(`Error generating document:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to generate document`,
      details: error.message
    });
  }
});

// Update document content (FIR or charge sheet)
app.post('/api/case/:caseId/update-document', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { documentType, content } = req.body;
    
    if (!caseId || !documentType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Case ID, document type, and content are required'
      });
    }
    
    if (!['fir', 'chargesheet'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type. Must be "fir" or "chargesheet"'
      });
    }
    
    // Read responses
    const responses = await readResponses();
    
    // Find the case
    const caseIndex = responses.cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    // Check if the case has analysis data
    if (!responses.cases[caseIndex].analysis) {
      return res.status(400).json({
        success: false,
        error: 'No analysis found for this case'
      });
    }
    
    // Initialize documents object if it doesn't exist
    if (!responses.cases[caseIndex].analysis.documents) {
      responses.cases[caseIndex].analysis.documents = {};
    }
    
    // Update the document content
    if (documentType === 'fir') {
      responses.cases[caseIndex].analysis.firDraft = content;
      
      // Update documents object as well (for the new component)
      if (!responses.cases[caseIndex].analysis.documents.fir) {
        responses.cases[caseIndex].analysis.documents.fir = {};
      }
      responses.cases[caseIndex].analysis.documents.fir.content = content;
      responses.cases[caseIndex].analysis.documents.fir.updatedAt = new Date().toISOString();
      
    } else if (documentType === 'chargesheet') {
      responses.cases[caseIndex].analysis.chargesheetDraft = content;
      
      // Update documents object as well (for the new component)
      if (!responses.cases[caseIndex].analysis.documents.chargesheet) {
        responses.cases[caseIndex].analysis.documents.chargesheet = {};
      }
      responses.cases[caseIndex].analysis.documents.chargesheet.content = content;
      responses.cases[caseIndex].analysis.documents.chargesheet.updatedAt = new Date().toISOString();
    }
    
    // Write back to file
    await writeResponses(responses);
    
    res.json({
      success: true,
      message: 'Document updated successfully',
      updatedAnalysis: responses.cases[caseIndex].analysis
    });
    
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document',
      details: error.message
    });
  }
});

// Helper function to analyze case and respond
async function analyzeAndRespondCase(caseData, res) {
  console.log('Analyzing case data:', caseData);

  try {
    // Read legal sections data
    const legalSectionsPath = path.join(__dirname, 'data', 'legal_sections.json');
    console.log('Reading legal sections from:', legalSectionsPath);
    const legalData = await fs.readJSON(legalSectionsPath);
    console.log('Legal data loaded successfully');
    
    // Load legal reference documents from PDFs
    console.log('Loading legal reference documents from PDFs...');
    const legalReferences = await loadLegalReferences();
    console.log('Legal references loaded:', Object.keys(legalReferences));
    
    // Generate AI analysis based on the case data, legal sections, and PDF references
    // First, extract the most relevant sections from the PDFs based on case details
    let relevantBnsExcerpts = '';
    let relevantSopExcerpts = '';
    let relevantGuidelinesExcerpts = '';
    let relevantPrecedentsExcerpts = '';
    
    // Determine case type and key details for targeted document search
    const victimAge = caseData.victimAge || caseData.basicInfo?.victimAge;
    const isPocsoCase = victimAge && parseInt(victimAge) < 18;
    const incidentDescription = caseData.caseDescription || caseData.basicInfo?.caseDescription || '';
    const isDigitalOffense = incidentDescription.toLowerCase().includes('online') || 
                            incidentDescription.toLowerCase().includes('cyber') || 
                            incidentDescription.toLowerCase().includes('internet');
  
  // Generate case-specific keywords based on the case details
  const caseSpecificKeywords = [];
  
  // Add basic keywords based on case description
  if (incidentDescription) {
    // Extract important words from the description
    const descWords = incidentDescription.toLowerCase().split(/\s+/);
    const significantWords = descWords.filter(word => 
      word.length > 4 && 
      !['about', 'there', 'their', 'these', 'those', 'while', 'where', 'which', 'would'].includes(word)
    );
    caseSpecificKeywords.push(...significantWords.slice(0, 5)); // Use up to 5 significant words
  }
  
  // Add location-specific keywords
  const location = caseData.victimLocation || caseData.basicInfo?.victimLocation;
  if (location) {
    caseSpecificKeywords.push(location.toLowerCase());
  }
  
  // Add age-specific keywords
  if (isPocsoCase) {
    caseSpecificKeywords.push('minor', 'child', 'juvenile', 'pocso');
  }
  
  // Add digital offense keywords
  if (isDigitalOffense) {
    caseSpecificKeywords.push('online', 'digital', 'cyber', 'electronic');
  }
  
  // Standard keywords for sexual offense cases
  const sexualOffenseKeywords = [
    'section 376', 'rape', 'sexual assault', 'sexual offence', 'victim',
    'evidence collection', 'medical examination', 'statement', 'investigation procedure'
  ];
  
  // POCSO-specific keywords
  const pocsoKeywords = isPocsoCase ? 
    ['child victim', 'minor victim', 'age determination', 'pocso act', 'juvenile justice'] : [];
  
  // Digital-specific keywords
  const digitalKeywords = isDigitalOffense ? 
    ['electronic evidence', 'digital forensic', 'online harassment', 'it act', 'cyber crime'] : [];
  
  // Extract relevant BNS sections
  if (legalReferences.bns) {
    const bnsKeywords = [
      ...sexualOffenseKeywords,
      ...(isPocsoCase ? pocsoKeywords : []),
      ...(isDigitalOffense ? digitalKeywords : []),
      ...caseSpecificKeywords
    ];
    
    relevantBnsExcerpts = extractRelevantPdfSections(legalReferences.bns, bnsKeywords, 40);
  }
  
  // Extract relevant SOP sections
  if (legalReferences.sop) {
    const sopKeywords = [
      'investigation procedure', 'evidence collection', 'statement recording',
      'medical examination', 'victim counseling', 'crime scene',
      ...(isPocsoCase ? pocsoKeywords : []),
      ...caseSpecificKeywords
    ];
    
    relevantSopExcerpts = extractRelevantPdfSections(legalReferences.sop, sopKeywords, 40);
  }
  
  // Extract relevant Delhi Police guidelines
  if (legalReferences.delhiPolice) {
    const guidelinesKeywords = isPocsoCase ? 
      ['child victim', 'pocso', 'minor', 'juvenile', ...caseSpecificKeywords] : 
      ['sexual assault', 'rape investigation', 'victim statement', ...caseSpecificKeywords];
    
    relevantGuidelinesExcerpts = extractRelevantPdfSections(legalReferences.delhiPolice, guidelinesKeywords, 40);
  }
  
  // Extract relevant case precedents
  if (legalReferences.datasets) {
    const precedentKeywords = isPocsoCase ? 
      ['pocso judgment', 'child victim', 'minor protection', ...caseSpecificKeywords] : 
      ['rape judgment', 'sexual assault precedent', 'victim testimony', ...caseSpecificKeywords];
    
    relevantPrecedentsExcerpts = extractRelevantPdfSections(legalReferences.datasets, precedentKeywords, 40);
  }
  
  const prompt = `
You are an AI legal assistant specialized in sexual offence investigations in India.
Your role is to guide an Investigating Officer (IO) in identifying the correct legal sections, 
procedures, and checklists based on case details.

I have provided you with important legal documents which you should use as reference for your analysis:
1. Bharatiya Nyaya Sanhita (BNS) - The primary criminal code of India
2. Standard Operating Procedures (SOP) for Investigation and Prosecution of Rape
3. Delhi Police guidelines for sexual offence investigations
4. Relevant case data and judicial precedents

Here is the case information:
- Case ID: ${caseData.caseId || caseData.id || 'Not provided'}
- Case Title: ${caseData.caseTitle || caseData.basicInfo?.caseTitle || 'Not provided'}
- Case Description: ${caseData.caseDescription || caseData.basicInfo?.caseDescription || 'Not provided'}
- Victim Age: ${caseData.victimAge || caseData.basicInfo?.victimAge || 'Not provided'}
- Victim Gender: ${caseData.victimGender || caseData.basicInfo?.victimGender || 'Not provided'}
- Victim Location: ${caseData.victimLocation || caseData.basicInfo?.victimLocation || 'Not provided'}
- Incident Date: ${caseData.incidentDate || caseData.basicInfo?.incidentDate || 'Not provided'}
- Incident Time: ${caseData.incidentTime || caseData.basicInfo?.incidentTime || 'Not provided'}

Additional details (if available):
${caseData.answers ? JSON.stringify(caseData.answers, null, 2) : 'No additional answers provided'}

Based on the case details, please generate a comprehensive legal analysis with the following components:

1. Applicable Legal Sections: Identify appropriate sections from BNS, POCSO Act, IT Act.
2. Investigation Steps Checklist: List required investigation steps and mark their status.
3. Legal Compliance Alerts: Identify any missing mandatory steps required by law.
4. Judicial Guidance: Reference relevant court judgments applicable to this case.
5. Draft FIR: Generate a structured FIR draft with correct legal sections.

Format your response as a JSON object with the following structure:
{
  "complianceScore": number,
  "caseType": string,
  "applicableSections": [
    {
      "act": string,
      "section": string,
      "title": string,
      "plainLanguage": string,
      "tags": [string]
    }
  ],
  "investigationSteps": [
    {
      "title": string,
      "description": string,
      "status": "completed" | "pending",
      "timeline": string,
      "officer": string
    }
  ],
  "complianceAlerts": [
    {
      "title": string,
      "description": string,
      "section": string,
      "timeline": string
    }
  ],
  "judicialGuidance": [
    {
      "name": string,
      "citation": string,
      "summary": string,
      "keyPoints": [string],
      "tags": [string]
    }
  ],
  "firDraft": string
}

Use the following legal sections data as reference:
${JSON.stringify(legalData, null, 2)}

Here are key excerpts from the reference documents that may be relevant to this case:

BHARATIYA NYAYA SANHITA EXCERPTS RELEVANT TO THIS CASE:
${relevantBnsExcerpts || (legalReferences.bns ? legalReferences.bns.substring(0, 2000) + '...' : 'Not available')}

SOP FOR INVESTIGATION AND PROSECUTION RELEVANT TO THIS CASE:
${relevantSopExcerpts || (legalReferences.sop ? legalReferences.sop.substring(0, 2000) + '...' : 'Not available')}

DELHI POLICE GUIDELINES RELEVANT TO THIS CASE:
${relevantGuidelinesExcerpts || (legalReferences.delhiPolice ? legalReferences.delhiPolice.substring(0, 2000) + '...' : 'Not available')}

CASE PRECEDENTS AND JUDICIAL GUIDANCE RELEVANT TO THIS CASE:
${relevantPrecedentsExcerpts || (legalReferences.datasets ? legalReferences.datasets.substring(0, 2000) + '...' : 'Not available')}

Using all the above reference material, provide a comprehensive legal analysis for this case.

IMPORTANT GUIDELINES:
1. Base ALL recommendations SOLELY on the provided legal documents and case details
2. Do NOT include generic or pre-programmed responses
3. Each recommendation must cite a specific legal section or guideline from the documents
4. Tailor analysis completely to the unique details of this specific case
5. Generate investigation steps based on actual procedures in the reference documents
6. Include only judicial guidance that is directly applicable to this case type

Only return the JSON object, no additional text.`;

  console.log('Sending prompt to AI...');
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  console.log('Raw AI response received');

// Parse the AI response
  let analysis;
  try {
    // Clean the response text to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    return res.status(500).json({
      success: false,
      error: 'Failed to parse AI response',
      details: parseError.message
    });
  }

  // Store the analysis in the responses file
  const responses = await readResponses();
  const caseId = caseData.caseId || caseData.id;
  const caseIndex = responses.cases.findIndex(c => c.id === caseId);
  
  if (caseIndex !== -1) {
    // Add IDs to each item in the analysis to make them identifiable
    if (analysis.investigationSteps) {
      analysis.investigationSteps = analysis.investigationSteps.map((step, index) => ({
        ...step,
        id: `step_${index + 1}`
      }));
    }
    
    if (analysis.complianceAlerts) {
      // Determine priority dynamically based on content rather than hardcoding
      analysis.complianceAlerts = analysis.complianceAlerts.map((alert, index) => {
        // Analyze the alert content to determine priority
        let priority = 'medium'; // Default priority
        const alertText = (alert.title + ' ' + alert.description).toLowerCase();
        
        // Critical alerts - time-sensitive or serious legal violations
        if (alertText.includes('immediate') || 
            alertText.includes('urgent') ||
            alertText.includes('mandatory') ||
            alertText.includes('within 24 hours') ||
            alertText.includes('critical') ||
            alertText.includes('failure to comply') ||
            alertText.includes('required by law')) {
          priority = 'critical';
        }
        // High priority alerts - important but not immediately critical
        else if (alertText.includes('important') ||
                alertText.includes('high priority') ||
                alertText.includes('significant') ||
                alertText.includes('essential') ||
                alertText.includes('within 72 hours')) {
          priority = 'high';
        }
        
        return {
          ...alert,
          id: `alert_${index + 1}`,
          priority
        };
      });
    }
    
    // Add documents structure if not already present
    if (!analysis.documents) {
      analysis.documents = {};
      
      // Add FIR document if there's a draft
      if (analysis.firDraft) {
        analysis.documents.fir = {
          content: analysis.firDraft,
          caseRef: caseId || 'case',
          generatedAt: new Date().toISOString(),
          sections: analysis.applicableSections?.map(s => `${s.act} Section ${s.section}`) || []
        };
      }
      
      // Add charge sheet if there's a draft
      if (analysis.chargesheetDraft) {
        analysis.documents.chargesheet = {
          content: analysis.chargesheetDraft,
          caseRef: caseId || 'case',
          generatedAt: new Date().toISOString(),
          sections: analysis.applicableSections?.map(s => `${s.act} Section ${s.section}`) || []
        };
      }
    }
    
    // Update the case with analysis
    responses.cases[caseIndex].analysis = analysis;
    responses.cases[caseIndex].analyzedAt = new Date().toISOString();
    
    // Write back to file
    await writeResponses(responses);
  }
  
  res.json({
    success: true,
    analysis: analysis
  });
  } catch (error) {
    console.error('Error in analyzeAndRespondCase:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze case',
      details: error.message
    });
  }
}

// Analyze case and generate legal recommendations
app.post('/api/analyze-case', async (req, res) => {
  try {
    console.log('Received analyze-case request');
    const caseData = req.body;
    console.log('Request body:', JSON.stringify(caseData).substring(0, 200) + '...');
    
    if (!caseData) {
      return res.status(400).json({
        success: false,
        error: 'No case data provided'
      });
    }
    
    await analyzeAndRespondCase(caseData, res);
  } catch (error) {
    console.error('Error in analyze-case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze case',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get analysis for a specific case
app.get('/api/analyze-case/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Read responses
    const responses = await readResponses();
    
    // Find the case
    const case_data = responses.cases.find(c => c.id === id);
    
    if (!case_data) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    // If analysis already exists, return it
    if (case_data.analysis) {
      return res.json({
        success: true,
        analysis: case_data.analysis
      });
    }
    
    // Otherwise, generate new analysis
    await analyzeAndRespondCase(case_data, res);
    
  } catch (error) {
    console.error('Error in get analyze-case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get or generate case analysis',
      details: error.message
    });
  }
});

// Submit initial case data and generate questions

// Submit initial case data and generate questions
app.post('/api/submit-case', async (req, res) => {
  try {
    const caseData = req.body;
    console.log('Received case data:', caseData);

    // Load legal reference documents from PDFs for more relevant questions
    console.log('Loading legal reference documents for question generation...');
    const legalReferences = await loadLegalReferences();
    
    // Determine case type based on victim age and case details for more targeted questions
    const isMightBePocsoCase = caseData.victimAge && parseInt(caseData.victimAge) < 18;
    const incidentDescription = caseData.caseDescription || '';
    const isDigitalOffense = incidentDescription.toLowerCase().includes('online') || 
                          incidentDescription.toLowerCase().includes('cyber') || 
                          incidentDescription.toLowerCase().includes('internet');
    
    // Generate case-specific keywords based on the case details
    const caseSpecificKeywords = [];
    
    // Add basic keywords based on case description
    if (incidentDescription) {
      // Extract important words from the description
      const descWords = incidentDescription.toLowerCase().split(/\s+/);
      const significantWords = descWords.filter(word => 
        word.length > 4 && 
        !['about', 'there', 'their', 'these', 'those', 'while', 'where', 'which', 'would'].includes(word)
      );
      caseSpecificKeywords.push(...significantWords.slice(0, 5)); // Use up to 5 significant words
    }
    
    const relevantPdfContent = [];
    
    // Extract relevant SOP content
    if (legalReferences.sop) {
      const sopKeywords = [
        'investigation procedure', 'evidence collection', 'statement recording',
        'medical examination', 'victim counseling', 'crime scene',
        ...(isMightBePocsoCase ? ['child victim', 'pocso', 'minor victim', 'juvenile'] : []),
        ...caseSpecificKeywords
      ];
      
      const sopExcerpt = extractRelevantPdfSections(legalReferences.sop, sopKeywords, 25);
      if (sopExcerpt) {
        relevantPdfContent.push(sopExcerpt);
      }
    }
    
    // Extract relevant BNS content
    if (legalReferences.bns) {
      const bnsKeywords = [
        'sexual offence', 'investigation procedure', 'section 376', 'rape', 
        'sexual assault', 'victim statement',
        ...(isMightBePocsoCase ? ['child', 'minor', 'pocso'] : []),
        ...(isDigitalOffense ? ['electronic', 'digital', 'online', 'cyber'] : []),
        ...caseSpecificKeywords
      ];
      
      const bnsExcerpt = extractRelevantPdfSections(legalReferences.bns, bnsKeywords, 25);
      if (bnsExcerpt) {
        relevantPdfContent.push(bnsExcerpt);
      }
    }
    
    // Generate AI questions based on the case data and PDF content
    const prompt = `
You are a legal assistant AI helping to gather complete case information. Based on the following case details and legal reference documents, generate a comprehensive list of questions that would help complete the case file for legal proceedings.

Case Details:
- Case ID: ${caseData.caseId || 'Not provided'}
- Case Title: ${caseData.caseTitle || 'Not provided'}
- Case Description: ${caseData.caseDescription || 'Not provided'}
- Victim Age: ${caseData.victimAge || 'Not provided'}
- Victim Gender: ${caseData.victimGender || 'Not provided'}
- Victim Location: ${caseData.victimLocation || 'Not provided'}
- Incident Date: ${caseData.incidentDate || 'Not provided'}
- Incident Time: ${caseData.incidentTime || 'Not provided'}

${isMightBePocsoCase ? 'IMPORTANT: This appears to be a POCSO case involving a minor victim. Include questions specific to POCSO requirements.' : ''}

Relevant legal context from official documents:
${relevantPdfContent.join('\n\n---\n\n')}

I need you to generate 15-20 DETAILED follow-up questions that would be important for this case. PLEASE INCLUDE MORE THAN 8 QUESTIONS. The questions should be organized into logical categories to help the investigating officer collect all necessary information.

For each question:
1. Make it specific and detailed
2. Specify the type of input needed (text, textarea, select, date, time, number, etc.) 
3. If it's a select type, provide the options
4. Add a category to group related questions (e.g., "Victim Details", "Scene Investigation", "Witness Information", "Evidence Collection")
5. Include a "questionId" field with a unique identifier for each question to help with dynamic follow-up questions

Format your response as a JSON array with objects containing:
- questionId: a unique identifier for the question (e.g., "q1", "victim_age", etc.)
- category: the category this question belongs to
- question: the question text
- type: input type (text, textarea, select, date, time, number, email, tel)
- placeholder: placeholder text (if applicable)
- options: array of options (only for select type)
- required: boolean
- followUpFor: optional field indicating if this is a follow-up to another question (reference the questionId)
- showIf: optional object with condition for showing this question (e.g., {"questionId": "q2", "equals": "Yes"})

Example format:
[
  {
    "questionId": "q1",
    "category": "Scene Investigation",
    "question": "What was the weather condition during the incident?",
    "type": "select",
    "placeholder": "",
    "options": ["Clear", "Rainy", "Cloudy", "Foggy", "Unknown"],
    "required": true
  },
  {
    "questionId": "q2",
    "category": "Witness Information",
    "question": "Were there any witnesses to the incident?",
    "type": "select",
    "placeholder": "",
    "options": ["Yes", "No", "Unknown"],
    "required": true
  },
  {
    "questionId": "q2_1",
    "category": "Witness Information",
    "question": "How many witnesses were present?",
    "type": "number",
    "placeholder": "Enter number of witnesses",
    "options": [],
    "required": true,
    "followUpFor": "q2",
    "showIf": {"questionId": "q2", "equals": "Yes"}
  },
  {
    "questionId": "q3",
    "category": "Scene Description",
    "question": "Please provide additional details about the incident location",
    "type": "textarea",
    "placeholder": "Describe the exact location, landmarks, etc.",
    "options": [],
    "required": false
  }
]

Make sure to include questions about all relevant aspects of investigation including:
- Victim details and medical examination
- Accused/suspect information
- Crime scene details
- Evidence collection procedures
- Witness statements
- Timeline of events
- Electronic/digital evidence (if applicable)
- Prior history (if relevant)
- POCSO-specific questions (if involving a minor victim)

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
      // Fallback questions with more detail and categories
      questions = [
        {
          questionId: "q1",
          category: "Incident Details",
          question: "What was the weather condition during the incident?",
          type: "select",
          placeholder: "",
          options: ["Clear", "Rainy", "Cloudy", "Foggy", "Unknown"],
          required: true
        },
        {
          questionId: "q2",
          category: "Incident Details",
          question: "Was the location well-lit at the time of the incident?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Partially", "Unknown"],
          required: true
        },
        {
          questionId: "q3",
          category: "Witness Information",
          question: "Were there any witnesses to the incident?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Unknown"],
          required: true
        },
        {
          questionId: "q3_1",
          category: "Witness Information",
          question: "How many witnesses were present?",
          type: "number",
          placeholder: "Enter number of witnesses",
          options: [],
          required: true,
          followUpFor: "q3",
          showIf: {"questionId": "q3", "equals": "Yes"}
        },
        {
          questionId: "q4",
          category: "Victim Details",
          question: "Has the victim received medical attention?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Pending"],
          required: true
        },
        {
          questionId: "q4_1",
          category: "Victim Details",
          question: "Please provide details of medical facility where victim was treated",
          type: "textarea",
          placeholder: "Hospital name, doctor name, treatment details",
          options: [],
          required: true,
          followUpFor: "q4",
          showIf: {"questionId": "q4", "equals": "Yes"}
        },
        {
          questionId: "q5",
          category: "Evidence Collection",
          question: "Has forensic evidence been collected from the scene?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Partially", "Not Applicable"],
          required: true
        },
        {
          questionId: "q6",
          category: "Evidence Collection",
          question: "What types of evidence have been collected so far?",
          type: "select",
          placeholder: "",
          options: ["Biological (DNA, Blood)", "Fingerprints", "Photographs", "Video Recording", "Clothing/Fibers", "Weapons", "Digital/Electronic", "Documents", "Other", "None"],
          required: true
        },
        {
          questionId: "q7",
          category: "Suspect Information",
          question: "Is the suspect/accused known to the victim?",
          type: "select",
          placeholder: "",
          options: ["Yes", "No", "Unknown"],
          required: true
        },
        {
          questionId: "q7_1",
          category: "Suspect Information",
          question: "What is the relationship between victim and suspect?",
          type: "select",
          placeholder: "",
          options: ["Family Member", "Friend", "Acquaintance", "Colleague", "Stranger with Prior Contact", "Complete Stranger", "Other"],
          required: true,
          followUpFor: "q7",
          showIf: {"questionId": "q7", "equals": "Yes"}
        },
        {
          questionId: "q8",
          category: "Case Timeline",
          question: "When was the incident first reported to authorities?",
          type: "date",
          placeholder: "",
          options: [],
          required: true
        },
        {
          questionId: "q9",
          category: "Case Timeline",
          question: "Time delay between incident and reporting (in hours)",
          type: "number",
          placeholder: "Enter approximate hours",
          options: [],
          required: false
        },
        {
          questionId: "q10",
          category: "Additional Details",
          question: "Please provide any additional details about the incident",
          type: "textarea",
          placeholder: "Describe any other relevant information not covered in previous questions",
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
      completed: false,
      questionCategories: Array.from(new Set(questions.map(q => q.category))),
      currentQuestionIndex: 0
    };

    responses.cases.push(newCase);
    await writeResponses(responses);

    res.json({
      success: true,
      caseId: newCase.id,
      questions: questions,
      categories: Array.from(new Set(questions.map(q => q.category)))
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

// Get legal references from PDFs
app.get('/api/legal-references', async (req, res) => {
  try {
    const documentType = req.query.type; // 'bns', 'sop', 'delhiPolice', 'datasets'
    const searchQuery = req.query.query; // Optional search term
    const contextSize = req.query.contextSize ? parseInt(req.query.contextSize) : 30; // Optional context size
    
    // Load all legal references
    const legalReferences = await loadLegalReferences();
    
    // If a specific document type is requested
    if (documentType && legalReferences[documentType]) {
      let content = legalReferences[documentType];
      
      // If search query is provided, try to find relevant sections
      if (searchQuery && content) {
        // Split the search query into keywords
        const searchKeywords = searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2) // Only use substantial words
          .map(word => word.replace(/[^\w]/g, '')); // Remove non-word characters
          
        // Add the original query to ensure exact matches are found
        searchKeywords.push(searchQuery.toLowerCase());
        
        // Use our advanced extraction function to get relevant sections
        const searchResults = extractRelevantPdfSections(content, searchKeywords, contextSize);
        
        // Split results into separate excerpts
        const excerpts = searchResults.split('---').filter(excerpt => excerpt.trim().length > 0);
        
        // Return search results
        return res.json({
          success: true,
          documentType,
          searchQuery,
          results: excerpts,
          totalMatches: excerpts.length,
          searchKeywords: searchKeywords
        });
      }
      
      // Return content (limited to prevent response size issues)
      return res.json({
        success: true,
        documentType,
        content: content.substring(0, 50000) + (content.length > 50000 ? '...' : '')
      });
    }
    
    // Return a summary of all available references
    const summary = {};
    for (const [key, content] of Object.entries(legalReferences)) {
      if (content) {
        // Extract document metadata (if available) by looking at the first few lines
        let title = key;
        let description = '';
        
        if (content) {
          const firstLines = content.split('\n').slice(0, 10).join(' ');
          
          // Try to extract a document title from the first lines
          const titleMatch = firstLines.match(/(title|subject|document):\s*([^\n.]+)/i);
          if (titleMatch) {
            title = titleMatch[2].trim();
          }
          
          // Include a brief preview
          description = content.substring(0, 200).replace(/\n/g, ' ') + '...';
        }
        
        summary[key] = {
          title: title,
          size: content.length,
          preview: description,
          pageEstimate: Math.ceil(content.length / 3000) // Rough estimate of page count
        };
      }
    }
    
    res.json({
      success: true,
      availableReferences: Object.keys(legalReferences).filter(key => legalReferences[key]),
      summary
    });
  } catch (error) {
    console.error('Error getting legal references:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get legal references',
      details: error.message
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
