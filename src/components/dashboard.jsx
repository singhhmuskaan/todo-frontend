import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

// Reusable Task Card Component
function TaskCard({ task, onEdit, onView }) {
  const createdAtDate = new Date(task.created_at);

   // Format the date in YYYY/MM/DD
   const formattedDate = createdAtDate.toLocaleDateString('en-GB').split('/').reverse().join('/');

   // Convert time to IST (Indian Standard Time)
   const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' };
   const formattedTime = createdAtDate.toLocaleTimeString('en-US', options);

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>{task.description}</Card.Text>
        <Card.Text>
          <small className="text-muted">Created at {formattedDate} {formattedTime}</small>
        </Card.Text>
        <Button variant="danger" className="me-2">Delete</Button>
        <Button variant="primary" className="me-2" onClick={() => onEdit(task)}>Edit</Button>
        <Button variant="secondary" onClick={() => onView(task)}>View Details</Button>
      </Card.Body>
    </Card>
  );
}

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [currentTask, setCurrentTask] = useState(null); // For edit and view modals
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });

  // Retrieve token from local storage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const allTasks = response.data;

        // Categorize tasks based on status
        const categorizedTasks = {
          todo: allTasks.filter(task => task.status === 1),
          inProgress: allTasks.filter(task => task.status === 2),
          done: allTasks.filter(task => task.status === 3)
        };

        setTasks(categorizedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [token]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSaveTask = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const createdTask = response.data;

      // Assuming your API returns the created task with a status
      const updatedTasks = { ...tasks };
      if (createdTask.status === 1) {
        updatedTasks.todo = [createdTask, ...updatedTasks.todo];
      } else if (createdTask.status === 2) {
        updatedTasks.inProgress = [createdTask, ...updatedTasks.inProgress];
      } else if (createdTask.status === 3) {
        updatedTasks.done = [createdTask, ...updatedTasks.done];
      }

      setTasks(updatedTasks);
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
      const response = await axios.put(`http://localhost:8080/api/tasks/${currentTask.id}`, currentTask, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedTask = response.data;

      // Update the tasks list
      const updatedTasks = { ...tasks };
      if (updatedTask.status === 1) {
        updatedTasks.todo = updatedTasks.todo.map(task => task.id === updatedTask.id ? updatedTask : task);
      } else if (updatedTask.status === 2) {
        updatedTasks.inProgress = updatedTasks.inProgress.map(task => task.id === updatedTask.id ? updatedTask : task);
      } else if (updatedTask.status === 3) {
        updatedTasks.done = updatedTasks.done.map(task => task.id === updatedTask.id ? updatedTask : task);
      }

      setTasks(updatedTasks);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" className="mb-2" onClick={handleShowModal}>Add Task</Button>
          <Form.Control type="text" placeholder="Search..." className="d-inline-block w-auto ms-3" />
        </Col>
        <Col className="text-end">
          <Form.Select className="d-inline-block w-auto">
            <option value="recent">Sort By: Recent</option>
            <option value="oldest">Sort By: Oldest</option>
          </Form.Select>
        </Col>
      </Row>
      <Row>
        {/* TODO Column */}
        <Col md={4}>
          <h5 className="mb-4">TODO</h5>
          {tasks.todo.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onView={handleViewTask} />
          ))}
        </Col>

        {/* IN PROGRESS Column */}
        <Col md={4}>
          <h5 className="mb-4">IN PROGRESS</h5>
          {tasks.inProgress.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onView={handleViewTask} />
          ))}
        </Col>

        {/* DONE Column */}
        <Col md={4}>
          <h5 className="mb-4">DONE</h5>
          {tasks.done.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onView={handleViewTask} />
          ))}
        </Col>
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
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="taskDescription" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter task description"
                value={newTask.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveTask}>
            Save Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Task Modal */}
      {currentTask && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="editTaskTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={currentTask.title}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="editTaskDescription" className="mt-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdateTask}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* View Task Details Modal */}
      {currentTask && (
        <Modal show={showViewModal} onHide={handleCloseViewModal}>
          <Modal.Header closeButton>
            <Modal.Title>Task Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>{currentTask.title}</h5>
            <p>{currentTask.description}</p>
            <p><small>Created at: {currentTask.createdAt}</small></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseViewModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

export default Dashboard;
