import { useEffect, useState } from "react"
import Button from "../components/Button";

export default function ImportGradesMan({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);

    const [studentId, setStudentId] = useState<string>('');
    const [course, setCourse] = useState<string>('');
    const [semester, setSemester] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>('');
    const [retake, setRetake] = useState<string>('');
    const [grade, setGrade] = useState<string>('');

    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: any) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
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
    }, [])

    const handleGradeSubmit = async () => {
        try {
            const res = await window.ipcRenderer.importGrade(studentId, course, semester, academicYear, retake, grade)
            if (res !== null) { // set the response data to corresponding state to be used in the UI
                setSuccess(true);
            } else {
                setError(true);
            }            
        } catch (error) {
            setError(true);
            console.log(error);
        }
        setTimeout(() => {
            setSuccess(false);
            setError(false);
        }, 5000);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Import Grades Manually</h1>
            <div className='grid grid-cols-6 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] text-sm mx-auto max-w-5xl border border-stone-800 p-2 pb-6 mt-2 rounded-lg '>
                {/* student */}
                <div>
                    <h3 className='text-left'>Student ID</h3>
                    <input type="text" placeholder='ID' className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white px-1' defaultValue={""} onChange={(event) => setStudentId(event.target.value)}></input>
                </div>
                {/* course */}
                <div>
                    <h3 className='text-left'>Course</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setCourse(event.target.value)}>
                        {courses.length > 0 && courses.map((c) => (
                                <option key={c[0]}>{c[0]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* semester */}
                <div>
                    <h3 className='text-left'>Semester</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setSemester(event.target.value)}>
                        {semesters.length > 0 && semesters.map((s) => (
                                <option key={s[0]} value={s[0]}>{s[1]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* ayear */}
                <div>
                    <h3 className='text-left'>Academic Year</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setAcademicYear(event.target.value)}>
                        {academicYears.length > 0 && academicYears.map((a) => (
                                <option key={a[0]} value={a[0]}>{a[1]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* retake */}
                <div>
                    <h3 className='text-left'>Retake</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setRetake(event.target.value)}>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>
                {/* grade */}
                <div>
                    <h3 className='text-left'>Final Grade</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setGrade(event.target.value)}>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D+">D+</option>
                        <option value="D">D</option>
                        <option value="D-">D-</option>
                        <option value="F">F</option>
                    </select>
                </div>
            </div>
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto pt-6">
                <Button icon={null} label="Submit" action={() => handleGradeSubmit()}/>
            </div>
            {success && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-green-700 text-white font-semibold">Imported successfully!</p></div>}
            {error && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Import failed, please try again.</p></div>}
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto">
                <Button icon={null} label="Back" action={() => Promise.resolve(setView('grades'))}/>
            </div>
        </div>
    )
}