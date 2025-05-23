import { useState } from "react";
import Button from "../components/Button";

export default function AddQuestions({setView, evalType}: {setView: React.Dispatch<React.SetStateAction<string>>, evalType: string}) {
    // these three state variables correspond to the dropdowns for type, category, and question_text
    const [selectedType, setSelectedType] = useState('likert');
    const [questionText, setQuestionText] = useState('');
    const [forManual, setForManual]= useState('0');

    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const handleSelectedType = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedType(event.target.value); };
    // const handleSelectedCategory = (event: React.ChangeEvent<HTMLSelectElement>) => { setSelectedCategory(event.target.value); };
    const handleQuestionText = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setQuestionText(event.target.value); };

    const handleForManual = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked === true) {
            setForManual('1');
        } else {
            setForManual('0');
        } 
    }

    const handleUpload = async () => {
        try {
            if(questionText === '') {
                setError(true)
                setTimeout(() => {
                    setError(false);
                }, 5000);
                return;
            }
            const res = await window.ipcRenderer.addQuestion(questionText, selectedType, evalType, forManual);
            if (res !== null) { // set the response data to corresponding state to be used in the UI
                setSuccess(true);
            } else {
                setError(true);
            }
        } catch {
            setError(true);
            console.log('fail');
        }
        setTimeout(() => {
            setSuccess(false);
            setError(false);
        }, 5000);
    }

    return(
        <div className='w-2/3 pb-12 mx-auto'>
            <h2 className="text-3xl font-bold">Add Questions for {evalType === "course" ? "Course Evaluations" : "Guest Speaker Evaluations"}</h2>
            <div className="flex justify-evenly gap-12 pb-12">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <h1 className="font-semibold">Select Question Type</h1>
                    <select defaultValue="likert" onChange={handleSelectedType} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        <option className='flex p-1 w-full' value="likert">Likert</option>
                        <option className='flex p-1 w-full' value="open">Open</option>
                    </select>
                    <h1 className="font-semibold">Enter Question</h1>
                    <textarea
                        className="w-full p-2 border rounded resize-none bg-white text-black"
                        placeholder="Type here..."
                        style={{ height: "auto" }}
                        onChange={(event) => {handleQuestionText(event)}}
                        onInput={(event) => {
                            const textarea = event.target as HTMLTextAreaElement; // Cast to HTMLTextAreaElement
                            textarea.style.height = "auto"; // Reset the height
                            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
                        }}
                    />
                    <h1 className="font-semibold">Select if Question will be Used for Manual Evaluations</h1>
                    <input
                        className="p-1 w-5 mx-auto"
                        type="checkbox"
                        onChange={(event) => handleForManual(event)}
                    />
                    <div className="pb-6">
                        <Button icon={null} label="Add" action={handleUpload}/>
                    </div>
                    {success && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-green-700 text-white font-semibold">Question added successfully!</p></div>}
                    {error && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Adding question failed, please ensure question text is filled in and try again.</p></div>}
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView(evalType === "course" ? "importCourseEvalMan" : "importGuestEvalMan"))}/>
                </div>
            </div>
        </div>
    )
}