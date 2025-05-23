import { Fragment, useEffect, useState } from "react";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function GuestLecturers({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [createGuestFName, setCreateGuestFName] = useState('');
    const [createGuestLName, setCreateGuestLName] = useState('');
    const [updateGuestId, setUpdateGuestId] = useState('');
    const [updateGuestFName, setUpdateGuestFName] = useState('');
    const [updateGuestLName, setUpdateGuestLName] = useState('');
    const [deleteGuestId, setDeleteGuestId] = useState('');
    const [createError, setCreateError] = useState<boolean>();
    const [modifyError, setModifyError] = useState<boolean>();
    const [deleteError, setDeleteError] = useState<boolean>();

    useEffect(() => {
        updateGuestLecturers();
    }, [])

    const updateGuestLecturers = () => {
        window.ipcRenderer.readGuestLecturers().then((result: any) => {
            const g = result.map((e: {id: string, fname: string, lname: string}) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(g);
        })
    };

    const createGuestLecturer = async () => {
        if(createGuestFName === '' || createGuestLName === '') {
            setCreateError(true);
            setTimeout(() => {
                setCreateError(false);
            }, 5000);
            return;        }
        const result = window.ipcRenderer.createGuestLecturer(createGuestFName, createGuestLName)
        updateGuestLecturers();
        return result;
    };

    const updateGuestLecturer = async () => {
        if(updateGuestFName === '' || updateGuestLName === '') {
            setModifyError(true);
            setTimeout(() => {
                setModifyError(false);
            }, 5000);
            return;
        }
        const result = window.ipcRenderer.updateGuestLecturer(updateGuestId, updateGuestFName, updateGuestLName);
        updateGuestLecturers();
        return result;
    };

    const deleteGuestLecturer = async () => {
        if(deleteGuestId === '') {
            setDeleteError(true);
            setTimeout(() => {
                setDeleteError(false);
            }, 5000);
            return;
        }
        const result = window.ipcRenderer.deleteGuestLecturer(deleteGuestId);
        updateGuestLecturers();
        return result;
    };

    return (
        <div className="">
            <div className='flex justify-between'>
                <div className="w-1/2 flex flex-col gap-8">
                    <h1 className="text-3xl font-bold">Guest Lecturers</h1>
                    <div className="flex gap-4">
                        <div className="flex flex-col justify-start w-full items-center">
                            <h2 className="text-lg font-semibold mb-2">Create Guest Lecturer</h2>
                            <TextField label="Guest First Name" setValue={setCreateGuestFName} placeholder={'New name'} />
                            <TextField label="Guest Last Name" setValue={setCreateGuestLName} placeholder={'New name'} />
                            <div>
                                <Button label="Save Guest" action={createGuestLecturer} icon={null} />
                            </div>
                            {createError && <div className='w-full flex justify-center pt-2'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Error, ensure you fill in the lecturer's first and last name.</p></div>}
                        </div>  
                        <div className="flex flex-col justify-start w-full items-center">
                            <h2 className="text-lg font-semibold mb-2">Update Guest Lecturer</h2>
                            <TextField label="Guest First Name" setValue={setUpdateGuestFName} placeholder={'New name'} />
                            <TextField label="Guest Last Name" setValue={setUpdateGuestLName} placeholder={'New name'} />
                            <TextField label="Guest ID" setValue={setUpdateGuestId} placeholder={'ID to update'} />
                            <div>
                                <Button label="Update Guest" action={updateGuestLecturer} icon={null} />
                            </div>
                            {modifyError && <div className='w-full flex justify-center pt-2'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Error, ensure you fill in the ID, first name, and last name.</p></div>}
                        </div>
                    </div>
                        <div className="flex flex-col justify-start items-center">
                            <h2 className="text-lg font-semibold mb-2">Delete Guest Lecturer</h2>
                            <TextField label="Guest ID" setValue={setDeleteGuestId} placeholder={'ID to delete'} />
                            <div>
                                <Button label="Delete Guest" action={deleteGuestLecturer} icon={null} />
                            </div>
                            {deleteError && <div className='w-full flex justify-center pt-2'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Error, ensure you fill in the Guest ID.</p></div>}
                        </div>
                </div>
                <div className='w-1/2 m-12'>
                    <div className='bg-stone-300 min-h-11/12 border-2 border-stone-600 rounded-xl overflow-y-auto max-h-[500px] text-stone-900 p-4 text-left'>
                        <div className='text-lg text-left grid mx-auto grid-cols-[0.2fr_0.35fr_0.35fr] w-full'>
                            <Fragment>
                                <p className="font-semibold">ID</p>
                                <p className="font-semibold">First Name</p>
                                <p className="font-semibold">Last Name</p>
                            </Fragment>
                            {guests.map((g, i) => (
                                <Fragment key={g[0] + i}>
                                    <p>{g[0]}</p>
                                    <p>{g[1]}</p>
                                    <p>{g[2]}</p>
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-evenly gap-12 pt-4">
                <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                    <Button icon={null} label="Back" action={() => Promise.resolve(setView('guestEval'))}/>
                </div>
            </div>
        </div>
    )
}
