import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/hello`)
      .then(res => res.text())
      .then(data => setMsg(data))
      .catch(err => setError("Failed to connect to backend. Make sure it's running on port 8080."));
  }, []);

  return (
    <div>
      <h1>React + Spring Boot + Docker</h1>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{msg || "Loading..."}</p>}
    </div>
  );
}

export default App;
