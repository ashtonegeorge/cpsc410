import Button from "../components/Button";

export default function Home({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
      <div>
        <h2>Home</h2>
        <p>Welcome to Evalu8, the solution for your grade and survey reporting needs.</p>
        <div className='block pt-24'>
            <div className="flex justify-evenly gap-12 pb-12">
                <Button label="Course Evaluations" action={() => Promise.resolve(setView('courseEval'))}/>
                <Button label="Guest Speaker Evaluations" action={() => Promise.resolve(setView('guestEval'))}/>
                <Button label="Module Grades" action={() => Promise.resolve(setView('grades'))}/>
            </div>
            <div className="flex justify-evenly gap-12 w-2/3 mx-auto">
                <Button label="Courses" action={() => Promise.resolve(setView('courses'))}/>
                <Button label="Academic Year" action={() => Promise.resolve(setView('academicYear'))}/>
            </div>
        </div>
      </div>
    );
  }