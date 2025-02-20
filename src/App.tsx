import { useEffect, useState } from 'react'
import sfuLogo from './assets/redflash.png'
import './App.css'

interface AppState {
  setView: (view: string) => void;
}

function Home({setView}: AppState) {
  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to Evalu8, the solution for your grade and survey reporting needs.</p>
      <div className='flex justify-evenly pt-24'>
        <button className='bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded' onClick={() => setView('courseEvaluations')}>
          Course Evaluations
        </button>
        <button className='bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded' onClick={() => setView('guestSpeakerEvaluations')}>
          Guest Speaker Evaluations
        </button>
        <button className='bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded' onClick={() => setView('moduleGrades')}>
          Module Grades
        </button>
      </div>
    </div>
  );
}

function About() {
  return <h2>About</h2>;
}

function Course() {
  const [create, setCreate] = useState('');
  const [read, setRead] = useState('');
  const [updateId, setUpdateId] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [del, setDelete] = useState('');
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    window.ipcRenderer.readCourses().then((result: { course_name: string }[]) => {
      const n = result.map((e) => e.course_name);
      setCourses(n);
    });
  }, []);

  const createCourse = async (courseName: string) => {
    const result = window.ipcRenderer.createCourse(courseName);
    console.log(result);
  }

  const updateCourses = async () => {
    window.ipcRenderer.readCourses().then((result: { course_name: string }[]) => {
      const n = result.map((e) => e.course_name);
      setCourses(n);
    });
  }

  const readCourse = async (courseId: string) => {
    const result = await window.ipcRenderer.readCourse(courseId);
    console.log(result[0].course_name);
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
          <input placeholder='Name' className='bg-white rounded-lg h-12 w-2/3 focus:border-red-700 focus:border-4 text-black p-2' type='text' value={create} onChange={(e) => setCreate(e.target.value)} />
          <button className='hover:cursor-pointer' onClick={() => createCourse(create)}>Submit</button>
        </div>
        <div className='flex flex-col justify-center w-full items-center'>
          <h2>Read Course</h2>
          <input placeholder='ID' className='bg-white rounded-lg h-12 w-2/3 focus:border-red-700 focus:border-4 text-black p-2' type='text' value={read} onChange={(e) => setRead(e.target.value)} />
          <button className='hover:cursor-pointer' onClick={() => readCourse(read)}>Submit</button>
        </div>
        <div className='flex flex-col justify-center w-full items-center'>
          <h2>Update Course</h2>
          <input placeholder='ID' className='bg-white rounded-lg h-12 w-2/3 mb-2 focus:border-red-700 focus:border-4 text-black p-2' type='text' value={updateId} onChange={(e) => setUpdateId(e.target.value)} />
          <input placeholder='New name' className='bg-white rounded-lg h-12 w-2/3 focus:border-red-700 focus:border-4 text-black p-2' type='text' value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
          <button className='hover:cursor-pointer' onClick={() => updateCourse(updateId, updateName)}>Submit</button>
        </div>
        <div className='flex flex-col justify-center w-full items-center'>
          <h2>Delete Course</h2>
          <input placeholder='ID' className='bg-white rounded-lg h-12 w-2/3 focus:border-red-700 focus:border-4 text-black p-2' type='text' value={del} onChange={(e) => setDelete(e.target.value)} />
          <button className='hover:cursor-pointer' onClick={() => deleteCourse(del)}>Submit</button>
        </div>
      </div>
      <div>
        <h2 className='text-lg font-bold p-2'>Courses</h2>
        <div className='text-sm'>
          {courses.map((course: any) => {
            return <p key={course}>{course}</p>
          })}
        </div>
      </div>
    </>
  )
}

function App() {
  const [view, setView] = useState('home'); // state to handle what view is displayed

  /**
   * useEffect()
   * This is a test to see if I can call the main process from the renderer process.
   * An event handler, "get-names", is defined in the main.ts file.
   * This event handler is exposed to the renderer process via the preload.ts file. The event is called in the getNames() function.
   */
  // useEffect(() => {
  // any code here
  // }, []); // notice the empty array I pass as the second parameter to the useEffect hook. This is called the dependency array. The fact it is empty tells the hook to only run once, when the component is mounted (when it is rendered on the screen).

  return (
    <main className=''>
      <nav className='flex justify-between bg-stone-600 w-full font-semibold p-2'>
        <div className='px-8'>
          <button className={`p-2 hover:text-red-300 transition-colors ${view == 'home' ? 'text-red-300 glow' : ''}`} onClick={() => setView('home')}>Home</button>
          <button className={`p-2 hover:text-red-300 transition-colors ${view == 'about' ? 'text-red-300 glow' : ''}`} onClick={() => setView('about')}>About</button>
        </div>
        <img src={sfuLogo} alt='logo' className='h-10 px-8 glow' />
      </nav>
      <div className='p-4'>
        <h1 className='font-bold text-4xl'>Evalu8</h1>
        {/* the following lines are conditional rendering. each line employs "short-circuit evaluation" meaning */}
        {/* when the left statement is true, perform the right statement, which renders the component */}
        {view === 'home' && <Home setView={setView} />}
        {view === 'about' && <About />}
        {view === 'courseEvaluations' && <Course />}
      </div>
    </main>
  )
}

export default App