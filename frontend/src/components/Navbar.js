
import React from 'react';
import logo from '../images/logo.svg';
import styled from 'styled-components';

const Navbar = () => {
  return (
    <NavbarContainer>
    <div className="navbar">

        {/* Insert your SVG logo here */}
        <img src={logo} alt="InstaLinked Logo"  className="logo"/>
     
      <nav>
        <ul className="nav-links">
          <li><a href="/login">Menu item 1</a></li>
          <li><a href="/login">Menu item 2</a></li>
          <li><a href="/login">Menu item 3</a></li>
          <li><a href="login">Menu item 4</a></li>
        </ul>
        <div className="auth-links">
          <a href="/login" className="login">Login</a>
          <a href="/" className="signup">Sign Up</a>
        </div>
      </nav>
    </div>
    </NavbarContainer>
  );
}

const NavbarContainer = styled.div`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
  }

  .navbar {
    display: flex;
    align-self: center;
    width: 100%;
    height: 10vh;
    justify-content: space-between;
    background-color: #006D77;
    color: white;
    padding: 0px 30px;
  }

  img {
    height: 20vh;
    position: relative;
    align-self: center;
  }

  nav {
    display: flex;
    align-items: center;
  }

  .nav-links {
    display: flex;
    align-self: center;
    list-style: none;
  }

  .nav-links li {
    margin-right: 20px;
  }

  .nav-links a {
    text-decoration: none;
    color: white;
    font-size: 16px;
  }

  .nav-links a:hover {
    text-decoration: underline;
  }

  .auth-links {
    display: flex;
  }

  .auth-links a {
    text-decoration: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin-left: 20px;
  }

  .auth-links a:hover {
    text-decoration: underline;
  }

  .login {
    border-right: 1px solid white;
    padding-right: 20px;
  }
`;

export default Navbar;
