import React from "react";

const RobotsList = ({ robots, onDelete }) => {
  return (
    <>
      <h3 style={{ marginTop: "2rem" }}>Roboty</h3>
      <ul>
        {robots.map((robot) => (
          <li key={robot._id}>
            <strong>{robot.name}</strong> (Drużyna ID: {robot.team})
            <button onClick={() => onDelete(robot._id)} style={{ marginLeft: "10px", color: "red" }}>
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default RobotsList;
