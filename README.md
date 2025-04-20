
# Grok Pattern Debugger

A powerful tool for debugging and testing Grok patterns against log data. This application helps developers and system administrators to validate Grok patterns used in log parsing tools like Logstash, Fluentd, and others.

## Features

- Interactive log input area
- Pattern management (add, edit, delete patterns)
- Real-time pattern validation
- Visualized parsed output
- Logstash syntax generation
- Pattern testing against sample logs

## Project Structure

The project consists of two parts:

1. **Frontend**: React application with TypeScript and Tailwind CSS
2. **Backend**: Python Flask API for Grok pattern validation

## Frontend Setup

The frontend is built with:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

To run the frontend:

```sh
npm install
npm run dev
```

## Backend Setup

The backend requires Python 3.7+ and the following packages:
- flask
- flask-cors
- pygrok

To set up the backend:

```sh
cd backend
pip install flask flask-cors pygrok
python grok_validator.py
```

This will start the Flask API server on port 5000.

## How to Use

1. Enter your log lines in the "Log Input" section
2. Define your Grok patterns in the "Pattern Editor"
3. Click "Validate Patterns" to test your patterns against the log lines
4. View the parsed results in the "Validation Results" section
5. Generate Logstash-compatible syntax using the "Generate Logstash Syntax" button

## Common Grok Patterns

Here are some commonly used Grok patterns:

- `%{TIMESTAMP_ISO8601:timestamp}` - Matches ISO8601 timestamps
- `%{LOGLEVEL:log_level}` - Matches common log levels (INFO, WARN, ERROR, etc.)
- `%{IP:client_ip}` - Matches IPv4 addresses
- `%{GREEDYDATA:message}` - Matches any remaining text

## Example

Input log line:
```
2023-04-15T12:34:56.789Z INFO [app-name] Request from 192.168.1.1 processed successfully
```

Grok pattern:
```
%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:log_level} \[%{WORD:app_name}\] %{GREEDYDATA:message}
```

This would parse the log line into:
- timestamp: `2023-04-15T12:34:56.789Z`
- log_level: `INFO`
- app_name: `app-name`
- message: `Request from 192.168.1.1 processed successfully`
