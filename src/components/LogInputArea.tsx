
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface LogInputAreaProps {
  logInput: string;
  setLogInput: (value: string) => void;
}

const LogInputArea: React.FC<LogInputAreaProps> = ({ logInput, setLogInput }) => {
  return (
    <div>
      <Textarea 
        placeholder="Paste your log lines here... Each line will be processed separately."
        className="min-h-[250px] font-mono text-sm bg-elastic-darker border-elastic-charcoal resize-y"
        value={logInput}
        onChange={(e) => setLogInput(e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {logInput ? logInput.split('\n').filter(line => line.trim() !== '').length : 0} log lines
      </p>
    </div>
  );
};

export default LogInputArea;
