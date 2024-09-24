import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './TrailerPlayer.css';
import Footer from '../footer/Footer';
import { FaPlayCircle } from "react-icons/fa";

// Utility function to extract YouTube video ID from URL
const extractVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : url; // Return the ID or the URL if no match
};

const TrailerPlayer = () => {
  const { videoId } = useParams(); // This should be the video ID, not the full URL
  const [trailer_url, setTrailerUrl] = useState(null);

  useEffect(() => {
    // Fetch the movie data using the video ID from the API
    axios.get(`http://localhost:8000/api/movies/${videoId}/`) // Assuming `videoId` is the movie ID, and it should be replaced with the appropriate endpoint
      .then(response => {
        const trailer_url = response.data.trailer_url; // Assume this is a full URL
        setTrailerUrl(extractVideoId(trailer_url)); // Extract the video ID
      })
      .catch(error => console.error('Error fetching trailer URL:', error));
  }, [videoId]);

  if (!trailer_url) return <div>Loading...</div>;

  return (
    <div className='bg-dark'>
    <h2 className="text-light play-text mt-1">Watch Trailer <FaPlayCircle className="material-icons"/></h2>
    <Container className="mt-1 mb-5">
      <div className="trailer-player">
        {trailer_url ? (
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${trailer_url}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Trailer"
          ></iframe>
        ) : (
          <p className="text-light">No trailer available</p>
        )}
      </div>
    </Container>
    <Footer />
    </div>
  );
};

export default TrailerPlayer;
