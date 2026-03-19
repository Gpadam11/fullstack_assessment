import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// 1. GET ALL TASKS (with Search, Filter, and Pagination)
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, search = '', status } = req.query;

    // Convert query params to numbers
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build the query dynamically
    const tasks = await prisma.task.findMany({
      where: {
        userId, // Only fetch tasks for the logged-in user
        title: { contains: String(search) }, // Search by title
        ...(status !== undefined && status !== 'all' && { 
          isCompleted: status === 'completed' 
        })
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' } // Newest tasks first
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// 2. CREATE A NEW TASK
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        userId: req.user!.userId 
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// 2.5. GET A SINGLE TASK
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({ where: { id } });
    
    if (!task || task.userId !== userId) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// 3. TOGGLE TASK COMPLETION STATUS
export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    // First, verify the task exists AND belongs to the user
    const task = await prisma.task.findUnique({ where: { id } });
    
    if (!task || task.userId !== userId) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Toggle the boolean value
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { isCompleted: !task.isCompleted }
    });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// 3.5. UPDATE TASK (Edit title and description)
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const { title, description, isCompleted } = req.body;

    // Verify the task exists AND belongs to the user
    const task = await prisma.task.findUnique({ where: { id } });
    
    if (!task || task.userId !== userId) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Update the task with provided fields
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isCompleted !== undefined && { isCompleted })
      }
    });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// 4. DELETE A TASK
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({ where: { id } });
    
    if (!task || task.userId !== userId) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};