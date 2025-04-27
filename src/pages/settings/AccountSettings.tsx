import React, { useState } from 'react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Mail, User, Key, Shield, Bell } from 'lucide-react';

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    apiFailures: true,
    apiChanges: true,
    security: true,
    marketing: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally call an API to update the profile
    alert('Profile would be updated');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Here you would normally call an API to update the password
    alert('Password would be updated');
  };

  const handleNotificationsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally call an API to update notification preferences
    alert('Notification preferences would be updated');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-5">Account Settings</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button
            className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button
            className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden mb-3">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user?.name || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-indigo-600" />
                  )}
                </div>
                <Button variant="secondary" size="sm">
                  Change Avatar
                </Button>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="pt-3">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your current password"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters and include a number and a special character.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <div className="pt-3">
            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </div>
        </form>
      )}
      
      {activeTab === 'notifications' && (
        <form onSubmit={handleNotificationsUpdate} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-5 flex items-center">
                <input
                  id="email"
                  name="email"
                  type="checkbox"
                  checked={notifications.email}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="email" className="font-medium text-gray-700">Email notifications</label>
                <p className="text-sm text-gray-500">Receive email updates about your account activity</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 flex items-center">
                <input
                  id="apiFailures"
                  name="apiFailures"
                  type="checkbox"
                  checked={notifications.apiFailures}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="apiFailures" className="font-medium text-gray-700">API Failure Alerts</label>
                <p className="text-sm text-gray-500">Get notified when any of your APIs encounter errors</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 flex items-center">
                <input
                  id="apiChanges"
                  name="apiChanges"
                  type="checkbox"
                  checked={notifications.apiChanges}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="apiChanges" className="font-medium text-gray-700">API Changes</label>
                <p className="text-sm text-gray-500">Receive notifications when collaborators modify your APIs</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 flex items-center">
                <input
                  id="security"
                  name="security"
                  type="checkbox"
                  checked={notifications.security}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="security" className="font-medium text-gray-700">Security Alerts</label>
                <p className="text-sm text-gray-500">Important security notifications about your account</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 flex items-center">
                <input
                  id="marketing"
                  name="marketing"
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="marketing" className="font-medium text-gray-700">Marketing Communications</label>
                <p className="text-sm text-gray-500">Updates about new features and promotional offers</p>
              </div>
            </div>
          </div>
          
          <div className="pt-3">
            <Button type="submit" variant="primary">
              Save Preferences
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AccountSettings;