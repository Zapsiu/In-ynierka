const RobotsList = ({ robots }) => (
  <>
    <h3>Twoje roboty:</h3>
    <ul>
      {robots.map((r) => <li key={r._id}>{r.name}</li>)}
    </ul>
  </>
);

export default RobotsList;
