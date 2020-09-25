const api = axios.create({
    baseURL: 'http://localhost:3000'||'https://todos-list-mysql.herokuapp.com/' 
});
const rowPrefix = "data-row"
const todoNameCell = "todoName-cell"
const editButtonPrefix = "editBtnPrefix"
const editTodoPrefix = "editTodoName"
const editTimePrefix = "editTodoTime"
const todoTimeCell = "editTime"
const edittedBtnPrefix = "edittedBtn"
const table = document.querySelector('#tbody')
const inpTitle = document.getElementById('title-input')
const inpTime = document.getElementById('time-input')
const errDiv = document.getElementById('error')
const inpSearch = document.getElementById('search-input')
const searchGroup = document.getElementById('search')
const allTodo = document.getElementById('load-all-todos')

document.addEventListener('DOMContentLoaded', async () => {
    const res = await api.get('/all')
    const result = res.data
    loadHTMLTable(result)
})
allTodo.addEventListener('click', async () => {
    const res = await api.get('/all')
    const result = res.data
    loadHTMLTable(result)
})


document.getElementById('add-title-btn').addEventListener('click', async () => {
    if (inpTitle.value.trim() === '' || !inpTitle.value )
    {
        const err = 'Please enter title'
        errDiv.innerHTML = err
        setTimeout(() => {
            errDiv.innerHTML = ' '
        }, 2000)
        return
    } else if (!inpTime.value) {
        const err = 'Please enter time'
        errDiv.innerHTML = err
        setTimeout(() => {
            errDiv.innerHTML = ' '
        }, 2000)
        return
    } else {
        const result = await api.post('/add', { todo: inpTitle.value.trim(), time: inpTime.value })
        const todo = inpTitle.value.trim()
        const time = inpTime.value.trim()
        const {id} = result.data
        insertIntoTable(id,todo,time)
        inpTitle.value = ''
        inpTime.value = ''
        inpTitle.focus()
        errDiv.innerHTML = ' '
    }   
})
document.getElementById('search-btn').addEventListener('click', async () => {
    if (inpSearch.value.trim() === '' || !inpSearch.value) {
        const err = 'Please type something to search'
        errDiv.innerHTML = err
        setTimeout(() => {
            errDiv.innerHTML = ' '
        }, 2000)
        return
    }
    
    const result = await api.get(`/todo/${inpSearch.value}`)
    displaySearchResult(result.data)
    
})

const deleteEvent = async(id)=> {
    const result = await api.delete(`/delete/${id}`)
    const { status } = result.data
    if (status === 2) {
        document.getElementById(`${rowPrefix}-${id}`).style.display = "none"
    } else {
        console.log('Error deleting') 
    }
}

const editEvent = (id) => {
    const todoCell = document.getElementById(`${todoNameCell}-${id}`)
    const data = todoCell.textContent
    const timeCell = document.getElementById(`${todoTimeCell}-${id}`)
    document.getElementById(`${editButtonPrefix}-${id}`).innerHTML = 
        `<button 
        class="cancel-btn" 
        onclick = "cancelEdit((${id}),('${todoCell.innerText}'),('${timeCell.innerHTML}'))
        ">Cancel</button>

        <button
        class="submit-btn"
        onclick = "submitEdit((${id}),('${timeCell.innerText}'))"
        >Submit</button>`
    
    todoCell.innerHTML =
        `<input id="${editTodoPrefix}-${id}" class="inp-edit" value='${data}'>`
    timeCell.innerHTML =
        `<input type="datetime-local" id="${editTimePrefix}-${id}" class="inp-edit">`
}

const cancelEdit = (id,todo,time) => {
    const nameCell = document.getElementById(`${todoNameCell}-${id}`)
    nameCell.innerHTML = todo
    const timeCell = document.getElementById(`${todoTimeCell}-${id}`)
    timeCell.innerHTML = time
    document.getElementById(`${editButtonPrefix}-${id}`).innerHTML = 
    `<button class="edit" onclick="editEvent(${id})">Edit</button>`
}

const submitEdit = async (id,time) => {
    const nameCell = document.getElementById(`${todoNameCell}-${id}`)
    const timeCell = document.getElementById(`${todoTimeCell}-${id}`)
    const todoName = document.getElementById(`${editTodoPrefix}-${id}`).value
    const todoTime = document.getElementById(`${editTimePrefix}-${id}`).value
    nameCell.innerHTML = todoName
    timeCell.innerHTML = todoTime.replace("T", " ") || time
   
    document.getElementById(`${editButtonPrefix}-${id}`).innerHTML =
        `<button class="edit ${edittedBtnPrefix}-${id}" onclick="editEvent(${id})">Edit</button>`
    const result = await api.put(`/edit/${id}`, { todo: todoName.trim(), time: todoTime })
    const { serverStatus } = result.data
    if (serverStatus === 2) {
        document.querySelector(`.${edittedBtnPrefix}-${id}`).classList.add('success')
        setTimeout(() => {
            document.querySelector(`.${edittedBtnPrefix}-${id}`).classList.remove('success')
        },1500)
    }
    
}


function loadHTMLTable(data) {
    if (data.length === 0) {
        table.innerHTML = '<p id="noDataRow"><span class="no-data" colspan="5">No data</span><p>'
    } else {
        const tableRows = data.map(
            ({ todo, id, time }) =>    (`<p class="t-row" key=${id} id="${rowPrefix}-${id}">
                                        <span>${id}</span>
                                        <span id="${todoNameCell}-${id}">${todo}</span>
                                        <span id="${todoTimeCell}-${id}">${time}</span>
                                        <span id="${editButtonPrefix}-${id}"><button class="edit" onclick="editEvent(${id})">Edit</button></span>
                                        <span><button class="delete" onclick="deleteEvent(${id})">Delete</button></span>
                                        </p>`) )
        table.innerHTML = tableRows.join("")
    }
}



function insertIntoTable( id, todo, time ) {
    const noDataRow = document.getElementById('noDataRow')
    if (!id) return
    else if (noDataRow) {      
        table.innerHTML =  `<p class="t-row" key=${id} id="${rowPrefix}-${id}">
                            <span>${id}</span>
                            <span id="${todoNameCell}-${id}">${todo}</span>
                            <span id="${todoTimeCell}-${id}">${time.replace("T"," ")}</span>
                            <span id="${editButtonPrefix}-${id}"><button class="edit" onclick="editEvent(${id})">Edit</button></span>
                            <span><button class="delete" onclick="deleteEvent(${id})">Delete</button></span>
                            </p>`
    } else {
        table.innerHTML += `<p class="t-row" key=${id} id="${rowPrefix}-${id}">
                            <span>${id}</span>
                            <span id="${todoNameCell}-${id}">${todo}</span>
                            <span id="${todoTimeCell}-${id}">${time.replace("T"," ")}</span>
                            <span id="${editButtonPrefix}-${id}"><button class="edit" onclick="editEvent(${id})">Edit</button></span>
                            <span><button class="delete" onclick="deleteEvent(${id})">Delete</button></span>
                            </p>`
        }
    
}

function displaySearchResult(data) {
    inpSearch.value = ''
    if (data.length === 0 || !data  || data.msg) {
        table.innerHTML = '<p id="noDataRow"><span class="no-data" colspan="5">No matched result</span><p>'
    } else {
        const tableRows = data.map(
            ({ todo, id, time }) =>    (`<p class="t-row" key=${id} id="${rowPrefix}-${id}">
                                        <span>${id}</span>
                                        <span id="${todoNameCell}-${id}">${todo.replace(/'/g,"")}</span>
                                        <span id="${todoTimeCell}-${id}">${time}</span>
                                        <span id="${editButtonPrefix}-${id}"><button class="edit" onclick="editEvent(${id})">Edit</button></span>
                                        <span><button class="delete" onclick="deleteEvent(${id})">Delete</button></span>
                                        </p>`) )
        table.innerHTML = tableRows.join("")
    }
}
