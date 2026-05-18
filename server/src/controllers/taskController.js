const prisma = require('../database/prisma');

// Lista apenas as tarefas pertencentes ao usuário autenticado.
async function listTasks(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        position: 'asc'
      }
    });

    return res.json({ tasks });
  } catch (error) {
    console.error('List tasks error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Cria uma nova tarefa vinculada ao usuário logado.
// A position é calculada para manter a ordenação da lista.
async function createTask(req, res) {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    const lastTask = await prisma.task.findFirst({
      where: {
        userId: req.userId,
        done: false
      },
      orderBy: {
        position: 'desc'
      }
    });

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        userId: req.userId,
        position: lastTask ? lastTask.position + 1 : 1
      }
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Atualiza uma tarefa do usuário logado.
// Usado para editar título, marcar como concluída e alterar posição.
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, done, position } = req.body;

    const taskExists = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!taskExists) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const task = await prisma.task.update({
      where: {
        id: Number(id)
      },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(done !== undefined && { done }),
        ...(position !== undefined && { position })
      }
    });

    return res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Remove uma tarefa específica do usuário logado.
async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const taskExists = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!taskExists) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: {
        id: Number(id)
      }
    });

    return res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Remove todas as tarefas do usuário conforme o status enviado.
// Exemplo: /tasks?done=true remove concluídas; /tasks?done=false remove pendentes.
async function deleteTasksByStatus(req, res) {
  try {
    const { done } = req.query;

    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        message: 'Query parameter done must be true or false'
      });
    }

    await prisma.task.deleteMany({
      where: {
        userId: req.userId,
        done: done === 'true'
      }
    });

    return res.json({
      message: 'Tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete tasks by status error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Atualiza a ordem das tarefas após drag and drop.
// Recebe um array de ids na nova ordem e atualiza a position de cada tarefa.
async function reorderTasks(req, res) {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({
        message: 'taskIds must be an array'
      });
    }

    const userTasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        id: {
          in: taskIds.map(Number)
        }
      }
    });

    if (userTasks.length !== taskIds.length) {
      return res.status(400).json({
        message: 'Invalid task list'
      });
    }

    await prisma.$transaction(
      taskIds.map((taskId, index) =>
        prisma.task.update({
          where: {
            id: Number(taskId)
          },
          data: {
            position: index + 1
          }
        })
      )
    );

    return res.json({
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteTasksByStatus,
  reorderTasks
};