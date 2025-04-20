
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pygrok
import logging
from logging.handlers import RotatingFileHandler
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        RotatingFileHandler("grok_validator.log", maxBytes=10485760, backupCount=3),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("grok-validator")

app = FastAPI(title="Grok Pattern Validator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pattern(BaseModel):
    name: str
    pattern: str

class ValidationRequest(BaseModel):
    logLines: List[str]
    patterns: List[Pattern]

class ParsedResult(BaseModel):
    lineNumber: int
    line: str
    parsed: Optional[Dict[str, str]] = None
    error: Optional[str] = None

class ValidationResponse(BaseModel):
    success: bool
    results: List[ParsedResult]
    error: Optional[str] = None

class GrokValidator:
    def __init__(self):
        self.custom_patterns = {}
    
    def add_custom_pattern(self, pattern_name: str, pattern: str):
        self.custom_patterns[pattern_name] = pattern
    
    def parse_log_line(self, line: str, pattern: str):
        try:
            grok_pattern = pygrok.Grok(pattern, custom_patterns=self.custom_patterns)
            result = grok_pattern.match(line)
            return result
        except Exception as e:
            logger.error(f"Error parsing line with pattern {pattern}: {str(e)}")
            logger.error(traceback.format_exc())
            return None

@app.post("/api/validate", response_model=ValidationResponse)
async def validate_patterns(request: ValidationRequest):
    logger.info(f"Received validation request with {len(request.logLines)} log lines and {len(request.patterns)} patterns")
    
    if not request.logLines:
        raise HTTPException(status_code=400, detail="No log lines provided")
        
    if not request.patterns:
        raise HTTPException(status_code=400, detail="No patterns provided")
    
    validator = GrokValidator()
    results = []
    
    for i, line in enumerate(request.logLines):
        if not line.strip():
            results.append(ParsedResult(
                lineNumber=i+1,
                line=line,
                error="Empty log line"
            ))
            continue
            
        # Try each pattern until one matches
        matched = False
        parsed_result = None
        error = None
        
        for pattern_obj in request.patterns:
            try:
                pattern = pattern_obj.pattern
                parsed = validator.parse_log_line(line, pattern)
                
                if parsed:
                    matched = True
                    parsed_result = parsed
                    break
            except Exception as e:
                error = f"Error in pattern '{pattern_obj.name}': {str(e)}"
                logger.error(error)
        
        result = ParsedResult(
            lineNumber=i+1,
            line=line,
            parsed=parsed_result,
        )
        
        if error and not matched:
            result.error = error
            
        results.append(result)
    
    logger.info(f"Completed validation with {len(results)} results")
    return ValidationResponse(success=True, results=results)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
