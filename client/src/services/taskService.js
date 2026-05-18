import { apiRequest } from './api';

// Busca todas as tarefas do usuário autenticado.
export function getTasks() {
  return apiRequest('/tasks');
}

// Cria uma nova tarefa.
export function createTask(title) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

// Atualiza título, status ou posição da tarefa.
export function updateTask(id, data) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Remove uma tarefa específica.
export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Remove tarefas por status: done=true ou done=false.
export function deleteTasksByStatus(done) {
  return apiRequest(`/tasks?done=${done}`, {
    method: 'DELETE',
  });
}

// Persiste a nova ordem das tarefas após drag and drop.
export function reorderTasks(taskIds) {
  return apiRequest('/tasks/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ taskIds }),
  });
}