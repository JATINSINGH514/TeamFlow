import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectTasks, createTask, updateTaskStatus, addMemberToProject, removeMemberFromProject, getAllUsers, assignTask, getProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', deadline: '', assignedTo: '' });
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjectDetails();
    if (user?.role === 'Admin') {
      fetchAllUsers();
    }
  }, [id, user]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await getProjects();
      const currentProject = data.find(p => p._id === id);
      setProject(currentProject);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await getProjectTasks(id);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, projectId: id };
      const { data } = await createTask(payload);
      
      // If a member was selected, assign it immediately
      if (newTask.assignedTo) {
         await assignTask(data._id, newTask.assignedTo);
      }

      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', deadline: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
      console.error('Failed to create task', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addMemberToProject({ projectId: id, memberId: selectedMember });
      alert('Member added successfully!');
      setShowMemberModal(false);
      setSelectedMember('');
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
      console.error('Failed to add member', err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMemberFromProject({ projectId: id, memberId });
      alert('Member removed successfully!');
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
      console.error('Failed to remove member', err);
    }
  };

  const isOverdue = (deadline, status) => {
    if (!deadline || status === 'Done') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">{project ? project.title : 'Project Workspace'}</h1>
           {project && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>
        {user?.role === 'Admin' && (
          <div className="flex gap-4">
            <button onClick={() => setShowManageMembersModal(true)} className="btn-secondary">
              Manage Members
            </button>
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary">
              + Add Member
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn-primary">
              + Add Task
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Todo', 'InProgress', 'Done'].map(status => (
          <div key={status} className="bg-gray-100 p-4 rounded-xl min-h-[500px]">
            <h2 className="font-bold text-lg mb-4 text-gray-700">{status.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map(task => {
                const overdue = isOverdue(task.deadline, task.status);
                return (
                <div key={task._id} className={`card ${overdue ? 'border-red-300 shadow-red-100' : ''}`}>
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${overdue ? 'text-red-600' : ''}`}>{task.title}</h4>
                    {overdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">OVERDUE</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                  
                  {task.assignedTo && (
                    <p className="text-xs text-brand-600 mt-3 font-medium">Assignee: {task.assignedTo.name}</p>
                  )}
                  {task.deadline && (
                    <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {task.priority} Priority
                    </span>
                    <select
                      className="text-xs border-gray-300 rounded p-1 bg-gray-50 hover:bg-gray-100 cursor-pointer outline-none"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input required className="input-field" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="input-field" rows="3" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select className="input-field" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input type="date" required className="input-field" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To (Optional)</label>
                <select className="input-field" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {allUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select User</label>
                <select required className="input-field" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  <option value="" disabled>Select a user to add...</option>
                  {allUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Manage Members</h2>
            <div className="space-y-3 mb-6">
              {project?.members?.map(member => (
                <div key={member._id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  {project.admin._id !== member._id && (
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  {project.admin._id === member._id && (
                    <span className="text-xs bg-brand-100 text-brand-800 px-2 py-1 rounded font-bold">Admin</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowManageMembersModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
