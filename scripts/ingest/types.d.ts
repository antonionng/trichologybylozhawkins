declare module "mammoth" {
  interface ExtractRawTextResult {
    value: string;
    messages: any[];
  }

  interface ExtractOptions {
    path?: string;
    buffer?: Buffer;
  }

  export function extractRawText(options: ExtractOptions): Promise<ExtractRawTextResult>;
  export function convertToHtml(options: ExtractOptions): Promise<{ value: string; messages: any[] }>;
}

declare module "officeparser" {
  type ParseCallback = (error: Error | null, data: string) => void;
  
  export function parseOffice(
    filePath: string,
    callback: ParseCallback
  ): void;
  
  export function parseOffice(
    filePath: string,
    options: { newlineDelimiter?: string; ignoreNotes?: boolean },
    callback: ParseCallback
  ): void;
}

