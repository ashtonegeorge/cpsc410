import { useState, useEffect } from 'react'; 
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function Courses() {
    // the following 5 lines are React state variables that allow us to track the values of the input fields
    const [create, setCreate] = useState('');
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

    const createCourse = async (courseName: string) => {
        const result = window.ipcRenderer.createCourse(courseName);
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
                    <TextField label="Course Name" setValue={setCreate}/>
                    <div className='w-1/2'>
                        <Button label="Create Course" action={() => createCourse(create)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Read Course</h2>
                    <TextField label="Course ID" setValue={setRead}/>
                    <div className='w-1/2'>
                        <Button label="Read Course" action={() => readCourse(read)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Update Course</h2>
                    <TextField label="Course ID" setValue={setUpdateId}/>
                    <TextField label="New Course Name" setValue={setUpdateName} />
                    <div className='w-1/2'>
                        <Button label="Update Course" action={() => updateCourse(updateId, updateName)}/>
                    </div>
                </div>
                <div className='flex flex-col justify-center w-full items-center'>
                    <h2>Delete Course</h2>
                    <TextField label="Course ID" setValue={setDelete}/>
                    <div className='w-1/2'>
                        <Button label="Delete Course" action={() => deleteCourse(del)}/>
                    </div>
                </div>
            </div>
            <div>
                <h2 className='text-lg font-bold p-2'>Courses</h2>
                <div className='text-sm'>
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