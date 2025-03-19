import Button from '../components/Button';

export default function CourseEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
            <div>
                <h2>Course Evaluation</h2>
                <Button icon="/upload.svg" label='Import Course Evaluation File' action={() => Promise.resolve(setView('importCourseEval'))} />
            </div>
        );
}