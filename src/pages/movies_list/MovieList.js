import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import Cards from '../../components/card/card';
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { ref, getDownloadURL } from "firebase/storage";  // Firebase Storage functions
import { db, storage } from '../../Firebase'; // Firebase configuration
import './MovieList.css';
import Footer from '../../components/footer/Footer';

const MovieList = () => {
  const [movieList, setMovieList] = useState([]);
  const { type } = useParams();
  const navigate = useNavigate(); // Add useNavigate hook

  useEffect(() => {
    getData();
  }, [type]);

  useEffect(() => {
    document.title = 'Popular - All Movies';
  }, []);  

  const getData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "movies"));
      const movieData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        let movie = doc.data();

        // Convert timestamp if present
        if (movie.release_date && movie.release_date.seconds) {
          movie.release_date = new Date(movie.release_date.seconds * 1000).toLocaleDateString();
        }

        let bannerUrl = '/default-banner.png';
        let thumbnailUrl = '/default-thumbnail.png';

        // Fetching banner and thumbnail URLs with error handling
        try {
          if (movie.banner_image) {
            bannerUrl = await getDownloadURL(ref(storage, `banners/${movie.banner_image}`));
          }
          if (movie.thumbnail) {
            thumbnailUrl = await getDownloadURL(ref(storage, `thumbnails/${movie.thumbnail}`));
          }
        } catch (storageError) {
          console.error("Error fetching images from Firebase Storage: ", storageError);
        }

        return { id: doc.id, ...movie, banner_image: bannerUrl, thumbnail: thumbnailUrl };
      }));
      setMovieList(movieData);
    } catch (error) {
      console.error("Error fetching movie data from Firestore: ", error);
    }
  };

  // Handle card click to navigate to movie detail page
  const handleCardClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className='bg-dark'>
      <div className="carousel m-0 p-0 shadow-lg">
        <Carousel className="movie-carousel">
          {movieList.slice(0, 5).map((movie) => (
            <Carousel.Item key={movie.id}>
              <img
                className="d-block w-100"
                src={movie.banner_image}
                alt={movie.title}
              />
              <Carousel.Caption>
                <h3>{movie.title}</h3>
                <p>{movie.description ? movie.description.slice(0, 500) + "..." : "No description available."}</p>
                {movie.release_date && <small className='release-date'>Release Date: {movie.release_date}</small>}
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>

        <h2 className="list__title text-light">{(type ? type : "POPULAR").toUpperCase()}</h2>
        <div className="list__cards mb-5 bg-dark">
          {movieList.map((movie) => (
            <Cards key={movie.id} movie={movie} onClick={() => handleCardClick(movie.id)} label="POPULAR" />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MovieList;
