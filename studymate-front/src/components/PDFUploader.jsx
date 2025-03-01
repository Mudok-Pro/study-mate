import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgress } from '@mui/material';

export default function PDFUploader({ onUpload }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10_000_000,
    onDrop: files => handleFileDrop(files),
    disabled: loading
  });

  const handleFileDrop = files => {
    const uploadedFile = files[0];
    if (!uploadedFile) {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);
      setFile(uploadedFile);
      if (onUpload) onUpload(uploadedFile);
    } catch (err) {
      setError('Error processing PDF file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        margin: '20px',
        position: 'relative',
        minHeight: '300px'
      }}
      aria-live="polite"
    >
      <input {...getInputProps()} aria-label="Upload PDF document" />

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <CircularProgress />
          <p>Processing PDF...</p>
        </div>
      )}

      {!loading && fileUrl && (
        <div>
          {/* Use browser's built-in PDF renderer */}
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height="600"
            style={{ maxWidth: '800px' }}
          >
            <div style={{ padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '4px' }}>
              <p>It appears you don't have a PDF plugin for this browser.</p>
              <p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  Click here to download the PDF file.
                </a>
              </p>
            </div>
          </object>
          <p style={{ marginTop: '10px' }}>
            {file?.name || 'uploaded-file.pdf'}
          </p>
        </div>
      )}

      {!loading && !fileUrl && (
        <div style={{ padding: '40px 20px' }}>
          <p>📁 Drag PDF here or click to upload</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            (Max 10MB • Text-based PDFs work best)
          </p>
        </div>
      )}

      {error && (
        <p style={{ 
          color: '#d32f2f', 
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}