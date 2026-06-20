const YoutubeReviews = () => {
  // Replace video IDs with your actual channel videos later
  const videos = ["dQw4w9WgXcQ", "9bZkp7q19f0"];

  return (
    <div className="home-card">
      <h3>Farmer Review Videos</h3>

      <div className="video-grid">
        {videos.map((id) => (
          <iframe
            key={id}
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube review"
            allowFullScreen
          ></iframe>
        ))}
      </div>
    </div>
  );
};

export default YoutubeReviews;
