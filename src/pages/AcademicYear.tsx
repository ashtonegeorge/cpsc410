import { Fragment, useEffect, useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function AcademicYear({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [newYear, setNewYear] = useState('');
    const [updateYearName, setUpdateYearName] = useState('');
    const [updateYearId, setUpdateYearId] = useState('');
    const [deleteYear, setDeleteYear] = useState('');
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);

    useEffect(() => {
        updateAcademicYears();
    }, [])

    const updateAcademicYears = () => {
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const ay = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(ay);
        });
    };

    const createAcademicYear = () => {
        const result = window.ipcRenderer.createAcademicYear(newYear);
        updateAcademicYears();
        return result;
    };
    
    const updateAcademicYear = () => {
        const result = window.ipcRenderer.updateAcademicYear(updateYearName, updateYearId);
        updateAcademicYears();
        return result;
    };
    
    const deleteAcademicYear = () => {
        const result = window.ipcRenderer.deleteAcademicYear(deleteYear);
        updateAcademicYears();
        return result;
    };

    return (
            <div>
                <div className='flex justify-between pb-6'>
                    <div className='w-3/5 flex flex-col gap-8'>
                        <h1 className='text-2xl'>Academic Year</h1>
                        <div className='flex gap-4'>
                            <div className="flex flex-col justify-start w-full items-center">
                                <h2 className="text-lg font-semibold mb-2">Add Academic Year</h2>
                                <TextField label="Academic Year Name" setValue={setNewYear} placeholder={'New name'} />
                                <Button label="Save Year" action={createAcademicYear} icon={null} />
                            </div>
                            <div className="flex flex-col justify-start w-1/2 items-center col-span-2 mx-auto">
                                <h2 className="text-lg font-semibold mb-2">Delete Academic Year</h2>
                                <TextField label="Academic Year ID" setValue={setDeleteYear} placeholder={'ID to delete'} />
                                <Button label="Delete Year" action={deleteAcademicYear} icon={null} />
                            </div>
                        </div>
                        <div className="flex flex-col justify-start w-full items-center">
                            <h2 className="text-lg font-semibold mb-2">Update Academic Year</h2>
                            <TextField label="Academic Year ID" setValue={setUpdateYearId} placeholder={'ID to update'} />
                            <TextField label="Academic Year Name" setValue={setUpdateYearName} placeholder={'New name'} />
                            <Button label="Update Year" action={updateAcademicYear} icon={null} />
                        </div>
                    </div>
                    <div className='w-2/5 m-12'>
                        <div className='bg-stone-300 w-full h-[500px] border-2 border-stone-600 rounded-xl overflow-y-auto max-h-[500px] text-stone-900 p-4 text-left'>
                            <div className='text-lg text-left mx-auto grid grid-cols-[0.5fr_0.5fr] gap-x-2'>
                                <Fragment>
                                    <p className='font-semibold text-center'>ID</p> 
                                    <p className='font-semibold text-left'> Year Name</p>
                                </Fragment>
                                {academicYears.map((ayear: [string, string], id: number) => {
                                    return (
                                        <Fragment key={ayear[0] + id}>
                                            <p className='text-center'>{ayear[0]}:</p> 
                                            <p className='text-left'>{ayear[1]}</p>
                                        </Fragment>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-evenly gap-12">
                    <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                        <Button icon={null} label="Back" action={() => Promise.resolve(setView('home'))}/>
                    </div>
                </div>
            </div>
    );
}
