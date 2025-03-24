import { Fragment, useEffect, useState } from "react";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function GuestLecturers() {
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [createGuestFName, setCreateGuestFName] = useState('');
    const [createGuestLName, setCreateGuestLName] = useState('');
    const [updateGuestId, setUpdateGuestId] = useState('');
    const [updateGuestFName, setUpdateGuestFName] = useState('');
    const [updateGuestLName, setUpdateGuestLName] = useState('');
    const [deleteGuestId, setDeleteGuestId] = useState('');

    useEffect(() => {
        updateGuestLecturers();
    }, [])

    const updateGuestLecturers = () => {
        window.ipcRenderer.readGuestLecturers().then((result: {id: string, fname: string, lname: string}[]) => {
            const g = result.map((e) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(g);
        })
    };

    const clearForm = () => {
        setCreateGuestFName('');
        setCreateGuestLName('');
        setUpdateGuestId('');
        setUpdateGuestFName('');
        setUpdateGuestLName('');
        setDeleteGuestId('');
    };

    const createGuestLecturer = () => {
        const result = window.ipcRenderer.createGuestLecturer(createGuestFName, createGuestLName)
        updateGuestLecturers();
        clearForm();
        return result;
    };

    const updateGuestLecturer = () => {
        const result = window.ipcRenderer.updateGuestLecturer(updateGuestId, updateGuestFName, updateGuestLName);
        updateGuestLecturers();
        clearForm();
        return result;
    };

    const deleteGuestLecturer = () => {
        const result = window.ipcRenderer.deleteGuestLecturer(deleteGuestId);
        updateGuestLecturers();
        clearForm();
        return result;
    };

    return (
        <div>
            <h1 className="h-1/12 text-2xl">Guest Lecturers</h1>
            <div className='grid grid-cols-2 gap-4'>
                <div className="flex flex-col justify-start w-full items-center">
                    <h2 className="text-lg font-semibold mb-2">Create Guest Lecturer</h2>
                    <TextField label="Guest First Name" setValue={setCreateGuestFName} placeholder={'New name'} />
                    <TextField label="Guest Last Name" setValue={setCreateGuestLName} placeholder={'New name'} />
                    <Button label="Save Guest" action={createGuestLecturer} icon={null} />
                </div>  
                <div className="flex flex-col justify-start w-full items-center">
                    <h2 className="text-lg font-semibold mb-2">Update Guest Lecturer</h2>
                    <TextField label="Guest ID" setValue={setUpdateGuestId} placeholder={'ID to update'} />
                    <TextField label="Guest First Name" setValue={setUpdateGuestFName} placeholder={'New name'} />
                    <TextField label="Guest Last Name" setValue={setUpdateGuestLName} placeholder={'New name'} />
                    <Button label="Update Guest" action={updateGuestLecturer} icon={null} />
                </div>
                <div className="flex flex-col justify-start w-1/2 mx-auto items-center col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Delete Guest Lecturer</h2>
                    <TextField label="Guest ID" setValue={setDeleteGuestId} placeholder={'ID to delete'} />
                    <Button label="Delete Guest" action={deleteGuestLecturer} icon={null} />
                </div>
            </div>
            <h1 className="text-xl font-bold py-6">Guest Lecturers</h1>
            <div className="grid grid-cols-3 w-md mx-auto">
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
    )
}