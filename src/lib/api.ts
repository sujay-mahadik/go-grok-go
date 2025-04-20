
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

// This function simulates a backend API call to a Python service
// In a real implementation, this would make an actual API request to a Python backend
export const validateGrokPatterns = async (
  request: ValidationRequest
): Promise<ValidationResponse> => {
  // For demo purposes, we'll simulate the backend validation with a mock response
  // In a production app, this would be an actual fetch to your Python backend
  console.log("Validating patterns:", request);
  
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock processing logic (simulating what the Python backend would do)
    const results: ParsedResult[] = request.logLines.map((line, index) => {
      // Simple mock implementation to demonstrate UI functionality
      // In reality, this would be done by the Python backend using the pygrok library
      
      // For demo purposes, we'll "extract" any words that match common log patterns
      const mockParsed: Record<string, string> = {};
      
      // Only process if we have a non-empty line
      if (line.trim().length === 0) {
        return {
          lineNumber: index + 1,
          line,
          parsed: null,
          error: "Empty log line"
        };
      }
      
      // Simulate timestamp extraction (looking for date-time like pattern)
      const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
      if (timestampMatch) {
        mockParsed.timestamp = timestampMatch[0];
      }
      
      // Simulate log level extraction (looking for common log levels)
      const logLevelMatch = line.match(/\b(INFO|DEBUG|WARN|WARNING|ERROR|CRITICAL|FATAL)\b/i);
      if (logLevelMatch) {
        mockParsed.log_level = logLevelMatch[0];
      }
      
      // Simulate IP address extraction
      const ipMatch = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
      if (ipMatch) {
        mockParsed.client_ip = ipMatch[0];
      }
      
      // If we have nothing extracted and there's pattern input, show an error for some lines
      // This simulates failed pattern matches
      if (Object.keys(mockParsed).length === 0 && request.patterns.some(p => p.pattern.trim())) {
        // For about 20% of lines, show no match instead of error to demonstrate both scenarios
        if (Math.random() > 0.2) {
          return {
            lineNumber: index + 1,
            line,
            parsed: null,
            error: "Pattern did not match this log line"
          };
        }
      }
      
      // For the rest, extract the remainder as message
      if (line) {
        let message = line;
        
        // Remove the parts we've already extracted
        if (timestampMatch) message = message.replace(timestampMatch[0], '');
        if (logLevelMatch) message = message.replace(logLevelMatch[0], '');
        if (ipMatch) message = message.replace(ipMatch[0], '');
        
        mockParsed.message = message.trim();
      }

      return {
        lineNumber: index + 1,
        line,
        parsed: Object.keys(mockParsed).length > 0 ? mockParsed : null
      };
    });

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error("Error in validateGrokPatterns:", error);
    return {
      success: false,
      results: [],
      error: "An error occurred during pattern validation"
    };
  }
};
