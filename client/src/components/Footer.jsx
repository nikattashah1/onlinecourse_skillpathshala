import React from 'react';
import logo from '../../../logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={logo} alt="SkillPathshala" className="footer-logo" />
            <div>
              <div className="footer-brand-name">SkillPathshala</div>
              <div className="muted small">Upgrade Your Skills Anytime, Anywhere.</div>
            </div>
          </div>

          <div className="footer-follow">
            <h4>Follow Us</h4>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/facebook--v1.png"
                  alt="Facebook"
                />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png"
                  alt="LinkedIn"
                />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png"
                  alt="Twitter"
                />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png"
                  alt="YouTube"
                />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/courses">Courses</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SkillPathshala. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

