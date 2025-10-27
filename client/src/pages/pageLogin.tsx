import type { AxiosInstance } from "axios";
import { redirect } from "react-router-dom";

interface pageLoginProps {
  api: AxiosInstance;
}

function pageLogin({ api }: pageLoginProps) {
  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    api
      .post("/login", {
        username: data.username,
        password: data.password,
      })
      .then(() => redirect("/"))
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  }

  return (
    <>
      <form id="loginForm" onSubmit={handleLogin}>
        <input name="username" type="text" placeholder="username" />
        <input name="password" type="text" placeholder="password" />
        <button type="submit">Log in</button>
      </form>
    </>
  );
}

export default pageLogin;
