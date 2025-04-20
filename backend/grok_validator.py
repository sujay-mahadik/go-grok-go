
#!/usr/bin/env python3
"""
Grok Pattern Validator

This module provides functions to validate and test Grok patterns against log lines.
In a real-world scenario, this would be exposed as an API endpoint that the frontend calls.
"""

import json
import re
from typing import Dict, List, Any, Optional, Union
import pygrok
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests for development

class GrokValidator:
    """Class to validate and test Grok patterns against log lines."""
    
    def __init__(self):
        """Initialize the validator."""
        # Common Grok patterns are already included in pygrok
        self.custom_patterns = {}
    
    def add_custom_pattern(self, pattern_name: str, pattern: str) -> None:
        """Add a custom Grok pattern."""
        self.custom_patterns[pattern_name] = pattern
    
    def parse_log_line(self, line: str, pattern: str) -> Dict[str, Any]:
        """
        Parse a log line using the provided Grok pattern.
        
        Args:
            line: The log line to parse
            pattern: The Grok pattern to use
            
        Returns:
            A dictionary with the parsed fields or None if pattern doesn't match
        """
        try:
            grok_pattern = pygrok.Grok(pattern, custom_patterns=self.custom_patterns)
            result = grok_pattern.match(line)
            return result
        except Exception as e:
            return None
    
    def validate_patterns(
        self, 
        log_lines: List[str], 
        patterns: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        Validate Grok patterns against multiple log lines.
        
        Args:
            log_lines: List of log lines to validate
            patterns: List of pattern dictionaries with 'name' and 'pattern' keys
            
        Returns:
            A list of validation results
        """
        results = []
        
        for i, line in enumerate(log_lines):
            line = line.strip()
            if not line:  # Skip empty lines
                continue
                
            matched = False
            parsed_result = None
            error = None
            
            # Try each pattern until one matches
            for pattern_dict in patterns:
                try:
                    pattern = pattern_dict['pattern']
                    parsed = self.parse_log_line(line, pattern)
                    
                    if parsed:
                        matched = True
                        parsed_result = parsed
                        break
                except Exception as e:
                    error = f"Error in pattern '{pattern_dict['name']}': {str(e)}"
            
            result = {
                "lineNumber": i + 1,
                "line": line,
                "parsed": parsed_result,
            }
            
            if error and not matched:
                result["error"] = error
                
            results.append(result)
            
        return results
                
    def generate_logstash_syntax(self, pattern: str) -> str:
        """
        Generate Logstash configuration syntax for a Grok pattern.
        
        Args:
            pattern: The Grok pattern
            
        Returns:
            Logstash configuration snippet
        """
        return f"""filter {{
  grok {{
    match => {{ "message" => "{pattern}" }}
  }}
}}"""


@app.route('/api/validate', methods=['POST'])
def validate():
    """API endpoint to validate Grok patterns."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
            
        log_lines = data.get('logLines', [])
        patterns = data.get('patterns', [])
        
        if not log_lines:
            return jsonify({"success": False, "error": "No log lines provided"}), 400
            
        if not patterns:
            return jsonify({"success": False, "error": "No patterns provided"}), 400
            
        validator = GrokValidator()
        results = validator.validate_patterns(log_lines, patterns)
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/logstash-syntax', methods=['POST'])
def generate_syntax():
    """API endpoint to generate Logstash syntax."""
    try:
        data = request.json
        pattern = data.get('pattern', '')
        
        if not pattern:
            return jsonify({"success": False, "error": "No pattern provided"}), 400
            
        validator = GrokValidator()
        syntax = validator.generate_logstash_syntax(pattern)
        
        return jsonify({"success": True, "syntax": syntax})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    # This would be the script that runs the Flask API server
    app.run(debug=True, port=5000)

# Requirements (for pip install):
# flask==2.0.1
# flask-cors==3.0.10
# pygrok==1.0.0
