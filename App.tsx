import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FilePreview } from './components/FilePreview';
import { SplitSettings } from './components/SplitSettings';
import { SplitResults } from './components/SplitResults';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { FileData, SplitFile } from './types/csv';

export default function App() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [rowsPerFile, setRowsPerFile] = useState(5000);
  const [customPrefix, setCustomPrefix] = useState('');
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileLoaded = (data: FileData) => {
    setFileData(data);
    setCustomPrefix(data.baseName);
    setSplitFiles([]);
  };

  const handleSplit = () => {
    if (!fileData) return;
    
    setIsProcessing(true);
    
    // Use setTimeout to show processing state
    setTimeout(() => {
      const prefix = customPrefix.trim() || fileData.baseName;
      const chunks = Math.ceil(fileData.dataLines.length / rowsPerFile);
      const files: SplitFile[] = [];

      for (let i = 0; i < chunks; i++) {
        const start = i * rowsPerFile;
        const end = Math.min(start + rowsPerFile, fileData.dataLines.length);
        const chunkLines = [fileData.headerLine, ...fileData.dataLines.slice(start, end)];
        const blob = new Blob([chunkLines.join('\n')], { type: 'text/csv' });
        const chunkName = `${prefix}_part${String(i + 1).padStart(String(chunks).length, '0')}.csv`;
        const rowCount = end - start;

        files.push({ blob, name: chunkName, rowCount });
      }

      setSplitFiles(files);
      setIsProcessing(false);
    }, 500);
  };

  const handleReset = () => {
    setFileData(null);
    setSplitFiles([]);
    setCustomPrefix('');
    setRowsPerFile(5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl">
          <Header />

          <AnimatePresence mode="wait">
            {!fileData ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FileUpload onFileLoaded={handleFileLoaded} />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <FilePreview fileData={fileData} />
                
                {splitFiles.length === 0 ? (
                  <SplitSettings
                    fileData={fileData}
                    rowsPerFile={rowsPerFile}
                    customPrefix={customPrefix}
                    onRowsPerFileChange={setRowsPerFile}
                    onCustomPrefixChange={setCustomPrefix}
                    onSplit={handleSplit}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <SplitResults
                    files={splitFiles}
                    prefix={customPrefix || fileData.baseName}
                    onReset={handleReset}
                  />
                )}

                {splitFiles.length === 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleReset}
                    className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-200"
                  >
                    ↻ Start Over
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
