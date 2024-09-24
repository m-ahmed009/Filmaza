import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../Firebase"; // Import Firebase storage
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "./card.css";

const Cards = ({ movie, label }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      if (movie?.image) {
        try {
          const imageRef = ref(storage, `images/${movie.image}`);
          console.log("Fetching image from:", imageRef);
          const imageURL = await getDownloadURL(imageRef);
          setImageUrl(imageURL);
        } catch (error) {
          console.error('Error fetching image:', error);
          setImageUrl(require("./default-thumbnail.jpg")); // Fallback image
        }
      } else {
        setImageUrl(require("./default-thumbnail.jpg")); // Fallback if no image
      }
    };

    fetchImage();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [movie]);


  // Determine the path based on the label
    const path = label === "Top Rated" 
    ? `/top-rated/${movie.id}` 
    : label === "Upcoming" 
    ? `/upcoming/${movie.id}` 
    : `/movies/${movie.id}`;

  return (
    <>
      {isLoading ? (
        <div className="cards">
          <SkeletonTheme color="#202020" highlightColor="#444">
            <Skeleton height={300} duration={2} />
          </SkeletonTheme>
        </div>
      ) : (
        <Link to={path} style={{ textDecoration: "none", color: "white" }}>
          <div className="cards">
            {label && <div className="card__label">{label}</div>} {/* Render label if provided */}
            <img
              className="cards__img"
              src={imageUrl || require("./default-thumbnail.jpg")}
              alt={movie.title || "Movie Poster"}
            />
            <div className="cards__overlay">
              <div className="card__title">{movie?.title}</div>
              <div className="card__runtime">
                {movie?.release_date}
                <span className="card__rating">
                  {movie?.vote_average}
                  <i className="fas fa-star" />
                </span>
              </div>
              <div className="card__description">
                {movie?.description?.slice(0, 118) + "..." || "No description available"}
              </div>
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default Cards;
