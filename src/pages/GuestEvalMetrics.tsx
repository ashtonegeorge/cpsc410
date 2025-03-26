import { Fragment, useEffect, useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ExcelJS from 'exceljs';



export default function GuestEvalMetrics() {
    const [filter, setFilter] = useState('gs');
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [studentId, setStudentId] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const [workbook, setWorkbook] = useState<ExcelJS.Buffer>();
    const [cpAndBelow, setCpAndBelow] = useState<number[]>([]);
    const [gradeCounts, setGradeCounts] = useState<{ [key: string]: number[] } | null>(null);


    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: { id: string, name: string }[]) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const coursesArray = result.map((e) => [e.id, e.name] as [string, string]);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
        window.ipcRenderer.readGuestLecturers().then((result: { id: string, fname: string, lname: string }[]) => {
            const guestsArray = result.map((e) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(guestsArray);
        });
    }, [])
    
    useEffect(() => { // reset values when filter changes
        setSelectedAcademicYear("*");
        setSelectedCourse("*");
        setStudentId("");
    }, [filter])

    function handleSelectedCourseChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedCourse(event.target.value);
    }

    function handleSelectedAcademicYearChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedAcademicYear(event.target.value);
    }

    async function handleGenerateReport(): Promise<void> {
        // if(filter === 'sid' && studentId === "") { // form validation
        //     setError(true);
        //     setTimeout(() => {
        //         setError(false);
        //     }, 7000);
        //     return;
        // }

        try {
            const res: any = await window.ipcRenderer.generateGradeReport( // get sql data
                studentId === "" ? "*" : studentId,
                selectedCourse,
                selectedAcademicYear
            );

            if (res) { // set the response data to corresponding state to be used in the UI
                // setGrades(res.result);
                // setCpAndBelow(res.sortedCpAndBelow);
                // setGradeCounts(res.gradeCounts);
                // setWorkbook(res.buffer);
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
        <div className="flex justify-between gap-8 h-full">
            <div className="w-1/3">
                <h2 className="h-1/12 text-2xl">Guest Evaluation Metrics</h2>
                <div className="flex">
                    <h3 className="w-full place-self-center text-left">Filter results by: </h3>
                    <select className="text-black bg-white p-2 rounded-lg my-2 w-full" defaultValue={"gs"} onChange={(e) => setFilter(e.target.value)}>
                        <option value="gs">Guest Speaker</option>
                        <option value="course">Course</option>
                        <option value="ayear">Academic Year</option>
                    </select>
                </div>
                {filter === 'gs' && 
                    <>
                        <div className="w-full flex flex-col text-left">
                            <h3>Select Guest</h3>
                            <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                                <option value="*">All guest speakers</option>
                                {guests.map((guest) => <option key={guest[0]} value={guest[0]}>{guest[2]}, {guest[1]}</option>)}
                            </select>
                            <h3>Select Course</h3>
                            <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                                <option value="*">All courses</option>
                                {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                            </select>
                            <h3>Select Academic Year</h3>
                            <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                                <option value="*">All courses</option>
                                {academicYears.map(([id, name]) => (  
                                    <option className='flex p-1 w-full' value={id} key={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
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
                            <h3>Select Academic Year</h3>
                            <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                                <option value="*">All academic years</option>
                                {academicYears.map(([id, name]) => (  
                                    <option className='flex p-1 w-full' value={id} key={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                }
                {filter === 'ayear' && 
                    <>
                        <div className="w-full flex flex-col text-left">
                            <h3>Select Academic Year</h3>
                            <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                                <option value="*">All academic years</option>
                                {academicYears.map(([id, name]) => (  
                                    <option className='flex p-1 w-full' value={id} key={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
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
                </div>
                {success && <p className="w-full text-green-300 font-semibold">Report generated successfully!</p>}
                {error && <p className="w-full text-red-300 font-semibold">Saving report to Excel failed, ensure a report has been generated and please try again.</p>}
            </div>

            <div className="w-full h-full">
                <div className="h-1/12 text-2xl">Output</div>
                <div className="bg-stone-300 w-full min-h-11/12 border-2 border-stone-600 rounded-xl  text-stone-900 p-4 text-left">
                    {cpAndBelow.length === 0 && !gradeCounts && 
                        <div>Run a report to show metrics here.</div>
                    }
                    {cpAndBelow.length > 0 && 
                        <>
                            <p className="font-bold">Number of students with C+ or below: {cpAndBelow.length}</p>
                            <p className="font-bold">Students with C+ or below:</p>
                            <div className="grid grid-cols-6 gap-x-4 grid-flow-row">
                                {Array.from(cpAndBelow).map((id: number) => (
                                    <p key={id}>{id.toString()}</p>
                                ))}
                            </div>
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