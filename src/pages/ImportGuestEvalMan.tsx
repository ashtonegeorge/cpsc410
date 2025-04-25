import React, { useEffect, useState } from 'react';
import Button from '../components/Button';

export default function importGuestEvalMan({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [questions, setQuestions] = useState<[string, string, string, string, string][]>([]);
    const [answers, setAnswers] = useState<string[]>([]);

    // these three state variables correspond to the dropdowns for course, semester, and academic year
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedGuest, setSelectedGuest] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

    useEffect(() => {
        window.ipcRenderer.readGuestLecturers().then((result: any) => {
            const guestsArray = result.map((e: { id: string, fname: string, lname: string }) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(guestsArray);
            setSelectedGuest(guestsArray[0][0]);
        });
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
        
        window.ipcRenderer.readManualGuestQuestions().then((result: { id: string, question_text: string, type: string, category: string, manual: string }[]) => {
            const questionsArray = result.map((e) => [e.id, e.question_text, e.type, e.category, e.manual] as [string, string, string, string, string]);
            setQuestions(questionsArray);
            const answersArray: string[] = [];
            questionsArray.forEach((q) => answersArray.push(q[2] === "likert" ? '1' : ''))
            setAnswers(answersArray);
        });
    }, [])

    // when the user selects a course, we store the course code in a state variable to be used for uploading
    const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
    const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
    const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };
    const handleSelectedGuestChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedGuest(event.target.value); };

    const handleUpload = async () => {
        try {
            await window.ipcRenderer.importGuestEvaluationManual(selectedCourse, selectedGuest, selectedSemester, selectedAcademicYear, questions, answers)
        } catch {
            console.log('fail');
        }
    }

    return (
        <div className='w-2/3 pb-12 mx-auto'>
            <h2 className="text-3xl font-bold">Import Guest Speaker Evaluations Manually</h2>
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
            </div>
            <div className='flex justify-evenly align-middle gap-4 pt-3'>
                <div>
                    <h1 className='font-semibold'>Guest Lecturer</h1>
                    <select onChange={handleSelectedGuestChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        {guests.map(([id, fname, lname]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {lname}, {fname} 
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
                                    <input 
                                        className='w-full outline-0 border border-black text-black bg-white p-2 rounded-lg' 
                                        type='number' 
                                        value={answers[i]}
                                        placeholder={"1"}
                                        min={1}
                                        max={5}
                                        onChange={(event) => {
                                            const newAnswers = [...answers]; 
                                            newAnswers[i] = event.target.value; 
                                            setAnswers(newAnswers); 
                                        }}
                                    />
                                    <p className='font-semibold text-sm'>For likert style questions, enter the average score on a 1-5 scale, where 1 is strongly disagree and 5 is strongly agree.</p>
                                </div> 
                            : 
                                <div>
                                    <textarea
                                        className="w-full p-2 border rounded resize-none bg-white text-black"
                                        placeholder="Type here..."
                                        style={{ height: "auto" }}
                                        value={answers[i]} 
                                        onChange={(event) => {
                                            const newAnswers = [...answers];
                                            newAnswers[i] = event.target.value; 
                                            setAnswers(newAnswers); 
                                        }}
                                        onInput={(event) => {
                                            const textarea = event.target as HTMLTextAreaElement;
                                            textarea.style.height = "auto"; 
                                            textarea.style.height = `${textarea.scrollHeight}px`; 
                                        }}
                                    />
                                    <p className='font-semibold text-sm'>For open response questions, separate each individual response with two slashes <strong>//</strong>. This helps to analyze the responses effectively.</p>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
            <div className='py-6'>
                <Button icon={null} label="Submit" action={handleUpload}/>
            </div>
            <Button icon={null} label="Back" action={() => Promise.resolve(setView('guestEval'))}/>
        </div>
    );
}