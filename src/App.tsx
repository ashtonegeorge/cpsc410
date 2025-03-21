import { useEffect, useState } from 'react'
import sfuLogo from './assets/redflash.png'
import './App.css'
// the following imports are dedicated pages

import { Home, Courses, About, GuestEval, Grades, AcademicYear, CourseEval, ImportGrades, GradeMetrics, GuestEvalMetrics, ImportGuestEval, GuestEvalEdit, CourseEvalEdit, } from './pages';

function App() {
  const [view, setView] = useState('home'); // state to handle what page is displayed

  /**
   * useEffect()
   * this function call is a React "hook" that allows us to perform side effects within components.
   */
  useEffect(() => {
    console.log("homepage loaded!");
  }, []); // notice the empty array I pass as the second parameter to the useEffect hook. This is called the dependency array. The fact it is empty tells the hook to only run once, when the component is mounted (when it is rendered on the screen).

  return (
    <main className='text-center'>
      <nav className='flex justify-between bg-black w-full font-semibold p-2 fixed top-0 border-b-2 border-b-(--color-francis-red)'>
        <div className='px-8'>
          <button className={`p-2 hover:text-red-500 transition-colors ${view == 'home' ? 'text-red-500 glow' : ''}`} onClick={() => setView('home')}>Home</button>
          <button className={`p-2 hover:text-red-500 transition-colors ${view == 'about' ? 'text-red-500 glow' : ''}`} onClick={() => setView('about')}>About</button>
        </div>
        <h1 className='font-bold text-4xl'>Evalu8</h1>
        <img src={sfuLogo} alt='logo' className='h-10 px-8 glow' />
      </nav>
      <div className='p-4 pt-18 h-[100vh]'>
        {/* the following lines are conditional rendering. each line employs "short-circuit evaluation" meaning */}
        {/* when the left statement is true, perform the right statement, which in our case renders a component */}
        {view === 'home' && <Home setView={setView} />}
        {view === 'about' && <About />}
        {view === 'courses' && <Courses />}
        {view === 'grades' && <Grades setView={setView} />}
        {view === 'importGrades' && <ImportGrades />}
        {view === 'gradeMetrics' && <GradeMetrics />}
        {view === 'guestEval' && <GuestEval setView={setView} />}
        {view === 'guestEvalEdit' && <GuestEvalEdit />}
        {view === 'importGuestEval' && <ImportGuestEval />}
        {view === 'guestEvalmetrics' && <GuestEvalMetrics />}
        {view === 'courseEval' && <CourseEval setView={setView} />}
        {view === 'importCourseEval' && <ImportCourseEval setView={setView} />}
        {view === 'academicYear' && <AcademicYear />}
        {view === 'courseEvalEdit' && <CourseEvalEdit/>}

      </div>
    </main>
  )
}

export default App
