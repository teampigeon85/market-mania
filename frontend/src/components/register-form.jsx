import { Button } from "../components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const backend_url = 'http://localhost:3000';

export function RegisterForm({ className, ...props }) {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setLoading(true);

    try {
      const response = await fetch(`${backend_url}/api/emailauth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) setValidationErrors(data.details);
        else throw new Error(data.error || "Registration failed");
        return;
      }

      // ✅ Registration successful, automatically log in the user
      const user = data.user; // Backend must return created user object

      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to user home page
      navigate("/user-home");

    } catch (err) {
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${backend_url}/api/googleauth/google`;
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create your account</h2>

      {/* Google Sign-Up */}
      <button
        onClick={handleGoogleSignUp}
        className="w-full mb-4 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        disabled={loading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          />
        </svg>
        Sign up with Google
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 text-sm text-amber-600 bg-amber-50 rounded">
          <p className="font-semibold mb-1">Password requirements:</p>
          <ul className="list-disc pl-5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 hover:underline"
          disabled={loading}
        >
          Log in
        </button>
      </div>
    </div>
  )
}
