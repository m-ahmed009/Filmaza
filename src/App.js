import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieList from './pages/movies_list/MovieList';
import MovieDetail from './pages/movies_details/MovieDetail';
import TopRated from './pages/Toprated/Toprated';
import UpcomingMovies from './pages/UpcomingMovies/UpcomingMovies';
import UpcomingMovieDetail from './pages/UpcomingMovieDetail/UpcomingMovieDetail';
import TopRatedMovieDetail from './pages/TopRatedMovieDetail/TopRatedMovieDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from './components/navbar/AppNavbar';
import TrailerPlayer from './components/TrailerPlayer/TrailerPlayer';

function App() {
  return (
    <Router>
      <div>
        <AppNavbar />
        <main>
          <Routes>
            <Route path="/" element={<MovieList />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/top-rated/:id" element={<TopRatedMovieDetail />} /> 
            <Route path="/upcoming" element={<UpcomingMovies />} />
            <Route path="/upcoming/:id" element={<UpcomingMovieDetail />} />                                  
            <Route path="/trailer/:videoId" element={<TrailerPlayer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
