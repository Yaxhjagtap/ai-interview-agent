import React, {useState} from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [form,setForm] = useState({email:"", password:""});
  const [err,setErr] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const r = await login(form);
      localStorage.setItem("access_token", r.access_token);
      nav("/dashboard");
    }catch(err){
      setErr("Login failed");
    }
  }

  return (
    <div style={{maxWidth:600}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><br/>
        <button type="submit">Login</button>
      </form>
      <div style={{color:"red"}}>{err}</div>
    </div>
  );
}
