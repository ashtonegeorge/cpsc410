import { useEffect, useState } from 'react'
import sfuLogo from './assets/redflash.png'
import './App.css'
// the following imports are dedicated pages

import { Home, Courses, About, GuestEval, Grades, AcademicYear, CourseEval, ImportGrades, GradeMetrics, GuestEvalMetrics, GuestLecturers, ImportGuestEval, GuestEvalEdit, CourseEvalEdit, ImportCourseEval, ImportCourseEvalMan, ImportGuestEvalMan } from './pages';
import GuestEvalMan from './pages/ImportGuestEvalMan';

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
        <div className='px-8 sm:w-1/3'>
          <div className='flex justify-start'>
            <button className={`p-2 hover:text-red-500 transition-colors ${view == 'home' ? 'text-red-500 glow' : ''}`} onClick={() => setView('home')}>Home</button>
            <button className={`p-2 hover:text-red-500 transition-colors ${view == 'about' ? 'text-red-500 glow' : ''}`} onClick={() => setView('about')}>About</button>
          </div>
        </div>
        <h1 className='font-bold text-4xl sm:w-1/3'>Evalu8</h1>
        <div className='sm:w-1/3 h-10'>
          <img src={sfuLogo} alt='logo' className='ml-auto h-10 px-8 glow' />
        </div>
      </nav>
      <div className='p-4 pt-18 h-[100vh]'>
        {/* the following lines are conditional rendering. each line employs "short-circuit evaluation" meaning */}
        {/* when the left statement is true, perform the right statement, which in our case renders a component */}
        {view === 'home' && <Home setView={setView} />}
        {view === 'about' && <About />}
        {view === 'courses' && <Courses setView={setView} />}
        {view === 'grades' && <Grades setView={setView} />}
        {view === 'importGrades' && <ImportGrades setView={setView}/>}
        {view === 'gradeMetrics' && <GradeMetrics setView={setView} />}
        {view === 'guestEval' && <GuestEval setView={setView} />}
        {view === 'guestLecturers' && <GuestLecturers />}
        {view === 'guestEvalEdit' && <GuestEvalEdit setView={setView} />}
        {view === 'importGuestEval' && <ImportGuestEval setView={setView} />}
        {view === 'guestEvalmetrics' && <GuestEvalMetrics setView={setView} />}
        {view === 'importGuestEvalMan' && <ImportGuestEvalMan />}
        {view === 'courseEval' && <CourseEval setView={setView} />}
        {view === 'importCourseEval' && <ImportCourseEval setView={setView} />}
        {view === 'importCourseEvalMan' && <ImportCourseEvalMan setView={setView} />}
        {view === 'academicYear' && <AcademicYear />}
        {view === 'courseEvalEdit' && <CourseEvalEdit setView={setView} />}
      </div>
    </main>
  )
}

export default App
