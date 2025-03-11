import Button from '../components/Button';

export default function Grades({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
        <div>
            <h2>Module Grades</h2>
            <Button label='Import Grade File' action={() => Promise.resolve(setView('importGrades'))} />
        </div>
    );
}