import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';

export default function CourseEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    const [courseEvals, setCourseEvals] = useState<[string, string, string, string][]>([]);
    const [markedEvals, setMarkedEvals] = useState<string[]>([]);

    useEffect(() => {
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
                        {/* <button onClick={() => handleCourseEvaluationDelete(e[0])} className='bg-(--color-francis-red) hover:bg-red-700 transition-colors rounded-lg text-sm w-1/2 place-self-center p-1 cursor-pointer'>Delete</button> */}
                        <input className='p-1 w-5 mx-auto' type='checkbox' onChange={(event) => handleEvalChecked(event, e[0])} />
                        <p className='self-center'>{e[0]}</p>
                        <p className='self-center'>{e[1]}</p>
                        <p className='self-center'>{e[2]}</p>
                        <p className='self-center'>{e[3]}</p>
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