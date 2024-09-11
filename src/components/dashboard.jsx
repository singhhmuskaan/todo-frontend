import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import config from '../config';


// Reusable Task Card Component
function TaskCard({ task, index, onEdit, onView, onDelete }) {
  const createdAtDate = new Date(task.created_at);

  // Format the date in YYYY/MM/DD
  const formattedDate = createdAtDate.toLocaleDateString('en-GB').split('/').reverse().join('/');

  // Convert time to IST (Indian Standard Time)
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' };
  const formattedTime = createdAtDate.toLocaleTimeString('en-US', options);

  return (
      <Draggable draggableId={task.id.toString()} index={index}>
        {(provided) => (
            <Card
                className="mb-3 shadow-sm"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
              <Card.Body>
                <Card.Title>{task.title}</Card.Title>
                <Card.Text>{task.description}</Card.Text>
                <Card.Text>
                  <small className="text-muted">Created at {formattedDate} {formattedTime}</small>
                </Card.Text>
                <Button variant="danger" className="me-2" onClick={() => onDelete(task)}>Delete</Button>
                <Button variant="primary" className="me-2" onClick={() => onEdit(task)}>Edit</Button>
                <Button variant="secondary" onClick={() => onView(task)}>View Details</Button>
              </Card.Body>
            </Card>
        )}
      </Draggable>
  );
}

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [currentTask, setCurrentTask] = useState(null); // For edit and view modals
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [originalTasks, setOriginalTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null); // For delete confirmation modal
  const [sorting, setSorting] = useState('recent');

  // Retrieve token from local storage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const allTasks = response.data;

        // Categorize tasks based on status
        const categorizedTasks = {
          todo: allTasks.filter(task => task.status_id === 1),
          inProgress: allTasks.filter(task => task.status_id === 2),
          done: allTasks.filter(task => task.status_id === 3)
        };

        setAllTasks(categorizedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [token]);

  useEffect(() => {
    const searched = {
      todo: originalTasks.todo.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase())),
      inProgress: originalTasks.inProgress.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase())),
      done: originalTasks.done.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    };
    setTasks(searched);
  }, [originalTasks.done, originalTasks.inProgress, originalTasks.todo, searchTerm]);

  useEffect(() => {
    const sortedTasks = {
      todo: originalTasks.todo.sort((a, b) => sorting === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)),
      inProgress: originalTasks.inProgress.sort((a, b) => sorting === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)),
      done: originalTasks.done.sort((a, b) => sorting === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)),
    };
    setTasks(sortedTasks);
  }, [originalTasks.done, originalTasks.inProgress, originalTasks.todo, sorting]);

  function setAllTasks(tasks) {
    setTasks(tasks);
    setOriginalTasks(tasks);
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  }

  const handleSort = (e) => {
    setSorting(e.target.value);
  }

  const handleSaveTask = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/tasks`, newTask, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const createdTask = response.data;

      // Assuming your API returns the created task with a status
      const updatedTasks = { ...tasks };
      if (createdTask.status_id === 1) {
        updatedTasks.todo = [createdTask, ...updatedTasks.todo];
      } else if (createdTask.status_id === 2) {
        updatedTasks.inProgress = [createdTask, ...updatedTasks.inProgress];
      } else if (createdTask.status_id === 3) {
        updatedTasks.done = [createdTask, ...updatedTasks.done];
      }

      setAllTasks(updatedTasks);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setShowEditModal(true);
  };

  const handleViewTask = (task) => {
    setCurrentTask(task);
    setShowViewModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseViewModal = () => setShowViewModal(false);

  const handleUpdateTask = async () => {
    try {
      const response = await axios.put(`${config.apiUrl}/${currentTask.id}`, currentTask, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedTask = response.data;

      // Update the task list
      const updatedTasks = { ...tasks };
      if (updatedTask.status_id === 1) {
        updatedTasks.todo = updatedTasks.todo.map(task => task.id === updatedTask.id ? updatedTask : task);
      } else if (updatedTask.status_id === 2) {
        updatedTasks.inProgress = updatedTasks.inProgress.map(task => task.id === updatedTask.id ? updatedTask : task);
      } else if (updatedTask.status_id === 3) {
        updatedTasks.done = updatedTasks.done.map(task => task.id === updatedTask.id ? updatedTask : task);
      }

      setAllTasks(updatedTasks);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${config.apiUrl}/${taskToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove the deleted task from the list
      const updatedTasks = { ...tasks };
      if (taskToDelete.status_id === 1) {
        updatedTasks.todo = updatedTasks.todo.filter(task => task.id !== taskToDelete.id);
      } else if (taskToDelete.status_id === 2) {
        updatedTasks.inProgress = updatedTasks.inProgress.filter(task => task.id !== taskToDelete.id);
      } else if (taskToDelete.status_id === 3) {
        updatedTasks.done = updatedTasks.done.filter(task => task.id !== taskToDelete.id);
      }

      setAllTasks(updatedTasks);
      setTaskToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCloseDeleteModal = () => {
    setTaskToDelete(null);
    setShowDeleteModal(false);
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return; // Dropped outside the list

    const { droppableId: sourceId } = source;
    const { droppableId: destinationId } = destination;

    if (sourceId === destinationId) return; // No change in status

    // Find and remove the dragged task from the source list
    const draggedTask = tasks[sourceId].find(task => task.id === parseInt(result.draggableId));
    const updatedTasks = {
      ...tasks,
      [sourceId]: tasks[sourceId].filter(task => task.id !== parseInt(result.draggableId)),
    };

    // Add the task to the destination list
    updatedTasks[destinationId] = [...updatedTasks[destinationId], draggedTask];

    // Update the task status in the backend
    try {
      await axios.put(`${config.apiUrl}/${draggedTask.id}`, { ...draggedTask, status_id: destinationId === 'todo' ? 1 : destinationId === 'inProgress' ? 2 : 3 }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAllTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Container>
          <Row className="mb-3">
            <Col>
              <Button variant="primary" className="mb-2" onClick={handleShowModal}>Add Task</Button>
              <Form.Control type="text" placeholder="Search..." className="d-inline-block w-auto ms-3" onChange={handleSearch} />
            </Col>
            <Col className="text-end">
              <Form.Select className="d-inline-block w-auto" onChange={handleSort}>
                <option value="recent">Sort By: Recent</option>
                <option value="oldest">Sort By: Oldest</option>
              </Form.Select>
            </Col>
          </Row>

          <Row>
            <Droppable droppableId="todo">
              {(provided) => (
                  <Col ref={provided.innerRef} {...provided.droppableProps} md={4}>
                    <h4>To Do</h4>
                    {tasks.todo.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onView={handleViewTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                    {provided.placeholder}
                  </Col>
              )}
            </Droppable>

            <Droppable droppableId="inProgress">
              {(provided) => (
                  <Col ref={provided.innerRef} {...provided.droppableProps} md={4}>
                    <h4>In Progress</h4>
                    {tasks.inProgress.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onView={handleViewTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                    {provided.placeholder}
                  </Col>
              )}
            </Droppable>

            <Droppable droppableId="done">
              {(provided) => (
                  <Col ref={provided.innerRef} {...provided.droppableProps} md={4}>
                    <h4>Done</h4>
                    {tasks.done.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onView={handleViewTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                    {provided.placeholder}
                  </Col>
              )}
            </Droppable>
          </Row>

          {/* Add Task Modal */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="taskTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control type="text" name="title" value={newTask.title} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group controlId="taskDescription" className="mt-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={newTask.description} onChange={handleInputChange} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
              <Button variant="primary" onClick={handleSaveTask}>Save Task</Button>
            </Modal.Footer>
          </Modal>

          {/* Edit Task Modal */}
          <Modal show={showEditModal} onHide={handleCloseEditModal}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="editTaskTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control type="text" name="title" value={currentTask?.title || ''} onChange={(e) => setCurrentTask(prev => ({ ...prev, title: e.target.value }))} />
                </Form.Group>
                <Form.Group controlId="editTaskDescription" className="mt-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={currentTask?.description || ''} onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditModal}>Close</Button>
              <Button variant="primary" onClick={handleUpdateTask}>Update Task</Button>
            </Modal.Footer>
          </Modal>

          {/* View Task Modal */}
          <Modal show={showViewModal} onHide={handleCloseViewModal}>
            <Modal.Header closeButton>
              <Modal.Title>Task Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h5>{currentTask?.title}</h5>
              <p>{currentTask?.description}</p>
              <p><strong>Status:</strong> {currentTask?.status_id === 1 ? 'TODO' : currentTask?.status_id === 2 ? 'IN PROGRESS' : 'DONE'}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseViewModal}>Close</Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete the task "{taskToDelete?.title}"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </DragDropContext>
  );
}

export default Dashboard;
