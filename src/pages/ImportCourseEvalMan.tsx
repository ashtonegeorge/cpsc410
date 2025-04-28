import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import pencilIcon from "/edit.svg";

export default function ImportCourseEvalMan({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [questions, setQuestions] = useState<[string, string, string, string, string][]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [success, setSuccess] = useState<boolean>();

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
        
        window.ipcRenderer.readManualCourseQuestions().then((result: { id: string, question_text: string, type: string, category: string, manual: string }[]) => {
            const questionsArray = result.map((e) => [e.id, e.question_text, e.type, e.category, e.manual] as [string, string, string, string, string]);
            setQuestions(questionsArray);
            const answersArray: string[] = [];
            questionsArray.forEach((q) => answersArray.push(q[2] === "likert" ? '5' : ''))
            setAnswers(answersArray);
        });
    }, [])

    // when the user selects a course, we store the course code in a state variable to be used for uploading
    const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
    const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
    const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };

    const handleUpload = async () => {
        try {
            await window.ipcRenderer.importCourseEvaluationManual(selectedCourse, selectedSemester, selectedAcademicYear, questions, answers)
            const answersArray: string[] = [];
            questions.forEach((q) => answersArray.push(q[2] === "likert" ? '5' : ''))
            setAnswers(answersArray);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch {
            console.log('fail');
        }
    }

    return (
        <div className='w-2/3 pb-12 mx-auto'>
            <h2 className="text-3xl font-bold">Import Course Evaluations Manually</h2>
            <div className='flex justify-evenly align-middle gap-4 pt-12'>
                <div>
                    <h1 className='font-semibold'>Course</h1>
                    <select onChange={handleSelectedCourseChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        {courses.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {id}: {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <h1 className='font-semibold'>Semester</h1>
                    <select onChange={handleSelectedSemesterChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        {semesters.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <h1 className='font-semibold'>Academic Year</h1>
                    <select onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        {academicYears.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <div>
                    {questions.map((q, i) => (
                        <div key={q[0]} className='pb-6'>
                            <h1 className="flex p-1 w-full text-left">{q[1]}</h1>
                            { q[2] === "likert" ? 
                                <div>
                                    <select 
                                        className='text-black bg-white p-2 rounded-lg my-2 w-full'
                                        value={answers[i]}
                                        onChange={(event) => {
                                            const newAnswers = [...answers]; // Create a copy of the answers array
                                            newAnswers[i] = event.target.value; // Update the specific answer
                                            setAnswers(newAnswers); // Update the state
                                        }}
                                    >
                                        <option value='5'>Highly Agree</option>
                                        <option value='4'>Agree</option>
                                        <option value='3'>Neutral</option>
                                        <option value='2'>Disagree</option>
                                        <option value='1'>Highly Disagree</option>
                                    </select>
                                </div> 
                            : 
                                <div>
                                    <textarea
                                        className="w-full p-2 border rounded resize-none bg-white text-black"
                                        placeholder="Type here..."
                                        style={{ height: "auto" }}
                                        value={answers[i]} // Bind the value to the corresponding entry in the answers array
                                        onChange={(event) => {
                                            const newAnswers = [...answers]; // Create a copy of the answers array
                                            newAnswers[i] = event.target.value; // Update the specific answer
                                            setAnswers(newAnswers); // Update the state
                                        }}
                                        onInput={(event) => {
                                            const textarea = event.target as HTMLTextAreaElement;
                                            textarea.style.height = "auto"; 
                                            textarea.style.height = `${textarea.scrollHeight}px`; 
                                        }}
                                    />
                                    <p className='font-semibold text-sm'>If no response was given, please enter N/A.</p>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
            <div className='pt-6 pb-4'>
                <Button icon={null} label="Submit" action={handleUpload}/>
            </div>
            {success && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-green-700 text-white font-semibold">Evaluation added successfully!</p></div>}
            <div className="flex gap-4 pb-6">
                <Button label="Add Questions" action={() => Promise.resolve(setView('addCourseQuestions'))} icon={null}/>
                <Button label="Edit Questions" action={() => Promise.resolve(setView('editCourseQuestions'))} icon={pencilIcon}/>
            </div>
            <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
        </div>
    );
}