import { useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function AcademicYear() {
    const [newYear, setNewYear] = useState('');
    const [updateYear, setUpdateYear] = useState('');

    const saveAcademicYear = () => {
        console.log('Saving Academic Year:', newYear);
    };

    const updateAcademicYear = () => {
        console.log('Updating Academic Year:', updateYear);
    };

    return (
            <>
                <h1>Add Academic Year & Update Academic Year</h1>
                <div className='grid grid-cols-2 gap-4'>
                    <div className="flex flex-col justify-center w-full items-center">
                        <h2 className="text-lg font-semibold mb-2">Add Academic Year</h2>
                        <TextField label="Academic Year" setValue={setNewYear} />
                        <div className='w-1/2'></div>
                        <Button label="Save" action={saveAcademicYear} className="w-full mt-4" />
                    </div>
                    
                    <div className="flex flex-col justify-center w-full items-center">
                        <h2 className="text-lg font-semibold mb-2">Update Academic Year</h2>
                        <TextField label="Academic Year" setValue={setUpdateYear} />
                        <div className='w-1/2'></div>
                        <Button label="Update" action={updateAcademicYear} className="w-full mt-4" />
                    </div>
                </div>
            </>
        
    );
}
