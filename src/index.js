document.addEventListener('DOMContentLoaded', () => {
	const input = document.querySelector('#input-area');
	const todoList = document.querySelector('#todo-list');
	const addButton = document.querySelector('#add-button');
	let keyCount = 0;

	//Load existing todos from localStorage on page load
	loadTodos();
	changeTheme();

	addButton.addEventListener('click', addTodo);
	input.addEventListener('keyup', (e) => {
		if (e.key === 'Enter') {
			console.log(e);
			addTodo();
		}
	});

	/** changeTheme 정의  */
	function changeTheme() {
		const themeIcon = document.querySelector('#theme-icon');
		themeIcon.addEventListener('click', () => {
			document.body.classList.toggle('dark-mode');
			if (document.body.classList.contains('dark-mode')) {
				themeIcon.src = '../images/icon-sun.svg';
			} else {
				themeIcon.src = '../images/icon-moon.svg';
			}

			// if (document.body.classList.contains('dark-mode')) {
			// 	document.body.classList.toggle();
			// }
		});
	}

	/** addTodo 함수 정의 */
	function addTodo() {
		const text = input.value.trim();
		if (text === '') {
			alert("You didn't write anything.");
			return;
		}
		const todoItem = createTodoItem(text);
		todoList.appendChild(todoItem);
		input.value = '';

		saveTodos();
	}

	/** 각문장의 첫글자 대문자 함수 정의 */

	function capitalizeFirstLetter(text) {
		return text.replace(/(?<=(?:^|[.?!])\W*)[a-z]/g, (match) =>
			match.toUpperCase()
		);

		// return text
		// 	.split('. ')
		// 	.map(
		// 		(sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1)
		// 	)
		// 	.join('. ');
	}

	/** createTodoItem 함수 정의
	 * This function creates a todo item and returns it.
	 * It's used both when adding a new todo and
	 * when loading todos from localStorage.
	 */
	function createTodoItem(text) {
		const item = document.createElement('div');
		const checkbox = document.createElement('span');

		// Use a div instead of span for todo text, and make it contenteditable
		const textNode = document.createElement('div');
		textNode.contentEditable = false; // Initially not editable
		const removeButton = document.createElement('button');
		const editButton = document.createElement('button');
		const key = keyCount++;

		item.setAttribute('draggable', true); //*new
		item.setAttribute('data-key', key);
		item.id = 'todo-item-' + keyCount; // *new: Ensure each todo item has a unique id
		item.classList.add('todo-item');

		checkbox.classList.add('checkbox');
		checkbox.addEventListener('click', () => {
			checkbox.classList.toggle('checked');
			textNode.classList.toggle('completed-text');
			saveTodos(); // **다른 곳에 위치하면 어떻게 되는지 나중에 테스트하기
		});

		// textNode.textContent = text; // 위의 text 여기서 정의

		textNode.textContent = capitalizeFirstLetter(text); // 위의 text 여기서 정의
		textNode.classList.add('todo-text');

		editButton.textContent = 'EDIT';
		editButton.classList.add('edit-button');
		editButton.addEventListener('click', () =>
			toggleEdit(textNode, editButton)
		);

		removeButton.classList.add('remove-button');
		removeButton.addEventListener('click', () => {
			removeTodo(key);
		});

		addEventsDragAndDrop(item);

		item.appendChild(checkbox);
		item.appendChild(textNode);
		item.appendChild(editButton);
		item.appendChild(removeButton);

		return item;
	}
	/** addEventsDragAndDrop(item) 함수 정의 */
	function addEventsDragAndDrop(item) {
		item.addEventListener('dragstart', dragStart, false);
		item.addEventListener('dragover', dragOver, false);
		item.addEventListener('drop', dragDrop, false);
		item.addEventListener('dragend', dragEnd, false);
	}
	function dragStart(event) {
		event.dataTransfer.setData('text/plain', event.target.id);
	}

	function dragOver(event) {
		event.preventDefault(); // Necessary to allow dropping
	}

	function dragDrop(event) {
		event.preventDefault();
		const id = event.dataTransfer.getData('text');
		const draggableElement = document.getElementById(id);
		const dropzone = event.target.closest('.todo-item'); // Adjust selector as needed
		if (dropzone && draggableElement !== dropzone) {
			let referenceElement =
				dropzone.nextElementSibling === draggableElement
					? dropzone
					: dropzone.nextElementSibling;
			todoList.insertBefore(draggableElement, referenceElement);
		}
		saveTodos(); // Implement this function to update order in localStorage
	}

	function dragEnd(event) {
		// Optional: Additional logic to handle after drag ends
	}

	/** editTodo 함수 정의 */
	function toggleEdit(textNode, editButton) {
		const isEditable = textNode.contentEditable === 'true';

		textNode.contentEditable = !isEditable; // toggle the contentEditable state
		textNode.focus(); // Focus on the element if it's now editable
		editButton.textContent = isEditable ? 'EDIT' : 'SAVE';

		if (!isEditable) {
			// add an event listener to save and disable editing when Enter is pressed
			textNode.addEventListener(
				'keypress',
				function (e) {
					if (e.key === 'Enter') {
						e.preventDefault(); // Prevent the default Enter key action (new line)
						textNode.contentEditable = false; // make the textNode not editable
						textNode.blur(); // Remove focus from the textNode
						editButton.textContent = 'EDIT'; // Change the button text back to 'EDIT'
						textNode.textContent = capitalizeFirstLetter(
							textNode.textContent.trim()
						);
						saveTodos();
					}
				},
				{ once: true }
			); // the listener is removed after it executes once
		} else {
			// if switching back to editable=false, save the todo list and  listeners are attached
			textNode.textContent = capitalizeFirstLetter(
				textNode.textContent.trim()
			);
			saveTodos();
		}
	}

	/** removeTodo 함수 정의 */
	function removeTodo(key) {
		const item = document.querySelector(`[data-key='${key}']`);
		if (item) {
			todoList.removeChild(item);
			saveTodos(); // 함수 불러와서 지울때마다 상태 세이브해줘야함
		}
	}
	/** saveTodos 함수 정의
	 * Whenever a todo is added or removed,
	 * this function saves the current state of todos
	 * to localStorage. It creates an array of objects
	 * representing each todo item, including its key,
	 * text content, and whether it's checked.
	 */

	function saveTodos() {
		const todos = [];
		document.querySelectorAll('.todo-item').forEach((item) => {
			const textContent = item.querySelector('.todo-text').textContent;
			const isChecked = item
				.querySelector('.checkbox')
				.classList.contains('checked');
			todos.push({
				key: item.getAttribute('data-key'),
				textContent,
				isChecked,
			});
		});
		localStorage.setItem('todos', JSON.stringify(todos));
		console.log(todos);
		leftItems();
	}

	/** loadTodo 함수 정의
	 * When the page loads, this function gets the saved todos
	 * from localStorage, creates todo items for each,
	 * and appends them to the todoList.
	 */
	function loadTodos() {
		const savedTodos = JSON.parse(localStorage.getItem('todos'));
		if (savedTodos) {
			savedTodos.forEach((todo) => {
				const todoItem = createTodoItem(todo.textContent);
				if (todo.isChecked) {
					todoItem.querySelector('.checkbox').classList.add('checked');
					todoItem
						.querySelector('.todo-text')
						.classList.add('completed-text');
				}
				todoList.appendChild(todoItem);
			});
			leftItems();
		}
	}

	/** setActiveButton 정의 */
	const setActiveButton = (activeButtonID) => {
		const filterButtons = document.querySelectorAll('.filter-buttons');
		filterButtons.forEach((button) => {
			button.classList.remove('active');
		});
		document.querySelector(`#${activeButtonID}`).classList.add('active');
	};

	/** clearCompleted 함수 정의 */
	function clearCompleted() {
		const todos = document.querySelectorAll('.todo-item');
		todos.forEach((todo) => {
			const isChecked = todo
				.querySelector('.checkbox')
				.classList.contains('checked');
			if (isChecked) {
				todoList.removeChild(todo);
			}
		});
	}

	/** leftItems 정의 */
	function leftItems() {
		const todos = document.querySelectorAll('.todo-item');
		let activeCount = 0;

		todos.forEach((todo) => {
			const isChecked = todo
				.querySelector('.checkbox')
				.classList.contains('checked');
			if (!isChecked) {
				// if the item is not checked, it's active
				activeCount++;
			}
		});
		const activeCountElement = document.querySelector('#active-count');
		if (activeCount < 2) {
			activeCountElement.textContent = `${activeCount} item left`;
		} else {
			activeCountElement.textContent = `${activeCount} items left`;
		}
	}

	/** handleEnter 함수 정의  */

	// function handleEnter(e) {
	// 	if (e.key === 'Enter') {
	// 		e.preventDefault(); //prevent the default enter action

	// 	}
	// }

	/** filterTodos 정의 */
	const filterTodos = (filterType) => {
		const todos = document.querySelectorAll('.todo-item');
		todos.forEach((todo) => {
			const isChecked = todo
				.querySelector('.checkbox')
				.classList.contains('checked');
			switch (filterType) {
				case 'all':
					todo.style.display = 'flex';
					break;

				case 'active':
					todo.style.display = isChecked ? 'none' : 'flex';
					break;

				case 'completed':
					todo.style.display = isChecked ? 'flex' : 'none';
					break;
			}
		});
		setActiveButton(`filter-${filterType}`);
	};

	document
		.querySelector('#filter-all')
		.addEventListener('click', () => filterTodos('all'));
	document
		.querySelector('#filter-active')
		.addEventListener('click', () => filterTodos('active'));
	document
		.querySelector('#filter-completed')
		.addEventListener('click', () => filterTodos('completed'));
	document
		.querySelector('#clear-completed-button')
		.addEventListener('click', () => clearCompleted());
});
