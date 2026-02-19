import React, {useState, useEffect} from "react";
import { getProfile, uploadResume, startInterview, listInterviews } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard(){
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const nav = useNavigate();

  useEffect(()=>{ fetchProfile(); fetchInterviews(); },[]);

  async function fetchProfile(){
    try{
      const p = await getProfile();
      setProfile(p);
    }catch(e){
      console.error(e);
    }
  }

  async function onUpload(e){
    e.preventDefault();
    if(!file) return alert("Choose PDF");
    const r = await uploadResume(file);
    alert("Uploaded: " + JSON.stringify(r));
    fetchProfile();
  }

  async function onStart(){
    try{
      const r = await startInterview();
      // r: {interview_id, first_question}
      nav(`/interview/${r.interview_id}`);
    }catch(err){
      alert("Start failed: " + err.message);
    }
  }

  async function fetchInterviews(){
    try{
      const list = await listInterviews();
      setInterviews(list);
    }catch(e){}
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {profile && <div>
        <div><b>Name:</b> {profile.name}</div>
        <div><b>Email:</b> {profile.email}</div>
        <div><b>Education:</b> {profile.education}</div>
        <div><b>Resume:</b> {profile.resume_path ? profile.resume_path : "Not uploaded"}</div>
      </div>}
      <hr />
      <h3>Upload Resume (PDF)</h3>
      <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])} />
      <button onClick={onUpload}>Upload</button>
      <hr />
      <button onClick={onStart}>Start Interview</button>
      <hr />
      <h3>Past Interviews</h3>
      <ul>
        {interviews.map(i => (
          <li key={i.id}>
            <Link to={`/interview/${i.id}`}>Interview #{i.id} - {new Date(i.created_at).toLocaleString()}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
