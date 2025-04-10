import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';

export default function CourseEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    const [courseEvals, setCourseEvals] = useState<[string, string, string, string][]>([]);

    useEffect(() => {
        window.ipcRenderer.readCourseEvals().then(((result: { id: string, course_id: string, semester_id: number, academic_year_id: string, semester_name: string, academic_year_name: string }[]) => {
            const ce = result.map((e) => [e['id'], e['course_id'], e['semester_name'], e['academic_year_name']] as [string, string, string, string]);
            setCourseEvals(ce);
        }))
    }, [])

    const handleCourseEvaluationDelete = (e: string) => {
        return true;
    }
    
    return (
       <div>
            <h1>Edit Course Evaluation Data</h1>
            <div className='grid grid-cols-5 grid-flow-row items-center bg-stone-600 border border-stone-800 p-2 pb-6 my-12 rounded-lg '>
                <p></p>
                <p className='font-semibold'>ID</p>
                <p className='font-semibold'>Course</p>
                <p className='font-semibold'>Semester</p>
                <p className='font-semibold'>Academic Year</p>
                {courseEvals.map((e, i) => (
                    <Fragment key={e[0] + i}>
                        <button onClick={() => handleCourseEvaluationDelete(e[0])} className='bg-(--color-francis-red) hover:bg-red-700 transition-colors rounded-lg text-sm w-1/2 place-self-center p-1 cursor-pointer'>Delete</button>
                        <p>{e[0]}</p>
                        <p>{e[1]}</p>
                        <p>{e[2]}</p>
                        <p>{e[3]}</p>
                    </Fragment>
                ))}

            </div>
            <div className="flex justify-evenly gap-12 py-12">
                <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
            </div>
       </div>
    );
}