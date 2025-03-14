import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import AppNavbar from './AppNavbar';
import disk from '../images/disk.jpg'
import { FaFilm, FaMicrophone } from 'react-icons/fa';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const videoRefs = useRef({});
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const selectedHashtag = location.state?.selectedHashtag || null;
    console.log(selectedHashtag)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5500/api/explore/explore-page');
                if (Array.isArray(response.data)) {
                    const arranged = arrangePosts(response.data);
                    localStorage.setItem('storedPosts', JSON.stringify(arranged));  // Store arranged posts
                    setPosts(arranged);
                    setFilteredPosts(arranged);
                } else {
                    console.error('Response data is not an array:', response.data);
                }
            } catch (error) {
                console.error('Error fetching posts:', error.response?.data || error.message);
            }
        }

        if (window.location.pathname === '/explore-page' && performance.navigation.type === performance.navigation.TYPE_RELOAD) {
            // If page was refreshed, clear local storage and fetch new posts
            localStorage.removeItem('storedPosts');
            fetchPosts();
        } else {
            // Check if posts are passed via state or available in localStorage
            if (location.state?.posts) {
                setPosts(location.state.posts);
                setFilteredPosts(location.state.posts);
            } else {
                const storedPosts = localStorage.getItem('storedPosts');
                if (storedPosts) {
                    const parsedPosts = JSON.parse(storedPosts);
                    setPosts(parsedPosts);
                    setFilteredPosts(parsedPosts);
                } else {
                    fetchPosts();
                }
            }
        }
    }, []);

    useEffect(() => {
        let filtered = [...posts];

        // Apply hashtag filter if a hashtag is selected
        if (selectedHashtag) {
            filtered = filtered.filter(post =>
                post.hashtags?.some(tag => {
                    const cleanedTag = tag.trim().replace("#", "").toLowerCase();
                    const cleanedSelected = selectedHashtag.trim().replace("#", "").toLowerCase();
                    const isMatch = cleanedTag === cleanedSelected;

                    return isMatch;
                })
            );
        }
        else {
            setFilteredPosts(posts);
        }
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter if a category is selected
        if (selectedCategory) {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }

        const arrangedFilterPosts = arrangePosts(filtered);
        setFilteredPosts(arrangedFilterPosts);
    }, [selectedHashtag, selectedCategory, posts]);

    const handleVideoPreview = (id) => {
        const video = videoRefs.current[id];
        if (video) {
            video.play();
            setTimeout(() => {
                video.pause();
                video.currentTime = 0;
            }, 5000);
        }
    };

    const renderPost = (post) => {
        switch (post.content_type) {
            case 'Image':
                return <img src={post.url} alt="Post" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />;
            case 'Reel':
                return (
                    <video
                        ref={(el) => (videoRefs.current[post._id] = el)}
                        src={post.url}
                        onMouseEnter={() => handleVideoPreview(post._id)}
                        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1 / 2' }}
                        muted
                    />
                );
            case 'Documentary':
                return (
                    <div style={{ position: 'relative' }}>
                        <video src={post.url} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1 / 1' }} muted />
                        <span style={{ position: 'absolute', top: 0, right: 0, color: 'white', zIndex: 10, pointerEvents: 'none' }}>
                            <FaFilm size={30} style={{ position: 'absolute', color: 'white', top: 0, right: 0, padding: '5px', backgroundColor: "hsla(172, 96.40%, 43.50%, 0.53)" }} />
                        </span>
                    </div>
                );
            case 'Pdf':
                return (
                    <div
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => navigate(`/p/${post._id}`, { state: { background: location } })}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 1
                            }}
                        ></div>
                        <iframe
                            src={`${post.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            title="PDF Viewer"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>
                );
            case 'Audio':
                return (
                    <div style={{ position: 'relative', width: '100%', maxWidth: 'md' }}>
                        <div
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                padding: '4px',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FaMicrophone size={30} style={{ zIndex: 1000, color: 'white', padding: '5px', backgroundColor: "hsla(172, 96.40%, 43.50%, 0.53)" }} />
                        </div>
                        <img
                            src={disk}
                            alt="Audio thumbnail"
                            style={{ width: '100%', height: '100%', zIndex: 3 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem' }}>
                            <audio
                                controls
                                src={post.url}
                                style={{ width: '90%' }}
                            >
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </div>
                );
            default:
                return <p style={{ color: 'red' }}>Unsupported file type</p>;
        }
    };

    const arrangePosts = (posts) => {
        let pdfs = posts.filter(post => post.content_type === 'Pdf');
        let reels = posts.filter(post => post.content_type === 'Reel');
        let otherPosts = posts.filter(post => !['Pdf', 'Reel'].includes(post.content_type));

        let arrangedPosts = [];
        let usedOtherIndexes = new Set(); // Track used otherPosts to prevent duplicates

        let pdfIndex = 0, reelIndex = 0, otherIndex = 0;

        while (arrangedPosts.length < 120) {
            // Add 4 other posts
            for (let i = 0; i < 4; i++) {
                if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                    arrangedPosts.push(otherPosts[otherIndex]);
                    usedOtherIndexes.add(otherIndex);
                    otherIndex++;
                }
            }

            // Add a PDF if available, else add 4 more otherPosts
            if (pdfIndex < pdfs.length) {
                arrangedPosts.push(pdfs[pdfIndex++]);
            } else {
                for (let i = 0; i < 4; i++) {
                    if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                        arrangedPosts.push(otherPosts[otherIndex]);
                        usedOtherIndexes.add(otherIndex);
                        otherIndex++;
                    }
                }
            }

            // Add another other post if available
            if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                arrangedPosts.push(otherPosts[otherIndex]);
                usedOtherIndexes.add(otherIndex);
                otherIndex++;
            }

            // Add a reel if available, else add 2 more otherPosts
            if (reelIndex < reels.length) {
                arrangedPosts.push(reels[reelIndex++]);
            } else {
                for (let i = 0; i < 2; i++) {
                    if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                        arrangedPosts.push(otherPosts[otherIndex]);
                        usedOtherIndexes.add(otherIndex);
                        otherIndex++;
                    }
                }
            }

            // Add 6 other posts
            for (let i = 0; i < 6; i++) {
                if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                    arrangedPosts.push(otherPosts[otherIndex]);
                    usedOtherIndexes.add(otherIndex);
                    otherIndex++;
                }
            }

            // Add another reel if available, else add 2 more otherPosts
            if (reelIndex < reels.length) {
                arrangedPosts.push(reels[reelIndex++]);
            } else {
                for (let i = 0; i < 2; i++) {
                    if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                        arrangedPosts.push(otherPosts[otherIndex]);
                        usedOtherIndexes.add(otherIndex);
                        otherIndex++;
                    }
                }
            }

            // Add 2 other posts
            for (let i = 0; i < 2; i++) {
                if (otherIndex < otherPosts.length && !usedOtherIndexes.has(otherIndex)) {
                    arrangedPosts.push(otherPosts[otherIndex]);
                    usedOtherIndexes.add(otherIndex);
                    otherIndex++;
                }
            }

            // Stop if no more posts are left to add
            if (pdfIndex >= pdfs.length && reelIndex >= reels.length && otherIndex >= otherPosts.length) {
                break;
            }
        }

        return arrangedPosts.slice(0, 120);
    };

    return (
        <>
            <AppNavbar posts={posts} />
            <div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px' }}>
                    {['Heritage', 'Music', 'Art', 'Story', 'Research'].map(category => (
                        <button
                            key={category}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                border: 'none',
                                fontWeight: '600',
                                borderRadius: '24px',
                                backgroundColor: selectedCategory === category ? '#006b6b' : '#b4f1df',
                                color: selectedCategory === category ? '#fff' : '#333',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginLeft: '20vw', marginRight: '20vw', gap: '5px', padding: '10px', height: '100%' }}>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div
                                key={post._id}
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    aspectRatio: '1 / 1',
                                }}
                            >
                                <div
                                    onClick={() => navigate(`/p/${post._id}`, { state: { background: location } })}
                                    style={{ display: 'block', width: '100%', height: '100%' }}
                                >
                                    {post.url ? renderPost(post) : <p>Post content unavailable</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'gray' }}>No posts available</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Explore;