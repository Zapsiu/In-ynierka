import React from "react";

const UsersTable = ({ users, onRoleChange, onDeleteUser }) => {
  return (
    <div>
      <h3>Użytkownicy</h3>
      <table>
        <thead>
          <tr>
            <th>Nazwa użytkownika</th>
            <th>Rola</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => onRoleChange(u.username, e.target.value)}
                >
                  <option value="user">Użytkownik</option>
                  <option value="judge">Sędzia</option>
                  <option value="admin">Administrator</option>
                </select>
              </td>
              <td>
                <button
                  style={{ marginLeft: "10px", backgroundColor: "darkred", color: "white" }}
                  onClick={() => onDeleteUser(u.username)}
                >
                  Usuń konto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
