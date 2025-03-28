import Button from '../components/Button';

export default function GuestEval({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
    <div> 
        <h2>Guest Speaker Evaluations</h2>
            <div className='block pt-24'>
                <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={null} label='Import Guest Eval File' action={() => Promise.resolve(setView('importGuestEval'))} />
                    <Button icon={null} label="Guest Evaluations Metrics" action={() => Promise.resolve(setView('guestEvalmetrics'))}/>
                </div>
                <div className="flex justify-evenly gap-12 pb-12">
                    <Button icon={null} label="Import Evaluations Manually" action={() => Promise.resolve(setView('importGuestEvalMan'))}/>
                    <Button icon={null} label="Edit Guest Evaluation Data" action={() => Promise.resolve(setView('guestEvalEdit'))}/>
                </div>
            </div>
            <div>
                <div className="flex justify-center pb-12">
                    <div className="text-white rounded-xl p-2 text-sm border-none">
                        <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                            </div>
                        </div>
                    </div>

    
    </div>
    );
}
