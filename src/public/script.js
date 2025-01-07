// public/script.js

document.addEventListener('DOMContentLoaded', function() {
    const todoList = document.getElementById('todo-list');
    const addButton = document.getElementById('add-btn');
    const newTodoInput = document.getElementById('new-todo');
  
    // Charger les todos depuis le localStorage
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    savedTodos.forEach(todo => addTodoToList(todo));
  
    // Ajouter un nouveau todo
    addButton.addEventListener('click', () => {
      const newTodo = {
        id: Date.now(),
        title: newTodoInput.value,
        completed: false,
      };
  
      if (newTodo.title.trim()) {
        addTodoToList(newTodo);
        saveTodoToLocalStorage(newTodo);
        newTodoInput.value = ''; // Réinitialiser l'input
      }
    });
  
    // Fonction pour ajouter un todo dans le DOM
    function addTodoToList(todo) {
      const li = document.createElement('li');
      li.textContent = todo.title;
      li.classList.toggle('completed', todo.completed);
      li.dataset.id = todo.id;
  
      // Ajouter un bouton de suppression
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Supprimer';
      deleteBtn.classList.add('delete-btn');
      li.appendChild(deleteBtn);
  
      // Marquer comme terminé ou non terminé
      li.addEventListener('click', () => {
        li.classList.toggle('completed');
        toggleCompleteInLocalStorage(todo.id);
      });
  
      // Supprimer une tâche
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        li.remove();
        removeTodoFromLocalStorage(todo.id);
      });
  
      todoList.appendChild(li);
    }
  
    // Sauvegarder une tâche dans le localStorage
    function saveTodoToLocalStorage(todo) {
      const todos = JSON.parse(localStorage.getItem('todos')) || [];
      todos.push(todo);
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  
    // Basculer l'état terminé d'une tâche dans le localStorage
    function toggleCompleteInLocalStorage(id) {
      const todos = JSON.parse(localStorage.getItem('todos')) || [];
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  
    // Supprimer une tâche du localStorage
    function removeTodoFromLocalStorage(id) {
      const todos = JSON.parse(localStorage.getItem('todos')) || [];
      const updatedTodos = todos.filter(todo => todo.id !== id);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  });
  