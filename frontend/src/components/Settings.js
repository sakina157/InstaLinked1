import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight, FaArrowLeft, FaLock, FaUserShield, FaQuestionCircle, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import default_user from '../images/default_user.jpg';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogout = async () => {
        try {
            // First clear local storage
            localStorage.clear();
            
            // Then make the API call
            await fetch('http://localhost:5500/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Navigate to login regardless of API response
            navigate("/login");
        } catch (error) {
            console.error('Error during logout:', error);
            // Still navigate to login even if API call fails
            navigate("/login");
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAccount = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('http://localhost:5500/api/auth/delete', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userData._id })
            });

            if (response.ok) {
                localStorage.clear();
                navigate("/login");
            } else {
                console.error('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleChangePasswordClick = () => {
        setShowChangePassword(true);
        setError('');
        setSuccess('');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const validatePasswords = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (passwordData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }
        return true;
    };

    const handleChangePassword = async () => {
        if (!validatePasswords()) return;

        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('http://localhost:5500/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: userData._id,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password changed successfully');
                setTimeout(() => {
                    setShowChangePassword(false);
                    setSuccess('');
                }, 2000);
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError('Failed to change password');
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <FaArrowLeft style={styles.backIcon} onClick={handleBack} />
                    <span style={styles.headerTitle}>Security & Support</span>
                </div>
                <img
                    src={user?.profileImage || default_user}
                    alt="Profile"
                    style={styles.profileImage}
                />
            </div>

            {/* Search Bar */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search settings and support"
                    style={styles.searchInput}
                />
            </div>

            {/* Settings Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Settings</h2>
                
                {/* Account Security */}
                <div style={styles.settingBlock}>
                    <div style={styles.settingHeader}>
                        <FaLock style={styles.settingIcon} />
                        <div style={styles.settingHeaderText}>
                            <h3 style={styles.settingTitle}>Account Security</h3>
                            <p style={styles.settingDescription}>Manage your passwords, 2FA, and login activity</p>
                        </div>
                    </div>
                    <div style={styles.settingItem} onClick={handleChangePasswordClick}>
                        <span>Change Password</span>
                        <FaChevronRight style={styles.arrowIcon} />
                    </div>
                    <div style={styles.settingItem}>
                        <span>Two-Factor Authentication</span>
                        <label style={styles.switch}>
                            <input
                                type="checkbox"
                                checked={twoFactorEnabled}
                                onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            />
                            <span style={styles.slider}></span>
                        </label>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div style={styles.settingBlock}>
                    <div style={styles.settingHeader}>
                        <FaUserShield style={styles.settingIcon} />
                        <div style={styles.settingHeaderText}>
                            <h3 style={styles.settingTitle}>Privacy Settings</h3>
                            <p style={styles.settingDescription}>Control your profile visibility and data sharing</p>
                        </div>
                    </div>
                    <div style={styles.settingItem}>
                        <span>Profile Visibility</span>
                        <span style={styles.visibilityText}>Public</span>
                    </div>
                </div>
            </div>

            {/* Support Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Support</h2>
                <div style={styles.settingBlock}>
                    <div style={styles.settingItem}>
                        <div style={styles.settingHeader}>
                            <FaQuestionCircle style={styles.settingIcon} />
                            <span>Help Center</span>
                        </div>
                        <FaChevronRight style={styles.arrowIcon} />
                    </div>
                    <div style={styles.settingItem}>
                        <div style={styles.settingHeader}>
                            <FaQuestionCircle style={styles.settingIcon} />
                            <span>Contact Support</span>
                        </div>
                        <FaChevronRight style={styles.arrowIcon} />
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div style={styles.section}>
                <div style={styles.settingBlock}>
                    <div style={styles.settingItem} onClick={handleLogoutClick}>
                        <div style={styles.settingHeader}>
                            <FaSignOutAlt style={{...styles.settingIcon, color: '#dc3545'}} />
                            <span style={{color: '#dc3545'}}>Logout</span>
                        </div>
                    </div>
                    <div style={styles.settingItem} onClick={handleDeleteAccount}>
                        <div style={styles.settingHeader}>
                            <FaTrash style={{...styles.settingIcon, color: '#dc3545'}} />
                            <span style={{color: '#dc3545'}}>Delete Account</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Logout</h3>
                        <p>Are you sure you want to logout?</p>
                        <div style={styles.modalActions}>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#ccc'}}
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#006d77'}}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Delete Account</h3>
                        <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
                        <div style={styles.modalActions}>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#ccc'}}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#dc3545'}}
                                onClick={confirmDeleteAccount}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassword && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Change Password</h3>
                        {error && <p style={styles.errorText}>{error}</p>}
                        {success && <p style={styles.successText}>{success}</p>}
                        <div style={styles.inputGroup}>
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                style={styles.input}
                            />
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                style={styles.input}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.modalActions}>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#ccc'}}
                                onClick={() => setShowChangePassword(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{...styles.modalButton, backgroundColor: '#006d77'}}
                                onClick={handleChangePassword}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#f4f2ee',
        minHeight: '100vh',
        width: '100%',
    },
    header: {
        backgroundColor: '#006d77',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    backIcon: {
        cursor: 'pointer',
        fontSize: '20px',
    },
    headerTitle: {
        fontSize: '18px',
        fontWeight: '500',
    },
    profileImage: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    searchContainer: {
        padding: '15px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
    },
    searchInput: {
        width: '100%',
        padding: '10px 5px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#f4f2ee',
    },
    section: {
        padding: '20px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#000000',
    },
    settingBlock: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        marginBottom: '20px',
        overflow: 'hidden',
    },
    settingHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    settingHeaderText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: '16px',
        fontWeight: '500',
        margin: 0,
        color: '#000000',
    },
    settingDescription: {
        fontSize: '14px',
        color: '#666666',
        margin: '5px 0 0 0',
    },
    settingIcon: {
        color: '#80b6bb',
        fontSize: '20px',
    },
    settingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderTop: '1px solid #f4f2ee',
        cursor: 'pointer',
    },
    arrowIcon: {
        color: '#80b6bb',
        fontSize: '16px',
    },
    visibilityText: {
        color: '#80b6bb',
    },
    switch: {
        position: 'relative',
        display: 'inline-block',
        width: '44px',
        height: '24px',
    },
    slider: {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ccc',
        transition: '0.4s',
        borderRadius: '24px',
        '&:before': {
            position: 'absolute',
            content: '""',
            height: '20px',
            width: '20px',
            left: '2px',
            bottom: '2px',
            backgroundColor: 'white',
            transition: '0.4s',
            borderRadius: '50%',
        },
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px',
    },
    modalButton: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        color: '#ffffff',
        cursor: 'pointer',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        fontSize: '14px',
    },
    inputGroup: {
        marginTop: '20px',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '14px',
        marginTop: '10px',
    },
    successText: {
        color: '#28a745',
        fontSize: '14px',
        marginTop: '10px',
    },
};

export default Settings; 