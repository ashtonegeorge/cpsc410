import { useState, useEffect, Fragment } from "react";
import Button from "../components/Button";
import React from "react";
import ExcelJS from 'exceljs';

interface GradeRow {
    student_id: string;
    course_id: string;
    semester_name: string;
    academic_year_name: string;
    retake: number;
    final_grade: string;
}

interface GradeReport {
    result: GradeRow[];
    sortedCpAndBelow: number[];
    gradeCounts: { [key: string]: number[] };
    buffer: Buffer;
}

export default function GradeMetrics({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [filter, setFilter] = useState('sid');
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [studentId, setStudentId] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [workbook, setWorkbook] = useState<ExcelJS.Buffer>();
    const [cpAndBelow, setCpAndBelow] = useState<number[]>([]);
    const [gradeCounts, setGradeCounts] = useState<{ [key: string]: number[] } | null>(null);

    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: any) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const coursesArray = result.map((e:  { id: string, name: string }) => [e.id, e.name] as [string, string]);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
    }, [])

    useEffect(() => { // reset values when filter changes
        setSelectedAcademicYears([]);
        setSelectedCourse("*");
        setStudentId("");
    }, [filter])

    function handleSelectedCourseChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedCourse(event.target.value);
    }

    function handleSelectedAcademicYearChange(event: React.ChangeEvent<HTMLInputElement>, id: string): void {
        setSelectedAcademicYears((prev) =>
            event.target.checked
                ? [...prev, id]
                : prev.filter((a) => a !== id)
        );
    }

    function handleStudentIdChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setStudentId(event.target.value);
    }

    async function handleGenerateReport(): Promise<void> {
        if(filter === 'sid' && studentId === "") { // form validation
            setError(true);
            setTimeout(() => {
                setError(false);
            }, 7000);
            return;
        }

        try {
            const res: GradeReport = await window.ipcRenderer.generateGradeReport( // get sql data
                studentId === "" ? "*" : studentId,
                selectedCourse,
                selectedAcademicYears.length > 0 ? selectedAcademicYears : ["*"]
            );

            if (res) { // set the response data to corresponding state to be used in the UI
                setGrades(res.result);
                setCpAndBelow(res.sortedCpAndBelow);
                setGradeCounts(res.gradeCounts);
                setWorkbook(res.buffer);
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

    async function handleSaveGradeReport(): Promise<void> {
        try {
            if (!workbook) throw new Error("Missing data, please generate a report and try again.");
            const res = await window.ipcRenderer.saveGradeReport(workbook);
            if (!res.success) {
                setError(true);
                console.error('Error saving grade report:', res.message);
            } else {
                setSuccess(true);
            }
        } catch (error) {
            setError(true);
            console.error('Error saving grade report:', error);
        } finally {
            setTimeout(() => {
                setSuccess(false);
                setError(false);
            }, 5000);
        }
    }

    return (
        <div className="flex justify-between gap-8 h-full">
            <div className="w-1/3">
                <h2 className="text-3xl font-bold">Grade Metrics</h2>
                <div className="flex">
                    <h3 className="w-full place-self-center text-left">Filter results by: </h3>
                    <select className="text-black bg-white p-2 rounded-lg my-2 w-full" defaultValue={"sid"} onChange={(e) => setFilter(e.target.value)}>
                        <option value="sid">Student</option>
                        <option value="course">Course</option>
                        <option value="ayear">Academic Year</option>
                    </select>
                </div>
                {filter === 'sid' && 
                    <>
                        <div className="w-full flex flex-col text-left">
                            <h3>Enter Student ID</h3>
                            <input value={studentId} onChange={handleStudentIdChange} type="text" placeholder="ID" className="text-black bg-white p-2 rounded-lg my-2" />
                            <h3>Select Course</h3>
                            <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                                <option value="*">All courses</option>
                                {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                            </select>
                            <h3>Select Academic Year(s)</h3>
                            <label className="relative bg-white text-black p-2 pr-0 rounded-lg">
                                <input type="checkbox" className="hidden peer" />
                                <div className="flex items-center justify-between">
                                    <p>{"Select all that apply"}</p>
                                    <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M14.83 16.42l9.17 9.17 9.17-9.17 2.83 2.83-12 12-12-12z"/><path d="M0-.75h48v48h-48z" fill="none"/></svg>
                                </div>
                                <div className="absolute left-0 text-black rounded-b-lg border border-gray-200 w-full opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto">
                                    <ol className="bg-white rounded-b-md">
                                    {academicYears.map(([id, name]) => {
                                        return (
                                            <li key={id} className="">
                                                <label className="flex px-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
                                                <input
                                                    type="checkbox"
                                                    name={name}
                                                    value={id}
                                                    className="cursor-pointer"
                                                    onChange={(event) => handleSelectedAcademicYearChange(event, id)}
                                                />
                                                <span className="ml-1">{name}</span>
                                                </label>
                                            </li>
                                        );
                                    })}

                                    </ol>
                                </div>
                            </label>
                        </div>
                    </>
                }
                {filter === 'course' && 
                    <>
                        <div className="w-full flex flex-col text-left">
                            <h3>Select Course</h3>
                            <select onChange={handleSelectedCourseChange} value={selectedCourse} className="text-black bg-white p-2 rounded-lg my-2" >
                                <option value="*">All courses</option>
                                {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                            </select>
                            <h3>Select Academic Year(s)</h3>
                            <label className="relative bg-white text-black p-2 pr-0 rounded-lg">
                                <input type="checkbox" className="hidden peer" />
                                <div className="flex items-center justify-between">
                                    <p>{"Select all that apply"}</p>
                                    <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M14.83 16.42l9.17 9.17 9.17-9.17 2.83 2.83-12 12-12-12z"/><path d="M0-.75h48v48h-48z" fill="none"/></svg>
                                </div>
                                <div className="absolute left-0 text-black border border-gray-200 w-full opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto">
                                    <ol className="bg-white ">
                                    {academicYears.map(([id, name]) => {
                                        return (
                                            <li key={id} className="">
                                                <label className="flex px-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
                                                <input
                                                    type="checkbox"
                                                    name={name}
                                                    value={id}
                                                    className="cursor-pointer"
                                                    onChange={(event) => handleSelectedAcademicYearChange(event, id)}
                                                />
                                                <span className="ml-1">{name}</span>
                                                </label>
                                            </li>
                                        );
                                    })}

                                    </ol>
                                </div>
                            </label>
                        </div>
                    </>
                }
                {filter === 'ayear' && 
                    <>
                        <div className="w-full flex flex-col text-left">
                        <h3>Select Academic Year(s)</h3>
                            <label className="relative bg-white text-black p-2 pr-0 rounded-lg">
                                <input type="checkbox" className="hidden peer" />
                                <div className="flex items-center justify-between">
                                    <p>{"Select all that apply"}</p>
                                    <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M14.83 16.42l9.17 9.17 9.17-9.17 2.83 2.83-12 12-12-12z"/><path d="M0-.75h48v48h-48z" fill="none"/></svg>
                                </div>
                                <div className="absolute left-0 text-black rounded-b-lg border border-gray-200 w-full opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto">
                                    <ol className="bg-white rounded-b-md">
                                    {academicYears.map(([id, name]) => {
                                        return (
                                            <li key={id} className="">
                                                <label className="flex px-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
                                                <input
                                                    type="checkbox"
                                                    name={name}
                                                    value={id}
                                                    className="cursor-pointer"
                                                    onChange={(event) => handleSelectedAcademicYearChange(event, id)}
                                                />
                                                <span className="ml-1">{name}</span>
                                                </label>
                                            </li>
                                        );
                                    })}

                                    </ol>
                                </div>
                            </label>
                            <h3>Select Course</h3>
                            <select value={selectedCourse} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                                <option value="*">All courses</option>
                                {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                            </select>
                        </div>
                    </>
                }
                <div className="w-2/3 mx-auto py-6 flex flex-col gap-4">
                    <Button icon={null} label="Generate Report" action={handleGenerateReport} />
                    {workbook && <Button icon={null} label="Save Report to Excel" action={handleSaveGradeReport} />}
                    <div className="flex justify-center">
                        <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                            <Button icon={null} label="Back" action={() => Promise.resolve(setView('grades'))}/>
                        </div>
                    </div>
                </div>
                {success && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-green-700 text-white font-semibold">Report generated successfully!</p></div>}
                {error && <div className='w-full flex justify-center'><p className="p-4 mb-6 rounded-lg shadow-md shadow-black bg-red-700 text-white font-semibold">Generating report failed, please check filters and try again.</p></div>}
            </div>

            <div className="w-full h-full">
                <div className="h-1/12 text-2xl">Output</div>
                <div className="bg-stone-300 w-full min-h-11/12 border-2 border-stone-600 rounded-xl  text-stone-900 p-4 text-left">
                    {cpAndBelow.length === 0 && !gradeCounts && 
                        <div>Run a report to show metrics here.</div>
                    }
                    {gradeCounts && 
                        <>
                        <p className="font-bold">Number of students with C+ or below: {cpAndBelow.length}</p>
                        <p className="font-bold">Students with C+ or below:</p>
                        {gradeCounts["C+"].length > 0 &&
                            <>
                                <h3 className="font-bold">C+</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["C+"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        {gradeCounts["C"].length > 0 &&
                            <>
                                <h3 className="font-bold">C</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["C"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        {gradeCounts["C-"].length > 0 &&
                            <>
                                <h3 className="font-bold">C-</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["C-"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }    
                        {gradeCounts["D+"].length > 0 &&
                            <>
                                <h3 className="font-bold">D+</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["D+"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        {gradeCounts["D"].length > 0 &&
                            <>
                                <h3 className="font-bold">D</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["D"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        {gradeCounts["D-"].length > 0 &&
                            <>
                                <h3 className="font-bold">D-</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["D-"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        {gradeCounts["F"].length > 0 &&
                            <>
                                <h3 className="font-bold">F</h3>
                                <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                    {gradeCounts["F"].map((studentIds) => (
                                        <Fragment key={studentIds}>
                                            <div>{studentIds}</div>
                                        </Fragment>
                                    ))}
                                </div>
                            </>
                        }
                        </>
                    }
                    {gradeCounts &&
                        <>
                            <div className="grid grid-cols-3 gap-x-4">
                                <div className="font-bold">Letter Grade</div>
                                <div className="font-bold">Grade Count</div>
                                <div className="font-bold">Percentage</div>
                                {Object.entries(gradeCounts).map(([letterGrade, studentIds]) => (
                                    <Fragment key={letterGrade}>
                                        <div>{letterGrade}</div>
                                        <div>{studentIds.length}</div>
                                        <div>{((studentIds.length / grades.length) * 100).toFixed(2)}%</div>
                                    </Fragment>
                                ))}
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}