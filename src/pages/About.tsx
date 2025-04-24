import marcusPhoto from "../assets/marcus.jpg"
import ashtonPhoto from "../assets/ashton.jpg"
import zachPhoto from "../assets/zach.jpg"
import caseyPhoto from "../assets/casey.jpg"
import auremPhoto from "../assets/aurem.jpg"
import prestonPhoto from "../assets/preston.jpg"
import tommyPhoto from "../assets/tommy.jpg"

export default function About() {
    return (
        <div>
            <h2 className="text-3xl font-bold">About</h2>
            <p>This application was developed by a team of students in Dr. Slonka's CPSC 410 class. The team members are:</p>
            <ul>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={marcusPhoto} height="400" width="400"/></li>
                <li>Marcus Amerine</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={ashtonPhoto} height="400" width="400"/></li>
                <li>Ashton George</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={zachPhoto} height="400" width="400"/></li>
                <li>Zachary Krepelka</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={caseyPhoto} height="400" width="400"/></li>
                <li>Casey Kuhn</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={auremPhoto} height="400" width="400"/></li>
                <li>Aurembiaix Pifarre Planes</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={prestonPhoto} height="400" width="400"/></li>
                <li>Preston Slagle</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
                <li><img className="ml-104" src={tommyPhoto} height="400" width="400"/></li>
                <li>Thomas Urbain</li>
                <li>-------------------------------------------------------------------------------------------------------------------------</li>
            </ul>
        </div>
    );
}
