import React from 'react';
import { useNavigate } from 'react-router-dom';

function ButtonBack() {
    const navigate = useNavigate();
    return (
        <>
            <button 
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 z-20 // Posição e Z-index p-2 rounded-full text-black cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
        </>
    );
}

export default ButtonBack;