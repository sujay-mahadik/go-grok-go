
import React from 'react';
import { ParsedResult } from "./GrokDebugger";
import { Badge } from "@/components/ui/badge";

interface ResultsViewerProps {
  results: ParsedResult[];
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ results }) => {
  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div key={index} className="border border-elastic-charcoal rounded-md overflow-hidden">
          <div className="bg-elastic-charcoal/20 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Line {result.lineNumber}</span>
              {result.parsed ? (
                <Badge className="bg-elastic-success">Matched</Badge>
              ) : (
                <Badge variant="destructive">No Match</Badge>
              )}
            </div>
          </div>
          
          <div className="p-3 border-b border-elastic-charcoal bg-elastic-darker">
            <code className="text-sm break-all">{result.line}</code>
          </div>
          
          {result.error ? (
            <div className="p-3 bg-destructive/10 text-destructive text-sm">
              Error: {result.error}
            </div>
          ) : result.parsed ? (
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {Object.entries(result.parsed).map(([key, value]) => (
                <div key={key} className="flex">
                  <div className="font-medium text-sm min-w-[120px] text-elastic-primary">{key}:</div>
                  <div className="text-sm break-all">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground italic">
              No fields extracted. Pattern did not match.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResultsViewer;
