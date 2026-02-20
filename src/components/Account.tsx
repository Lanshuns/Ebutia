import React from 'react';
import { UserIcon } from './ui/Icons';

interface AccountProps {
  isDark: boolean;
}

const Account: React.FC<AccountProps> = ({ isDark }) => {
  return (
    <div className="account-container">
      <div className={`account-card ${isDark ? 'dark' : ''}`}>
        <div className="account-header-centered">
          <div className={`account-avatar large ${isDark ? 'dark' : ''}`}>
            <UserIcon size={32} />
          </div>
          <h3 className={`account-title ${isDark ? 'dark' : ''}`}>
            Account
          </h3>
          <p className={`account-subtitle ${isDark ? 'dark' : ''}`}>
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
