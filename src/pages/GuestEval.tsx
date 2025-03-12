import Button from '../components/Button';

export default function GuestEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
    <div> 
        <h2>Guest Speaker Evaluations</h2>
    <Button icon="/upload.svg" label='Import Guest Eval File' action={() => Promise.resolve(setView('importGuestEval'))} />
    </div>
    );
}
