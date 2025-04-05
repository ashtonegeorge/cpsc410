/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';

interface EvalQuestion {
    questionText: string;
    likertAnswers: number[];
    likertAverage: number;
    openResponses: string[];
}

export default function ImportGuestEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    const [filePath, setFilePath] = useState(''); // state to store the file path to be used for uploading
        const [success, setSuccess] = useState(false);
        // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
        const [courses, setCourses] = useState<[string, string][]>([]);
        const [semesters, setSemesters] = useState<[string, string][]>([]);
        const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
        const [guests, setGuests] = useState<[string, string, string][]>([]);
    
        // these three state variables correspond to the dropdowns for course, semester, and academic year
        const [selectedCourse, setSelectedCourse] = useState('');
        const [selectedSemester, setSelectedSemester] = useState('');
        const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
        const [selectedGuest, setSelectedGuest] = useState('');
    
        useEffect(() => {
            window.ipcRenderer.readCourses().then((result: any) => {
                // unfortunately we can't directly reference the state variable, so we have to create a new array
                const coursesArray = result.map((e: { id: string, name: string }) => [e.id, e.name] as [string, string]);
                setCourses(coursesArray);
                if (coursesArray.length > 0) { // we set the selected course to the first course in the array by default since that is the first (and automatically selected) course in the dropdown
                    setSelectedCourse(coursesArray[0][0]);
                }
            });
            window.ipcRenderer.readSemesters().then((result: { id: string, name: string }[]) => {
                const semestersArray = result.map((e) => [e.id, e.name] as [string, string]);
                setSemesters(semestersArray);
                if (semestersArray.length > 0) {
                    setSelectedSemester(semestersArray[0][0]);
                }
            });
            window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
                const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
                setAcademicYears(academicYearsArray);
                if (academicYearsArray.length > 0) {
                    setSelectedAcademicYear(academicYearsArray[0][0]);
                }
            });
            window.ipcRenderer.readGuestLecturers().then((result: any) => {
                const guestsArray = result.map((e: { id: string; fname: string; lname: string; }) => [e.id, e.fname, e.lname] as [string, string, string]);
                setGuests(guestsArray);
                if (guestsArray.length > 0) {
                    setSelectedGuest(guestsArray[0][0]);
                }
            });
        }, [])
    
        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                setFilePath(file.path);
            }
        };
    
        const handleUpload = async () => {
            if (filePath) { // if there is a file path, read the file
                const records = await window.ipcRenderer.readGuestEvalFile(filePath); // read the file and get student id and grade pairs
                window.ipcRenderer.importGuestEvaluation(selectedGuest, selectedCourse, selectedSemester, selectedAcademicYear, records);

                setSuccess(true);
                setTimeout(() => { // hides success message after ten seconds
                    setSuccess(false);
                }, 3000); 
            }
        };
    
        // when the user selects a course, we store the course code in a state variable to be used for uploading
        const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
        const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
        const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };
        const handleSelectedGuestChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedGuest(event.target.value); };

    return (
        <div className='pt-12 w-1/2 mx-auto'>
                    <h2 className='font-semibold'>Import Guest Evaluation File</h2>
                    <p>Upload a CSV file to import guest evaluations.</p>
                    <div className='w-full flex justify-center my-4 cursor-pointer'>
                        <input 
                            id="upload" 
                            type="file" 
                            accept=".csv, .xls, .xlsx" 
                            onChange={handleFileChange} 
                            className='text-stone-50 font-semibold text-md file:mr-8 cursor-pointer text-xl rounded-xl leading-6 w-full file:w-1/2 file:bg-(--color-francis-red) file:hover:bg-red-700 file:text-stone-50 file:font-semibold file:border-none file:p-4 file:rounded-xl'
                        />
                    </div>
                    <div>
                        <h1 className='font-semibold'>Select Guest Lecturer</h1>
                        <select onChange={handleSelectedGuestChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            {guests.map(([id, fname, lname]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {lname}, {fname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h1 className='font-semibold'>Select Course</h1>
                        <select onChange={handleSelectedCourseChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            {courses.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {id}: {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h1 className='font-semibold'>Select Semester</h1>
                        <select onChange={handleSelectedSemesterChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            {semesters.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h1 className='font-semibold'>Select Academic Year</h1>
                        <select onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            {academicYears.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                <Button icon={uploadIcon} action={handleUpload} label="Upload" />
                <div className='mt-2'>
                    <div className="flex justify-center pb-12">
                                <div className="text-white rounded-xl p-2 text-sm border-none">
                                <Button icon={null} label="Back" action={() => Promise.resolve(setView('guestEval'))}/>
                            </div>
                        </div>
                    </div>
                {success && <p className='text-green-500 font-semibold text-xl'>File uploaded successfully!</p>}
            </div>
          );
}
