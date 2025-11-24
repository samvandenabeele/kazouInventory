import { useNavigate } from "react-router-dom";
import api from "../components/api";
import { useState } from "react";

interface PageSignUpProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

function PageSignUp({ setIsLoggedIn }: PageSignUpProps) {
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
    const email = String(data.email || "").trim();

    if (!username || !password || !email) {
      setErrorMessage("All fields are required");
      console.error("Validation error: Missing required fields");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      console.error("Validation error: Password too short");
      return;
    }

    const payload = {
      username,
      password,
      email,
    };

    console.log("Signup payload:", { ...payload, password: "[REDACTED]" });

    api
      .post("/signup", payload)
      .then((response) => {
        console.log("Signup successful:", response.data);
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        window.dispatchEvent(new Event("loginStatusChanged"));
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing up:", error);

        // Detailed error logging
        if (error.response) {
          // Server responded with error status
          console.error("Server error status:", error.response.status);
          console.error("Server error data:", error.response.data);

          const serverMessage =
            error.response.data?.error || error.response.data?.message;

          if (serverMessage) {
            setErrorMessage(serverMessage);
          } else if (error.response.status === 400) {
            setErrorMessage("Invalid input. Please check your data.");
          } else if (error.response.status === 500) {
            setErrorMessage("Server error. Please try again later.");
          } else {
            setErrorMessage("Signup failed. Please try again.");
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
        <div>gebruikersnaam</div>
        <input name="username" type="text" placeholder="Dirk" required />
        <div>wachtwoord</div>
        <input
          name="password"
          type="password"
          placeholder="Peeters"
          required
          minLength={6}
        />
        <div>emailadress</div>
        <input
          type="email"
          name="email"
          placeholder="dirk.peeters@gmail.com"
          required
        />
        <button type="submit">sign up</button>
      </form>
    </>
  );
}
export default PageSignUp;
