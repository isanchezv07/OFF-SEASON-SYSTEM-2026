import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users');
      const users: User[] = await response.json();
      
      const userFound = users.find((user: User) =>
        user.username === formData.username && user.password === formData.password
      );

      if (userFound) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', userFound.username);
        localStorage.setItem('role', userFound.role);

        toast.success(`Bienvenido, ${userFound.username}`);

        switch (userFound.role) {
          case 'admin':
            window.location.href = '/admin_dashboard';
            break;
          case 'head_ref':
            window.location.href = '/head_ref';
            break;
          case 'blue_ref':
            window.location.href = '/blue_ref';
            break;
          case 'red_ref':
            window.location.href = '/red_ref';
            break;
          case 'scorekeeper':
            window.location.href = '/scorekeeper';
            break;
          case 'inspector':
            window.location.href = '/inspection';
            break;
          default:
            window.location.href = '/login';
        }
      } else {
        toast.error('Usuario o contraseña incorrectos');
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      toast.error('Error al conectar con el servidor');
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-lg mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-lg mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center text-sm py-4 text-gray-500">
        Developed by{' '}
        <a
          href="https://github.com/isanchezv07"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @isanchezv07
        </a>
      </footer>
    </div>
  );
};

export default LoginForm;