// icons from FontAwesome
var removeIcon = '<i class="fa fa-trash-o fa-2x" aria-hidden="true">';
var completeIcon = '<i class="fa fa-check fa-lg" aria-hidden="true">';

var data = (localStorage.getItem('todoList')) ? JSON.parse(localStorage.getItem('todoList')) : {
	todo: [],
	completed: []
};



/////////////////////
// Event Listeners //
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


renderToDoList();
function renderToDoList() {
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






function updateDataStorage() {
	localStorage.setItem('todoList', JSON.stringify(data))
}


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

// Adds new item to todo list
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

