
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Pattern } from "./GrokDebugger";

interface PatternManagerProps {
  patterns: Pattern[];
  onUpdatePattern: (pattern: Pattern) => void;
  onRemovePattern: (id: string) => void;
}

const PatternManager: React.FC<PatternManagerProps> = ({ 
  patterns, 
  onUpdatePattern, 
  onRemovePattern 
}) => {
  return (
    <div className="space-y-4">
      {patterns.map((pattern) => (
        <div key={pattern.id} className="space-y-3 pb-4 border-b border-elastic-charcoal last:border-b-0 last:pb-0">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pattern name"
              className="flex-1 bg-elastic-dark border-elastic-charcoal"
              value={pattern.name}
              onChange={(e) => onUpdatePattern({ ...pattern, name: e.target.value })}
            />
            {patterns.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemovePattern(pattern.id)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <Textarea
            placeholder="%{PATTERN_NAME:field_name} %{ANOTHER_PATTERN:another_field}"
            className="font-mono text-sm bg-elastic-dark border-elastic-charcoal"
            value={pattern.pattern}
            onChange={(e) => onUpdatePattern({ ...pattern, pattern: e.target.value })}
            rows={3}
          />
          <div className="text-xs text-muted-foreground">
            <span>Example patterns: </span>
            <code className="px-1 py-0.5 rounded bg-elastic-charcoal">{"%" + "{TIMESTAMP_ISO8601:timestamp}"}</code>
            <span>, </span>
            <code className="px-1 py-0.5 rounded bg-elastic-charcoal">{"%" + "{IP:client_ip}"}</code>
            <span>, </span>
            <code className="px-1 py-0.5 rounded bg-elastic-charcoal">{"%" + "{LOGLEVEL:log_level}"}</code>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatternManager;
