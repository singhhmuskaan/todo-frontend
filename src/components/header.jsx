import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

function Header() {
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to handle logout
  const handleLogout = () => {
    // Clear the authentication token (or other relevant data)
    localStorage.removeItem('token'); // Assuming the token is stored in localStorage
    // Redirect to the login page
    navigate('/');
  };

  // Check if the user is logged in by checking if a token exists
  const isLoggedIn = !!localStorage.getItem('token'); // Assuming token is stored in localStorage

  return (
    <Navbar expand="lg" style={{ backgroundColor: '#4688F1' }}>
      <Container>
        <Navbar.Brand href="#" style={{ color: '#fff' }}>
          <i className="bi bi-calendar"></i>
        </Navbar.Brand>
        <Nav className="ms-auto">
          {/* Use Link for navigation */}
          {!isLoggedIn ? (
            <>
              <Link to="/" className="nav-link" style={{ color: '#fff' }}>
                Login
              </Link>
              <Button variant="light" as={Link} to="/signup" className="ms-2">
                Signup
              </Button>
            </>
          ) : (
            <Button variant="light" onClick={handleLogout} className="ms-2">
              Logout
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
