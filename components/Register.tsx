import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async() => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                username,
                email,
                password
            });

            console.log(response.data);

            if (response.status === 201) {
                window.location.href = '/login';
            } 

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="h-screen w-screen bg-slate-900 flex items-center flex-col justify-center">
            <div className="shadow-xl bg-slate-950 w-[30vw] h-auto min-w-[30rem] p-10 flex flex-col items-center rounded-2xl justify-center gap-5">
                <h3 className="text-center uppercase text-3xl text-gray-50">
                    Register
                </h3>
                <div className="flex flex-col items-start justify-start gap-1 w-full">
                    <label
                        htmlFor="username"
                        className="text-slate-200 text-left text-sm"
                    >
                        Username
                    </label>
                    <input
                        type="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-12 pl-3 border-2 rounded-lg border-slate-100 text-lg text-slate-200 bg-slate-900"
                    />
                </div>
                <div className="flex flex-col items-start justify-start gap-1 w-full">
                    <label
                        htmlFor="email"
                        className="text-slate-200 text-left text-sm"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-3 border-2 rounded-lg border-slate-100 text-lg text-slate-200 bg-slate-900"
                    />
                </div>
                <div className="flex flex-col items-start justify-start gap-1 w-full">
                    <label
                        htmlFor="password"
                        className="text-slate-200 text-left text-sm"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-3 border-2 rounded-lg border-slate-100 text-lg text-slate-200 bg-slate-900"
                    />
                </div>
                <button onClick={handleSubmit} className="w-auto h-auto px-8 py-3 bg-slate-200 rounded-lg uppercase font-semibold">
                    Sign Up
                </button>
                <div className="mt-3 mb-3 w-full h-[1px] bg-slate-200"></div>
                <p className="text-slate-200">Already have an account?</p>
                <Link
                    className="text-slate-200 text-lg underline underline-offset-8"
                    to="/login"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
