import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';

export default function ImportGrades({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [filePath, setFilePath] = useState(''); // state to store the file path to be used for uploading
    const [success, setSuccess] = useState(false);
    const [duplicates, setDuplicates] = useState(0);
    // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);

    // these three state variables correspond to the dropdowns for course, semester, and academic year
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

    const [isRetake, setIsRetake] = useState("0");

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
    }, [])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFilePath(file.path);
        }
    };

    const handleUpload = async () => {
        if (filePath) { // if there is a file path, read the file
            const records = await window.ipcRenderer.readGradeFile(filePath); // read the file and get student id and grade pairs
            let dupes = 0;
            for(const record of records) {
                const response = await window.ipcRenderer.importGrade(record[0], 
                                                selectedCourse, 
                                                selectedSemester, 
                                                selectedAcademicYear, 
                                                isRetake, 
                                                record[1]);
                if(response.success === false) dupes++;
            }

            setSuccess(true);
            if(dupes > 0) setDuplicates(dupes);
            setTimeout(() => {
                setDuplicates(0); 
                setSuccess(false);
            }, 8000); 
        }
    };

    // when the user selects a course, we store the course code in a state variable to be used for uploading
    const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
    const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
    const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };
    const handleIsRetakeChange = (event: React.ChangeEvent<HTMLInputElement>) => { setIsRetake(event.target.checked === true ? "1" : "0"); }

    return (
        <div className='pt-12 w-1/2 mx-auto'>
            <h2 className="text-3xl font-bold">Import Grade File</h2>
            <p>Upload a CSV file to import module grades.</p>
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
            <div className='flex w-full justify-center gap-2 py-2'>
                <input onChange={handleIsRetakeChange} type="checkbox" id="retake" name="retake"  />
                <label htmlFor="vehicle1" className='font-semibold'>Retakes?</label><br/>
            </div>
        <Button icon={uploadIcon} action={handleUpload} label="Upload" />
        <div className="flex justify-evenly gap-12 pt-6">
            <Button icon={null} label="Back" action={() => Promise.resolve(setView('grades'))}/>
        </div>
        {success && <div className='w-full flex justify-center'><p className="p-4 my-6 rounded-lg shadow-md shadow-black bg-green-700 text-white font-semibold">File uploaded successfully!</p></div>}
        {duplicates > 0 && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-green-700 grayscale-50 text-white font-semibold">Note: {duplicates} imported grades already existed in the database and were skipped.</p></div>}
    </div>
  );
}