import { useState, useEffect } from 'react'; 
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function Courses() {
    // the following 5 lines are React state variables that allow us to track the values of the input fields
    const [createCode, setCreateCode] = useState('');
    const [createName, setCreateName] = useState('');
    const [read, setRead] = useState('');
    const [updateId, setUpdateId] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [del, setDelete] = useState('');

    const [courses, setCourses] = useState<[string, string][]>([]); // this state variable is used to store the courses locally
  
    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: { id: string, name: string }[]) => {
            // the ipc renderer returns an array of objects, we map the array to a tuple of [string, string]
            const n = result.map((e) => [e.id, e.name] as [string, string]);
            setCourses(n);
        });
    }, []);

    const createCourse = async (courseCode: string, courseName: string) => {
        const result = window.ipcRenderer.createCourse(courseCode, courseName);
        console.log(result);
        updateCourses();
    }

    const updateCourses = async () => {
        window.ipcRenderer.readCourses().then((result: { id:string, name: string }[]) => {
            const n = result.map((e) => [e.id, e.name] as [string, string]);
            setCourses(n);
        });
    }

    const readCourse = async (courseId: string) => {
        const result = await window.ipcRenderer.readCourse(courseId);
        if(result == null || result.length == 0) {
            console.log("No results found.");
        } else {
            console.log(result[0].name);
        }
    }

    const updateCourse = async (courseId: string, courseName: string) => {
        const result = await window.ipcRenderer.updateCourse(courseId, courseName);
        console.log(result);
        updateCourses();
    }

    const deleteCourse = async (courseId: string) => {
        const result = await window.ipcRenderer.deleteCourse(courseId);
        console.log(result);
        updateCourses();
    }

    return (
        <>
            <h1>Testing</h1>
            <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Create Course</h2>
                    <TextField label="Course Code" setValue={setCreateCode}/>
                    <TextField label="Course Name" setValue={setCreateName}/>
                    <div className='w-1/2'>
                        <Button icon={null} label="Create Course" action={() => createCourse(createCode, createName)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Read Course</h2>
                    <TextField label="Course Code" setValue={setRead}/>
                    <div className='w-1/2'>
                        <Button icon={null} label="Read Course" action={() => readCourse(read)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Update Course</h2>
                    <TextField label="Course Code" setValue={setUpdateId}/>
                    <TextField label="New Course Name" setValue={setUpdateName} />
                    <div className='w-1/2'>
                        <Button icon={null} label="Update Course" action={() => updateCourse(updateId, updateName)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Delete Course</h2>
                    <TextField label="Course Code" setValue={setDelete}/>
                    <div className='w-1/2'>
                        <Button icon={null} label="Delete Course" action={() => deleteCourse(del)}/>
                    </div>
                </div>
            </div>
            <div className='p-8'>
                <h2 className='text-lg font-bold p-2'>Courses</h2>
                <div className='text-md text-left xl:w-1/4 w-1/2 mx-auto'>
                    {courses.map((course: [string, string], index: number) => { // here we map over the tuple array and render each course
                        return (
                        <div key={course[0] + index}>
                            <p>{course[0]} : {course[1]}</p>
                        </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}