import { useState } from 'react'
import sfuLogo from './assets/redflash.png'
import './App.css'

function Home() {
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
        {view === 'home' && <Home />} 
        {view === 'about' && <About />}
      </div>
    </main>
  )
}

export default App