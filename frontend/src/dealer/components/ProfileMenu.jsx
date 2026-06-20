import { useState } from "react";
import profileImg from "../../assets/default-profile.png";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="profile-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <img src={profileImg} alt="Profile" className="profile-img" />

      {open && (
        <div className="profile-dropdown">
          <p>Change Password</p>
          <p>Logout</p>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
