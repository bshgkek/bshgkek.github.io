// icons from FontAwesome
var removeIcon = '<i class="fa fa-trash-o fa-2x" aria-hidden="true">';
var completeIcon = '<i class="fa fa-check fa-lg" aria-hidden="true">';

var data = (localStorage.getItem('todoList')) ? JSON.parse(localStorage.getItem('todoList')) : {
	todo: [],
	completed: [],
	style: 'light'
};

/////////////////////// Event Listeners //
/////////////////////

// add item button clicked
document.getElementById('add').addEventListener('click', function(e) {
	var val = document.getElementById('item').value;
	if(val){
		data.todo.push(val);
		addItemTodo(val);
		document.getElementById('item').value = '';
	}
});

// enter button hit on input field
document.getElementById('item').addEventListener('keydown', function(e) {
	var val = this.value;
	if(e.code === "Enter" && val){
		data.todo.push(val);
		addItemTodo(val);
		document.getElementById('item').value = '';
	}
});

document.getElementById('settings').addEventListener('click', function(e) {
	let x = document.getElementById('mystyle');
	if(x.href.endsWith('2.css')){
		swapStyleSheet(x, 'resources/css/style3.css');
		data.style = 'light';
		updateDataStorage();	
	} else {
		swapStyleSheet(x, 'resources/css/style2.css');
		data.style = 'dark';
		updateDataStorage();	
	}
});


/////////////////////////
// Render from storage //
/////////////////////////

/**
 * fills todo/completed lists based on localStorage
 * @method renderTodoList
 */
function renderTodoList() {
	if(data.style === 'dark'){
		document.getElementById('mystyle').setAttribute('href','resources/css/style2.css');
	} else {
		document.getElementById('mystyle').setAttribute('href','resources/css/style3.css');
	}

	if(!data.completed.length && !data.todo.length) return;
	for (var i = 0; i < data.todo.length; i++) {
		var val = data.todo[i];
		addItemTodo(val)
	}
	for (var i = 0; i < data.completed.length; i++) {
		var val = data.completed[i];
		addItemTodo(val, true)
	}



}

renderTodoList();


/////////////////////
// Other Functions //
/////////////////////

/**
 * updates localStorage with the todolist
 * @method updateDataStorage
 */
function updateDataStorage() {
	localStorage.setItem('todoList', JSON.stringify(data))
}

/**
 * removes an item from the todo list - called when delete button clicked
 * @method removeItem
 * @param {clickEvent} event - click event of the delete button
 */
function removeItem(event) {
	var li = this.parentNode.parentNode;
	var val = li.innerText;
	var list = li.parentNode;
	var listid = list.id; 

	if (listid === 'todo'){
		data.todo.splice(data.todo.indexOf(val), 1);
	} else {
		data.completed.splice(data.completed.indexOf(val), 1);
	}

	list.removeChild(li);
	updateDataStorage();
}

/**
 * completes or uncompletes an item depending on original list - called on complete button clicked
 * @method completeItem
 * @param {clickEvent} event - click event of the complete button
 */
function completeItem(event) {
	var li = this.parentNode.parentNode;
	var val = li.innerText;
	var list = li.parentNode;
	var listid = list.id; 
	var target = (listid === 'todo') ? document.getElementById('completed'):document.getElementById('todo');

	if (listid === 'todo'){
		data.todo.splice(data.todo.indexOf(val), 1);
		data.completed.push(val);
	} else {
		data.completed.splice(data.todo.indexOf(val), 1);
		data.todo.push(val);
	}

	list.removeChild(li);
	target.insertBefore(li, target.childNodes[0]);
	updateDataStorage();
}

/**
 * adds an item to the todo list from the top input bar or completed list
 * @method addItemTodo
 * @param {string} text - string of todo
 * @param {boolean} completed - check whether item moving from completed > non completed
 */
function addItemTodo(text, completed) {
	var list = (completed) ? document.getElementById('completed') : document.getElementById('todo');

	var item = document.createElement('li');
	item.innerText = text;

	var buttons = document.createElement('div');
	buttons.classList.add('buttons');

	var remove = document.createElement('button');
	remove.classList.add('remove');
	remove.innerHTML = removeIcon;
	remove.addEventListener('click', removeItem);

	var complete = document.createElement('button');
	complete.classList.add('complete');
	complete.innerHTML = completeIcon;
	complete.addEventListener('click', completeItem);

	// append html elements to list
	buttons.appendChild(remove);
	buttons.appendChild(complete);
	item.appendChild(buttons);
	list.insertBefore(item, list.childNodes[0]);
	updateDataStorage();
}


function swapStyleSheet(ele, sheet) {
   	ele.setAttribute("href", sheet);
}
