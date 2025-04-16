import { Fragment, useEffect, useState } from "react";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function Questions({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return(
        <div>
            <h2>Manage Questions</h2>
                <div className='block pt-24'>
                    <div className="flex justify-evenly pb-12">
                        <Button label="Add Questions" action={() => Promise.resolve(setView('addQuestions'))} icon={null}/>
                    </div>
                    <div className="flex justify-center pb-12">
                        <Button label="Edit Questions" action={() => Promise.resolve(setView('editQuestions'))} icon="/edit.svg"/>
                    </div>
                </div>   
                <div className="flex justify-evenly gap-12 pb-12">
                    <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                        <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                    </div>
                </div> 
        </div>
    )
}