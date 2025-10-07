import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
    const { user, axios, setUser } = useAppContext();
    const location = useLocation();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to upload and update image
   const updateImage = async () => {
    if (!image) return;
    try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        const { data } = await axios.post('/api/owners/update-image', formData);

        if (data.success) {
            const newImageUrl = `${data.updatedImage}?t=${Date.now()}`;
            setUser(prev => ({ ...prev, image: newImageUrl }));
            setImage(null);
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm'>

            {/* Profile Image */}
            <div className='group relative'>
                <label htmlFor="image">
                    <img 
                        className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto' 
                        src={image ? URL.createObjectURL(image) : user?.image || "https://images.unsplash.com/photo-1633332755192-7a0c4013d?q=80&w=300"} 
                        alt="profile" 
                    />
                    <input 
                        type="file" 
                        id='image' 
                        accept="image/*" 
                        hidden 
                        onChange={(e) => setImage(e.target.files[0])} 
                    />
                    <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/10 rounded-full group-hover:flex items-center justify-center cursor-pointer'>
                        <img src={assets.edit_icon} alt="edit icon" />
                    </div>
                </label>
            </div>

            {/* Save Button */}
            {image && (
                <button 
                    className='absolute top-0 right-0 flex p-2 gap-1 bg-primary/10 text-primary cursor-pointer' 
                    onClick={updateImage}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'} 
                    <img src={assets.check_icon} width={13} alt="check icon" />
                </button>
            )}

            {/* User Name */}
            <p className='mt-2 text-base max-md:hidden'>{user?.name}</p>

            {/* Navigation Links */}
            <div className='w-full'>
                {ownerMenuLinks.map((link, index) => (
                    <NavLink 
                        key={index} 
                        to={link.path} 
                        className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
                    >
                        <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt="icon" />
                        <span className='max-md:hidden'>{link.name}</span>
                        {link.path === location.pathname && (
                            <div className='bg-primary w-1.5 h-8 rounded-l right-0 absolute'></div>
                        )}
                    </NavLink>
                ))}
            </div>

        </div>
    )
}

export default Sidebar;
