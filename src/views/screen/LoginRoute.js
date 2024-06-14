import { useContext, useEffect } from 'react';
import { Route, Navigate, useNavigate } from 'react-router-dom';
import { AppContext } from 'context/AppContext';

export function LoginRoute({ children }) {
    const { authUser } = useContext(AppContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (!authUser) {
            navigate('/signIn-page');
        }
    },[])
    return children;
}