import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import Cards from '../../components/card/card';
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { ref, getDownloadURL } from "firebase/storage";  // Firebase Storage functions
import { db, storage } from '../../Firebase'; // Firebase configuration
import './Toprated.css';
import Footer from '../../components/footer/Footer';

const TopRated = () => {
  const [topRatedList, setTopRatedList] = useState([]);

  useEffect(() => {
    getTopRatedData();
  }, []);

  useEffect(() => {
    document.title = 'Top Rated - All Movies';
  }, []);   

  const getTopRatedData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "top-rated")); // Fetching top-rated movies
      const topRatedData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        let topRated = doc.data();

        // Convert timestamp if present
        if (topRated.release_date && topRated.release_date.seconds) {
          topRated.release_date = new Date(topRated.release_date.seconds * 1000).toLocaleDateString();
        }

        let bannerUrl = '/default-banner.png';
        let thumbnailUrl = '/default-thumbnail.png';

        // Fetching banner and thumbnail URLs with error handling
        try {
          if (topRated.banner_image) {
            bannerUrl = await getDownloadURL(ref(storage, `banners/${topRated.banner_image}`));
          }
          if (topRated.thumbnail) {
            thumbnailUrl = await getDownloadURL(ref(storage, `thumbnails/${topRated.thumbnail}`));
          }
        } catch (storageError) {
          console.error("Error fetching images from Firebase Storage: ", storageError);
        }

        return { id: doc.id, ...topRated, banner_image: bannerUrl, thumbnail: thumbnailUrl };
      }));
      setTopRatedList(topRatedData);
    } catch (error) {
      console.error("Error fetching top-rated movie data from Firestore: ", error);
    }
  };

  return (
    <div className='bg-dark'>
      <div className="carousel m-0 p-0 shadow-lg">
        <Carousel className="movie-carousel">
          {topRatedList.slice(0, 5).map((topRated) => (
            <Carousel.Item key={topRated.id}>
              <img
                className="d-block w-100"
                src={topRated.banner_image}
                alt={topRated.title}
              />
              <Carousel.Caption>
                <h3>{topRated.title}</h3>
                <p>{topRated.description ? topRated.description.slice(0, 500) + "..." : "No description available."}</p>
                {topRated.release_date && <small className='release-date'>Release Date: {topRated.release_date}</small>}
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>

        <h2 className="list__title text-light"> <span className='fs-5'>TOP</span> RATED</h2>
        <div className="list__cards mb-5 bg-dark">
            {topRatedList.map((topRated) => (
                <Cards key={topRated.id} movie={topRated} label="Top Rated" />
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopRated;
