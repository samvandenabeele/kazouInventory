import type { AxiosInstance } from "axios";
import { redirect } from "react-router-dom";

interface PageSignUpProps {
  api: AxiosInstance;
}

function PageSignUp({ api }: PageSignUpProps) {
  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    api
      .post("/signup", {
        username: data.username,
        password: data.password,
      })
      .then(() => redirect("/"))
      .catch((error) => {
        console.error("Error signing up:", error);
      });
  }

  return (
    <>
      <form id="loginForm" onSubmit={handleLogin}>
        <input name="username" type="text" placeholder="username" />
        <input name="password" type="text" placeholder="password" />
        <button type="submit">sign up</button>
      </form>
    </>
  );
}
export default PageSignUp;
