import React from 'react';

export const ContactDetails = () => {
  return (
    <div className="ct-details-card">
      <h2 className="ct-details-heading">Contact Details</h2>

      <div className="ct-info-group">
        <div className="ct-info-item">
          <div className="ct-info-icon">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <div className="ct-info-text">
            <h3>Office Address</h3>
            <p>
             
              East Lohanipur, Das Lane, Behind Krishna Kutir, Kadamkuan, <br/>
               Patna, Bihar – 800003, India
            <br/>
            </p>
          </div>
        </div>

        <div className="ct-info-item">
          <div className="ct-info-icon">
            <i className="fa-solid fa-envelope"></i>
          </div>
          <div className="ct-info-text">
            <h3>Email</h3>
            <p>
              <a href="mailto:smarthometutor2026@gmail.com">smarthometutor2026@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="ct-info-item">
          <div className="ct-info-icon">
            <i className="fa-solid fa-phone"></i>
          </div>
          <div className="ct-info-text">
            <h3>Phone Number</h3>
            <p>
              <a href="tel:+917465060975">+91 7465060975</a>
            </p>
          </div>
        </div>

        <div className="ct-info-item">
          <div className="ct-info-icon">
            <i className="fa-solid fa-globe"></i>
          </div>
          <div className="ct-info-text">
            <h3>Website</h3>
            <p>
              <a href="#"  rel="noopener noreferrer">
                www.smarthometutor.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="ct-social-links">
        <a
          href="https://www.instagram.com/smarthome_tutor?igsh=MWMwYnRrbnZjdjlnNw=="
          
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i className="fab fa-instagram"></i>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61592827381793"
          
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </a>
        <a
          href="https://www.linkedin.com/company/143232958/admin/dashboard/"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </a>
        <a
          href="https://www.youtube.com/@smarthomeTutor-f9k" rel="noopener noreferrer" aria-label="YouTube"
        >
          <i className="fa-brands fa-youtube"></i>
        </a>
      </div>
    </div>
  );
};
