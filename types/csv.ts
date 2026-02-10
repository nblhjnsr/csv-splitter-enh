export interface FileData {
  baseName: string;
  fileName: string;
  headerLine: string;
  headerCols: string[];
  dataLines: string[];
  totalRows: number;
}

export interface SplitFile {
  blob: Blob;
  name: string;
  rowCount: number;
}
