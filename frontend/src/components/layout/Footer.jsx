const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-links">
        <a href="/">Strona główna</a>
        <a href="/regulamin">Regulamin</a>
      </div>
      <small>
        © {new Date().getFullYear()} EastRobo — Projekt Inżynierski.  
        Wszelkie prawa zastrzeżone.
      </small>
    </div>
  </footer>
);

export default Footer;
