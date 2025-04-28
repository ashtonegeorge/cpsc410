import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';
import pencilIcon from "/edit.svg";

export default function CourseEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
            <div>
                <h2 className="text-3xl font-bold">Course Evaluation</h2>
                <div className='block pt-24'>
                    <div className="flex justify-evenly gap-12 pb-12">
                        <Button icon={uploadIcon} label='Import Course Evaluation File' action={() => Promise.resolve(setView('importCourseEval'))} />
                        <Button icon={null} label="Course Evaluations Metrics" action={() => Promise.resolve(setView('courseEvalMetrics'))}/>
                    </div>
                    <div className="flex justify-evenly gap-12 pb-12">
                        <Button icon={null} label="Import Evaluations Manually" action={() => Promise.resolve(setView('importCourseEvalMan'))}/>
                        <Button icon={pencilIcon} label="Edit Course Evaluation Data" action={() => Promise.resolve(setView('courseEvalEdit'))}/>
                    </div>
                    <div className="flex justify-evenly w-1/3 mx-auto gap-12 pb-12">
                        <Button label="Manage Courses" action={() => Promise.resolve(setView('courses'))} icon={null}/>
                    </div>
                    <div className="flex justify-evenly gap-12 pb-12">
                        <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                            <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                        </div>
                    </div>
                </div>
            </div>
        );
}
