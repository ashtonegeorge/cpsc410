import { Fragment, useEffect, useState } from "react";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function EditQuestions({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    return(
        <div>
            <h2>Edit Questions</h2>
            <div className="flex justify-evenly gap-12 pb-12">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('questions'))}/>
                </div>
            </div>
        </div>
    )
}