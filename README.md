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
After running the postinstall, you must set up the Python embedded environment by first installing pip in the scope of the embedded interpreter.
```bash
./src/python/python.exe get-pip.py
```
Then install the necessary pip packages to the embedded environment by running the command below. 
```bash
./src/python/python.exe -m pip install --target ./src/python/Lib/site-packages -r ./requirements.txt
```
You can confirm that the embedded environment is sourcing the packages correctly by running the following command. 
```bash
./src/python/python.exe -c "import sys; print('\n'.join(sys.path))"
```

## Usage
You can start the application by running the following command. Ensure the Python environment is activated to use all features.
```bash
npm run dev
```

You can build an executable of the application by running the following command. The build is placed in /dist.
```bash
npm run build
```

## Technologies
This project was built using the following technologies:
- [Node.js](https://nodejs.org/docs/latest/api/)
- [Electron](https://www.electronjs.org/docs/latest/)
- [React](https://react.dev/learn)
- [Typescript](https://www.typescriptlang.org/docs/)
- [Python3.12.3](https://www.python.org/downloads/release/python-3123/)
- [OnnxRuntime](https://onnxruntime.ai/)
- [SQLite3](https://www.npmjs.com/package/better-sqlite3) 
- [TailwindCSS](https://tailwindcss.com/docs/installation/using-vite)