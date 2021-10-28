"use strict";
//CONSTANTS
const todoInput = document.querySelector(".add-task-input");
const todoAddButton = document.querySelector(".add-task-btn");
const todoList = document.querySelector(".to-do-list");
const todoDeleteAllButton = document.querySelector(".delete-completed-btn");
const errorMessage = document.querySelector(".error-message");
const storedNameList = "storedNameList";
const storedStatusList = "storedStatusList";

//LISTENERS
document.addEventListener("DOMContentLoaded", createTodoListFromLocalStorage);
todoAddButton.addEventListener("click", addTask);
todoList.addEventListener("click", checkClick);
todoDeleteAllButton.addEventListener("click", deleteCompleted);

//FUNCTIONS

//add a new task to the to-do list
function addTask(event) {
    //prevent the button from refreshing the page
    event.preventDefault();

    //check for incorrect input, abort if so
    if (inputError()) {
        return;
    }
    //create the task element
    const newTask = createNewTaskElement(todoInput.value);

    //add it to the main list
    todoList.appendChild(newTask);

    //save to LocalStorage
    saveToLocalStorage(todoInput.value, "in-progress");
    todoInput.value = ""; //clear the input field
}

//creates the task element
function createNewTaskElement(text, status) {
    //div - the main element of the task
    const newTask = document.createElement("div");
    newTask.classList.add("task");

    //the button to complete the task
    const taskCompleteButton = document.createElement("button");
    taskCompleteButton.title = "Task complete";
    taskCompleteButton.innerHTML = "<i class='fas fa-check'></i>";
    taskCompleteButton.classList.add("task-complete-btn");
    newTask.appendChild(taskCompleteButton);

    //the text of the task
    const taskText = document.createElement("li");
    taskText.innerText = text;
    taskText.classList.add("task-text");
    newTask.appendChild(taskText);

    //the button to delete the task
    const taskDeleteButton = document.createElement("button");
    taskDeleteButton.title = "Remove task";
    taskDeleteButton.innerHTML = "<i class='fas fa-trash'></i>";
    taskDeleteButton.classList.add("task-delete-btn");
    newTask.appendChild(taskDeleteButton);

    //set complete status if already complete
    if (status === "completed") {
        newTask.classList.add("completed");
    }
    return newTask;
}

//check what was clicked
function checkClick(event) {
    const item = event.target;
    const task = item.parentElement;
    if (item.classList[0] === "task-delete-btn") { //delete button
        deleteTask(task);
    } else if (item.classList[0] === "task-complete-btn") { //complete button
        completeTask(task);
    }
}

//delete a task
function deleteTask(task) {
    task.classList.add("removing");
    //console.log("1");
    deleteFromLocalStorage(task);
    //delete after animation
    task.addEventListener("transitionend", function () {
        //console.log("2");
        task.remove();
    })
}

//complete a task
function completeTask(task) {
    //task.classList.toggle("completed");

    const statusList = getLocalStorageTable(storedStatusList); //fetch the LocalStorage table
    let index = indexOfObject(todoList.children, task); //find the index of the task in the to-do list

    //change the task status in-browser
    let status;
    if (!task.classList.contains("completed")) {
        status = "completed";
    } else {
        task.classList.remove("completed");
        status = "in-progress";
    }
    task.classList.add(status);

    statusList[index] = status; //change the status in LocalStorage
    localStorage.setItem(storedStatusList, JSON.stringify(statusList));
}

//delete all completed tasks
function deleteCompleted() {
    //for loop used because of needing to potentially remove multiple tasks of the same name
    //for loop in reverse order to avoid messing up indexing
    let array = todoList.children;
    for (let i = array.length - 1; i >= 0; i--) {
        console.log(i);
        if (array[i].classList.contains("completed")) {
            console.log("deleted");
            const task = array[i];
            deleteTask(task);
        }
    }
}

//check for input errors. Return true if an error occurs. Clear previous error if not.
function inputError() {
    errorMessage.innerText = "";
    //check for too short input
    if (todoInput.value.length < 3) {
        //make the error message
        errorMessage.innerText = "The task must be longer than 2 letters!";
        //show the incorrect input field
        todoInput.classList.add("error");
        //make error visible
        errorMessage.style.visibility = 'visible';
        //add transition to back normal
        todoInput.addEventListener("transitionend", function () {
            todoInput.classList.remove("error");
        })
        return true;
    } else {
        //clear error if input is accepted
        errorMessage.style.visibility = 'hidden';
        return false;
    }

}

//add a task to the end of the table and store it in LocalStorage
function saveToLocalStorage(task, status) {
    const nameList = getLocalStorageTable(storedNameList);
    const statusList = getLocalStorageTable(storedStatusList);

    nameList.push(task);
    statusList.push(status);

    localStorage.setItem(storedNameList, JSON.stringify(nameList));
    localStorage.setItem(storedStatusList, JSON.stringify(statusList));
}

//delete a task and its status from LocalStorage
function deleteFromLocalStorage(task) {
    const nameList = getLocalStorageTable(storedNameList);
    const statusList = getLocalStorageTable(storedStatusList);
    const index = indexOfObject(todoList.children, task);

    nameList.splice(index, 1);
    statusList.splice(index, 1);

    localStorage.setItem(storedNameList, JSON.stringify(nameList));
    localStorage.setItem(storedStatusList, JSON.stringify(statusList));
}

//copy over the LocalStorage data to browser
function createTodoListFromLocalStorage() {
    const nameList = getLocalStorageTable(storedNameList);
    const statusList = getLocalStorageTable(storedStatusList);

    //loop over the LocalStorage name list. Status list shares the same indexes.
    for (let i = 0; i < nameList.length; i++) {
        const newTask = createNewTaskElement(nameList[i], statusList[i]);
        todoList.appendChild(newTask);
    }
}

//get a LocalStorage table
function getLocalStorageTable(name) {
    let storedList;
    //check if data already exists in storage
    if (localStorage.getItem(name) === null) {
        storedList = []; //create new if not
    } else {
        storedList = JSON.parse(localStorage.getItem(name)); //parse from existing
    }
    return storedList;
}

//find the index of mostly a task :D
function indexOfObject(list, obj) {
    let index;
    let array = list;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            index = i;
        }
    }
    return index;
}