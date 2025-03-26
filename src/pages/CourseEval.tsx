import Button from '../components/Button';

export default function CourseEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
            <div>
                <h2>Course Evaluation</h2>
                <div className='block pt-24'>
                    <div className="flex justify-evenly gap-12 pb-12">
                        <Button icon={null} label='Import Course Evaluation File' action={() => Promise.resolve(setView('importCourseEval'))} />
                        <Button icon={null} label="Course Evaluations Metrics" action={() => Promise.resolve(setView('courseEvalMetrics'))}/>
                    </div>
                    <div className="flex justify-evenly gap-12 pb-12">
                        <Button icon={null} label="Import Evaluations Manually" action={() => Promise.resolve(setView('importCourseEvalMan'))}/>
                        <Button icon="/edit.svg" label="Edit Course Evaluation Data" action={() => Promise.resolve(setView('CourseEvalEdit'))}/>
                    </div>
                    <div className="flex gap-12 pb-12">
                        <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                    </div>
                </div>
            </div>
        );
}