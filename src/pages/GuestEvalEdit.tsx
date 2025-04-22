import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';
export default function GuestEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [guestEvals, setGuestEvals] = useState<[string, string, string, string, string, string][]>([]);
    const [markedEvals, setMarkedEvals] = useState<string[]>([]);
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);

    useEffect(() => {
        window.ipcRenderer.readGuestLecturers().then((result: any) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const guestsArray = result.map((e: { id: string, fname: string, lname: string }) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(guestsArray);
        });
        window.ipcRenderer.readCourses().then((result: any) => {
            const coursesArray = result.map((e: { id: string, name: string }) => [e.id, e.name] as [string, string]);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
        window.ipcRenderer.readSemesters().then((result: { id: string, name: string }[]) => {
            const semestersArray = result.map((e) => [e.id, e.name] as [string, string]);
            setSemesters(semestersArray);
        });
        updateGuestEvals()
    }, [])

    const handleDeleteGuestEvaluation = async () => {
        markedEvals.forEach((e) => {
            window.ipcRenderer.deleteGuestEvaluation(e);
        })
        updateGuestEvals()
        setMarkedEvals([]);
    }

    const updateGuestEvals = async () => {
        window.ipcRenderer.readGuestEvals().then(((result: { id: string, guest_id: string, course_id: string, semester_id: number, academic_year_id: string, guest_name: string, semester_name: string, academic_year_name: string }[]) => {
            const ge = result.map((e) => [e['id'], e['guest_id'], e['course_id'], e['semester_name'], e['guest_name'], e['academic_year_name']] as [string, string, string, string, string, string]);
            setGuestEvals(ge);
        }))
    }

    const handleEvalChecked = (event: React.ChangeEvent<HTMLInputElement>, evalId: string) => {
        if(event.target.checked) {
            setMarkedEvals([...markedEvals, evalId]);
        } else {
            const e = markedEvals.filter(i => i !== evalId)
            setMarkedEvals(e);
        } 
    }
    
    function handleGuestUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {

        const lname: string = event.target.value.split(', ')[0];
        const fname: string = event.target.value.split(', ')[1];
        // match the guest name to the guest lecturer
        let id;
        guests.forEach((g) => {
            if(lname == g[2] && fname == g[1]) id = g[0];
        })
        window.ipcRenderer.updateGuestEval(evalId, id, undefined, undefined, undefined);
    }
    
    function handleCourseUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        window.ipcRenderer.updateGuestEval(evalId, undefined, event.target.value, undefined, undefined);
    }
    
    function handleSemesterUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        const semesterMapping: { [key: string]: number } = {
            Spring: 1,
            Summer: 2,
            Fall: 3,
            Winter: 4,
        };
    
        const id = semesterMapping[event.target.value];
        window.ipcRenderer.updateGuestEval(evalId, undefined, undefined, id.toString(), undefined);
    }
    
    function handleAcademicYearUpdate(event: React.ChangeEvent<HTMLSelectElement>, evalId: string): void {
        let id;
        academicYears.forEach((ayear) => {
            if(ayear[1] == event.target.value) id = ayear[0];
        })
        window.ipcRenderer.updateGuestEval(evalId, undefined, undefined, undefined, id);
    }

    return (
       <div>
            <h1 className="text-3xl font-bold">Edit Guest Evaluation Data</h1>
            {guestEvals.length > 0 ? <div className='grid grid-cols-6 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 pb-6 mt-6 rounded-lg '>
                <p className='font-semibold'>Delete</p>
                <p className='font-semibold'>ID</p>
                <p className='font-semibold'>Guest</p>
                <p className='font-semibold'>Course</p>
                <p className='font-semibold'>Semester</p>
                <p className='font-semibold'>Academic Year</p>
                {guestEvals.map((e, i) => (
                    <Fragment key={i}>
                        <input className='p-1 w-5 mx-auto' type='checkbox' onChange={(event) => handleEvalChecked(event, e[0])} />
                        <p className='self-center'>{e[0]}</p>
                        <select defaultValue={e[4]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleGuestUpdate(event, e[0])}>
                            {/* <option>{e[1]}</option> */}
                            {guests.length > 0 && guests.map((g) => (
                                    <option key={g[0]}>{g[2]}, {g[1]}</option>
                                ))
                            }
                        </select>
                        <select defaultValue={e[2]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleCourseUpdate(event, e[0])}>
                            {/* <option>{e[1]}</option> */}
                            {courses.length > 0 && courses.map((c) => (
                                    <option key={c[0]}>{c[0]}</option>
                                ))
                            }
                        </select>
                        <select defaultValue={e[3]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleSemesterUpdate(event, e[0])}>
                            {/* <option>{e[2]}</option> */}
                            {semesters.length > 0 && semesters.map((s) => (
                                    <option key={s[0]}>{s[1]}</option>
                                ))
                            }
                        </select>
                        <select defaultValue={e[4]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleAcademicYearUpdate(event, e[0])}>
                            {/* <option>{e[3]}</option> */}
                            {academicYears.length > 0 && academicYears.map((a) => (
                                    <option key={a[0]}>{a[1]}</option>
                                ))
                            }
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
            </div>
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto pt-6">
                <Button icon={null} label="Delete" action={handleDeleteGuestEvaluation}/>
            </div>
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto">
                <Button icon={null} label="Back" action={() => Promise.resolve(setView('guestEval'))}/>
            </div>
       </div>
    );

}