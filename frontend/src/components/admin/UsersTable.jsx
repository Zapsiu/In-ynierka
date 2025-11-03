import React from "react";

const UsersTable = ({ users, onRoleChange }) => {
  return (
    <>
      <h3>Użytkownicy</h3>
      <table>
        <thead>
          <tr>
            <th>Login</th>
            <th>Rola</th>
            <th>Nowa rola</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <select value={u.role} onChange={(e) => onRoleChange(u.username, e.target.value)}>
                  <option value="user">user</option>
                  <option value="judge">judge</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default UsersTable;
