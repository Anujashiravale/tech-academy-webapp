import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from './api';
import './index.css';

const Home = () => (
  <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Welcome to Tech Academy</h1>
    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
      Master full-stack development, deployment, and more with our premium courses.
    </p>
    <Link to="/courses" className="btn" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>Explore Courses</Link>
  </div>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('courses/')
      .then(res => { setCourses(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleEnroll = async (id) => {
    try {
      await api.post(`courses/${id}/enroll/`);
      alert('Successfully enrolled!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Please login to enroll.');
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px' }}>Available Courses</h2>
      {loading ? <p>Loading...</p> : (
        <div className="card-grid">
          {courses.map(course => (
            <div className="card" key={course.id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="price">${course.price}</div>
              <p>Instructor: {course.instructor_name}</p>
              <button className="btn" onClick={() => handleEnroll(course.id)}>Enroll Now</button>
            </div>
          ))}
          {courses.length === 0 && <p>No courses available right now.</p>}
        </div>
      )}
    </div>
  );
};

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('users/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setAuth(true);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn" style={{ width: '100%' }}>Login</button>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('users/register/', { username, password });
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      alert(err.response?.data?.username?.[0] || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Student Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn" style={{ width: '100%' }}>Register</button>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('enrollments/')
      .then(res => { setEnrollments(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px' }}>Your Enrolled Courses</h2>
      {loading ? <p>Loading...</p> : (
        <div className="card-grid">
          {enrollments.map(enroll => (
            <div className="card" key={enroll.id}>
              <h3>{enroll.course_title}</h3>
              <p style={{ color: 'var(--success)' }}>Enrolled on: {new Date(enroll.enrolled_at).toLocaleDateString()}</p>
              <Link to={`/courses/${enroll.course_id}/play`} className="btn btn-outline" style={{ marginTop: '10px' }}>Go to Course</Link>
            </div>
          ))}
          {enrollments.length === 0 && <p>You have not enrolled in any courses yet.</p>}
        </div>
      )}
    </div>
  );
};

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    api.get(`courses/${id}/`)
      .then(res => { 
        setCourse(res.data);
        if (res.data.lessons && res.data.lessons.length > 0) {
          setActiveLesson(res.data.lessons[0]);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!course) return <div className="container"><p>Loading Course...</p></div>;

  return (
    <div className="container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <div style={{ flex: '1' }}>
        <h2 style={{ marginBottom: '20px' }}>{course.title}</h2>
        {activeLesson ? (
          <div>
            <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '20px' }}>
              {activeLesson.video_url ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={activeLesson.video_url} 
                  title={activeLesson.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                  No video available
                </div>
              )}
            </div>
            <h3>{activeLesson.title}</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{activeLesson.content}</p>
          </div>
        ) : (
          <p>No lessons available for this course yet. Check back soon!</p>
        )}
      </div>
      
      <div style={{ width: '300px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
        <h3 style={{ marginBottom: '15px' }}>Course Lessons</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {course.lessons?.map((lesson, idx) => (
            <button 
              key={lesson.id} 
              onClick={() => setActiveLesson(lesson)}
              style={{ 
                textAlign: 'left', 
                padding: '12px', 
                background: activeLesson?.id === lesson.id ? 'var(--primary)' : 'transparent',
                color: activeLesson?.id === lesson.id ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {idx + 1}. {lesson.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">Tech Academy</Link>
          <div className="links">
            <Link to="/courses">Courses</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button className="btn btn-outline" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn">Register</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id/play" element={isAuthenticated ? <CoursePlayer /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
