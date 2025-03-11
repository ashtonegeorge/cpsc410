import React, { useState } from 'react';
import Button from '../components/Button';

export default function ImportGrades() {
    const [filePath, setFilePath] = useState(''); // state to store the file path to be used for uploading
    const [success, setSuccess] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        setFilePath(file.path);
        }
    };

    const handleUpload = async () => {
        if (filePath) { // if there is a file path, read the file
            const rows = await window.ipcRenderer.readSpreadsheetFile(filePath);
            setSuccess(true);
            console.log(rows);

            setTimeout(() => { // hides success message after ten seconds
                setSuccess(false);
            }, 3000); 
        }
    };

  return (
    <div className='pt-12 w-1/2 mx-auto'>
        <h2 className='font-semibold'>Import Grade File</h2>
        <p>Upload a CSV file to import module grades.</p>
        <div className='w-full flex justify-center py-12'>
            <input 
                id="upload" 
                type="file" 
                accept=".csv, .xls, .xlsx" 
                onChange={handleFileChange} 
                className='text-stone-50 font-semibold text-md file:mr-8 cursor-pointer text-xl rounded-xl leading-6 w-full file:w-1/2 file:bg-(--color-francis-red) file:hover:bg-red-700 file:text-stone-50 file:font-semibold file:border-none file:p-4 file:rounded-xl'
            />
        </div>
      <Button action={handleUpload} label="Upload" />
      {success && <p className='text-green-500 font-semibold text-xl'>File uploaded successfully!</p>}
    </div>
  );
}