import '../AppStyles.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Strona główna</h1>

        <p className="home-description">
          <strong>Czym jest EastROBO?</strong><br /><br />
          EastROBO to międzynarodowe wydarzenie odbywające się na Politechnice Białostockiej.
To idealne miejsce dla każdego pasjonata robotyki i nowoczesnych technologii.
Podczas wydarzenia będzie można zobaczyć wiele różnych typów robotów i urządzeń autonomicznych
— a nawet ich walkę!<br /><br />

Jeśli chcesz zobaczyć prawdziwą kreatywność i pasję w akcji, to miejsce jest dla Ciebie!
EastROBO organizują koło naukowe <strong>Mobilne Systemy Inteligentne</strong>
oraz <strong>Samorząd Studencki</strong>.<br /><br />

Wydarzenie jest <strong>bezpłatne i otwarte dla wszystkich</strong>. Będzie też specjalna
strefa dla dzieci, gdzie będą mogły rozpocząć swoją przygodę z LEGO i robotyką.
        </p>
      </div>
    </div>
  );
};

export default Home;
