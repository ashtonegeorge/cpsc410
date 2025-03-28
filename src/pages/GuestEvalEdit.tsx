import Button from '../components/Button';
export default function GuestEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return (
        <div>
            <h2>Edit Guest Evaluation Data</h2>
                        <div className="flex justify-center pb-12">
                            <div className="text-white rounded-xl p-2 text-sm border-none">
                                <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                            </div>
                        </div>
                    </div>

    ) ; 
}