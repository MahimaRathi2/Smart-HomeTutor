import React from 'react';

export const OtherBranches = () => {
  const branches = [
    {
      id: 'patna',
      name: 'Patna Branch',
      address: 'East Lohanipur, Das Lane, Behind Krishna Kutir, Kadamkuan, Patna, Bihar – 800003, India',
    },
    {
      id: 'dehradun',
      name: 'Dehradun Branch',
      address: 'Engineers Enclave, Dwarkapuri Extension, GMS Road, Dehradun, Uttarakhand – 248001, India',
    },
  ];

  return (
    <section className="ct-branches-section ct-reveal-on-scroll">
      <div className="ct-branches-container">
        <div className="ct-branches-heading">
          <h2>Other Branches</h2>
        </div>

        <div className="ct-branches-grid">
          {branches.map((branch) => (
            <div key={branch.id} className="ct-branch-card">
              <div className="ct-branch-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <h3 className="ct-branch-title">{branch.name}</h3>
              <p className="ct-branch-address">{branch.address}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
