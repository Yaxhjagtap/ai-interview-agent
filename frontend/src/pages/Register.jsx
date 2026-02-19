import React, {useState} from "react";
import { register } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [form,setForm] = useState({name:"",email:"",password:"",education:"",address:"",skills:"",company_interest:""});
  const [msg,setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const r = await register(form);
      setMsg("Registered. Please login.");
      nav("/login");
    }catch(err){
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div style={{maxWidth:700}}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><br/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><br/>
        <input placeholder="Education" value={form.education} onChange={e=>setForm({...form,education:e.target.value})} /><br/>
        <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /><br/>
        <input placeholder="Skills (comma)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} /><br/>
        <input placeholder="Company interest" value={form.company_interest} onChange={e=>setForm({...form,company_interest:e.target.value})} /><br/>
        <button type="submit">Register</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}
