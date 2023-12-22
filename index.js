document.getElementById("generateButton").addEventListener("click", generateTimetables);

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        function generateTimetables() {
            var k=document.getElementById("nme").value;
            document.getElementById("plzScr").innerHTML="*scroll down for timetable";
            document.getElementById("ht").innerHTML="Here is "+k +" department timetable";
            document.getElementById("scr").style.backgroundColor="#323232";
            var aud=new Audio("./audio/timetable.mp3");
            aud.play();
            const numSections = parseInt(document.getElementById("numSections").value);
            const periodsPerDay = parseInt(document.getElementById("periodsPerDay").value);
            const numSubjects = parseInt(document.getElementById("numSubjects").value);
            const periodsPerSubject = parseInt(document.getElementById("periodsPerSubject").value);
            const numFaculty = parseInt(document.getElementById("numFaculty").value);

            const facultyInfo = generateFacultyInfo(numSections, numFaculty);

            const timetablesContainer = document.getElementById("timetablesContainer");
            timetablesContainer.innerHTML = ''; // Clear previous content

            for (let section = 0; section < numSections; section++) {
                const timetable = generateWeeklyTimetable(1, periodsPerDay, numSubjects, periodsPerSubject, [facultyInfo[section]]);
                displayTimetable(timetable, 1, periodsPerDay, numSubjects, daysOfWeek, timetablesContainer, section);
            }
        }

        function generateFacultyInfo(numSections, numFaculty) {
            const facultyInfo = [];
            for (let i = 0; i < numSections; i++) {
                const sectionInfo = [];
                for (let j = 0; j < numFaculty; j++) {
                    sectionInfo.push({
                        faculty: `Faculty ${j + 1}`,
                        subject: `Subject ${j + 1}`,
                        periodsScheduled: 0
                    });
                }
                facultyInfo.push(sectionInfo);
            }
            return facultyInfo;
        }

        function displayTimetable(timetable, numSections, periodsPerDay, numSubjects, daysOfWeek, container, section) {
            const table = document.createElement("table");
            table.style.marginBottom = "5rem";
            container.appendChild(table);

            // Create the table headers with periods as columns
            const headerRow = table.insertRow();
            const headerCell = headerRow.insertCell();
            headerCell.innerHTML = `<b>Section ${section + 1}</b>`; // Section header

            for (let period = 0; period < periodsPerDay; period++) {
                const headerCell = headerRow.insertCell();
                headerCell.innerHTML = `Period ${period + 1}`;
            }

            // Fill in the timetable for the section
            for (let day = 0; day < daysOfWeek.length; day++) {
                const row = table.insertRow();
                const dayCell = row.insertCell();
                dayCell.innerHTML = daysOfWeek[day];

                for (let period = 0; period < periodsPerDay; period++) {
                    const cell = row.insertCell();
                    const schedule = timetable[0][period][day];
                    cell.innerHTML = `${schedule.faculty}<br>${schedule.subject}`;
                }
            }
        }

        // Rest of your code remains unchanged
        function addFacultyInputFields() {
            const numSections = document.getElementById("numSections").value;
            const numSubjects = document.getElementById("numSubjects").value;

            const facultyInfoContainer = document.getElementById("facultyInfo");
            facultyInfoContainer.innerHTML = '';

            for (let i = 1; i <= numSections; i++) {
                for (let j = 0; j < numSubjects; j++) {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.id = `facultyName_${i}_${j}`;
                    input.placeholder = `Faculty Name for Section ${i}, Subject ${j + 1}`;
                    facultyInfoContainer.appendChild(input);

                    // Add a line break after each faculty input
                    const lineBreak = document.createElement("br");
                    facultyInfoContainer.appendChild(lineBreak);
                }
            }
        }

        document.getElementById("numSections").addEventListener("input", addFacultyInputFields);
        document.getElementById("numSubjects").addEventListener("input", addFacultyInputFields);

        // Modified generateWeeklyTimetable function
        function generateWeeklyTimetable(numSections, periodsPerDay, numSubjects, periodsPerSubject, facultyInfo) {
            const timetable = [];

            // Initialize a data structure to track scheduled subjects for each section and period
            const scheduledSubjects = new Array(numSections);
            for (let section = 0; section < numSections; section++) {
                scheduledSubjects[section] = new Array(daysOfWeek.length);
                for (let day = 0; day < daysOfWeek.length; day++) {
                    scheduledSubjects[section][day] = new Array(periodsPerDay).fill([]);
                }
            }

            const facultyPerDay = Math.ceil(facultyInfo[0].length / daysOfWeek.length);

            for (let section = 0; section < numSections; section++) {
                const sectionTimetable = [];
                for (let period = 0; period < periodsPerDay; period++) {
                    const dailySchedule = [];
                    for (let day = 0; day < daysOfWeek.length; day++) {
                        // Find a faculty member who can teach an unscheduled subject
                        const facultyIndex = findAvailableFaculty(section, day, period, scheduledSubjects, facultyInfo, periodsPerSubject);

                        if (facultyIndex !== -1) {
                            const faculty = facultyInfo[section][facultyIndex].faculty;
                            const subject = facultyInfo[section][facultyIndex].subject;
                            dailySchedule.push({
                                faculty,
                                subject
                            });

                            // Update the list of scheduled subjects and increment the periodsScheduled count
                            scheduledSubjects[section][day][period] = [...scheduledSubjects[section][day][period], subject];
                            facultyInfo[section][facultyIndex].periodsScheduled++;
                        } else {
                            dailySchedule.push({
                                faculty: '',
                                subject: ''
                            }); // No available faculty
                        }
                    }
                    sectionTimetable.push(dailySchedule);
                }
                timetable.push(sectionTimetable);
            }

            // Add empty slots in the last periods of each day
            addEmptySlots(timetable, periodsPerDay);

            return timetable;
        }

        function addEmptySlots(timetable, periodsPerDay) {
            for (let section = 0; section < timetable.length; section++) {
                for (let day = 0; day < timetable[section][0].length; day++) {
                    for (let period = timetable[section].length; period < periodsPerDay; period++) {
                        timetable[section].forEach(schedule => {
                            schedule.push({
                                faculty: '',
                                subject: ''
                            });
                        });
                    }
                }
            }
        }

        function findAvailableFaculty(section, day, period, scheduledSubjects, facultyInfo, periodsPerSubject) {
            const availableSubjects = facultyInfo[section].filter(({
                subject,
                periodsScheduled
            }, index) => {
                return !scheduledSubjects[section][day][period].includes(subject) &&
                    periodsScheduled < periodsPerSubject &&
                    !scheduledSubjects.some((s, i) => i !== section && s[day][period].includes(subject));
            });

            if (availableSubjects.length > 0) {
                // Choose a faculty member from the available subjects
                const randomIndex = Math.floor(Math.random() * availableSubjects.length);
                return facultyInfo[section].indexOf(availableSubjects[randomIndex]);
            } else {
                return -1; // No available faculty for this period
            }
        }