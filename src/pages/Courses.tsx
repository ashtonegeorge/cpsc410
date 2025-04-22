import { useState, useEffect, Fragment } from 'react'; 
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function Courses({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    // the following 5 lines are React state variables that allow us to track the values of the input fields
    const [createCode, setCreateCode] = useState('');
    const [createName, setCreateName] = useState('');
    const [updateId, setUpdateId] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [del, setDelete] = useState('');

    const [courses, setCourses] = useState<[string, string][]>([]); // this state variable is used to store the courses locally
  
    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: any) => {
            // the ipc renderer returns an array of objects, we map the array to a tuple of [string, string]
            const n = result.map((e: { id: string, name: string }) => [e.id, e.name] as [string, string]);
            setCourses(n);
        });
    }, []);

    const createCourse = async (courseCode: string, courseName: string) => {
        const result = window.ipcRenderer.createCourse(courseCode, courseName);
        updateCourses();
    }

    const updateCourses = async () => {
        window.ipcRenderer.readCourses().then((result: any) => {
            const n = result.map((e: { id:string, name: string }) => [e.id, e.name] as [string, string]);
            setCourses(n);
        });
    }

    const updateCourse = async (courseId: string, courseName: string) => {
        await window.ipcRenderer.updateCourse(courseId, courseName);
        updateCourses();
    }

    const deleteCourse = async (courseId: string) => {
        await window.ipcRenderer.deleteCourse(courseId);
        updateCourses();
    }

    return (
        <div>
            <div className='flex justify-between'>
                <div className='w-1/2 flex flex-col gap-8'>
                    <h1 className="text-3xl font-bold">Courses</h1>
                    <div className='flex flex-col justify-center w-full items-center'>
                        <h2 className="text-lg font-semibold mb-2">Create Course</h2>
                        <TextField label="Course Code" setValue={setCreateCode} placeholder={''}/>
                        <TextField label="Course Name" setValue={setCreateName} placeholder={''}/>
                        <div className=''>
                            <Button icon={null} label="Create Course" action={() => createCourse(createCode, createName)}/>
                        </div>
                    </div>
                    <div className='flex flex-col justify-start w-full items-center'>
                        <h2 className="text-lg font-semibold mb-2">Update Course</h2>
                        <TextField label="Course Code" setValue={setUpdateId} placeholder={''}/>
                        <TextField label="New Course Name" setValue={setUpdateName} placeholder={''} />
                        <div className=''>
                            <Button icon={null} label="Update Course" action={() => updateCourse(updateId, updateName)}/>
                        </div>
                    </div>
                    <div className='flex flex-col justify-start mx-auto items-center col-span-2'>
                        <h2 className="text-lg font-semibold mb-2">Delete Course</h2>
                        <TextField label="Course Code" setValue={setDelete} placeholder={''}/>
                        <div className=''>
                            <Button icon={null} label="Delete Course" action={() => deleteCourse(del)}/>
                        </div>
                    </div>
                </div>
                <div className='w-full m-12'>
                    <div className='bg-stone-300 w-full min-h-11/12 border-2 border-stone-600 rounded-xl overflow-y-auto max-h-[500px] text-stone-900 p-4 text-left'>
                        <div className='text-lg text-left mx-auto grid grid-cols-[0.5fr_2fr] gap-x-2'>
                            <Fragment>
                                <p className='font-semibold text-center'>Course Code : </p> 
                                <p className='font-semibold text-left'> Course Name</p>
                            </Fragment>
                            {courses.map((course: [string, string], index: number) => { // here we map over the tuple array and render each course
                                return (
                                    <Fragment key={course[0] + index}>
                                        <p className='text-center'>{course[0]}:</p>
                                        <p className='text-left'> {course[1]}</p>
                                    </Fragment>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-evenly gap-12 pb-12">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                </div>
            </div>
        </div>
    )
}
