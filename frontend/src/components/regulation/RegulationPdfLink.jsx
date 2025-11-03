const RegulationPdfLink = ({ pdfUrl, pdfFileName }) => {
  if (!pdfUrl) return null;
  return (
    <p>
      Oryginalny PDF:{" "}
      <a href={pdfUrl} target="_blank" rel="noreferrer">
        {pdfFileName || "Pobierz"}
      </a>
    </p>
  );
};

export default RegulationPdfLink;
