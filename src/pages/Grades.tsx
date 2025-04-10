import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';

export default function Grades({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
        <div className=''>
            <h2>Module Grades</h2>
            <div className='flex gap-4 pt-24'>
                <Button icon={uploadIcon} label='Import Grade File' action={() => Promise.resolve(setView('importGrades'))} />
                <Button icon={uploadIcon} label='Grade Metrics' action={() => Promise.resolve(setView('gradeMetrics'))} />
            </div>
                <div className="flex justify-center pt-12">
                    <div className="text-white rounded-xl p-2 text-sm border-none">
                        <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                    </div>
                </div>
        </div>
    );
}