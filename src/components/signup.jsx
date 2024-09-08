// import React, { useState } from 'react';
// import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';


// function Signup() {
//   const responseMessage = (response) => {
//       console.log(response);
//   };
//   const errorMessage = (error) => {
//       console.log(error);
//   };
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate(); // Hook to programmatically navigate

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({ ...prevState, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { firstName, lastName, email, password, confirmPassword } = formData;

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     setError('');

//     const name = `${firstName} ${lastName}`;

//     try {
//       const response = await axios.post('http://localhost:8080/api/register', {
//         name,
//         email,
//         password
//       });

//       localStorage.setItem('token', response.data.token);
//       console.log('User registered and logged in successfully:', response.data);

//       // Redirect to dashboard
//       navigate('/dashboard');

//     } catch (error) {
//       setError('User already registered. Please log in.');
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center mt-5">
//       <Row>
//         <Col>
//           <h3 className="text-start mb-4 text-primary">Signup</h3>
//           <Card className="p-4 shadow-sm border-primary border-3" style={{ maxWidth: '400px', margin: 'auto' }}>
//             <Card.Body>
//               <Form onSubmit={handleSubmit}>
//                 <Form.Group controlId="formBasicfirstName" className="mb-3">
//                   <Form.Control
//                     type="text"
//                     placeholder="First Name"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     className="py-2"
//                   />
//                 </Form.Group>
//                 <Form.Group controlId="formBasiclastName" className="mb-3">
//                   <Form.Control
//                     type="text"
//                     placeholder="Last Name"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     className="py-2"
//                   />
//                 </Form.Group>
//                 <Form.Group controlId="formBasicEmail" className="mb-3">
//                   <Form.Control
//                     type="email"
//                     placeholder="Email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="py-2"
//                   />
//                 </Form.Group>
//                 <Form.Group controlId="formBasicPassword" className="mb-3">
//                   <Form.Control
//                     type="password"
//                     placeholder="Password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="py-2"
//                   />
//                 </Form.Group>
//                 <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
//                   <Form.Control
//                     type="password"
//                     placeholder="Confirm Password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className="py-2"
//                   />
//                 </Form.Group>

//                 {error && <div className="text-danger mb-3">{error}</div>}

//                 <Button variant="primary" type="submit" className="w-100 mb-3 py-2">
//                   Signup
//                 </Button>

//                 <div className="text-center">
//                   <span>Already have an account? </span>
//                   <a href="/" className="text-primary">
//                     Login
//                   </a>
//                 </div>

//                                 <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default Signup;

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');

    const name = `${firstName} ${lastName}`;

    try {
      const response = await axios.post('http://localhost:8080/api/register', {
        name,
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      console.log('User registered and logged in successfully:', response.data);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      setError('User already registered. Please log in.');
    }
  };

  // Handle Google Login Success
  const responseMessage = async (response) => {
    try {
      // Decode the JWT token returned by Google
      const decoded = jwtDecode(response.credential);
      const { name, email } = decoded; // Extract the name and email from the decoded token

      // Call your backend API to handle Google signup
      const apiResponse = await axios.post('http://localhost:8080/api/google-signup', {
        name,
        email,
        googleToken: response.credential // Pass the Google token
      });

      // Save the JWT token returned by your backend after successful signup
      localStorage.setItem('token', apiResponse.data.token);
      console.log('User registered via Google and logged in successfully:', apiResponse.data);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Error signing up with Google. Please try again.');
    }
  };

  const errorMessage = (error) => {
    console.log('Google login error', error);
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Row>
        <Col>
          <h3 className="text-start mb-4 text-primary">Signup</h3>
          <Card className="p-4 shadow-sm border-primary border-3" style={{ maxWidth: '400px', margin: 'auto' }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicfirstName" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group controlId="formBasiclastName" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group controlId="formBasicEmail" className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>

                {error && <div className="text-danger mb-3">{error}</div>}

                <Button variant="primary" type="submit" className="w-100 mb-3 py-2">
                  Signup
                </Button>

                <div className="text-center">
                  <span>Already have an account? </span>
                  <a href="/" className="text-primary">
                    Login
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
  );
}

export default Signup;
