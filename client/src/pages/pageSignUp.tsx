import type { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";

interface PageSignUpProps {
  api: AxiosInstance;
}

function PageSignUp({ api }: PageSignUpProps) {
  const navigate = useNavigate();
  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    api
      .post("/signup", {
        username: String(data.username).trim(),
        password: String(data.password).trim(),
        email: String(data.email).trim(),
      })
      .then(() => navigate("/"))
      .catch((error) => {
        console.error("Error signing up:", error);
      });
  }

  return (
    <>
      <form id="loginForm" onSubmit={handleLogin}>
        <input name="username" type="text" placeholder="username" />
        <input name="password" type="text" placeholder="password" />
        <input type="email" name="email" />
        <button type="submit">sign up</button>
      </form>
    </>
  );
}
export default PageSignUp;
