const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
app.use(cors());

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to handle PDF upload and text extraction
app.post('/analyze-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);

    // Extracted text from PDF
    const extractedText = pdfData.text;

    console.log('PDF successfully processed.');
    res.json({ text: extractedText });
  } catch (error) {
    console.error('Error processing PDF:', error.message);
    res.status(500).json({ error: 'Failed to process the PDF.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
