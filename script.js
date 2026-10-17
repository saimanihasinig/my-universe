const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("myUniverseTasks")) || [];
let habits = JSON.parse(localStorage.getItem("myUniverseHabits")) || [];
let selectedDate = getLocalDateString();

function createTask(taskText, completed = false,taskId=crypto.randomUUID()) {
    const newTask = document.createElement("li");
    newTask.dataset.taskId = taskId;

    const taskTextElement = document.createElement("span");
    taskTextElement.textContent = taskText;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("deleteBtn");

    newTask.appendChild(checkbox);
    newTask.appendChild(taskTextElement);
    newTask.appendChild(deleteBtn);

    if (completed) {
        newTask.classList.add("completed");
    }

    
    checkbox.addEventListener("change", function() {
        newTask.classList.toggle("completed", checkbox.checked);
        const today = new Date().toLocaleDateString("en-CA");
        const task = tasks.find(function(task) {
            return task.id === taskId;
        });
        if (task) {
            task.completed = checkbox.checked;

            if (checkbox.checked) {
                task.completedDate = today;
            } else {
                task.completedDate = null;
            }

            saveTasks()
        }
    });

    
    deleteBtn.addEventListener("click", function() {
        tasks = tasks.filter(function(task) {
            return task.id !== taskId;
        });

        newTask.remove();

        saveTasks();
    });


    return newTask;
}


function displayTasks() {
    taskList.innerHTML = "";

    const selectedTasks = tasks.filter(function(task) {
        // Keep older tasks visible until we migrate them.
        if (!task.date) {
            return true;
        }

        return task.date === selectedDate;
    });

    selectedTasks.forEach(function(task) {
        const newTask = createTask(
            task.text,
            task.completed,
            task.id
        );

        taskList.appendChild(newTask);
    });
}


function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const taskId = crypto.randomUUID();

    const newTaskData = {
        id: taskId,
        text: taskText,
        completed: false,
        date: selectedDate
    };

    tasks.push(newTaskData);

    displayTasks();
    saveTasks();

    taskInput.value = "";
    
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

function saveTasks() {
    localStorage.setItem("myUniverseTasks", JSON.stringify(tasks));
}

function createHabit(name, schedule) {
    return {
        id: crypto.randomUUID(),
        name: name,
        schedule: schedule,
        completedDates: [],
        currentStreak: 0,
        bestStreak: 0
    };
}

function addHabit(name, schedule) {
    const newHabit = createHabit(name, schedule);

    habits.push(newHabit);
    saveHabits();

    return newHabit;
}


const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const addHabitBtn = document.getElementById("addHabitBtn");


function displayHabits() {
    habitList.innerHTML = "";

    habits.forEach(function(habit) {
        const li = document.createElement("li");

        // Create the completion checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const today = getLocalDateString();
        checkbox.checked = habit.completedDates.includes(today);

        // Create the habit name
        const habitText = document.createElement("span");
        habitText.textContent = habit.name;

        
        const scheduleText = document.createElement("small");

        if (habit.schedule.type === "daily") {
            scheduleText.textContent = "Every day";
        } else if (habit.schedule.type === "selectedDays") {
            const dayNames = [
                "Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"
            ];

            scheduleText.textContent = habit.schedule.days
                .map(function(day) {
                    return dayNames[day];
                })
                .join(", ");
        } else if (habit.schedule.type === "weekly") {
            const dayNames = [
                "Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"
            ];

            scheduleText.textContent =
                "Every " + dayNames[habit.schedule.day];
        } else if (habit.schedule.type === "interval") {
            scheduleText.textContent =
                "Every " + habit.schedule.interval + " days";
        }


        if (checkbox.checked) {
            habitText.classList.add("habit-completed");
        }

        // Save completion when checkbox changes
        checkbox.addEventListener("change", function() {
            if (checkbox.checked) {
                if (!habit.completedDates.includes(today)) {
                    habit.completedDates.push(today);
                }
            } else {
                habit.completedDates =
                    habit.completedDates.filter(function(date) {
                        return date !== today;
                    });
            }

            saveHabits();
            displayHabits();
        });

        // Create the Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("deleteBtn");

        deleteBtn.addEventListener("click", function() {
            habits = habits.filter(function(item) {
                return item.id !== habit.id;
            });

            saveHabits();
            displayHabits();
        });

        
        const habitInfo = document.createElement("div");
        
        const streaks = getHabitStreaks(habit);

        const streakInfo = document.createElement("small");   

        streakInfo.textContent =
            "🔥 Current: " + streaks.current +
            "  |  🏆 Max: " + streaks.max;

        streakInfo.style.color = "#8B79BD";
        streakInfo.style.fontSize = "15px";

        habitInfo.style.display = "flex";
        habitInfo.style.flexDirection = "column";
        habitInfo.style.flex = "1";
        habitInfo.style.gap = "4px";

        habitInfo.appendChild(habitText);
        habitInfo.appendChild(scheduleText);
        habitInfo.appendChild(streakInfo);

        li.appendChild(checkbox);
        li.appendChild(habitInfo);
        li.appendChild(deleteBtn);


        habitList.appendChild(li);
    });
}


function displayScheduleOptions() {
    const scheduleType =
        document.getElementById("habitSchedule").value;

    const optionsContainer =
        document.getElementById("habitScheduleOptions");

    optionsContainer.innerHTML = "";

    if (scheduleType === "selectedDays") {
        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const heading = document.createElement("p");
        heading.textContent = "Choose your habit days:";
        optionsContainer.appendChild(heading);

        days.forEach(function(day, index) {
            const label = document.createElement("label");
            label.style.marginRight = "12px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = index;
            checkbox.name = "habitDay";

            label.appendChild(checkbox);
            label.appendChild(
                document.createTextNode(" " + day)
            );

            optionsContainer.appendChild(label);
        });
    }
    
    if (scheduleType === "weekly") {
        const label = document.createElement("label");
        label.textContent = "Repeat every week on ";

        const select = document.createElement("select");
        select.id = "habitWeeklyDay";

        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        days.forEach(function(day, index) {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = day;

            if (index === new Date().getDay()) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        label.appendChild(select);
        optionsContainer.appendChild(label);
    }

    if (scheduleType === "interval") {
        const label = document.createElement("label");
        label.textContent = "Repeat every ";

        const input = document.createElement("input");
        input.type = "number";
        input.id = "habitInterval";
        input.min = "2";
        input.max = "365";
        input.value = "3";
        input.style.width = "65px";
        input.style.padding = "8px";
        input.style.margin = "0 6px";
        input.style.border = "2px solid #C6B5E8";
        input.style.borderRadius = "8px";
        input.style.fontFamily = "inherit";

        const daysText = document.createTextNode(" days");

        label.appendChild(input);
        label.appendChild(daysText);
        optionsContainer.appendChild(label);
    }
}

document.getElementById("habitSchedule").addEventListener(
    "change",
    displayScheduleOptions
);

function handleAddHabit() {
    const habitName = habitInput.value.trim();

    if (habitName === "") {
        alert("Please enter a habit name! 🌱");
        return;
    }

    const scheduleType =document.getElementById("habitSchedule").value;

    let schedule;

    if (scheduleType === "daily") {
        schedule = { type: "daily" };
    
    }else if (scheduleType === "selectedDays") {
        const selectedDays = Array.from(
            document.querySelectorAll(
                'input[name="habitDay"]:checked'
            )
        ).map(function(checkbox) {
            return Number(checkbox.value);
        });

        if (selectedDays.length === 0) {
            alert("Please select at least one day! 🌷");
            return;
        }

        schedule = {
            type: "selectedDays",
            days: selectedDays
        };

    } else if (scheduleType === "weekly") {
        const weeklyDay =document.getElementById("habitWeeklyDay");

        schedule = {
            type: "weekly",
            day: Number(weeklyDay.value)
        };
    } else if (scheduleType === "interval") {
        const intervalInput =
            document.getElementById("habitInterval");
        const interval = Number(intervalInput.value);

        if (
            !Number.isInteger(interval) ||
            interval < 2 ||
            interval > 365
        ) {
            alert("Please enter a whole number between 2 and 365! 🌷");
            return;
        }

        schedule = {
            type: "interval",
            interval: interval,
            startDate: getLocalDateString()
        };
    }

    
    addHabit(habitName, schedule);
    displayHabits();

    habitInput.value = "";

    document.getElementById("habitSchedule").value = "daily";
    displayScheduleOptions();

}

addHabitBtn.addEventListener("click", handleAddHabit);

habitInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        handleAddHabit();
    }
});


function loadTasks() {
    displayTasks();
}

loadTasks();
displayHabits();

function saveHabits() {
    localStorage.setItem("myUniverseHabits", JSON.stringify(habits));
}

function findHabitById(habitId) {
    return habits.find(function(habit) {
        return habit.id === habitId;
    });
}

function completeHabit(habitId, date) {
    const habit = findHabitById(habitId);

    if (!habit) {
        return;
    }

    if (!habit.completedDates.includes(date)) {
        habit.completedDates.push(date);
        saveHabits();
    }
}

function getCompletedTasksForDate(date) {
    return tasks.filter(function(task) {
        return task.completed === true &&
               task.completedDate === date;
    }).length;
}

function getDailyActivity() {
    const activity = {};

    tasks.forEach(function(task) {
        if (task.completed && task.completedDate) {
            activity[task.completedDate] =
                (activity[task.completedDate] || 0) + 1;
        }
    });

    return activity;
}

function isScheduledToday(schedule, date) {
    const day = date.getDay();

    if (schedule.type === "daily") {
        return true;
    }

    if (schedule.type === "selectedDays") {
        return schedule.days.includes(day);
    }

    if (schedule.type === "weekly") {
        return day === schedule.day;
    }

    if (schedule.type === "interval") {
        const startDate = new Date(schedule.startDate + "T12:00:00");
        const currentDate = new Date(date);

        const differenceInDays = Math.floor(
            (currentDate - startDate) / (1000 * 60 * 60 * 24)
        );

        return differenceInDays >= 0 &&
           differenceInDays % schedule.interval === 0;
    }

    return false;
}


function getHabitStreaks(habit) {
    const today = getLocalDateString();
    const completedDates = new Set(habit.completedDates);

    if (completedDates.size === 0) {
        return { current: 0, max: 0 };
    }

    const dates = [...completedDates].sort();
    const firstDate = new Date(dates[0] + "T12:00:00");
    const todayDate = new Date(today + "T12:00:00");

    let streak = 0;
    let maxStreak = 0;
    let currentStreak = 0;

    for (
        let date = new Date(firstDate);
        date <= todayDate;
        date.setDate(date.getDate() + 1)
    ) {
        const dateString = getLocalDateString(date);
        const scheduled = isScheduledToday(habit.schedule, date);
        const completed = completedDates.has(dateString);

        if (!scheduled) {
            continue;
        }

        if (completed) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else {
            streak = 0;
        }
    }

    currentStreak = streak;

    return {
        current: currentStreak,
        max: maxStreak
    };
}

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


const calendarGrid = document.getElementById("calendarGrid");
const calendarMonth = document.getElementById("calendarMonth");
const tasksHeading = document.getElementById("tasksHeading");

let displayedMonth = new Date();
displayedMonth.setDate(1);

function displayCalendar() {
    calendarGrid.innerHTML = "";

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    calendarMonth.textContent = displayedMonth.toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    dayNames.forEach(function(day) {
        const dayLabel = document.createElement("div");
        dayLabel.textContent = day;
        dayLabel.classList.add("calendar-day-name");
        calendarGrid.appendChild(dayLabel);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-empty");
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.textContent = day;
        dayButton.classList.add("calendar-date");

        if (dateString === getLocalDateString()) {
            dayButton.classList.add("today");
        }

        if (dateString === selectedDate) {
            dayButton.classList.add("selected");
        }

        const hasTasks = tasks.some(function(task) {
            return task.date === dateString;
        });

        if (hasTasks) {
            dayButton.classList.add("has-tasks");
        }

        dayButton.addEventListener("click", function() {
            selectedDate = dateString;
            displayCalendar();
            displayTasks();

            tasksHeading.textContent =
                dateString === getLocalDateString()
                    ? "Today's Tasks"
                    : "Tasks for " + date.toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                    );
        });

        calendarGrid.appendChild(dayButton);
    }
}

document.getElementById("prevMonthBtn").addEventListener(
    "click",
    function() {
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);
        displayCalendar();
    }
);

document.getElementById("nextMonthBtn").addEventListener(
    "click",
    function() {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);
        displayCalendar();
    }
);

document.getElementById("todayBtn").addEventListener(
    "click",
    function() {
        displayedMonth = new Date();
        displayedMonth.setDate(1);

        selectedDate = getLocalDateString();

        displayCalendar();
        displayTasks();

        tasksHeading.textContent = "Today's Tasks";
    }
);

displayCalendar();


const datePickerModal = document.getElementById("datePickerModal");
const chosenDatePreview = document.getElementById("chosenDatePreview");
const cancelDateBtn = document.getElementById("cancelDateBtn");
const confirmDateBtn = document.getElementById("confirmDateBtn");

const jumpMonthBtn = document.getElementById("jumpMonthBtn");
const jumpMonthLabel = document.getElementById("jumpMonthLabel");
const monthOptions = document.getElementById("monthOptions");

let chosenMonth = 0;

const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];


// Build the custom month menu
monthNames.forEach(function(month, index) {
    const option = document.createElement("button");

    option.type = "button";
    option.classList.add("month-option");
    option.textContent = month;

    option.addEventListener("click", function() {
        chosenMonth = index;
        jumpMonthLabel.textContent = month;

        monthOptions.hidden = true;
        jumpMonthBtn.setAttribute("aria-expanded", "false");

        updateJumpDays();
    });

    monthOptions.appendChild(option);
});

// Custom Day and Year picker elements
const jumpDayBtn = document.getElementById("jumpDayBtn");
const jumpDayLabel = document.getElementById("jumpDayLabel");
const dayOptions = document.getElementById("dayOptions");

const jumpYearBtn = document.getElementById("jumpYearBtn");
const jumpYearLabel = document.getElementById("jumpYearLabel");
const yearOptions = document.getElementById("yearOptions");

// Store the selected day and year
let chosenDay = 1;
let chosenYear = 2026;


// Close a dropdown menu
function closePickerMenu(menu, button) {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
}


// Open or close a dropdown menu
function togglePickerMenu(menu, button) {
    const willOpen = menu.hidden;

    // Close the other custom menus
    closePickerMenu(dayOptions, jumpDayBtn);
    closePickerMenu(monthOptions, jumpMonthBtn);
    closePickerMenu(yearOptions, jumpYearBtn);

    console.log("Day hidden:", dayOptions.hidden);
    console.log("Month hidden:", monthOptions.hidden);
    console.log("Year hidden:", yearOptions.hidden);

    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
}


// Update the available days for the chosen month and year
function updateJumpDays() {
    const daysInMonth = new Date(
        chosenYear,
        chosenMonth + 1,
        0
    ).getDate();

    // Keep the selected day valid for the month
    chosenDay = Math.min(chosenDay, daysInMonth);

    dayOptions.innerHTML = "";

    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement("button");

        option.type = "button";
        option.classList.add("picker-option");
        option.textContent = day;

        option.addEventListener("click", function() {
            chosenDay = day;
            jumpDayLabel.textContent = day;

            closePickerMenu(dayOptions, jumpDayBtn);
            updateDatePreview();
        });

        dayOptions.appendChild(option);
    }

    jumpDayLabel.textContent = chosenDay;
    updateDatePreview();
}


// Build the list of years
for (let year = 1900; year <= 2100; year++) {
    const option = document.createElement("button");

    option.type = "button";
    option.classList.add("picker-option");
    option.textContent = year;

    option.addEventListener("click", function() {
        chosenYear = year;
        jumpYearLabel.textContent = year;

        closePickerMenu(yearOptions, jumpYearBtn);
        updateJumpDays();
    });

    yearOptions.appendChild(option);
}



jumpDayBtn.addEventListener("click", function() {
    togglePickerMenu(dayOptions, jumpDayBtn);
});

jumpMonthBtn.addEventListener("click", function() {
    togglePickerMenu(monthOptions, jumpMonthBtn);
});

jumpYearBtn.addEventListener("click", function() {
    togglePickerMenu(yearOptions, jumpYearBtn);
});


// Update the date preview
function updateDatePreview() {
    if (
        chosenDay < 1 ||
        chosenMonth === undefined ||
        !chosenYear
    ) {
        chosenDatePreview.textContent = "Select a date";
        return;
    }

    const chosenDate = new Date(
        chosenYear,
        chosenMonth,
        chosenDay,
        12
    );

    chosenDatePreview.textContent =
        chosenDate.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}


// Open the Jump to Date popup
function openJumpDatePicker() {
    const parts = selectedDate.split("-").map(Number);

    chosenYear = parts[0];
    chosenMonth = parts[1] - 1;
    chosenDay = parts[2];

    jumpYearLabel.textContent = chosenYear;
    jumpMonthLabel.textContent = monthNames[chosenMonth];
    jumpDayLabel.textContent = chosenDay;

    closePickerMenu(dayOptions, jumpDayBtn);
    closePickerMenu(monthOptions, jumpMonthBtn);
    closePickerMenu(yearOptions, jumpYearBtn);

    updateJumpDays();

    datePickerModal.hidden = false;
}


calendarMonth.addEventListener("click", openJumpDatePicker);


// Cancel button
cancelDateBtn.addEventListener("click", function() {
    datePickerModal.hidden = true;

    closePickerMenu(dayOptions, jumpDayBtn);
    closePickerMenu(monthOptions, jumpMonthBtn);
    closePickerMenu(yearOptions, jumpYearBtn);
});


// OK button
confirmDateBtn.addEventListener("click", function() {
    const year = chosenYear;
    const month = chosenMonth;
    const day = chosenDay;

    selectedDate = [
        String(year).padStart(4, "0"),
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0")
    ].join("-");

    displayedMonth = new Date(year, month, 1);

    displayCalendar();
    displayTasks();

    const chosenDate = new Date(year, month, day, 12);

    tasksHeading.textContent =
        selectedDate === getLocalDateString()
            ? "Today's Tasks"
            : "Tasks for " + chosenDate.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

    datePickerModal.hidden = true;
});