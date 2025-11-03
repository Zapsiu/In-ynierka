import { useEffect, useState } from "react";
import "../AppStyles.css";
import { createTeam, getTeams, addMember, getTeamByUsername } from "../api/team";
import { getProfile } from "../api/auth";
import { getGlobalTeamLimit } from "../api/admin";
import { fetchCategories } from "../api/categories";
import { getRobotsByUsername, createRobot } from "../api/robots";

import TeamCreateForm from "../components/team/TeamCreateForm";
import AddMemberForm from "../components/team/AddMemberForm";
import MyTeamSummary from "../components/team/MyTeamSummary";
import RobotCreateForm from "../components/team/RobotCreateForm";
import RobotsList from "../components/team/RobotList";
import TeamsPublicList from "../components/team/TeamsPublicList";

const Team = () => {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userHasTeam, setUserHasTeam] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [robotName, setRobotName] = useState("");
  const [robots, setRobots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [globalLimit, setGlobalLimit] = useState(null);

  const [myTeam, setMyTeam] = useState(null);
  const [memberNick, setMemberNick] = useState("");

  const safeErr = (e) => {
    const msg = e?.response?.data?.message || e?.message || String(e);
    console.error("[TEAM]", e);
    setError(msg);
  };

  const loadRobots = async (username) => {
    const res = await getRobotsByUsername(username);
    setRobots(res.data || []);
  };

  const loadCategories = async () => {
    const list = await fetchCategories();
    setCategories(list || []);
  };

  const loadGlobalLimit = async () => {
    try {
      const res = await getGlobalTeamLimit();
      setGlobalLimit(res.data?.limit ?? null);
    } catch {  }
  };

  const loadMyTeam = async (username) => {
    try {
      const res = await getTeamByUsername(username);
      setMyTeam(res.data || null);
    } catch {
      setMyTeam(null);
    }
  };

  const loadTeams = async () => {
    const list = await getTeams();
    setTeams(list.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");
        if (!username || !token) throw new Error("Brak zalogowanego użytkownika");
        const profile = await getProfile(username); // GET /auth/profil z x-username w Twoim auth.js
        const u = profile.data;
        setCurrentUser(u?.username || null);
        const hasTeam = !!u?.team;
        setUserHasTeam(hasTeam);

        await loadTeams();
        await loadGlobalLimit();

        if (hasTeam) {
          await loadMyTeam(u.username);
          await loadRobots(u.username);
          await loadCategories();
        }
      } catch (err) { safeErr(err); }
    })();
  }, []);

  const isOwner = myTeam?.ownerId?.username === currentUser;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!currentUser) return setError("Nie jesteś zalogowany.");
    try {
      const res = await createTeam(teamName, currentUser);
      setMessage(res.data?.message || "Drużyna utworzona");
      setTeamName("");
      await loadTeams();
      setUserHasTeam(true);
      await loadMyTeam(currentUser);
      await loadRobots(currentUser);
      await loadCategories();
    } catch (err) { safeErr(err); }
  };

  const handleCreateRobot = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const res = await createRobot({ username: currentUser, robotName, categoryId: selectedCategory });
      setMessage(res.data?.message || "Dodano robota");
      setRobotName(""); setSelectedCategory("");
      await loadRobots(currentUser);
    } catch (err) { safeErr(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!memberNick || !myTeam?._id) return setError("Podaj nick i upewnij się, że masz drużynę.");
    try {
      const res = await addMember({
        teamId: myTeam._id,
        requesterUsername: currentUser,
        usernameToAdd: memberNick,
      });
      setMessage(res.data?.message || "Dodano członka.");
      setMemberNick("");
      await loadMyTeam(currentUser);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
    }
  };

  return (
    <div className="profile-container">
    <div className="card">
      <h2>Zarządzanie drużyną</h2>
    

      {!userHasTeam && (
        <TeamCreateForm
          teamName={teamName}
          setTeamName={setTeamName}
          globalLimit={globalLimit}
          onSubmit={handleCreate}
        />
      )}
    
      {userHasTeam && (
        <>
          <AddMemberForm
            visible={isOwner}
            memberNick={memberNick}
            setMemberNick={setMemberNick}
            onSubmit={handleAddMember}
          />

          <MyTeamSummary team={myTeam} />

          <RobotCreateForm
            onSubmit={handleCreateRobot}
            robotName={robotName}
            setRobotName={setRobotName}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <RobotsList robots={robots} />
        </>
      )}

      {message && <p style={{ color: "lightgreen" }}>{message}</p>}
      {error && <p className="error">{error}</p>}

      <TeamsPublicList teams={teams} />
    </div>
    </div>
  );
};

export default Team;
