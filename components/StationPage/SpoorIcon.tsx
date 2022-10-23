const SpoorIcon = ({ spoorNr }: { spoorNr: string }) => (
  <div
    style={{
      margin: "1rem",
      borderColor: "black",
      borderWidth: "5px",
      borderRadius: "5px",
      borderStyle: "solid",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",

      minWidth: "75px",
      maxWidth: "75px",
      height: "75px",
    }}
  >
    <p style={{ fontSize: "10px", fontFamily: "monospace" }}>Spoor</p>
    <p style={{ fontSize: "30px", fontWeight: "bold" }}>{spoorNr}</p>
  </div>
);

export default SpoorIcon;
