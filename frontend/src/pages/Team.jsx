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
  const [creationLocked, setCreationLocked] = useState(false);

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
      const limit = res.data?.limit ?? null;
      setGlobalLimit(limit);
      const locked = res.data?.lockTeams || limit === 0;
      setCreationLocked(Boolean(locked));
    } catch { setCreationLocked(false); }
  };
  const loadMyTeam = async (username) => {
    try {
      const res = await getTeamByUsername(username);
      setMyTeam(res.data || null);
    } catch { setMyTeam(null); }
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

        const profile = await getProfile(username);
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

const isOwner = true;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!currentUser) return setError("Nie jesteś zalogowany.");
    if (creationLocked) return setError("Tworzenie drużyn jest obecnie zablokowane przez organizatora.");
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
      setRobotName("");
      setSelectedCategory("");
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
    <div className="team-wrap">
      {/* Nagłówek */}
      <div className="card">
        <div className="card-body team-head">
          <h2 className="team-title">Zarządzanie drużyną</h2>
          {globalLimit !== null && (
            <div className="helper">Globalny limit członków: <strong>{globalLimit}</strong></div>
          )}
        </div>
      </div>

      {/* Komunikaty */}
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      {/* Główna siatka */}
      <div className="team-grid">
        {/* LEWA kolumna – podsumowanie/roboty lub publiczne drużyny */}
        <div className="card">
          <div className="card-body">
            {userHasTeam ? (
              <>
                <div className="section">
                  <MyTeamSummary team={myTeam} />
                </div>

                <div className="hr" />

                <div className="section">
                  <RobotsList robots={robots} />
                </div>
              </>
            ) : (
              <>
                <h3>Dostępne drużyny</h3>
                <TeamsPublicList teams={teams} />
                {!teams?.length && <p className="helper">Brak dostępnych drużyn.</p>}
              </>
            )}
          </div>
        </div>

        {/* PRAWA kolumna – tworzenie/dodawanie/roboty */}
        <div className="card">
          <div className="card-body">
            {!userHasTeam && !creationLocked && (
              <div className="section">
                <h3>Utwórz drużynę</h3>
                <TeamCreateForm
                  teamName={teamName}
                  setTeamName={setTeamName}
                  globalLimit={globalLimit}
                  onSubmit={handleCreate}
                />
              </div>
            )}

            {!userHasTeam && creationLocked && (
              <p className="notice error">Tworzenie drużyn zostało zablokowane przez organizatora.</p>
            )}

            {userHasTeam && (
              <>
                <div className="section">
                  <h3>Dodaj członka</h3>
                  <p className="helper" style={{ marginTop: -4, marginBottom: 8 }}>
                    Wpisz <strong>username</strong> osoby, którą chcesz dodać do swojej drużyny.
                  </p>
                  <AddMemberForm
                    visible={isOwner }
                    memberNick={memberNick}
                    setMemberNick={setMemberNick}
                    onSubmit={handleAddMember}
                  />
                  {!isOwner && (
                    <p className="helper">Dodawać nowych członków może tylko właściciel drużyny.</p>
                  )}
                </div>

                <div className="hr" />

                <div className="section">
                  <h3>Dodaj robota</h3>
                  <RobotCreateForm
                    onSubmit={handleCreateRobot}
                    robotName={robotName}
                    setRobotName={setRobotName}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
