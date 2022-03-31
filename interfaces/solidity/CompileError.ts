export interface CompileError {
  component: string;
  formattedMessage: string;
  message: string;
  severity: "error" | "warning";
  type: "CompileError";
  sourceLocation: {
    end: number;
    file: string;
    start: number;
  };
}
