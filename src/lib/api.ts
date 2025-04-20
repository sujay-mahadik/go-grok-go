
import { Pattern, ParsedResult } from "@/components/GrokDebugger";

interface ValidationRequest {
  logLines: string[];
  patterns: { name: string; pattern: string }[];
}

interface ValidationResponse {
  success: boolean;
  results: ParsedResult[];
  error?: string;
}

// API client to call our FastAPI backend for Grok pattern validation
export const validateGrokPatterns = async (
  request: ValidationRequest
): Promise<ValidationResponse> => {
  console.log("Validating patterns:", request);
  
  try {
    // In production, this would point to your actual FastAPI endpoint
    // For local development, use http://localhost:8000/api/validate
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/validate';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in validateGrokPatterns:", error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

// Generate Logstash syntax from a pattern
export const generateLogstashSyntax = (pattern: string): string => {
  return `filter {
  grok {
    match => { "message" => "${pattern}" }
  }
}`;
};
