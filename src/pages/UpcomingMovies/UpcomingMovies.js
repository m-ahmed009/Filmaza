import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { ref, getDownloadURL } from "firebase/storage";  // Firebase Storage functions
import { db, storage } from '../../Firebase'; // Firebase configuration
import './UpcomingMovies.css';
import Cards from '../../components/card/card'; // Assume this component is for movie cards
import Footer from '../../components/footer/Footer';

const UpcomingMovies = () => {
  const [movieList, setMovieList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    document.title = 'Upcoming - All Movies';
  }, []);  

  const getData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "upcomingMovies")); // Fetch from 'upcomingMovies' collection
      const movieData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        let movie = doc.data();

        // Convert timestamp if present
        if (movie.release_date && movie.release_date.seconds) {
          movie.release_date = new Date(movie.release_date.seconds * 1000).toLocaleDateString();
        }

        let thumbnailUrl = '/default-thumbnail.png';

        // Fetch thumbnail URL from Firebase Storage
        try {
          if (movie.thumbnail) {
            thumbnailUrl = await getDownloadURL(ref(storage, `thumbnails/${movie.thumbnail}`));
          }
        } catch (storageError) {
          console.error("Error fetching thumbnail from Firebase Storage: ", storageError);
        }

        return { id: doc.id, ...movie, thumbnail: thumbnailUrl };
      }));
      setMovieList(movieData);
    } catch (error) {
      console.error("Error fetching upcoming movie data from Firestore: ", error);
    }
  };

  // Handle card click to navigate to movie detail page
  const handleCardClick = (movieId) => {
    navigate(`/upcoming/${movieId}`);
  };

  return (
    <div className='bg-dark'>
    <div className='mt-1'>.</div>
    <div className="bg-dark upcoming-movies">
      <h2 className="list__title text-light"> <span className='fs-6'>UPCOMING</span> MOVIES</h2>
      <div className="list__cards mb-5 bg-dark">
        {movieList.map((movie) => (
          <Cards key={movie.id} movie={movie} onClick={() => handleCardClick(movie.id)} label="Upcoming" />
        ))}
      </div>
      <Footer />      
    </div>
    </div>
  );
};

export default UpcomingMovies;
