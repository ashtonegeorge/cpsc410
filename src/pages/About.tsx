import marcusPhoto from "../assets/marcus.jpg"
import ashtonPhoto from "../assets/ashton.jpg"
import zachPhoto from "../assets/zach.jpg"
import caseyPhoto from "../assets/casey.jpg"
import auremPhoto from "../assets/aurem.jpg"
import prestonPhoto from "../assets/preston.jpg"
import tommyPhoto from "../assets/tommy.jpg"
import evalu8Photo from "../assets/Evalu8.png"

export default function About() {
    return (
        <div>
            <h2 className="text-3xl font-bold">About</h2>
            <p>This application was developed by a team of students in Dr. Slonka's CPSC 410 class. The team members are:</p>
            <ul>
                <div className="flex justify-evenly w-full">
                    <div>
                        <li><img className="mx-auto" src={marcusPhoto} height="100" width="100"/></li>
                        <li>Marcus Amerine</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={ashtonPhoto} height="100" width="100"/></li>
                        <li>Ashton George</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={zachPhoto} height="100" width="100"/></li>
                        <li>Zachary Krepelka</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={caseyPhoto} height="100" width="100"/></li>
                        <li>Casey Kuhn</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={auremPhoto} height="100" width="100"/></li>
                        <li>Aurembiaix Pifarre Planes</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={prestonPhoto} height="100" width="100"/></li>
                        <li>Preston Slagle</li>
                    </div>
                    <div>
                        <li><img className="mx-auto" src={tommyPhoto} height="100" width="100"/></li>
                        <li>Thomas Urbain</li>
                    </div>
                </div>
            </ul>
            <ul>
            <div className='pt-12 w-1/2 mx-auto'></div>
            <li><img className="mx-auto" src={evalu8Photo} height="200" width="200"/></li>
            </ul>
            <div className='pt-12 w-1/2 mx-auto'>
            <h2 className="text-3xl font-bold">User Manual</h2>
            <p>Click below to access our User Manual if you have any questions.</p>

            </div>
        </div>
    );
}
