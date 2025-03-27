import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';
// import ExcelJS from 'exceljs';

export default function GuestEvalMetrics() {
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [selectedGuest, setSelectedGuest] = useState('*');
    const [selectedCourse, setSelectedCourse] = useState('*');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('*');
    const [selectedSemester, setSelectedSemester] = useState('*');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    // const [workbook, setWorkbook] = useState<ExcelJS.Buffer>();
    const [result, setResult] = useState<[string, string][]>([]);

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
        window.ipcRenderer.readSemesters().then((result: { id: string, name: string }[]) => {
            const semestersArray = result.map((e) => [e.id, e.name] as [string, string]);
            setSemesters(semestersArray);
        });
        window.ipcRenderer.readGuestLecturers().then((result: { id: string, fname: string, lname: string }[]) => {
            const guestsArray = result.map((e) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(guestsArray);
        });
    }, [])

    function handleSelectedGuestChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedGuest(event.target.value);
    }

    function handleSelectedCourseChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedCourse(event.target.value);
    }

    function handleSelectedAcademicYearChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedAcademicYear(event.target.value);
    }
    
    function handleSelectedSemesterChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedSemester(event.target.value);
    }

    async function handleGenerateReport(): Promise<void> {
        try {
            const res: [string, string][] = await window.ipcRenderer.generateGuestReport( // get sql data
                selectedGuest,
                selectedCourse,
                selectedSemester,
                selectedAcademicYear
            );

            console.log(res);

            if (res) { // set the response data to corresponding state to be used in the UI
                setResult(res);
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
                <div className="w-full flex flex-col text-left">
                    <h3>Select Guest</h3>
                    <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedGuestChange}>
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
                        <option value="*">All academic years</option>
                        {academicYears.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <h3>Select semester</h3>
                    <select defaultValue={"*"} onChange={handleSelectedSemesterChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        <option value="*">All semesters</option>
                        {semesters.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-2/3 mx-auto py-6 flex flex-col gap-4">
                    <Button icon={null} label="Generate Report" action={handleGenerateReport} />
                    {/* {workbook && <Button icon={null} label="Save Report to Excel" action={handleSaveGuestReport} />} */}
                </div>
                {success && <p className="w-full text-green-300 font-semibold">Report generated successfully!</p>}
                {error && <p className="w-full text-red-300 font-semibold">Saving report to Excel failed, ensure a report has been generated and please try again.</p>}
            </div>

            <div className="w-full h-full">
                <div className="h-1/12 text-2xl">Output</div>
                <div className="bg-stone-300 w-full min-h-11/12 border-2 border-stone-600 rounded-xl  text-stone-900 p-4 text-left">
                    {(result.length === 0 || !result) && 
                        <div>Run a report to show metrics here.</div>
                    }
                    { result.length > 0 &&
                        <div className='grid grid-cols-1'>
                            {result.map((qa, i) => (
                                <Fragment key={i}>
                                    <p className='font-semibold'>
                                        {qa[0]}
                                    </p>
                                    <p>
                                        {qa[1]}
                                    </p>
                                </Fragment>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>

    );
}