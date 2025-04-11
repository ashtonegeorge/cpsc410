import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';

export default function CourseEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    const [courseEvals, setCourseEvals] = useState<[string, string, string, string][]>([]);
    const [markedEvals, setMarkedEvals] = useState<string[]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);

    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: any) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const coursesArray = result.map((e: { id: string, name: string }) => [e.id, e.name] as [string, string]);
            console.log(coursesArray);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
        window.ipcRenderer.readSemesters().then((result: { id: string, name: string }[]) => {
            const semestersArray = result.map((e) => [e.id, e.name] as [string, string]);
            setSemesters(semestersArray);
        });
        updateCourseEvals()
    }, [])

    const handleDeleteCourseEvaluation = async () => {
        // console.log(markedEvals)
        markedEvals.forEach((e) => {
            window.ipcRenderer.deleteCourseEvaluation(e);
        })
        updateCourseEvals()
        setMarkedEvals([]);
    }

    const updateCourseEvals = async () => {
        window.ipcRenderer.readCourseEvals().then(((result: { id: string, course_id: string, semester_id: number, academic_year_id: string, semester_name: string, academic_year_name: string }[]) => {
            const ce = result.map((e) => [e['id'], e['course_id'], e['semester_name'], e['academic_year_name']] as [string, string, string, string]);
            setCourseEvals(ce);
        }))
    }

    const handleEvalChecked = (event: React.ChangeEvent<HTMLInputElement>, evalId: string) => {
        if(event.target.checked) {
            setMarkedEvals([...markedEvals, evalId]);
        } else {
            const e = markedEvals.filter(i => i !== evalId)
            setMarkedEvals(e);
        }
    }
    
    function handleCourseUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        console.log(evalId)
    }

    function handleSemesterUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        console.log(evalId)
    }

    function handleAcademicYearUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        console.log(evalId)
    }

    return (
       <div>
            <h1>Edit Course Evaluation Data</h1>
            <div className='grid grid-cols-5 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 pb-6 mt-6 rounded-lg '>
                <p className='font-semibold'>Delete</p>
                <p className='font-semibold'>ID</p>
                <p className='font-semibold'>Course</p>
                <p className='font-semibold'>Semester</p>
                <p className='font-semibold'>Academic Year</p>
                {courseEvals.map((e, i) => (
                    <Fragment key={i}>
                        <input className='p-1 w-5 mx-auto' type='checkbox' onChange={(event) => handleEvalChecked(event, e[0])} />
                        <p className='self-center'>{e[0]}</p>
                        <select className='self-center' onChange={(event) => handleCourseUpdate(event, e[0])}>
                            <option>{e[1]}</option>
                            {courses.length > 0 && courses.map((c) => (
                                    <option key={c[0]}>{c[0]}</option>
                                ))
                            }
                        </select>
                        <select className='self-center' onChange={(event) => handleSemesterUpdate(event, e[0])}>
                            <option>{e[2]}</option>
                            {semesters.length > 0 && semesters.map((s) => (
                                    <option key={s[0]}>{s[1]}</option>
                                ))
                            }
                        </select>
                        <select className='self-center' onChange={(event) => handleAcademicYearUpdate(event, e[0])}>
                            <option>{e[3]}</option>
                            {academicYears.length > 0 && academicYears.map((a) => (
                                    <option key={a[0]}>{a[1]}</option>
                                ))
                            }
                        </select>
                    </Fragment>
                ))}

            </div>
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto">
                    <Button icon={null} label="Delete" action={handleDeleteCourseEvaluation}/>
                </div>
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
                </div>
       </div>
    );
}