import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import {GoogleLogin} from "@react-oauth/google";
import {useGoogleSuccess} from "../auth/google/use-google-auth";
import config from '../config';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const {responseMessage, errorMessage} = useGoogleSuccess();


  async function handleSubmit(event) {
    event.preventDefault();
    setError('');  // Clear any previous error

    const loginData = {
      email,
      password
    };

    try {
      const response = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the token in localStorage or cookies
        localStorage.setItem('token', result.token);

        // Redirect to the dashboard
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  }

  return (
    <>
      <Container className="d-flex justify-content-center align-items-center mt-5">
        <Row>
          <Col>
            <h3 className="text-start mb-4 text-primary">Login</h3>
            <Card className="p-4 shadow-sm border-primary border-3" style={{ maxWidth: '400px', margin: 'auto' }}>
              <Card.Body>
                {error && <p className="text-danger">{error}</p>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      className="py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      className="py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 mb-3 py-2">
                    Login
                  </Button>

                  <div className="text-center">
                    <span>Don’t have an account? </span>
                    <a href="/signup" className="text-primary">
                      Signup
                    </a>
                  </div>

                  {/* Google Login Button */}
                  <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
