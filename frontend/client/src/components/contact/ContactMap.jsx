import React from 'react';

export const ContactMap = () => {
  return (
    <div className="ct-map-card">
      <div className="ct-map-container">
        <iframe
          title="Smart HomeTutor Office Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110204.74616223594!2d77.94723145451996!3d30.31649449279586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390929c356c888af%3A0x4cdd8eb677271424!2sDehradun%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};
