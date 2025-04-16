import { ChangeEvent, Fragment, useCallback, useEffect, useState } from 'react';
import Button from '../components/Button';

export default function GradeEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    const [grades, setGrades] = useState<[string, string, string, string, string, string, string][]>([]);
    const [markedGrades, setMarkedGrades] = useState<string[]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [studentIdFilter, setStudentIdFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [academicYearFilter, setAcademicYearFilter] = useState("");
    const [retakeFilter, setRetakeFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const handleDeleteCourseEvaluation = async () => {
        markedGrades.forEach((g) => {
            window.ipcRenderer.deleteGrade(g);
        })
        updateGrades()
        setMarkedGrades([]);
        setDeleteSuccess(true);
        
        setTimeout(() => {
            setDeleteSuccess(false);
        }, 5000);
    }

    const updateGrades = useCallback(async () => {
        const result = await window.ipcRenderer.readGrades(studentIdFilter, courseFilter, semesterFilter, academicYearFilter, retakeFilter, gradeFilter);
        const g = result.map((g: { id: string, student_id: string, course_id: string, semester_name: string, academic_year_name: string, retake: string, final_grade: string }) => 
            [g.id, g.student_id, g.course_id, g.semester_name, g.academic_year_name, g.retake, g.final_grade] as [string, string, string, string, string, string, string]
        );
        setGrades(g);
    }, [studentIdFilter, courseFilter, semesterFilter, academicYearFilter, retakeFilter, gradeFilter]);

    // Run updateGrades on component mount
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
        updateGrades();
    }, [updateGrades]);

    const handleEvalChecked = (event: React.ChangeEvent<HTMLInputElement>, gradeId: string) => {
        if(event.target.checked) {
            setMarkedGrades([...markedGrades, gradeId]);
        } else {
            const e = markedGrades.filter(i => i !== gradeId)
            setMarkedGrades(e);
        }
    }
    
    function handleStudentIdUpdate(event: React.ChangeEvent<HTMLInputElement>, gradeId: string): void {
        window.ipcRenderer.updateGrade(gradeId, event.target.value, undefined, undefined, undefined, undefined, undefined);
        updateGrades();
    }

    function handleCourseUpdate(event: React.ChangeEvent<HTMLSelectElement>, gradeId: string): void {
        window.ipcRenderer.updateGrade(gradeId, undefined, event.target.value, undefined, undefined, undefined, undefined);
        updateGrades();
    }
    
    function handleSemesterUpdate(event: React.ChangeEvent<HTMLSelectElement>, gradeId: string): void {
        const semesterMapping: { [key: string]: number } = {
            Spring: 1,
            Summer: 2,
            Fall: 3,
            Winter: 4,
        };
    
        const id = semesterMapping[event.target.value];
        window.ipcRenderer.updateGrade(gradeId, undefined, undefined, id.toString(), undefined, undefined, undefined);
        updateGrades();
    }
    
    function handleAcademicYearUpdate(event: React.ChangeEvent<HTMLSelectElement>, gradeId: string): void {
        let id;
        academicYears.forEach((ayear) => {
            if(ayear[1] == event.target.value) id = ayear[0];
        })
        window.ipcRenderer.updateGrade(gradeId, undefined, undefined, undefined, id, undefined, undefined);
        updateGrades();
    }
    
    function handleRetakeUpdate(event: React.ChangeEvent<HTMLSelectElement>, gradeId: string): void {
        window.ipcRenderer.updateGrade(gradeId, undefined, undefined, undefined, undefined, event.target.value, undefined);
        updateGrades();
    }
    
    function handleFinalGradeUpdate(event: ChangeEvent<HTMLSelectElement>, gradeId: string): void {
        window.ipcRenderer.updateGrade(gradeId, undefined, undefined, undefined, undefined, undefined, event.target.value)
        updateGrades();
    }

    return (
       <div>
            <h1 className='text-lg font-semibold'>Edit Grade Data</h1>
            <h2 className='mt-6'>Filter results:</h2>
            <div className='grid grid-cols-6 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] text-sm mx-auto max-w-5xl border border-stone-800 p-2 pb-6 mt-2 rounded-lg '>
                {/* student */}
                <div>
                    <h3 className='text-left'>Student ID</h3>
                    <input type="text" placeholder='ID' className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white px-1' defaultValue={""} onChange={(event) => setStudentIdFilter(event.target.value)}></input>
                </div>
                {/* course */}
                <div>
                    <h3 className='text-left'>Course</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setCourseFilter(event.target.value)}>
                        <option value="">All courses</option>
                        {courses.length > 0 && courses.map((c) => (
                                <option key={c[0]}>{c[0]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* semester */}
                <div>
                    <h3 className='text-left'>Semester</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setSemesterFilter(event.target.value)}>
                        <option value="">All semesters</option>
                        {semesters.length > 0 && semesters.map((s) => (
                                <option key={s[0]} value={s[0]}>{s[1]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* ayear */}
                <div>
                    <h3 className='text-left'>Academic Year</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setAcademicYearFilter(event.target.value)}>
                        <option value="">All academic years</option>
                        {academicYears.length > 0 && academicYears.map((a) => (
                                <option key={a[0]} value={a[0]}>{a[1]}</option>
                            ))
                        }
                    </select>
                </div>
                {/* retake */}
                <div>
                    <h3 className='text-left'>Retake</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setRetakeFilter(event.target.value)}>
                        <option value="">Both</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>
                {/* grade */}
                <div>
                    <h3 className='text-left'>Final Grade</h3>
                    <select className='w-full p-2 border border-stone-700 rounded-sm self-center text-black bg-white' defaultValue={""} onChange={(event) => setGradeFilter(event.target.value)}>
                        <option value="">All grades</option>
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
            {grades.length > 0 ? (
                <div className='grid grid-cols-8 gap-2 h-min grid-flow-row overflow-y-auto max-h-[500px] text-sm mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 pb-6 mt-6 rounded-lg '>
                    <p className='font-semibold'>Delete</p>
                    <p className='font-semibold'>ID</p>
                    <p className='font-semibold'>Student ID</p>
                    <p className='font-semibold'>Course</p>
                    <p className='font-semibold'>Semester</p>
                    <p className='font-semibold'>Academic Year</p>
                    <p className='font-semibold'>Retake</p>
                    <p className='font-semibold'>Final Grade</p>
                    {grades.map((g, i) => (
                        <Fragment key={i}>
                            <input className='p-1 w-5 mx-auto' type='checkbox' checked={markedGrades.includes(g[0])} onChange={(event) => handleEvalChecked(event, g[0])} />
                            <p className='self-center'>{g[0]}</p>
                            <input type="text" value={g[1]} className='border border-stone-700 rounded-sm self-center bg-stone-600 px-1' onChange={(event) => handleStudentIdUpdate(event, g[0])}></input>
                            <select value={g[2]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleCourseUpdate(event, g[0])}>
                                {courses.length > 0 && courses.map((c) => (
                                    <option key={c[0]}>{c[0]}</option>
                                ))}
                            </select>
                            <select value={g[3]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleSemesterUpdate(event, g[0])}>
                                {semesters.length > 0 && semesters.map((s) => (
                                    <option key={s[0]}>{s[1]}</option>
                                ))}
                            </select>
                            <select value={g[4]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleAcademicYearUpdate(event, g[0])}>
                                {academicYears.length > 0 && academicYears.map((a) => (
                                    <option key={a[0]}>{a[1]}</option>
                                ))}
                            </select>
                            <select value={g[5]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleRetakeUpdate(event, g[0])}>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                            <select value={g[6]} className='border border-stone-700 rounded-sm self-center bg-stone-600' onChange={(event) => handleFinalGradeUpdate(event, g[0])}>
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
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className='text-center w-full mx-auto max-w-5xl bg-stone-600 border border-stone-800 p-2 mt-6 rounded-lg '>
                    <h2>No results found, please ensure data with the filter criteria exists in the database and try again.</h2>
                </div>
            )}
            <div className='p-1'>
                <p>To delete a grade, mark the corresponding checkbox and hit the Delete button.</p>
                <p>To change grade details, simply click the dropdown on the cell and select the new value.</p>
            </div>
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto pt-6">
                <Button icon={null} label="Delete" action={handleDeleteCourseEvaluation}/>
            </div>
            {deleteSuccess && <p className="w-full text-green-300 font-semibold">Deleted successfully!</p>}
            <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none mx-auto">
                <Button icon={null} label="Back" action={() => Promise.resolve(setView('grades'))}/>
            </div>
       </div>
    );
}