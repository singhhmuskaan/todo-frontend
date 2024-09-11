import { jwtDecode } from 'jwt-decode';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import config from './config';

export const useGoogleSuccess = () => {
    // Handle Google Login Success
    const navigate = useNavigate(); // Hook to programmatically navigate

    const responseMessage = async (response) => {
        try {
            // Decode the JWT token returned by Google
            const decoded = jwtDecode(response.credential);
            const { name, email } = decoded; // Extract the name and email from the decoded token

            // Call your backend API to handle Google signup
            const apiResponse = await axios.post(`${config.apiUrl}/google-signup`, {
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
        }
    };

    const errorMessage = (error) => {
        console.log('Google login error', error);
    };
    return {responseMessage, errorMessage};
}