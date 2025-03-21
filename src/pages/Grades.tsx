import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';

export default function Grades({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
        <div className='flex flex-col gap-4'>
            <h2>Module Grades</h2>
            <Button icon={uploadIcon} label='Import Grade File' action={() => Promise.resolve(setView('importGrades'))} />
            <Button icon={uploadIcon} label='Grade Metrics' action={() => Promise.resolve(setView('gradeMetrics'))} />
        </div>
    );
}