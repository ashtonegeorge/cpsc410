import { Fragment, useEffect, useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function AcademicYear() {
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
    }

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
            <>
                <h1>Academic Year</h1>
                <div className='grid grid-cols-2 gap-4'>
                    <div className="flex flex-col justify-start w-full items-center">
                        <h2 className="text-lg font-semibold mb-2">Add Academic Year</h2>
                        <TextField label="Academic Year Name" setValue={setNewYear} placeholder={'New name'} />
                        <Button label="Save Year" action={createAcademicYear} icon={null} />
                    </div>
                    
                    <div className="flex flex-col justify-start w-full items-center">
                        <h2 className="text-lg font-semibold mb-2">Update Academic Year</h2>
                        <TextField label="Academic Year ID" setValue={setUpdateYearId} placeholder={'ID to update'} />
                        <TextField label="Academic Year Name" setValue={setUpdateYearName} placeholder={'New name'} />
                        <Button label="Update Year" action={updateAcademicYear} icon={null} />
                    </div>
                    <div className="flex flex-col justify-start w-full items-center">
                        <h2 className="text-lg font-semibold mb-2">Delete Academic Year</h2>
                        <TextField label="Academic Year ID" setValue={setDeleteYear} placeholder={'ID to delete'} />
                        <Button label="Delete Year" action={deleteAcademicYear} icon={null} />
                    </div>
                </div>
                <div className='pt-12'>
                    <h2 className='text-2xl font-bold'>Academic Years</h2>
                    <div className='grid grid-cols-2 w-sm mx-auto'>
                        <p className='font-semibold'>ID</p> 
                        <p className='font-semibold'>Name</p>
                        {academicYears.map((ayear: [string, string], id: number) => {
                            return (
                                <Fragment key={ayear[0] + id}>
                                    <p>
                                        {ayear[0]}: 
                                    </p>
                                    <p>
                                        {ayear[1]}
                                    </p>
                                </Fragment>
                            )
                        })}
                    </div>
                </div>
            </>
    );
}
