import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import { User } from '../../types/user';
import zIndex from '@mui/material/styles/zIndex';

interface ActionPayload {
  action: string;
  user_id: string;
  email: string;
}

interface ActionDropdownProps {
  handleAction: (payload: ActionPayload) => void;
  setUserId: (id: string) => void;
  selectedUser: any;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  handleAction,
  setUserId,
  selectedUser,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [dropUpwards, setDropUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropdownRef.current && dropdownOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 160; // Approximate height of your dropdown
      setDropUpwards(spaceBelow < dropdownHeight);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const tokenObj = localStorage.getItem('tk');
    if (tokenObj) {
      const decoded: any = jwt_decode(tokenObj) as DecodedToken;
      if (
        decoded.role === 'superuser' ||
        decoded.role === 'manager' ||
        decoded.role === 'seller'
      ) {
        setUser(decoded);
        setLoggedIn(true);
      }
    } else {
      navigate('/auth/signin');
    }
  }, []);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => {
          if (!dropdownOpen) {
            setUserId(selectedUser._id);
          } else {
            setUserId('');
          }
          setDropdownOpen(!dropdownOpen);
        }}
        className="flex items-center gap-4"
        to="#"
      >
        <svg
          className="fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          style={{ zIndex: 1000 }}
          className={`absolute right-4 ${
            dropUpwards ? 'bottom-full mb-4' : 'top-full mt-4'
          } w-48 flex-col rounded-md border border-stroke bg-white shadow-lg z-100 border-primary/[0.5] dark:bg-boxdark transition-all duration-300 ease-in-out`}
        >
          {selectedUser?.role === 'seller' && (
            <button
              onClick={() => {
                handleAction({
                  action: 'view',
                  user_id: selectedUser._id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              View
            </button>
          )}
          {selectedUser.workingstatus === 'active' && (
            <button
              onClick={() => {
                handleAction({
                  action: 'suspend',
                  user_id: selectedUser._id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              Suspend
            </button>
          )}
          {(selectedUser.workingstatus === 'inactive' ||
            selectedUser.workingstatus === 'suspended') && (
            <button
              onClick={() => {
                handleAction({
                  action: 'active',
                  user_id: selectedUser._id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => {
              handleAction({
                action: 'deactive',
                user_id: selectedUser._id,
                email: selectedUser.email,
              });
            }}
            className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
          >
            Deactivate
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default ActionDropdown;
