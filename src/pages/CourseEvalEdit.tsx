import Button from '../components/Button';

export default function CourseEvalEdit({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) { 
    return (
        /*div>
            <div className='pt-12 w-1/2 mx-auto'></div>
            <h2 className='font-semibold'>Edit Course Evaluation Data</h2>
            <p>Update course evaluation data from this menu</p>
            
        </div>
        */
        <div className="flex justify-evenly gap-12 pb-12">
                <Button icon={null} label="Back" action={() => Promise.resolve(setView('courseEval'))}/>
            </div>
    );
}