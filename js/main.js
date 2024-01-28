const tasksList = document.getElementById("tasksList");
const taskInput = document.querySelector(".add-task__input");
const taskPopup = document.getElementById("taskPopup");
const popupClose = document.getElementById("popupClose");
const popupTaskText = document.getElementById("popupTaskText");
const applyChangesButton = document.getElementById("applyChanges");
const addTaskButton = document.getElementById("addTaskButton");
const deleteTaskButton = document.getElementById("deleteTaskButton");
const statusWrapper = document.querySelector(".popup__wrapper");
const taksOpenBoard = document.getElementById("open");
const taksWorkBoard = document.getElementById("at-work");
const taksClosedBoard = document.getElementById("closed");
const alertText = document.querySelector(".alert");
const clearInputButton = document.querySelector(".del");

let savedStatus ; 
let  statuses = [];
let tasks = [];
let taskIdCounter = 4; // Счетчик для уникальных идентификаторов задач

// Отрисовка задач на странице
function renderTasks() {
  tasksList.innerHTML="" 
  taksOpenBoard.innerHTML=''
  taksWorkBoard.innerHTML=''
  taksClosedBoard.innerHTML=''
  if (localStorage.getItem("Task")) {
    tasks = JSON.parse(localStorage.getItem("Task"));
  }

  tasks.forEach((task) => {
    const taskItem = createTaskElement(task);
    tasksList.appendChild(taskItem);
    createTaskElementForTaskBoard(task);
    
  });
  statuses = taskPopup.querySelectorAll(".tasks__status")
  
}
// Отрисовка кнопки очистки


function toggleClearButton() {
  if (taskInput.value.trim()!=="") {
    clearInputButton.style.display = "block"
  
  }
  else{
    clearInputButton.style.display = "none"
    
  }
}
clearInputButton.addEventListener("click", ()=>{
  clearInputButton.style.display = "none"
  taskInput.value=""
})


//Создание дом-элемента для нижнего списка
function createTaskElementForTaskBoard(item) {
  const taskItemForBoard = document.createElement("li");
  taskItemForBoard.classList.add("task-board__item");
  taskItemForBoard.id = item.id;

  taskItemForBoard.draggable = "true";

  taskItemForBoard.addEventListener("dragstart", function (event) {});

  taskItemForBoard.draggable = "true";
  taskItemForBoard.ondragstart = "drag(event)";

  taskItemForBoard.textContent = item.text;

  switch (item.status) {
    case "Открыт":
      taksOpenBoard.appendChild(taskItemForBoard);

      break;
    case "В работе":
      taksWorkBoard.appendChild(taskItemForBoard);

      break;
    case "Закрыт":
      taksClosedBoard.appendChild(taskItemForBoard);

      break;
    default:
      break;
  }
}

// Создание дом-элемента для спикска
function createTaskElement(task) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("tasks__item");
  taskItem.id = task.id;

  taskItem.textContent = task.text;

  const statusButton = document.createElement("button");
  statusButton.classList.add("tasks__status");
  statusButton.textContent = task.status;

  taskItem.appendChild(statusButton);
  return taskItem;
}

// Открытие попапа при клике на статус
tasksList.addEventListener("click", function (event) {
  if(event.target.className.includes("tasks__status") ){
    const taskItem = event.target.parentNode
    const taskId = parseInt(taskItem.id, 10);
    const currentTask = tasks.find((task) => task.id === taskId);
    showPopup(currentTask);
  }
});

// Закрытие попапа по клику на крестик
popupClose.addEventListener("click", hidePopup);

// Применение изменений и закрытие попапа
applyChangesButton.addEventListener("click", function () {
  
  const taskId = parseInt(taskPopup.currentTask.id, 10);
  const newText = popupTaskText.value;
 

  // Обновление текста задачи и статуса
 
  const updatedTask = tasks.find((task) => task.id === taskId);
  if (updatedTask) {
    updatedTask.text = newText;
    updatedTask.status = savedStatus;
  }


  // Пересортировка задач
  sortTasks();
  setToLocalStorage()
  // Закрытие попапа
  hidePopup()
});


// Добавление новой задачи
addTaskButton.addEventListener("click", function () {
  if (taskInput.value) {
    const newTask = {
      id: taskIdCounter++,
      text: taskInput.value,
      status: "Открыт",
    };

    tasks.push(newTask);
    setToLocalStorage();
    renderTasks();
    updateCounters();
    taskInput.value = "";
  } 
});

// Удаление задачи
deleteTaskButton.addEventListener("click", function () {
  if (taskPopup.currentTask) {
    const taskId = parseInt(taskPopup.currentTask.id, 10);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      setToLocalStorage();
      hidePopup();
      renderTasks();
      updateCounters();
    }
  }
});

// Показ попапа
function showPopup(currentTask) {
  // Заполнение данными из задачи
  popupTaskText.value = currentTask.text;

  // Определение доступных статусов в попапе
  const availableStatuses = getAvailableStatuses(currentTask.status);

  //отображение статусов задачи
  updateStatusButtons(availableStatuses);

  // Пометка задачи для последующего обновления статуса
  taskPopup.currentTask = currentTask;

  // Открытие попапа
  taskPopup.style.display = "block";
  popupBc.style.display = "block";
}
const popupBc = document.querySelector(".popup-bc");

// Закрытие попапа
function hidePopup() {
  taskPopup.style.display = "none";
  popupBc.style.display = "none";
}

function getAvailableStatuses() {
  const availableStatuses = {
    "В работу": "В работе",
    "Отложить": "Открыт",
    "Закрыть": "Закрыт",
  };

  setToLocalStorage();
  return availableStatuses;
}

// Обновление кнопок статуса в попапе
function updateStatusButtons(availableStatuses) {
  // Удаление предыдущих кнопок
  const oldButtons = taskPopup.querySelectorAll(".popup__tasks-status");
  oldButtons.forEach((button) => button.remove());

  Object.keys(availableStatuses).forEach((key) => {
    const value = availableStatuses[key];
    const button = document.createElement("button");
    button.classList.add("popup__tasks-status");
    button.textContent = key;
    button.addEventListener("click", function () {
       savedStatus  = value;
      
      // Пересортировка задач после изменения статyса
      sortTasks();
      setToLocalStorage();
    });
    statusWrapper.appendChild(button);
  });
}

// Сортировка задач по статусам (c помощью gbt)
function sortTasks() {
  tasks.sort((a, b) => {
    const order = ["Открыт", "В работе", "Закрыт"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });
  
  renderTasks();
}

// Инициализация (c помощью gbt)
function updateCounters() {
  const openCounter = document.querySelector(".openCounter");
  const inProgressCounter = document.querySelector(".inProgressCounter");
  const closedCounter = document.querySelector(".closedCounter");

  // Объект для хранения количества задач по каждому статусу
  const counters = {
    "Открыт": 0,
    "В работе": 0,
    "Закрыт": 0,
  };

  // Подсчет количества задач для каждого статуса
  tasks.forEach((task) => {
    counters[task.status]++;
  });

  // Обновление текста счетчиков 
  openCounter.textContent = counters["Открыт"];
  inProgressCounter.textContent = counters["В работе"];
  closedCounter.textContent = counters["Закрыт"];
}

function setToLocalStorage() {
  localStorage.setItem("Task", JSON.stringify(tasks));
}
//  после вызова renderTasks():
function sortTasks() {
  tasks.sort((a, b) => {
    const order = ["Открыт", "В работе", "Закрыт"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });
  setToLocalStorage()
  renderTasks();
  updateCounters(); // функция обновления счетчиков
}


// Инициализация
renderTasks();
updateCounters(); 
