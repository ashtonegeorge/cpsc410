# Evalu8 (or whatever we come up with later)
This is an application for the PA department to store and report on data from surveys regarding the course and guest speakers. Also, this application handles grade entry and reporting for the department.

## The Team
This application was developed by a team of students in Dr. Slonka's CPSC 410 class. The team members are:
- Marcus Amerine
- Ashton George
- Zachary Krepelka
- Casey Kuhn
- Aurembiaix Pifarre Planes
- Preston Slagle
- Thomas Urbain

## Installation
Instructions on how to install and set up the project.

First, clone the repository to your local machine.
```bash
git clone https://github.com/ashtonegeorge/cpsc410
```
Then navigate to the project directory.
```bash
cd cpsc410
```
Now install the project dependencies.
```bash
npm i
```
From here, you must run the postinstall script to initialize the database.
```bash
npm run postinstall
```
After running the postinstall, you must create a Python virtual environment using the command below.
```bash
virtualenv venv
```
Now activate the virtual environment.
```bash
.\venv\Scripts\activate.ps1 # Windows PowerShell
.\venv\Scripts\activate.bat # Windows Command Prompt
source ./venv/bin/activate # macOS/Linux
```
From here we can finally install the pip dependencies from requirements.txt. 
```bash
pip install -r requirements.txt
```

## Usage
You can start the application by running the following command. Ensure the Python environment is activated to use all features.
```bash
npm run dev
```

## Technologies
This project was built using the following technologies:
- [Node.js](https://nodejs.org/docs/latest/api/)
- [Electron](https://www.electronjs.org/docs/latest/)
- [React](https://react.dev/learn)
- [Typescript](https://www.typescriptlang.org/docs/)
- [SQLite3](https://www.npmjs.com/package/better-sqlite3) 
- [TailwindCSS](https://tailwindcss.com/docs/installation/using-vite)