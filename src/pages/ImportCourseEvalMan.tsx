import React, { useEffect, useState } from 'react';
import Button from '../components/Button';

export default function importCourseEvalMan({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    // the following three state variables are arrays of tuples, where the first element is the id and the second is the name
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [questions, setQuestions] = useState<[string, string, string][]>([]);
    const [likertGoals, setLikertGoals] = useState<[string, string][]>([]);

    // these three state variables correspond to the dropdowns for course, semester, and academic year
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [selectedLikertGoals, setSelectedLikertGoals] = useState('');

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
        // commenting this out because its not implemented yet
        // window.ipcRenderer.readCourseQuestions().then((result: { id: string, question_text: string, type: string }[]) => {
        //     const questionsArray = result.map((e) => [e.id, e.question_text, e.type] as [string, string, string]);
        //     setQuestions(questionsArray);
        // });

    }, [])

    // when the user selects a course, we store the course code in a state variable to be used for uploading
    const handleSelectedCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCourse(event.target.value); };
    const handleSelectedSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedSemester(event.target.value); };
    const handleSelectedAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAcademicYear(event.target.value); };
    const handleSelectedLikertGoals = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedLikertGoals(event.target.value); };

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
                <h1 className='font-semibold'>The course Program Goals, Course Learning Outcomes, Instructional Objectives, and Syllabus are an effective guide of the material.</h1>
                <select onChange={handleSelectedLikertGoals} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                    <option className='flex p-1 w-full'>Strongly Agree</option>
                    <option className='flex p-1 w-full'>Agree</option>
                    <option className='flex p-1 w-full'>Neutral</option>
                    <option className='flex p-1 w-full'>Disagree</option>
                    <option className='flex p-1 w-full'>Strongly Disagree</option>
                </select>
            </div>
            <div>
                <h1 className='font-semibold'>Overall, I rate this course as excellent.</h1>

            </div>
            <div>
                <h1 className='font-semibold'>The course challenged me to improve upon my understanding of the subject.</h1>
                
            </div>
            <div>
                <h1 className='font-semibold'>The course included instruction in patient evaluation, diagnoses, and management.</h1>

            </div>
            <div>
                <h1 className='font-semibold'>After taking the course, I understand the role of the Physician Assistant in regards to providing care to patients with conditions covered in this course.</h1>
                
            </div>
            <div>
                <h1 className='font-semibold'>The department is always looking for ways to improve the curriculum. What are the reflections regarding the course (for example: course objectives, assessments, labs, etc.)? Please be as specific and provide suggestions, when applicable.</h1>

            </div>
        <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
    </div>
    );
}