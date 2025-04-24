import Button from '../components/Button';
import uploadIcon from '../assets/upload.png';
import pencilIcon from "/edit.svg";

export default function GuestEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
    <div>
        <h2 className="text-3xl font-bold">Guest Speaker Evaluations</h2>
        <div className='block pt-24'>
            <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={uploadIcon} label='Import Guest Eval File' action={() => Promise.resolve(setView('importGuestEval'))} />
                <Button icon={null} label="Guest Evaluations Metrics" action={() => Promise.resolve(setView('guestEvalmetrics'))}/>
            </div>
            <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={null} label="Import Evaluations Manually" action={() => Promise.resolve(setView('importGuestEvalMan'))}/>
                <Button icon={pencilIcon} label="Edit Guest Evaluation Data" action={() => Promise.resolve(setView('guestEvalEdit'))}/>
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
