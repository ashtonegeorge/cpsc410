import { Fragment, useEffect, useState } from "react";
import Button from "../components/Button";
import TextField from "../components/TextField";
import { stringify } from "node:querystring";

export default function EditQuestions({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
        const [markedEvals, setMarkedQuestions] = useState<string[]>([]);
        const [questions, setQuestions] = useState<[string, string, string, string][]>([]);
    
        useEffect(() => {
            window.ipcRenderer.readQuestions().then((result: any) => {
                // unfortunately we can't directly reference the state variable, so we have to create a new array
                const questionsArray = result.map((e: {id: string, question_text: string, type: string, category: string }) => [e.id, e.question_text, e.type, e.category] as [string, string, string, string]);
                setQuestions(questionsArray);
            });
            updateQuestions()
        }, [])
    
        const handleDeleteQuestion = async () => {
            markedEvals.forEach((e) => {
                window.ipcRenderer.deleteQuestion(e);
            })
            updateQuestions()
            setMarkedQuestions([]);
        }
    
        const updateQuestions = async () => {
            window.ipcRenderer.readQuestions().then(((result: { id: string, question_text: string, type: string, category: string}[]) => {
                const q = result.map((e) => [e['id'], e['question_text'], e['type'], e['category']] as [string, string, string, string]);
                setQuestions(q);
            }))
        }
    
        const handleQuestionChecked = (event: React.ChangeEvent<HTMLInputElement>, evalId: string) => {
            if(event.target.checked) {
                setMarkedQuestions([...markedEvals, evalId]);
            } else {
                const e = markedEvals.filter(i => i !== evalId)
                setMarkedQuestions(e);
            } 
        }
        
        function handleTypeUpdate(event: React.ChangeEvent<HTMLSelectElement>, questionId: string): void {
            window.ipcRenderer.updateQuestion(questionId, null, event.target.value, null);
        }

        function handleCategoryUpdate(event: React.ChangeEvent<HTMLSelectElement>, questionId: string): void {
            window.ipcRenderer.updateQuestion(questionId, null, null, event.target.value);
        }
    
        return (
           <div>
                <h1>Edit Questions</h1>
                {questions.length > 0 ? <div className='grid grid-cols-4 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 pb-6 mt-6 rounded-lg '>
                    <p className='font-semibold'>Delete</p>
                    <p className='font-semibold'>Question</p>
                    <p className='font-semibold'>Type</p>
                    <p className='font-semibold'>Category</p>
                    {questions.map((e, i) => (
                        <Fragment key={i}>
                            <input className='p-1 w-5 mx-auto' type='checkbox' onChange={(event) => handleQuestionChecked(event, e[0])} />
                            <p className='border border-stone-700 rounded-sm self-center bg-stone-600'>{e[1]}</p>
                            <select defaultValue={e[2]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleTypeUpdate(event, e[0])}>
                                {/* <option>{e[1]}</option> */}
                                <option value="likert">
                                    Likert
                                </option>
                                <option value="open">
                                    Open
                                </option>
                            </select>
                            <select defaultValue={e[3]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleCategoryUpdate(event, e[0])}>
                                {/* <option>{e[2]}</option> */}
                                <option value="course">
                                    Course
                                </option>
                                <option value="guest">
                                    Guest
                                </option>
                            </select>
                        </Fragment>
                    ))}
                </div> : 
                    <div className='text-center w-full mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 mt-6 rounded-lg '>
                        <h2>No results found, please upload a guest lecturer evaluation and check back again.</h2>
                    </div>
                }
                <div className='p-1'>
                    <p>To delete guest lecturer evaluations, mark the corresponding checkbox and hit the Delete button.</p>
                    <p>To change guest lecturer evaluation details, simply click the dropdown on the cell and select the new value.</p>
                    <p><b>WARNING: If you delete a question, all answers associated with the question will also be deleted!!!</b></p>
                </div>
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto pt-6">
                    <Button icon={null} label="Delete" action={handleDeleteQuestion}/>
                </div>
            <div className="flex justify-evenly gap-12 pb-12">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('questions'))}/>
                </div>
            </div>
        </div>
    )
}