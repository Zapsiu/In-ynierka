import { useEffect, useState } from "react";
import "../AppStyles.css";
import UsersTable from "../components/admin/UsersTable";
import GlobalTeamLimit from "../components/admin/GlobalTeamLimit";
import TeamsList from "../components/admin/TeamsList";
import RobotsList from "../components/admin/RobotsList";
import CategoriesList from "../components/admin/CategoriesList";
import {
  getUsers,
  getTeams,
  getCategories,
  getRobots,
  getGlobalTeamLimit,
  changeUserRole,
  updateTeamLimit,
  removeTeamMember,
  deleteRobot,
  deleteCategory,
  deleteTeam,
  saveGlobalTeamLimit,
  deleteUser,
} from "../api/admin";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [robots, setRobots] = useState([]);
  const [message, setMessage] = useState("");
  const [globalLimit, setGlobalLimit] = useState(5);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const loadTeams = async () => {
    const res = await getTeams();
    const updated = res.data.map((t) => ({ ...t, newLimit: t.limit }));
    setTeams(updated);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  const loadRobots = async () => {
    const res = await getRobots();
    setRobots(res.data);
  };

  const loadGlobalLimit = async () => {
    const res = await getGlobalTeamLimit();
    setGlobalLimit(res.data.limit);
  };

  useEffect(() => {
    Promise.all([loadUsers(), loadTeams(), loadCategories(), loadRobots(), loadGlobalLimit()]);
  }, []);

  const handleRoleChange = async (username, newRole) => {
    const res = await changeUserRole(username, newRole);
    setMessage(res.data.message);
    loadUsers();
  };

  const handleLimitChange = async (teamId, newLimit) => {
    const res = await updateTeamLimit(teamId, newLimit);
    setMessage(res.data.message);
    loadTeams();
  };

  const handleRemoveMember = async (teamId, username) => {
    const res = await removeTeamMember(teamId, username);
    setMessage(res.data.message);
    loadTeams();
  };

  const handleDeleteRobot = async (robotId) => {
    await deleteRobot(robotId);
    setMessage("Robot usunięty");
    loadRobots();
  };

  const handleDeleteCategory = async (categoryId) => {
    await deleteCategory(categoryId);
    setMessage("Kategoria usunięta");
    loadCategories();
  };

  const handleDeleteTeam = async (teamId) => {
    await deleteTeam(teamId);
    setMessage("Drużyna usunięta");
    loadTeams();
    loadRobots();
  };

  const handleGlobalLimitSave = async () => {
    const res = await saveGlobalTeamLimit(globalLimit);
    setMessage(res.data.message);
  };

  const handleLocalTeamLimitChange = (teamId, value) => {
    const updated = teams.map((t) => (t._id === teamId ? { ...t, newLimit: value } : t));
    setTeams(updated);
  };
  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${username}?`)) {
      return;
    }

    try {
      const res = await deleteUser(username);
      setMessage(res.data?.message || "Użytkownik usunięty");
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("Nie udało się usunąć użytkownika");
    }
  };

  return (
    <div className="profile-container">
      <h2>Panel Administratora</h2>
      <div className="card" style={{gap:15}}>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <UsersTable users={users} onRoleChange={handleRoleChange} onDeleteUser={handleDeleteUser}/>

      <GlobalTeamLimit
        value={globalLimit}
        onChange={setGlobalLimit}
        onSave={handleGlobalLimitSave}
      />

      <TeamsList
        teams={teams}
        onLocalLimitChange={handleLocalTeamLimitChange}
        onSaveLimit={handleLimitChange}
        onRemoveMember={handleRemoveMember}
        onDeleteTeam={handleDeleteTeam}
      />

      <RobotsList robots={robots} onDelete={handleDeleteRobot} />

      <CategoriesList categories={categories} onDelete={handleDeleteCategory} />
    </div>
    </div>
  );
};

export default AdminPanel;
