import { useNavigate } from "react-router-dom";
import api from "../components/api";
import { useState } from "react";

interface pageLoginProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

function pageLogin({ setIsLoggedIn }: pageLoginProps) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Client-side validation
    const username = String(data.username || "").trim();
    const password = String(data.password || "").trim();

    if (!username || !password) {
      setErrorMessage("Username and password are required");
      console.error("Validation error: Missing required fields");
      return;
    }

    const payload = {
      username,
      password,
    };

    console.log("Login payload:", { ...payload, password: "[REDACTED]" });

    api
      .post("/login", payload)
      .then((response) => {
        console.log("Login successful:", response.data);
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        window.dispatchEvent(new Event("loginStatusChanged"));
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging in:", error);

        // Detailed error logging
        if (error.response) {
          // Server responded with error status
          console.error("Server error status:", error.response.status);
          console.error("Server error data:", error.response.data);

          const serverMessage =
            error.response.data?.error || error.response.data?.message;

          if (serverMessage) {
            setErrorMessage(serverMessage);
          } else if (error.response.status === 401) {
            setErrorMessage("Invalid username or password");
          } else if (error.response.status === 500) {
            setErrorMessage("Server error. Please try again later.");
          } else {
            setErrorMessage("Login failed. Please try again.");
          }
        } else if (error.request) {
          // Request made but no response
          console.error("No response from server:", error.request);
          setErrorMessage("Network error. Please check your connection.");
        } else {
          // Error setting up request
          console.error("Request setup error:", error.message);
          setErrorMessage("An unexpected error occurred.");
        }
      });
  }

  return (
    <>
      <form id="loginForm" onSubmit={handleLogin}>
        {errorMessage && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid red",
              borderRadius: "4px",
            }}
          >
            {errorMessage}
          </div>
        )}
        <input name="username" type="text" placeholder="username" required />
        <input
          name="password"
          type="password"
          placeholder="password"
          required
        />
        <button type="submit">Log in</button>
      </form>
    </>
  );
}

export default pageLogin;
