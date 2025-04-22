import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';

export default function Grades({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
    <div>
        <h2 className="text-3xl font-bold">Module Grades</h2>
        <div className='block pt-24'>
            <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={uploadIcon} label='Import Grade File' action={() => Promise.resolve(setView('importGrades'))} />
                <Button icon={null} label='Grade Metrics' action={() => Promise.resolve(setView('gradeMetrics'))} />
            </div>
            <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={null} label='Input Grades Manually' action={() => Promise.resolve(setView('importGradesMan'))} />
                <Button icon="/edit.svg" label='Edit Grade Data' action={() => Promise.resolve(setView('gradeEdit'))} />
            </div>
        </div>
        <div>
            <div className="flex justify-center pb-12">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                </div>
            </div>
        </div>
    </div>
    );
}
