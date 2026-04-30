import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, getProjectAnalytics } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await getProjectAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setShowModal(false);
      setNewProject({ title: '', description: '' });
      fetchProjects();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const chartData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [
          analytics?.completedTasks || 0,
          analytics?.inProgressTasks || 0,
          analytics?.pendingTasks || 0,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#3b82f6'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name} ({user?.role})</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <h4 className="text-gray-500 text-sm">Total Projects</h4>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalProjects}</p>
          </div>
          <div className="card text-center">
            <h4 className="text-gray-500 text-sm">Total Tasks</h4>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalTasks}</p>
          </div>
          <div className="card text-center">
            <h4 className="text-gray-500 text-sm">Completed Tasks</h4>
            <p className="text-3xl font-bold text-green-500">{analytics.completedTasks}</p>
          </div>
          <div className="card text-center bg-red-50 border-red-100">
            <h4 className="text-red-500 text-sm font-semibold">Overdue Tasks</h4>
            <p className="text-3xl font-bold text-red-600">{analytics.overdueTasks}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="block">
                <div className="card hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">{project.tasks.length} Tasks</span>
                    <span className="bg-brand-100 text-brand-800 py-1 px-3 rounded-full text-xs font-semibold">
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-500 col-span-2">No projects found. Create one to get started!</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Task Overview</h2>
          <div className="w-full max-w-[250px] mx-auto mb-8">
             {analytics?.totalTasks > 0 ? (
                <Doughnut data={chartData} options={{ maintainAspectRatio: true }} />
             ) : (
                <p className="text-center text-gray-400 mt-10">No tasks to display.</p>
             )}
          </div>
          
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-t pt-6">Tasks Per User</h2>
          {analytics?.tasksPerUser?.length > 0 ? (
            <div className="space-y-3">
              {analytics.tasksPerUser.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">{u.name}</span>
                  <span className="bg-brand-100 text-brand-800 py-1 px-3 rounded-full text-xs font-semibold">{u.count} Tasks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm">No assignments yet.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="input-field" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="input-field" rows="3" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
