import os
import uuid
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

# LangChain imports
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.chat_models import ChatOllama
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

# --- CONFIGURATION ---
PERSIST_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "document_store")
EMBEDDING_MODEL = "mixedbread-ai/mxbai-embed-large-v1"
LLM_MODEL = "huihui_ai/llama3.2-abliterate:latest"

# --- IN-MEMORY DICTIONARIES TO HOLD MODELS AND SESSIONS ---
ml_models = {}
active_sessions = {}

# --- FASTAPI LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    print("--- Loading models and building all chains ---")
    
    # Initialize shared components
    llm = ChatOllama(model=LLM_MODEL)
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vectordb = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
    retriever = vectordb.as_retriever(search_kwargs={'k': 5}) # Retrieve more docs for better context

    # --- 1. The Q&A Chain (for general questions) ---
    qa_template = """### ROLE: Q&A Expert ###
    You are an expert AI assistant for Indian Police Officers. Your sole purpose is to provide factual answers from the provided legal documents.
    ### INSTRUCTIONS ###
    Analyze the officer's question, use the "RELEVANT DOCUMENT INFORMATION" to find the answer. If a special law like POCSO applies, prioritize it.
    ---
    ### RELEVANT DOCUMENT INFORMATION ###
    {document_context}
    ---
    ### CONVERSATION HISTORY ###
    {chat_history}
    ---
    ### Officer's Question ###
    {question}
    ### Your Answer ###
    """
    qa_prompt = ChatPromptTemplate.from_template(qa_template)
    ml_models["qa_chain"] = ({
        "document_context": (lambda x: x["question"]) | retriever,
        "question": lambda x: x["question"],
        "chat_history": lambda x: x["chat_history"]
    } | qa_prompt | llm | StrOutputParser())

    # --- 2. The Form-Filler Chain ---
    form_filler_template = """### ROLE: Form Expert ###
    Your task is to accurately fill out a form using information from the provided text.
    ### INSTRUCTIONS ###
    1. Read the "CONVERSATION HISTORY" and "CURRENT USER MESSAGE" to find all available facts.
    2. Identify the form template in the "CURRENT USER MESSAGE".
    3. Fill in every blank (like `___`) in the form with the correct information.
    4. If information for a blank is not available, write "NOT MENTIONED".
    5. Return ONLY the fully completed form text.
    ---
    ### CONVERSATION HISTORY ###
    {chat_history}
    ---
    ### CURRENT USER MESSAGE (contains the form) ###
    {question}
    ---
    ### COMPLETED FORM ###
    """
    form_filler_prompt = ChatPromptTemplate.from_template(form_filler_template)
    ml_models["form_filler_chain"] = (form_filler_prompt | llm | StrOutputParser())

    # --- 3. The Investigative Guide Chain ---
    guide_template = """### ROLE: Investigative Guide ###
    You are an expert investigative AI assistant. Your task is to dynamically generate a procedural checklist for a police officer by analyzing legal documents and then guide them through it.
    ### CURRENT STATE ###
    The case has been classified as: {classification}. The officer's last message was: {question}.
    ### LEGAL CONTEXT (Retrieved from BNS/POCSO Docs) ###
    {document_context}
    ### INSTRUCTIONS ###
    Based on the legal context, determine the full checklist of mandatory steps for this investigation. Then, compare it to the conversation history to find the next most logical question to ask the officer to fill in a missing detail. Ask only that one question.
    ---
    ### CONVERSATION HISTORY ###
    {chat_history}
    ---
    ### Your Next Question ###
    """
    guide_prompt = ChatPromptTemplate.from_template(guide_template)
    ml_models["guide_chain"] = ({
        "document_context": (lambda x: x["question"]) | retriever,
        "question": lambda x: x["question"],
        "chat_history": lambda x: x["chat_history"],
        "classification": lambda x: x["classification"]
    } | guide_prompt | llm | StrOutputParser())


    # --- 4. The Router Chain ---
    router_template = """Your job is to classify the user's intent. Choose one of the following tools:

    1. "GUIDE": If the user is starting a new case, providing case details, or asking "what's next?".
    2. "FORM_FILLER": If the user explicitly asks to "fill a form" and provides a form template.
    3. "QA": For general questions about laws, procedures, or punishments.

    User Message: "{user_message}"
    Respond with ONLY the tool name (e.g., "GUIDE", "FORM_FILLER", or "QA")."""
    router_prompt = ChatPromptTemplate.from_template(router_template)
    ml_models["router_chain"] = router_prompt | llm | StrOutputParser()
    
    print("--- Models loaded and all chains are ready ---")
    yield
    ml_models.clear()
    active_sessions.clear()


# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# --- API ENDPOINTS ---
@app.get("/")
async def read_root():
    return {"status": "JusticeAI Local Backend is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    if "router_chain" not in ml_models:
        raise HTTPException(status_code=503, detail="Chains are not ready")

    session_id = request.session_id or str(uuid.uuid4())
    chat_history_list = active_sessions.get(session_id, [])
    formatted_history = "\n".join(chat_history_list)
    user_message = request.message
    
    # 1. Call the router to determine intent
    intent = await ml_models["router_chain"].ainvoke({"user_message": user_message})
    
    response_text = ""
    
    # 2. Route to the appropriate chain
    if "GUIDE" in intent:
        print("--- Routing to Guide Chain ---")
        # In a real app, you'd get the classification from the case state
        classification = "POCSO" if "minor" in user_message or "age" in user_message else "BNS_General"
        response_text = await ml_models["guide_chain"].ainvoke({
            "question": user_message, 
            "chat_history": formatted_history,
            "classification": classification
        })
    elif "FORM_FILLER" in intent:
        print("--- Routing to Form-Filler Chain ---")
        response_text = await ml_models["form_filler_chain"].ainvoke({
            "question": user_message, 
            "chat_history": formatted_history
        })
    else: # Default to Q&A
        print("--- Routing to Q&A Chain ---")
        response_text = await ml_models["qa_chain"].ainvoke({
            "question": user_message, 
            "chat_history": formatted_history
        })

    # 3. Update history and return response
    chat_history_list.append(f"Officer: {user_message}")
    chat_history_list.append(f"AI Guide: {response_text}")
    active_sessions[session_id] = chat_history_list
    
    return ChatResponse(response=response_text, session_id=session_id)