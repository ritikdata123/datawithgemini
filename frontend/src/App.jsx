import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";
import Chat from './Chat';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error('API key is not set in environment variables.');
  }
  // if(apiKey){
  //   console.log(apiKey);
  // }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/analyze-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        const extractedText = response.data.text;
        setPdfText(extractedText);

       

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        Given the following invoice text, extract the customer details, product details, and total amount, and structure the information into a JSON format. Allow for nullable fields where data might be missing. Return only the JSON data and nothing else.
       in this hightlight the details of total products and total_amount
        Invoice Text:

        ${extractedText}
        
        {
          "invoice_no": "123456",
          "date": "08/08/2024",
          "customer_details": {
            "name": "John Doe",
            "address": "1234 Elm Street, Springfield, IL 62704",
            "phone": "(555) 123-4567",
            "email": "johndoe@example.com"
          },
          "products": [
            {
              "name": "Widget A",
              "quantity": 2,
              "price": 10.00
            },
            {
              "name": "Widget B",
              "quantity": 1,
              "price": 15.00
            }
          ],
          "subtotal": 35.00,
          "tax": 3.50,
          "total_amount": 38.50
        }
        `;
      // const prompt = `tell more about some best stories`;
        const aiResponse = await model.generateContent(prompt);
  
        setProcessedText(aiResponse.response.text());
      } 
    } catch (err) {
      console.error('Error uploading and processing the PDF:', err.message)
    }
  };
  
  return (
    <>


   <Chat/>

    <div className="App">
      <h1>Upload Your Invoice</h1>
      <label htmlFor="file-upload" className='labelchoose'>Choose File</label>
<input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfFile && (
        <Document file={pdfFile.stream()}>
          <Page pageNumber={1} />
        </Document>
      )}
      {pdfText && (
        <div>
          <h2>Extracted Text:</h2>
          <p>{pdfText}</p>
        </div>
      )}
      {processedText && (
        <div className='cont'>
          <h2>Processed Text:</h2>
          <pre><code>{processedText.replace(/`/g, "").slice(4)}</code></pre>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
    </>
  );
}

export default App;
