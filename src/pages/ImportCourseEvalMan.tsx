import React, { useEffect, useState } from 'react';
import Button from '../components/Button';

export default function importCourseEvalMan({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [questions, setQuestions] = useState<[string, string, string, string][]>([]);

    // these three state variables correspond to the dropdowns for course, semester, and academic year
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

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
        
        window.ipcRenderer.readCourseQuestions().then((result: { id: string, question_text: string, type: string, group: string }[]) => {
            const questionsArray = result.map((e) => [e.id, e.question_text, e.type, e.group] as [string, string, string, string]);
            setQuestions(questionsArray);
        });

    }, [])

    // when the user selects a course, we store the course code in a state variable to be used for uploading
    const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
    const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
    const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };

    return (
        <div className='pt-12 w-1/2 mx-auto'>
            <h2 className='font-semibold'>Import Course Evaluations Manually</h2>
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
            <div>
                {questions.map(([id, question_text,type]) => (  
                    <div>
                        <h1 className='flex p-1 w-full' key={id}>
                            {question_text}
                        </h1>
                        <textarea
                            className="w-full p-2 border rounded resize-none bg-white text-black"
                            placeholder="Type here..."
                            style={{ height: "auto" }}
                            onInput={(event) => {
                            const textarea = event.target as HTMLTextAreaElement; // Cast to HTMLTextAreaElement
                            textarea.style.height = "auto"; // Reset the height
                            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
                            }}
                        />
                    </div>
                ))}
            </div>
        <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
    </div>
    );
}