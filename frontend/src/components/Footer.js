import React from "react";
import styled from "styled-components";
import logo from'../images/logo.svg'

const Footer = () => {
  return (
    <FooterContainer>
      <TopSection>
        <Logo src={logo} alt="Logo" />
        <NavLinks>
          <NavItem href="#">Pricing</NavItem>
          <NavItem href="#">About us</NavItem>
          <NavItem href="#">Features</NavItem>
          <NavItem href="#">Help Center</NavItem>
          <NavItem href="#">Contact us</NavItem>
          <NavItem href="#">FAQs</NavItem>
          <NavItem href="#">Careers</NavItem>
        </NavLinks>
      </TopSection>

      <Divider />

      <BottomSection>
        <LanguageSelector>
          <select>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </LanguageSelector>
        <CopyrightText>
          © 2022 Brand, Inc. • <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a> •{" "}
          <a href="/sitemap">Sitemap</a>
        </CopyrightText>
        <SocialIcons>
          <Icon href="#"><i className="fab fa-twitter"></i></Icon>
          <Icon href="#"><i className="fab fa-facebook"></i></Icon>
          <Icon href="#"><i className="fab fa-linkedin"></i></Icon>
          <Icon href="#"><i className="fab fa-youtube"></i></Icon>
        </SocialIcons>
      </BottomSection>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components
const FooterContainer = styled.footer`
  background: #006D77;
  color: white;
  padding: 40px 0;
  text-align: center;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 0px;
  padding-top: 0px;
`;

const Logo = styled.img`
  height: 120px; 
  margin-bottom: 0px;
`;

const NavLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 20px;
`;


const NavItem = styled.a`
  color: white;
  text-decoration: none;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #ccc;
  width: 60%;
  margin: 20px auto;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 900px;
  margin: auto;
`;

const LanguageSelector = styled.div`
  select {
    padding: 5px;
    border-radius: 5px;
    border: none;
  }
`;

const CopyrightText = styled.p`
  font-size: 14px;

  a {
    color: white;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 10px;
`;

const Icon = styled.a`
  color: white;
  font-size: 18px;

  &:hover {
    opacity: 0.7;
  }
`;