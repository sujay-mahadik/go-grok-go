
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Code, Search, Check, Copy, Settings, Plus, Trash2 } from "lucide-react";
import LogInputArea from "./LogInputArea";
import PatternManager from "./PatternManager";
import ResultsViewer from "./ResultsViewer";
import { validateGrokPatterns, generateLogstashSyntax as generateSyntax } from "@/lib/api";

export type Pattern = {
  id: string;
  name: string;
  pattern: string;
};

export type ParsedResult = {
  lineNumber: number;
  line: string;
  parsed: Record<string, string> | null;
  error?: string;
};

const GrokDebugger: React.FC = () => {
  const { toast } = useToast();
  const [logInput, setLogInput] = useState<string>('');
  const [patterns, setPatterns] = useState<Pattern[]>([
    { id: '1', name: 'Default Pattern', pattern: '%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:log_level} %{GREEDYDATA:message}' },
  ]);
  const [results, setResults] = useState<ParsedResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [logstashSyntax, setLogstashSyntax] = useState<string>('');
  
  const handleAddPattern = () => {
    const newId = (patterns.length + 1).toString();
    setPatterns([...patterns, { id: newId, name: `Pattern ${newId}`, pattern: '' }]);
  };

  const handleRemovePattern = (id: string) => {
    setPatterns(patterns.filter(pattern => pattern.id !== id));
  };

  const handleUpdatePattern = (updatedPattern: Pattern) => {
    setPatterns(patterns.map(p => p.id === updatedPattern.id ? updatedPattern : p));
  };

  const generateLogstashSyntax = () => {
    if (patterns.length === 0) {
      toast({
        title: "No patterns available",
        description: "Please add at least one pattern first",
        variant: "destructive",
      });
      return;
    }

    const selectedPattern = patterns[0];
    const syntax = generateSyntax(selectedPattern.pattern);
    
    setLogstashSyntax(syntax);
    toast({
      title: "Logstash syntax generated",
      description: "The syntax has been generated and is ready to copy",
    });
  };

  const copyLogstashSyntax = () => {
    navigator.clipboard.writeText(logstashSyntax);
    toast({
      title: "Copied to clipboard",
      description: "The Logstash syntax has been copied to your clipboard",
    });
  };

  const validatePatterns = async () => {
    if (!logInput.trim()) {
      toast({
        title: "No log input",
        description: "Please enter log lines to validate",
        variant: "destructive",
      });
      return;
    }

    if (patterns.length === 0 || patterns.some(p => !p.pattern.trim())) {
      toast({
        title: "Invalid patterns",
        description: "Please ensure all patterns are defined",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const logLines = logInput.split('\n').filter(line => line.trim() !== '');
      
      const response = await validateGrokPatterns({
        logLines,
        patterns: patterns.map(p => ({ name: p.name, pattern: p.pattern }))
      });

      if (response.success) {
        setResults(response.results);
        toast({
          title: "Validation successful",
          description: `Processed ${response.results.length} log lines`,
        });
      } else {
        toast({
          title: "Validation failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation error",
        description: "An error occurred during validation",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Code size={32} className="text-elastic-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Grok Pattern Debugger</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-elastic-dark border-elastic-charcoal">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium flex items-center gap-2">
                <Search size={20} className="text-elastic-primary" />
                Log Input
              </h2>
            </div>
            <LogInputArea logInput={logInput} setLogInput={setLogInput} />
          </CardContent>
        </Card>
        
        <Card className="bg-elastic-dark border-elastic-charcoal">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium flex items-center gap-2">
                <Settings size={20} className="text-elastic-primary" />
                Pattern Editor
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleAddPattern}
              >
                <Plus size={16} />
                Add Pattern
              </Button>
            </div>
            <PatternManager 
              patterns={patterns} 
              onUpdatePattern={handleUpdatePattern} 
              onRemovePattern={handleRemovePattern} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          className="bg-elastic-primary hover:bg-elastic-secondary text-white gap-2"
          onClick={validatePatterns}
          disabled={isValidating}
        >
          <Check size={16} />
          {isValidating ? "Validating..." : "Validate Patterns"}
        </Button>
        
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={generateLogstashSyntax}
        >
          <Code size={16} />
          Generate Logstash Syntax
        </Button>
        
        {logstashSyntax && (
          <Button 
            variant="secondary" 
            className="gap-2"
            onClick={copyLogstashSyntax}
          >
            <Copy size={16} />
            Copy Syntax
          </Button>
        )}
      </div>
      
      {logstashSyntax && (
        <Card className="mb-6 bg-elastic-dark border-elastic-charcoal">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Logstash Syntax</h3>
            <pre className="bg-elastic-darker p-4 rounded-md overflow-x-auto text-sm">
              {logstashSyntax}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {results.length > 0 && (
        <Card className="bg-elastic-dark border-elastic-charcoal">
          <CardContent className="p-6">
            <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
              <Check size={20} className="text-elastic-success" />
              Validation Results
            </h2>
            <Tabs defaultValue="structured">
              <TabsList className="mb-4">
                <TabsTrigger value="structured">Structured View</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="structured">
                <ResultsViewer results={results} />
              </TabsContent>
              <TabsContent value="raw">
                <pre className="bg-elastic-darker p-4 rounded-md overflow-x-auto text-sm h-[400px] overflow-y-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrokDebugger;
